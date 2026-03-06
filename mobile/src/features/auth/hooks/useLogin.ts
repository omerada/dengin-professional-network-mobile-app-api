// src/features/auth/hooks/useLogin.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { authApi, tokenService } from '../services';
import { useAuthStore } from '../stores';
import type { LoginFormData } from '../types';
import { getErrorMessage } from '@core/utils/errorUtils';
// import { resetNavigation } from '@core/navigation/AppNavigator'; // Not used

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
        // This will automatically trigger navigation through AppNavigator's isAuthenticated check
        setUser(data.user);

        // Remember last login email
        if (variables.rememberMe) {
          setLastLoginEmail(variables.email);
        }

        // No need to manually navigate - AppNavigator will re-render with isAuthenticated=true
        // and automatically show Main screen
        if (__DEV__) {
          console.log('[useLogin] Login successful, auth state updated');
        }
      } catch (error) {
        // Log critical errors only
        if (__DEV__) {
          console.error('[useLogin] Error in onSuccess:', getErrorMessage(error));
        }
        throw error;
      }
    },

    onError: () => {
      // Errors are already handled by UI, no need to log
      // User will see the error message displayed in LoginScreen
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
