// src/features/auth/stores/authStore.ts
// Oku: mobile-development-guide/state/14-ZUSTAND-STORE.md
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStore } from '../types';
import { secureStorage, SECURE_KEYS } from '@core/storage';
import type { User } from '@shared/types';
import { authApi } from '../services/authApi';
import { tokenService } from '../services/tokenService';

/**
 * Auth store with persistence
 * Manages user authentication state
 *
 * State is persisted to AsyncStorage (non-sensitive data)
 * Tokens are stored in SecureStorage (sensitive data)
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      biometricEnabled: false,
      lastLoginEmail: null,

      // Actions
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setBiometricEnabled: (enabled: boolean) => {
        set({ biometricEnabled: enabled });
      },

      setLastLoginEmail: (email: string) => {
        set({ lastLoginEmail: email });
      },

      /**
       * Set authenticated user with tokens
       */
      setAuth: async (user: User, tokens) => {
        try {
          // Store tokens securely
          await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, tokens.accessToken);
          await secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('[AuthStore] setAuth error:', error);
        }
      },

      /**
       * Initialize auth state on app start
       * Check for existing tokens and validate
       */
      initialize: async () => {
        try {
          set({ isLoading: true });

          // Check for existing access token
          const accessToken = await secureStorage.get(SECURE_KEYS.ACCESS_TOKEN);

          if (!accessToken) {
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          // Check if token is expired or expiring soon
          const expiresAt = await secureStorage.get(SECURE_KEYS.TOKEN_EXPIRES_AT);
          const now = Date.now();
          const safetyMargin = 60 * 1000; // 1 minute

          if (expiresAt && parseInt(expiresAt, 10) - now < safetyMargin) {
            // Token expired or expiring soon - try to refresh
            try {
              await tokenService.refreshAccessToken();
            } catch (refreshError) {
              // Refresh failed - logout user
              console.error('[AuthStore] Token refresh failed on init:', refreshError);
              await secureStorage.remove(SECURE_KEYS.ACCESS_TOKEN);
              await secureStorage.remove(SECURE_KEYS.REFRESH_TOKEN);
              await secureStorage.remove(SECURE_KEYS.TOKEN_EXPIRES_AT);
              set({ isLoading: false, isAuthenticated: false, user: null });
              return;
            }
          }

          // Token exists and is valid, user is authenticated
          // User data will be loaded from persisted state
          set({ isLoading: false, isAuthenticated: true });
        } catch (error) {
          console.error('[AuthStore] Initialize error:', error);
          set({ isLoading: false, isAuthenticated: false });
        }
      },

      /**
       * Logout user and clear all auth data
       */
      logout: async () => {
        try {
          // Clear secure storage
          await Promise.all([
            secureStorage.remove(SECURE_KEYS.ACCESS_TOKEN),
            secureStorage.remove(SECURE_KEYS.REFRESH_TOKEN),
            secureStorage.remove(SECURE_KEYS.TOKEN_EXPIRES_AT),
          ]);

          // Clear state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('[AuthStore] Logout error:', error);
        }
      },

      /**
       * Refresh access token
       */
      refreshToken: async () => {
        try {
          const refreshTokenValue = await secureStorage.get(SECURE_KEYS.REFRESH_TOKEN);
          if (!refreshTokenValue) {
            return false;
          }

          // Call refresh token API
          const response = await authApi.refreshToken(refreshTokenValue);
          await secureStorage.set(SECURE_KEYS.ACCESS_TOKEN, response.accessToken);
          await secureStorage.set(SECURE_KEYS.REFRESH_TOKEN, response.refreshToken);

          return true;
        } catch (error) {
          console.error('[AuthStore] refreshToken error:', error);
          // Token refresh failed, logout user
          await get().logout();
          return false;
        }
      },
    }),
    {
      name: 'meslektas-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        biometricEnabled: state.biometricEnabled,
        lastLoginEmail: state.lastLoginEmail,
      }),
    },
  ),
);

// Selectors for optimized re-renders
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectBiometricEnabled = (state: AuthStore) => state.biometricEnabled;
