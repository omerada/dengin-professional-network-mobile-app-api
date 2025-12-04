// src/features/auth/hooks/useAppleSignIn.ts
// Apple Sign-In hook (iOS only)
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART6.md

import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores';
import { oauth2Service } from '../services';
import type { AuthResponse } from '../types';

/**
 * Hook: Apple ile giriş yap (iOS only)
 *
 * @example
 * ```tsx
 * const appleSignIn = useAppleSignIn();
 *
 * const handleAppleLogin = async () => {
 *   try {
 *     await appleSignIn.mutateAsync();
 *     // Login successful, navigation handled by auth state
 *   } catch (error) {
 *     Alert.alert('Hata', error.message);
 *   }
 * };
 * ```
 */
export function useAppleSignIn() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, Error>({
    mutationFn: oauth2Service.signInWithApple,
    onSuccess: (data: AuthResponse) => {
      setAuth({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}
