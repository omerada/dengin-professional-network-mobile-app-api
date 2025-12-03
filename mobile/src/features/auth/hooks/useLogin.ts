// src/features/auth/hooks/useLogin.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { authApi, tokenService } from '../services';
import { useAuthStore } from '../stores';
import { LoginFormData } from '../types';
import { RootStackNavigationProp } from '@shared/types';

/**
 * Login hook with React Query mutation
 * Handles login flow including token storage and navigation
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
      // Save tokens securely
      await tokenService.saveTokens(data.tokens);

      // Update auth store
      setUser(data.user);
      setLastLoginEmail(variables.email);

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    },
    onError: error => {
      console.error('[useLogin] Error:', error);
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
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};
