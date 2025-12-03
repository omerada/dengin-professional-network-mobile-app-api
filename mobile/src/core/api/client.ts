// src/core/api/client.ts
// Oku: mobile-development-guide/core/10-API-CLIENT.md

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@config/env';
import { APP_CONFIG } from '@config/app';
import { secureStorage, SECURE_KEYS } from '@core/storage';

/**
 * Create Axios instance with base configuration
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: APP_CONFIG.API.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return instance;
};

/**
 * Main API client instance
 */
export const apiClient = createApiClient();

/**
 * Request interceptor - adds auth token to requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get access token from secure storage
    const accessToken = await secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request in development
    if (ENV.isDevelopment) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  error => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  },
);

/**
 * Response interceptor - handles token refresh and errors
 */
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = await secureStorage.get(SECURE_KEYS.REFRESH_TOKEN);

        if (refreshToken) {
          const response = await axios.post(`${ENV.API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Save new tokens
          await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, accessToken);
          await secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, newRefreshToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        await secureStorage.remove(SECURE_KEYS.ACCESS_TOKEN);
        await secureStorage.remove(SECURE_KEYS.REFRESH_TOKEN);

        // Emit logout event for navigation
        // This will be handled by auth store
        console.error('[API] Token refresh failed:', refreshError);
      }
    }

    // Log error in development
    if (ENV.isDevelopment) {
      console.error('[API] Response error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  },
);

/**
 * API request helper with retry logic
 */
export const apiRequest = async <T>(
  config: AxiosRequestConfig,
  retries: number = APP_CONFIG.API.RETRY_ATTEMPTS,
): Promise<T> => {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && error.response?.status !== 401) {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, APP_CONFIG.API.RETRY_DELAY));
      return apiRequest<T>(config, retries - 1);
    }
    throw error;
  }
};
