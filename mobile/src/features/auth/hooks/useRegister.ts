// src/features/auth/hooks/useRegister.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
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

      // UX IMPROVEMENT: Direct login after registration (no WelcomeSuccess screen)
      // Set auth state immediately to trigger navigation to Main
      console.log('[useRegister] 🔐 Setting auth state - automatic login');
      const setAuth = useAuthStore.getState().setAuth;
      await setAuth(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // Remember email for future logins
      await setLastLoginEmail(variables.email);

      // Clear registration form data
      resetRegistration();

      console.log('[useRegister] ✅ Registration & auto-login completed - navigating to Main');
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
