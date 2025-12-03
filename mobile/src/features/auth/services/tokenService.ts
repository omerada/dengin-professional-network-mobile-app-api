// src/features/auth/services/tokenService.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/best-practices/31-SECURITY.md

import { secureStorage, SECURE_KEYS } from '@core/storage';
import { AuthTokens } from '@shared/types';
import { APP_CONFIG } from '@config/app';

/**
 * Token service for secure token management
 */
export const tokenService = {
  /**
   * Save authentication tokens
   */
  saveTokens: async (tokens: AuthTokens): Promise<boolean> => {
    try {
      await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
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
    return secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token
   */
  getRefreshToken: async (): Promise<string | null> => {
    return secureStorage.get(SECURE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Clear all tokens
   */
  clearTokens: async (): Promise<boolean> => {
    try {
      await secureStorage.remove(SECURE_KEYS.ACCESS_TOKEN);
      await secureStorage.remove(SECURE_KEYS.REFRESH_TOKEN);
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
    const accessToken = await secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);
    return accessToken !== null;
  },

  /**
   * Decode JWT token (without verification)
   * Used only for reading expiration time
   */
  decodeToken: (token: string): { exp: number; sub: string } | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('[TokenService] Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is about to expire
   */
  isTokenExpiringSoon: async (): Promise<boolean> => {
    const accessToken = await secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);

    if (!accessToken) {
      return true;
    }

    const decoded = tokenService.decodeToken(accessToken);

    if (!decoded) {
      return true;
    }

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const threshold = APP_CONFIG.AUTH.TOKEN_REFRESH_THRESHOLD;

    return expirationTime - now < threshold;
  },
};
