// src/features/auth/services/oauth2Service.ts
// Backend OAuth2Controller ile uyumlu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART6.md

import { apiClient, API_ENDPOINTS } from '@core/api';
import { secureStorage, SECURE_KEYS } from '@core/storage';
import type { User } from '@shared/types';
import { googleAuth } from './googleAuth';
import { appleAuth } from './appleAuth';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface OAuth2TokenRequest {
  provider: 'GOOGLE' | 'APPLE';
  idToken: string;
  accessToken?: string;
  authorizationCode?: string;
  fullName?: string;
  email?: string;
}

/**
 * Google Sign-In yapılandırması
 * App.tsx veya App entry point'te çağrılmalı
 */
export const configureGoogleSignIn = (): void => {
  googleAuth.configure(process.env.GOOGLE_WEB_CLIENT_ID || 'YOUR_GOOGLE_WEB_CLIENT_ID');
};

/**
 * OAuth2 Service
 * Backend OAuth2Controller ile %100 uyumlu
 */
export const oauth2Service = {
  /**
   * Google ile giriş yap
   */
  signInWithGoogle: async (): Promise<AuthResponse> => {
    if (!googleAuth.isAvailable()) {
      throw new Error('Google ile giriş bu cihazda desteklenmiyor');
    }

    try {
      const { userInfo, tokens } = await googleAuth.signIn();

      const request: OAuth2TokenRequest = {
        provider: 'GOOGLE',
        idToken: userInfo.idToken || '',
        accessToken: tokens.accessToken,
      };

      return await oauth2Service.authenticateWithBackend(request);
    } catch (error: any) {
      if (googleAuth.isSignInError(error, 'cancelled')) {
        throw new Error('Giriş iptal edildi');
      }
      if (googleAuth.isSignInError(error, 'inProgress')) {
        throw new Error('Giriş işlemi devam ediyor');
      }
      if (googleAuth.isSignInError(error, 'playServices')) {
        throw new Error('Google Play Servisleri kullanılamıyor, lütfen güncelleyin');
      }
      throw error;
    }
  },

  /**
   * Apple ile giriş yap (iOS only)
   */
  signInWithApple: async (): Promise<AuthResponse> => {
    if (!appleAuth.isAvailable()) {
      throw new Error('Apple ile giriş yalnızca iOS cihazlarda kullanılabilir');
    }

    try {
      const credential = await appleAuth.signIn();

      // Apple ilk girişte fullName ve email verir, sonraki girişlerde vermez
      const displayName = credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : undefined;

      const request: OAuth2TokenRequest = {
        provider: 'APPLE',
        idToken: credential.identityToken || '',
        authorizationCode: credential.authorizationCode || undefined,
        fullName: displayName,
        email: credential.email || undefined,
      };

      return await oauth2Service.authenticateWithBackend(request);
    } catch (error: any) {
      if (error.message?.includes('iptal')) {
        throw new Error('Giriş iptal edildi');
      }
      throw error;
    }
  },

  /**
   * Backend'e OAuth2 token gönder
   * POST /api/auth/oauth2/callback
   */
  authenticateWithBackend: async (request: OAuth2TokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.OAUTH2_CALLBACK,
      request,
    );

    const authData = response.data.data;

    // Token'ları sakla
    await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, authData.accessToken);
    await secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, authData.refreshToken);

    return authData;
  },

  /**
   * Google Sign-Out
   */
  signOutGoogle: async (): Promise<void> => {
    await googleAuth.signOut();
  },

  /**
   * Apple Sign-Out (no-op, just clears local data)
   */
  signOutApple: async (): Promise<void> => {
    await appleAuth.signOut();
  },
};

export default oauth2Service;
