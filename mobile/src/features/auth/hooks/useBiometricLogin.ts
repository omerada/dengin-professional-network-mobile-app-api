// src/features/auth/hooks/useBiometricLogin.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { biometricService, authApi, tokenService } from '../services';
import { useAuthStore } from '../stores';
import { RootStackNavigationProp } from '@shared/types';

/**
 * Biometric login hook
 * Handles biometric authentication flow
 */
export const useBiometricLogin = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { setUser, biometricEnabled } = useAuthStore();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricName, setBiometricName] = useState<string>('');

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      const { available } = await biometricService.isAvailable();
      const isEnabled = await biometricService.isEnabled();
      setIsBiometricAvailable(available && isEnabled);

      if (available) {
        const name = await biometricService.getBiometricName();
        setBiometricName(name);
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
      const response = await authApi.refreshToken(credentials.refreshToken);
      return response;
    },
    onSuccess: async data => {
      // Save new tokens
      await tokenService.saveTokens(data.tokens);

      // Update auth store
      setUser(data.user);

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    },
    onError: error => {
      console.error('[useBiometricLogin] Error:', error);
    },
  });

  const loginWithBiometric = useCallback(() => {
    if (isBiometricAvailable) {
      mutation.mutate();
    }
  }, [isBiometricAvailable, mutation]);

  return {
    loginWithBiometric,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isBiometricAvailable,
    biometricName,
    reset: mutation.reset,
  };
};
