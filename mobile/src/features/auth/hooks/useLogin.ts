// src/features/auth/hooks/useLogin.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { authApi, tokenService } from '../services';
import { useAuthStore } from '../stores';
import type { LoginFormData } from '../types';
import type { RootStackNavigationProp } from '@shared/types';

/**
 * Login hook with React Query mutation
 * Handles login flow including token storage and navigation
 *
 * Backend API: POST /api/auth/login
 * Response format: { user, accessToken, refreshToken, tokenType, expiresIn }
 */
export const useLogin = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { setUser, setLastLoginEmail } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });
      return response;
    },

    onSuccess: async (data, variables) => {
      try {
        console.log('[useLogin] Login successful, response:', JSON.stringify(data, null, 2));
        console.log('[useLogin] AccessToken type:', typeof data.accessToken);
        console.log('[useLogin] AccessToken value:', data.accessToken);
        console.log('[useLogin] RefreshToken type:', typeof data.refreshToken);

        // Save tokens securely (backend format: accessToken, refreshToken, expiresIn)
        const tokensSaved = await tokenService.saveTokens(data);

        if (!tokensSaved) {
          console.error('[useLogin] Failed to save tokens, but continuing...');
        }

        // Update auth store with user data
        setUser(data.user);

        // Remember last login email
        if (variables.rememberMe) {
          setLastLoginEmail(variables.email);
        }

        // Navigate to main app
        console.log('[useLogin] Navigating to Main screen...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } catch (error) {
        console.error('[useLogin] Error in onSuccess:', error);
      }
    },

    onError: (error: Error) => {
      console.error('[useLogin] Error:', error.message);
    },
  });

  const login = useCallback(
    (data: LoginFormData) => {
      mutation.mutate(data);
    },
    [mutation],
  );

  return {
    login,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
