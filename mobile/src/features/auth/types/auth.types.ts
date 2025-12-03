// src/features/auth/types/auth.types.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { User, AuthTokens } from '@shared/types';

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
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
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
 * Login response from API
 */
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Register response from API
 */
export interface RegisterResponse {
  user: User;
  message: string;
}

/**
 * Biometric auth result
 */
export interface BiometricResult {
  success: boolean;
  error?: string;
}
