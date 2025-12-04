// src/features/auth/hooks/useGoogleSignIn.ts
// Google Sign-In hook
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART6.md

import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores';
import { oauth2Service } from '../services';
import type { AuthResponse } from '../types';

/**
 * Hook: Google ile giriş yap
 *
 * @example
 * ```tsx
 * const googleSignIn = useGoogleSignIn();
 *
 * const handleGoogleLogin = async () => {
 *   try {
 *     await googleSignIn.mutateAsync();
 *     // Login successful, navigation handled by auth state
 *   } catch (error) {
 *     Alert.alert('Hata', error.message);
 *   }
 * };
 * ```
 */
export function useGoogleSignIn() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, Error>({
    mutationFn: oauth2Service.signInWithGoogle,
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
