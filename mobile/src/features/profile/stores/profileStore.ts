// src/features/profile/stores/profileStore.ts
// Zustand store for profile state management
// Oku: mobile-development-guide/state/14-ZUSTAND-STORE.md

import { create } from 'zustand';
import type { ProfileStoreState, ProfileResponse } from '../types';

/**
 * Profile Store
 *
 * Görüntülenen profil state'ini yönetir (current user değil)
 * Current user state'i AuthStore'da tutulur
 *
 * Use cases:
 * - Başka bir kullanıcının profil sayfasını görüntüleme
 * - Profil sayfaları arası geçişlerde cache
 */
export const useProfileStore = create<ProfileStoreState>((set) => ({
  // State
  viewedProfile: null,
  isLoadingProfile: false,

  // Actions
  setViewedProfile: (profile: ProfileResponse | null) => {
    set({ viewedProfile: profile });
  },

  setLoadingProfile: (loading: boolean) => {
    set({ isLoadingProfile: loading });
  },

  clearViewedProfile: () => {
    set({ viewedProfile: null, isLoadingProfile: false });
  },
}));

// Selectors for optimized re-renders
export const selectViewedProfile = (state: ProfileStoreState) => state.viewedProfile;
export const selectIsLoadingProfile = (state: ProfileStoreState) => state.isLoadingProfile;

export default useProfileStore;
