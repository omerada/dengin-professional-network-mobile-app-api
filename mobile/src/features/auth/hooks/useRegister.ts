// src/features/auth/hooks/useRegister.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { authApi } from '../services';
import type { RegisterFormData } from '../types';
import type { AuthStackNavigationProp } from '@shared/types';

/**
 * Register hook with React Query mutation
 * Handles registration flow
 * 
 * Backend API: POST /api/auth/register
 * Request: { email, password, name, surname }
 * Response: { id, email, name, surname, createdAt }
 */
export const useRegister = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      // Backend expects 'name' and 'surname' instead of firstName/lastName
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        name: data.firstName,
        surname: data.lastName,
      });
      return response;
    },

    onSuccess: (_data, variables) => {
      // Show success message
      Alert.alert(
        'Kayıt Başarılı',
        'Hesabınız oluşturuldu. E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    },

    onError: (error: Error) => {
      console.error('[useRegister] Error:', error.message);
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
