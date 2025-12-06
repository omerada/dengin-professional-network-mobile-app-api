// src/core/api/client.ts
// Oku: mobile-development-guide/core/10-API-CLIENT.md

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { ENV } from '@config/env';
import { APP_CONFIG } from '@config/app';
import { secureStorage, SECURE_KEYS } from '@core/storage';
import { getErrorMessage } from '@core/utils/errorUtils';

/**
 * Get the correct API base URL for the current platform
 * Android emulator: localhost -> 10.0.2.2 (or use host machine IP directly)
 * iOS simulator: localhost works as-is
 */
const getApiBaseUrl = (): string => {
  let baseUrl = ENV.API_BASE_URL;

  // Only convert localhost to 10.0.2.2 on Android
  // If using direct IP (like 192.168.x.x), no conversion needed
  if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
    baseUrl = baseUrl.replace('localhost', '10.0.2.2');
  }

  // API URL configured for platform
  return baseUrl;
};

/**
 * Create Axios instance with base configuration
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000, // 10 seconds - shorter for faster failure detection
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    // Let axios throw on 4xx and 5xx errors by default
  });

  return instance;
};

/**
 * Main API client instance
 */
export const apiClient = createApiClient();

/**
 * Test backend connectivity
 */
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${getApiBaseUrl()}/actuator/health`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    return response.status === 200 || response.status === 404;
  } catch (error: any) {
    if (__DEV__) {
      console.error('[API] Backend unreachable:', error.message);
    }
    return false;
  }
};

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

    return config;
  },
  error => {
    // Only log critical request configuration errors in dev
    if (__DEV__ && error.message) {
      console.error('[API] Request setup failed:', error.message);
    }
    return Promise.reject(error);
  },
);

/**
 * Response interceptor - handles token refresh and errors
 */
apiClient.interceptors.response.use(
  response => {
    // Check if response contains error fields (backend ApiResponse error format)
    if (response.data && ('error' in response.data || 'errorCode' in response.data)) {
      const errorMessage = getErrorMessage(response.data);
      const error = new Error(errorMessage);
      (error as any).response = response;
      (error as any).isApiError = true;
      (error as any).errorCode = response.data.errorCode;
      return Promise.reject(error);
    }
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
          // Backend expects refresh token in header, not body
          // Endpoint: POST /api/auth/refresh with Refresh-Token header
          const response = await axios.post(
            `${ENV.API_BASE_URL}/api/auth/refresh`,
            null, // No body needed
            {
              headers: {
                'Refresh-Token': refreshToken,
              },
            },
          );

          // Backend returns ApiResponse<LoginResponse> format
          const responseData = response.data.data || response.data;
          const { accessToken, refreshToken: newRefreshToken } = responseData;

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
        // Auth store will handle logout redirect
      }
    }

    // Only log unexpected errors (network failures, 5xx errors)
    // Skip logging for expected errors (4xx) to reduce noise
    if (__DEV__) {
      const status = error.response?.status;
      const isUnexpectedError = !error.response || (status && status >= 500);

      if (isUnexpectedError) {
        console.error('[API] Unexpected error:', {
          message: getErrorMessage(error),
          status: status || 'Network Error',
          url: error.config?.url,
        });
      }
    }

    // Enhance error with user-friendly message
    const enhancedError = error;
    enhancedError.message = getErrorMessage(error);

    return Promise.reject(enhancedError);
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
