// src/features/feed/stores/feedStore.ts
// Feed store (Zustand)
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FeedStoreState, FeedFilter, LocalImage } from '../types';

/**
 * Maximum draft images
 */
const MAX_DRAFT_IMAGES = 5;

/**
 * Maximum content length
 */
export const MAX_CONTENT_LENGTH = 500;

type FeedStorePersist = (
  config: StateCreator<FeedStoreState>,
  options: PersistOptions<FeedStoreState, Partial<FeedStoreState>>,
) => StateCreator<FeedStoreState>;

/**
 * Feed Store
 */
export const useFeedStore = create<FeedStoreState>()(
  (persist as FeedStorePersist)(
    (set, get): FeedStoreState => ({
      // Filter
      filter: 'all' as FeedFilter,
      setFilter: (filter: FeedFilter) => set({ filter }),

      // Draft post
      draftContent: '',
      draftImages: [],

      setDraftContent: (content: string) => {
        // Enforce max length
        const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);
        set({ draftContent: trimmedContent });
      },

      addDraftImage: (image: LocalImage) => {
        const { draftImages } = get();
        if (draftImages.length < MAX_DRAFT_IMAGES) {
          set({ draftImages: [...draftImages, image] });
        }
      },

      removeDraftImage: (index: number) => {
        const { draftImages } = get();
        set({
          draftImages: draftImages.filter((_: LocalImage, i: number) => i !== index),
        });
      },

      clearDraft: () => {
        set({
          draftContent: '',
          draftImages: [],
        });
      },

      // Verification prompt tracking (session-based)
      verificationPromptShown: false,

      setVerificationPromptShown: (shown: boolean) => {
        set({ verificationPromptShown: shown });
      },
    }),
    {
      name: 'feed-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: FeedStoreState) => ({
        filter: state.filter,
        draftContent: state.draftContent,
        // Images are not persisted (file URIs may become invalid)
        // verificationPromptShown is NOT persisted (session-only)
      }),
    },
  ),
);

/**
 * Selectors
 */
export const selectFilter = (state: FeedStoreState) => state.filter;
export const selectDraftContent = (state: FeedStoreState) => state.draftContent;
export const selectDraftImages = (state: FeedStoreState) => state.draftImages;
export const selectHasDraft = (state: FeedStoreState) =>
  state.draftContent.length > 0 || state.draftImages.length > 0;
export const selectContentLength = (state: FeedStoreState) => state.draftContent.length;
export const selectRemainingChars = (state: FeedStoreState) =>
  MAX_CONTENT_LENGTH - state.draftContent.length;

export default useFeedStore;
