// src/features/auth/hooks/useForgotPassword.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { authApi } from '../services';
import { ForgotPasswordFormData } from '../types';

/**
 * Forgot password hook
 * Handles password reset email request
 */
export const useForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await authApi.forgotPassword(data.email);
      return response;
    },
    onSuccess: () => {
      setIsEmailSent(true);
    },
    onError: error => {
      console.error('[useForgotPassword] Error:', error);
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
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isEmailSent,
    reset: resetState,
  };
};
