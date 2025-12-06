// src/features/auth/hooks/useLogin.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { authApi, tokenService } from '../services';
import { useAuthStore } from '../stores';
import type { LoginFormData } from '../types';
import { getErrorMessage } from '@core/utils/errorUtils';
import { resetNavigation } from '@core/navigation/AppNavigator';

/**
 * Login hook with React Query mutation
 * Handles login flow including token storage and navigation
 *
 * Backend API: POST /api/auth/login
 * Response format: { user, accessToken, refreshToken, tokenType, expiresIn }
 */
export const useLogin = () => {
  const { setUser, setLastLoginEmail } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      // Validate required fields
      if (!response.accessToken || !response.refreshToken || !response.user) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }

      return response;
    },

    onSuccess: async (data, variables) => {
      try {
        // Save tokens securely
        const tokensSaved = await tokenService.saveTokens(data);

        if (!tokensSaved) {
          throw new Error('Oturum bilgileri kaydedilemedi');
        }

        // Update auth store with user data
        setUser(data.user);

        // Remember last login email
        if (variables.rememberMe) {
          setLastLoginEmail(variables.email);
        }

        // Navigate to main app using helper function
        resetNavigation(0, [{ name: 'Main' }]);
      } catch (error) {
        console.error('[useLogin] Error in onSuccess:', getErrorMessage(error));
        throw error;
      }
    },

    onError: (error: Error) => {
      console.error('[useLogin] Login error:', getErrorMessage(error));
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
