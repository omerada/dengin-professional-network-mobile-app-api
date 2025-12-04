// src/features/auth/stores/authStore.ts
// Oku: mobile-development-guide/state/14-ZUSTAND-STORE.md
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStore } from '../types';
import { secureStorage, SECURE_KEYS } from '@core/storage';
import type { User } from '@shared/types';

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

          // Token exists, user is authenticated
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
          await secureStorage.remove(SECURE_KEYS.ACCESS_TOKEN);
          await secureStorage.remove(SECURE_KEYS.REFRESH_TOKEN);

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
