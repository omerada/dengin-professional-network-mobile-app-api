// src/features/auth/services/oauth2Service.ts
// Backend OAuth2Controller ile uyumlu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART6.md

import { apiClient, API_ENDPOINTS } from '@core/api';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';
import { storage, STORAGE_KEYS } from '@core/storage';
import type { AuthResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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
  GoogleSignin.configure({
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID || 'YOUR_GOOGLE_WEB_CLIENT_ID',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
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
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const request: OAuth2TokenRequest = {
        provider: 'GOOGLE',
        idToken: userInfo.idToken || '',
        accessToken: tokens.accessToken,
      };

      return await oauth2Service.authenticateWithBackend(request);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Giriş iptal edildi');
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Giriş işlemi devam ediyor');
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Servisleri kullanılamıyor');
      }
      throw error;
    }
  },

  /**
   * Apple ile giriş yap (iOS only)
   */
  signInWithApple: async (): Promise<AuthResponse> => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In sadece iOS destekler');
    }

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      if (credentialState !== appleAuth.State.AUTHORIZED) {
        throw new Error('Apple Sign-In yetkilendirme başarısız');
      }

      const { identityToken, authorizationCode, fullName, email } =
        appleAuthRequestResponse;

      // Apple ilk girişte fullName ve email verir, sonraki girişlerde vermez
      const displayName = fullName
        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
        : undefined;

      const request: OAuth2TokenRequest = {
        provider: 'APPLE',
        idToken: identityToken || '',
        authorizationCode: authorizationCode || undefined,
        fullName: displayName,
        email: email || undefined,
      };

      return await oauth2Service.authenticateWithBackend(request);
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
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
    await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
    await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user));

    return authData;
  },

  /**
   * Google Sign-Out
   */
  signOutGoogle: async (): Promise<void> => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      // Ignore errors on sign out
      console.warn('Google sign out warning:', error);
    }
  },

  /**
   * Apple Sign-Out (no-op, just clears local data)
   */
  signOutApple: async (): Promise<void> => {
    // Apple doesn't have a sign-out method
    // Just clear local tokens
  },
};

export default oauth2Service;
