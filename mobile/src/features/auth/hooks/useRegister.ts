// src/features/auth/hooks/useRegister.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../services';
import type { RegisterFormData } from '../types';
import { getErrorMessage } from '@core/utils/errorUtils';
import { useAuthStore } from '../stores';
import { useRegistrationStore } from '../stores/registrationStore';

/**
 * Register hook with React Query mutation
 * Handles registration flow with auto-login and welcome screen
 *
 * Backend API: POST /api/auth/register
 * Request: { email, password, name, surname, professionId?, customProfession? }
 * Response: LoginResponse { user, accessToken, refreshToken, tokenType, expiresIn }
 */
export const useRegister = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const setLastLoginEmail = useAuthStore(state => state.setLastLoginEmail);
  const resetRegistration = useRegistrationStore(state => state.reset);

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      // Backend expects 'name' and 'surname' instead of firstName/lastName
      // Sprint 1: Send sectorId for sector-based community structure
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        name: data.firstName,
        surname: data.lastName,
        sectorId: data.sectorId,
        professionId: data.professionId,
        customProfession: data.customProfession,
      });
      return response;
    },

    onSuccess: async (data, variables) => {
      console.log('[useRegister] ✅ Registration successful');
      console.log('[useRegister] User data:', data.user);

      // Store tokens temporarily in auth store WITHOUT triggering isAuthenticated
      // This allows WelcomeSuccess screen to access user data and tokens
      // User will manually continue, then setAuth will be called
      console.log('[useRegister] 💾 Storing tokens temporarily');
      const tempStore = useAuthStore.getState() as any;
      tempStore.user = data.user;
      tempStore.tempAccessToken = data.accessToken;
      tempStore.tempRefreshToken = data.refreshToken;

      // Navigate to WelcomeSuccess - user will manually continue from there
      console.log('[useRegister] 🎉 Navigating to WelcomeSuccess screen');
      navigation.navigate('WelcomeSuccess');

      // Remember email for future logins
      await setLastLoginEmail(variables.email);

      // Clear registration form data
      resetRegistration();

      console.log('[useRegister] ✅ Registration flow completed - waiting for user to continue');
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
