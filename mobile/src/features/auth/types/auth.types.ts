// src/features/auth/types/auth.types.ts
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import type { User, AuthTokens } from '@shared/types';

/**
 * Auth response from backend
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

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
 * Sprint 1: Added sectorId for sector-based community structure
 *
 * Updated for RegisterScreenOptimized:
 * - confirmPassword: optional (only used in legacy RegisterScreenMultiStep)
 * - acceptTerms: optional (implicit consent in optimized flow)
 * - sectorId/professionId: optional (can be skipped in 2-step flow)
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword?: string; // Optional: only for legacy RegisterScreenMultiStep
  firstName: string; // Mapped to 'name' in API call
  lastName: string; // Mapped to 'surname' in API call
  // Sprint 1: Sector-based community structure
  sectorId?: number | null;
  // Deprecated: Kept for backward compatibility
  professionId?: number | null;
  customProfession?: string;
  acceptTerms?: boolean; // Optional: implicit consent in RegisterScreenOptimized
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
  setAuth: (user: User, tokens: AuthTokens) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setLastLoginEmail: (email: string) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
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
