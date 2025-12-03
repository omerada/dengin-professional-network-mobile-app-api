// src/features/auth/hooks/useRegister.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { authApi } from '../services';
import { RegisterFormData } from '../types';
import { AuthStackNavigationProp } from '@shared/types';

/**
 * Register hook with React Query mutation
 * Handles registration flow
 */
export const useRegister = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        profession: data.profession,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Navigate to email verification screen
      navigation.navigate('VerifyEmail', { email: variables.email });
    },
    onError: error => {
      console.error('[useRegister] Error:', error);
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
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};
