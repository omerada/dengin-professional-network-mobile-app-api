// src/features/auth/hooks/useLogout.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { authApi, tokenService } from '../services';
import { useAuthStore } from '../stores';
import { RootStackNavigationProp } from '@shared/types';

/**
 * Logout hook
 * Handles logout flow including token cleanup
 */
export const useLogout = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const logout = useAuthStore(state => state.logout);

  const mutation = useMutation({
    mutationFn: async () => {
      // Call logout API (optional, might fail if token expired)
      try {
        await authApi.logout();
      } catch (error) {
        // Ignore logout API errors
        console.warn('[useLogout] API logout failed:', error);
      }

      // Clear tokens
      await tokenService.clearTokens();

      // Clear auth store
      await logout();
    },
    onSuccess: () => {
      // Navigate to auth screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    },
    onError: error => {
      console.error('[useLogout] Error:', error);
      // Still navigate to auth on error
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    },
  });

  const handleLogout = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return {
    logout: handleLogout,
    isLoading: mutation.isPending,
  };
};
