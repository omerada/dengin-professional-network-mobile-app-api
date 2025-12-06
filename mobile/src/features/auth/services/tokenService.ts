// src/features/auth/services/tokenService.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { secureStorage, SECURE_KEYS } from '@core/storage';
import type { AuthTokens, AuthResponse, RefreshTokenResponse } from '@shared/types';
import { APP_CONFIG } from '@config/app';
import { authApi } from './authApi';

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: SECURE_KEYS.ACCESS_TOKEN,
  REFRESH_TOKEN: SECURE_KEYS.REFRESH_TOKEN,
  EXPIRES_AT: SECURE_KEYS.TOKEN_EXPIRES_AT,
} as const;

/**
 * Token service for secure token management
 * Dokümantasyon: mobile-development-guide/features/03-AUTH-MODULE.md
 */
export const tokenService = {
  /**
   * Save authentication tokens from AuthResponse
   * Backend response format: { accessToken, refreshToken, expiresIn }
   */
  saveTokens: async (response: AuthResponse | RefreshTokenResponse): Promise<boolean> => {
    try {
      // Validate tokens are strings (SecureStore requirement)
      const accessToken = response.accessToken;
      const refreshToken = response.refreshToken;

      if (typeof accessToken !== 'string' || !accessToken) {
        console.error('[TokenService] Invalid accessToken:', typeof accessToken, accessToken);
        return false;
      }

      if (typeof refreshToken !== 'string' || !refreshToken) {
        console.error('[TokenService] Invalid refreshToken:', typeof refreshToken, refreshToken);
        return false;
      }

      const expiresAt = Date.now() + response.expiresIn * 1000;

      await Promise.all([
        secureStorage.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
        secureStorage.set(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
        secureStorage.set(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString()),
      ]);

      console.log('[TokenService] Tokens saved successfully');
      return true;
    } catch (error) {
      console.error('[TokenService] Error saving tokens:', error);
      return false;
    }
  },

  /**
   * Save tokens from legacy format (AuthTokens)
   */
  saveTokensLegacy: async (tokens: AuthTokens): Promise<boolean> => {
    try {
      const expiresIn = tokens.expiresIn ?? 86400; // Default 24 hours
      const expiresAt = Date.now() + expiresIn * 1000;

      await Promise.all([
        secureStorage.set(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken),
        secureStorage.set(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken),
        secureStorage.set(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString()),
      ]);

      return true;
    } catch (error) {
      console.error('[TokenService] Error saving tokens:', error);
      return false;
    }
  },

  /**
   * Get access token
   */
  getAccessToken: async (): Promise<string | null> => {
    return secureStorage.get(TOKEN_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token
   */
  getRefreshToken: async (): Promise<string | null> => {
    return secureStorage.get(TOKEN_KEYS.REFRESH_TOKEN);
  },

  /**
   * Check if token is expired
   * Returns true 1 minute before actual expiration for safety margin
   */
  isTokenExpired: async (): Promise<boolean> => {
    const expiresAt = await secureStorage.get(TOKEN_KEYS.EXPIRES_AT);

    if (!expiresAt) {
      return true;
    }

    // Expire 1 minute before actual expiration (safety margin)
    const safetyMargin = 60 * 1000; // 60 seconds
    return Date.now() > parseInt(expiresAt, 10) - safetyMargin;
  },

  /**
   * Refresh access token using refresh token
   * Backend: POST /api/auth/refresh with Refresh-Token header
   */
  refreshAccessToken: async (): Promise<string> => {
    const refreshToken = await tokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('Oturum bilgisi bulunamadı');
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      await tokenService.saveTokens(response);
      return response.accessToken;
    } catch (error) {
      // If refresh fails, clear tokens
      await tokenService.clearTokens();
      throw error;
    }
  },

  /**
   * Clear all tokens
   */
  clearTokens: async (): Promise<boolean> => {
    try {
      await Promise.all([
        secureStorage.remove(TOKEN_KEYS.ACCESS_TOKEN),
        secureStorage.remove(TOKEN_KEYS.REFRESH_TOKEN),
        secureStorage.remove(TOKEN_KEYS.EXPIRES_AT),
      ]);
      return true;
    } catch (error) {
      console.error('[TokenService] Error clearing tokens:', error);
      return false;
    }
  },

  /**
   * Check if tokens exist
   */
  hasTokens: async (): Promise<boolean> => {
    const accessToken = await secureStorage.get(TOKEN_KEYS.ACCESS_TOKEN);
    return accessToken !== null;
  },

  /**
   * Check if token is about to expire (within threshold)
   */
  isTokenExpiringSoon: async (): Promise<boolean> => {
    const expiresAt = await secureStorage.get(TOKEN_KEYS.EXPIRES_AT);

    if (!expiresAt) {
      return true;
    }

    const expirationTime = parseInt(expiresAt, 10);
    const now = Date.now();
    const threshold = APP_CONFIG.AUTH?.TOKEN_REFRESH_THRESHOLD ?? 5 * 60 * 1000; // 5 minutes default

    return expirationTime - now < threshold;
  },

  /**
   * Decode JWT token (without verification)
   * Used only for reading payload data
   */
  decodeToken: (token: string): { exp: number; sub: string; iat: number } | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      // Base64 decode (handle URL-safe base64)
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
        ),
      );
      return decoded;
    } catch (error) {
      console.error('[TokenService] Error decoding token:', error);
      return null;
    }
  },

  /**
   * Get user ID from token
   */
  getUserIdFromToken: async (): Promise<string | null> => {
    const accessToken = await tokenService.getAccessToken();

    if (!accessToken) {
      return null;
    }

    const decoded = tokenService.decodeToken(accessToken);
    return decoded?.sub ?? null;
  },
};
