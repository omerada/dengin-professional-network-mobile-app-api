// src/features/auth/types/auth.types.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import type { User, AuthTokens } from '@shared/types';

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register form data
 * Note: Backend expects 'name' and 'surname'
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string; // Mapped to 'name' in API call
  lastName: string;  // Mapped to 'surname' in API call
  phoneNumber?: string;
  profession?: string;
  acceptTerms: boolean;
}

/**
 * Forgot password form data
 */
export interface ForgotPasswordFormData {
  email: string;
}

/**
 * Reset password form data
 */
export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Change password form data
 */
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Auth store state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  lastLoginEmail: string | null;
}

/**
 * Auth store actions
 */
export interface AuthActions {
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setLastLoginEmail: (email: string) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Auth store type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Biometric auth result
 */
export interface BiometricResult {
  success: boolean;
  error?: string;
}

/**
 * Biometric config
 */
export interface BiometricConfig {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | null;
}
