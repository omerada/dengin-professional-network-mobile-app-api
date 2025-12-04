// src/features/auth/hooks/useForgotPassword.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { authApi } from '../services';
import type { ForgotPasswordFormData } from '../types';

/**
 * Forgot password hook
 * Handles password reset email request
 * 
 * Backend API: POST /api/auth/password-reset/request
 * Note: Always returns 204 No Content for security (prevents email enumeration)
 */
export const useForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      // Backend always returns 204 for security
      await authApi.forgotPassword(data.email);
    },

    onSuccess: () => {
      // Always show success message even if email doesn't exist (security)
      setIsEmailSent(true);
    },

    onError: (error: Error) => {
      // Network or server errors only
      console.error('[useForgotPassword] Error:', error.message);
    },
  });

  const requestReset = useCallback(
    (data: ForgotPasswordFormData) => {
      mutation.mutate(data);
    },
    [mutation],
  );

  const resetState = useCallback(() => {
    setIsEmailSent(false);
    mutation.reset();
  }, [mutation]);

  return {
    requestReset,
    requestResetAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isEmailSent,
    reset: resetState,
  };
};
