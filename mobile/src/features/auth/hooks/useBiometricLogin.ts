// src/features/auth/hooks/useBiometricLogin.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { biometricService, authApi, tokenService } from '../services';
import { useAuthStore } from '../stores';
import { getErrorMessage } from '@core/utils/errorUtils';
import { resetNavigation } from '@core/navigation/AppNavigator';

/**
 * Biometric login hook
 * Handles biometric authentication flow
 *
 * Flow:
 * 1. User triggers biometric auth
 * 2. Biometric service verifies identity
 * 3. Get stored refresh token
 * 4. Refresh to get new access token
 * 5. Navigate to main app
 */
export const useBiometricLogin = () => {
  const { setUser, biometricEnabled } = useAuthStore();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricName, setBiometricName] = useState<string>('');

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const { available } = await biometricService.isAvailable();
        const isEnabled = await biometricService.isEnabled();
        setIsBiometricAvailable(available && isEnabled);

        if (available) {
          const name = await biometricService.getBiometricName();
          setBiometricName(name);
        }
      } catch (error) {
        console.warn('[useBiometricLogin] Failed to check biometric availability:', error);
        setIsBiometricAvailable(false);
      }
    };

    checkBiometric();
  }, [biometricEnabled]);

  const mutation = useMutation({
    mutationFn: async () => {
      // Get stored credentials with biometric auth
      const credentials = await biometricService.getStoredCredentials();

      if (!credentials) {
        throw new Error('Biyometrik doğrulama başarısız veya kayıtlı kimlik bilgisi yok');
      }

      // Refresh token to get new access token
      // Backend: POST /api/auth/refresh with Refresh-Token header
      const response = await authApi.refreshToken(credentials.refreshToken);

      // Get current user data
      const user = await authApi.getCurrentUser();

      return { tokens: response, user };
    },

    onSuccess: async ({ tokens, user }) => {
      // Save new tokens
      await tokenService.saveTokens(tokens);

      // Update auth store
      setUser(user);

      // Navigate to main app using helper function
      resetNavigation(0, [{ name: 'Main' }]);
    },

    onError: (error: Error) => {
      console.error('[useBiometricLogin] Biometric auth error:', getErrorMessage(error));
    },
  });

  const loginWithBiometric = useCallback(() => {
    if (isBiometricAvailable) {
      mutation.mutate();
    }
  }, [isBiometricAvailable, mutation]);

  return {
    loginWithBiometric,
    loginWithBiometricAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isBiometricAvailable,
    biometricName,
    reset: mutation.reset,
  };
};
