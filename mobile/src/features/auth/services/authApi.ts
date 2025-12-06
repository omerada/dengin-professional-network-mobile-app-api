// src/features/auth/services/authApi.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { apiClient, API_ENDPOINTS } from '@core/api';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RegisterResponse,
  RefreshTokenResponse,
  User,
  OAuth2AuthResponse,
  ApiResponse,
} from '@shared/types';

/**
 * Authentication API service
 * Backend API Reference ile %100 uyumlu
 */
export const authApi = {
  /**
   * Login with email and password
   * POST /api/auth/login
   * Backend returns: ApiResponse<LoginResponse> = { success, message, data: LoginResponse }
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data: AuthResponse;
    }>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    // Backend wraps response in ApiResponse format
    return response.data.data || (response.data as any);
  },

  /**
   * Register new user
   * POST /api/auth/register
   * Backend returns: ApiResponse<RegisterResponse>
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data: RegisterResponse;
    }>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data.data || (response.data as any);
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh
   * Header: Refresh-Token: {refreshToken}
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      null,
      {
        headers: {
          'Refresh-Token': refreshToken,
        },
      },
    );
    // Backend returns ApiResponse<LoginResponse> format
    return response.data.data || response.data;
  },

  /**
   * Logout user
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Request password reset email
   * POST /api/auth/password-reset/request
   * Always returns 204 for security (prevents email enumeration)
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   * POST /api/auth/password-reset/confirm
   */
  resetPassword: async (resetToken: string, newPassword: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      resetToken,
      newPassword,
    });
  },

  /**
   * Verify email with token
   * POST /api/auth/verify-email
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      token,
    });
    return response.data;
  },

  /**
   * Change password for authenticated user
   * POST /api/auth/change-password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Get current user profile
   * GET /api/users/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.USER.ME);
    return response.data;
  },

  /**
   * OAuth2 - Google Sign In
   * POST /api/auth/oauth/google
   */
  loginWithGoogle: async (idToken: string): Promise<OAuth2AuthResponse> => {
    const response = await apiClient.post<OAuth2AuthResponse>(API_ENDPOINTS.AUTH.OAUTH_GOOGLE, {
      idToken,
    });
    return response.data;
  },

  /**
   * OAuth2 - Apple Sign In
   * POST /api/auth/oauth/apple
   * Note: Apple only provides user's name on FIRST login
   */
  loginWithApple: async (
    idToken: string,
    authorizationCode?: string,
    fullName?: { givenName?: string; familyName?: string },
  ): Promise<OAuth2AuthResponse> => {
    const response = await apiClient.post<OAuth2AuthResponse>(API_ENDPOINTS.AUTH.OAUTH_APPLE, {
      idToken,
      authorizationCode,
      fullName,
    });
    return response.data;
  },
};
