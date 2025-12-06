// src/features/auth/hooks/useRegister.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { authApi } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RegisterFormData } from '../types';
import { getErrorMessage } from '@core/utils/errorUtils';

/**
 * Register hook with React Query mutation
 * Handles registration flow with auto-login
 *
 * Backend API: POST /api/auth/register
 * Request: { email, password, name, surname, professionId?, customProfession? }
 * Response: LoginResponse { user, accessToken, refreshToken, tokenType, expiresIn }
 */
export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      // Backend expects 'name' and 'surname' instead of firstName/lastName
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        name: data.firstName,
        surname: data.lastName,
        professionId: data.professionId,
        customProfession: data.customProfession,
      });
      return response;
    },

    onSuccess: async (data, _variables) => {
      // Auto-login: Store tokens in AsyncStorage
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      // Navigation to home will be handled by the app
    },

    onError: (error: Error) => {
      console.error('[useRegister] Registration error:', getErrorMessage(error));
    },
  });

  const register = useCallback(
    (data: RegisterFormData) => {
      mutation.mutate(data);
    },
    [mutation],
  );

  return {
    register,
    registerAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
