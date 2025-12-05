// src/features/social/stores/socialStore.ts
// Social/follow state management
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FollowUser } from '../types';

/**
 * Following relationship
 */
interface FollowRelationship {
  userId: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  updatedAt: number;
}

/**
 * Social store state
 */
interface SocialState {
  // Following relationships cache
  followRelationships: Map<number, FollowRelationship>;

  // Followers cache
  followersCache: Map<number, FollowUser[]>;
  followersLastFetch: Map<number, number>;

  // Following cache
  followingCache: Map<number, FollowUser[]>;
  followingLastFetch: Map<number, number>;

  // User follow counts
  followerCounts: Map<number, number>;
  followingCounts: Map<number, number>;

  // Loading states
  loadingFollowState: Set<number>;
}

/**
 * Social store actions
 */
interface SocialActions {
  // Follow relationship management
  setFollowRelationship: (userId: number, isFollowing: boolean, isFollowedBy?: boolean) => void;
  getFollowRelationship: (userId: number) => FollowRelationship | undefined;
  isFollowing: (userId: number) => boolean;
  isFollowedBy: (userId: number) => boolean;

  // Followers cache
  setFollowers: (userId: number, followers: FollowUser[]) => void;
  getFollowers: (userId: number) => FollowUser[] | undefined;
  addFollower: (userId: number, follower: FollowUser) => void;
  removeFollower: (userId: number, followerId: number) => void;
  clearFollowersCache: (userId: number) => void;

  // Following cache
  setFollowing: (userId: number, following: FollowUser[]) => void;
  getFollowing: (userId: number) => FollowUser[] | undefined;
  addFollowing: (userId: number, user: FollowUser) => void;
  removeFollowing: (userId: number, followingId: number) => void;
  clearFollowingCache: (userId: number) => void;

  // Counts management
  setFollowerCount: (userId: number, count: number) => void;
  setFollowingCount: (userId: number, count: number) => void;
  incrementFollowerCount: (userId: number) => void;
  decrementFollowerCount: (userId: number) => void;
  incrementFollowingCount: (userId: number) => void;
  decrementFollowingCount: (userId: number) => void;

  // Loading states
  setLoadingFollowState: (userId: number, loading: boolean) => void;
  isLoadingFollowState: (userId: number) => boolean;

  // Optimistic updates
  optimisticFollow: (userId: number) => void;
  optimisticUnfollow: (userId: number) => void;
  revertFollowState: (userId: number, wasFollowing: boolean) => void;

  // Cache management
  isFollowersCacheStale: (userId: number, maxAge?: number) => boolean;
  isFollowingCacheStale: (userId: number, maxAge?: number) => boolean;
  clearAllCache: () => void;

  // Reset
  reset: () => void;
}

type SocialStore = SocialState & SocialActions;

/**
 * Initial state
 */
const initialState: SocialState = {
  followRelationships: new Map(),
  followersCache: new Map(),
  followersLastFetch: new Map(),
  followingCache: new Map(),
  followingLastFetch: new Map(),
  followerCounts: new Map(),
  followingCounts: new Map(),
  loadingFollowState: new Set(),
};

/**
 * Default cache max age (5 minutes)
 */
const DEFAULT_CACHE_MAX_AGE = 5 * 60 * 1000;

/**
 * Social store
 */
export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== Follow Relationship Management ==========

      setFollowRelationship: (userId: number, isFollowing: boolean, isFollowedBy?: boolean) => {
        const { followRelationships } = get();
        const existing = followRelationships.get(userId);
        const newRelationships = new Map(followRelationships);
        newRelationships.set(userId, {
          userId,
          isFollowing,
          isFollowedBy: isFollowedBy ?? existing?.isFollowedBy ?? false,
          updatedAt: Date.now(),
        });
        set({ followRelationships: newRelationships });
      },

      getFollowRelationship: (userId: number) => {
        return get().followRelationships.get(userId);
      },

      isFollowing: (userId: number) => {
        const relationship = get().followRelationships.get(userId);
        return relationship?.isFollowing ?? false;
      },

      isFollowedBy: (userId: number) => {
        const relationship = get().followRelationships.get(userId);
        return relationship?.isFollowedBy ?? false;
      },

      // ========== Followers Cache ==========

      setFollowers: (userId: number, followers: FollowUser[]) => {
        const { followersCache, followersLastFetch } = get();
        const newCache = new Map(followersCache);
        const newLastFetch = new Map(followersLastFetch);
        newCache.set(userId, followers);
        newLastFetch.set(userId, Date.now());
        set({ followersCache: newCache, followersLastFetch: newLastFetch });
      },

      getFollowers: (userId: number) => {
        return get().followersCache.get(userId);
      },

      addFollower: (userId: number, follower: FollowUser) => {
        const { followersCache } = get();
        const existing = followersCache.get(userId) || [];
        if (!existing.find(f => f.id === follower.id)) {
          const newCache = new Map(followersCache);
          newCache.set(userId, [follower, ...existing]);
          set({ followersCache: newCache });
        }
      },

      removeFollower: (userId: number, followerId: number) => {
        const { followersCache } = get();
        const existing = followersCache.get(userId);
        if (existing) {
          const newCache = new Map(followersCache);
          newCache.set(
            userId,
            existing.filter(f => f.id !== followerId),
          );
          set({ followersCache: newCache });
        }
      },

      clearFollowersCache: (userId: number) => {
        const { followersCache, followersLastFetch } = get();
        const newCache = new Map(followersCache);
        const newLastFetch = new Map(followersLastFetch);
        newCache.delete(userId);
        newLastFetch.delete(userId);
        set({ followersCache: newCache, followersLastFetch: newLastFetch });
      },

      // ========== Following Cache ==========

      setFollowing: (userId: number, following: FollowUser[]) => {
        const { followingCache, followingLastFetch } = get();
        const newCache = new Map(followingCache);
        const newLastFetch = new Map(followingLastFetch);
        newCache.set(userId, following);
        newLastFetch.set(userId, Date.now());
        set({ followingCache: newCache, followingLastFetch: newLastFetch });
      },

      getFollowing: (userId: number) => {
        return get().followingCache.get(userId);
      },

      addFollowing: (userId: number, user: FollowUser) => {
        const { followingCache } = get();
        const existing = followingCache.get(userId) || [];
        if (!existing.find(f => f.id === user.id)) {
          const newCache = new Map(followingCache);
          newCache.set(userId, [user, ...existing]);
          set({ followingCache: newCache });
        }
      },

      removeFollowing: (userId: number, followingId: number) => {
        const { followingCache } = get();
        const existing = followingCache.get(userId);
        if (existing) {
          const newCache = new Map(followingCache);
          newCache.set(
            userId,
            existing.filter(f => f.id !== followingId),
          );
          set({ followingCache: newCache });
        }
      },

      clearFollowingCache: (userId: number) => {
        const { followingCache, followingLastFetch } = get();
        const newCache = new Map(followingCache);
        const newLastFetch = new Map(followingLastFetch);
        newCache.delete(userId);
        newLastFetch.delete(userId);
        set({ followingCache: newCache, followingLastFetch: newLastFetch });
      },

      // ========== Counts Management ==========

      setFollowerCount: (userId: number, count: number) => {
        const { followerCounts } = get();
        const newCounts = new Map(followerCounts);
        newCounts.set(userId, count);
        set({ followerCounts: newCounts });
      },

      setFollowingCount: (userId: number, count: number) => {
        const { followingCounts } = get();
        const newCounts = new Map(followingCounts);
        newCounts.set(userId, count);
        set({ followingCounts: newCounts });
      },

      incrementFollowerCount: (userId: number) => {
        const { followerCounts } = get();
        const current = followerCounts.get(userId) || 0;
        const newCounts = new Map(followerCounts);
        newCounts.set(userId, current + 1);
        set({ followerCounts: newCounts });
      },

      decrementFollowerCount: (userId: number) => {
        const { followerCounts } = get();
        const current = followerCounts.get(userId) || 0;
        const newCounts = new Map(followerCounts);
        newCounts.set(userId, Math.max(0, current - 1));
        set({ followerCounts: newCounts });
      },

      incrementFollowingCount: (userId: number) => {
        const { followingCounts } = get();
        const current = followingCounts.get(userId) || 0;
        const newCounts = new Map(followingCounts);
        newCounts.set(userId, current + 1);
        set({ followingCounts: newCounts });
      },

      decrementFollowingCount: (userId: number) => {
        const { followingCounts } = get();
        const current = followingCounts.get(userId) || 0;
        const newCounts = new Map(followingCounts);
        newCounts.set(userId, Math.max(0, current - 1));
        set({ followingCounts: newCounts });
      },

      // ========== Loading States ==========

      setLoadingFollowState: (userId: number, loading: boolean) => {
        const { loadingFollowState } = get();
        const newLoading = new Set(loadingFollowState);
        if (loading) {
          newLoading.add(userId);
        } else {
          newLoading.delete(userId);
        }
        set({ loadingFollowState: newLoading });
      },

      isLoadingFollowState: (userId: number) => {
        return get().loadingFollowState.has(userId);
      },

      // ========== Optimistic Updates ==========

      optimisticFollow: (userId: number) => {
        const state = get();
        state.setFollowRelationship(userId, true);
        state.incrementFollowerCount(userId);
      },

      optimisticUnfollow: (userId: number) => {
        const state = get();
        state.setFollowRelationship(userId, false);
        state.decrementFollowerCount(userId);
      },

      revertFollowState: (userId: number, wasFollowing: boolean) => {
        const state = get();
        state.setFollowRelationship(userId, wasFollowing);
        if (wasFollowing) {
          state.incrementFollowerCount(userId);
        } else {
          state.decrementFollowerCount(userId);
        }
      },

      // ========== Cache Management ==========

      isFollowersCacheStale: (userId: number, maxAge = DEFAULT_CACHE_MAX_AGE) => {
        const lastFetch = get().followersLastFetch.get(userId);
        if (!lastFetch) return true;
        return Date.now() - lastFetch > maxAge;
      },

      isFollowingCacheStale: (userId: number, maxAge = DEFAULT_CACHE_MAX_AGE) => {
        const lastFetch = get().followingLastFetch.get(userId);
        if (!lastFetch) return true;
        return Date.now() - lastFetch > maxAge;
      },

      clearAllCache: () => {
        set({
          followersCache: new Map(),
          followersLastFetch: new Map(),
          followingCache: new Map(),
          followingLastFetch: new Map(),
        });
      },

      // ========== Reset ==========

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'social-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        // Persist follow relationships as array of entries
        followRelationships: Array.from(state.followRelationships.entries()),
        // Persist counts
        followerCounts: Array.from(state.followerCounts.entries()),
        followingCounts: Array.from(state.followingCounts.entries()),
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          // Convert arrays back to Maps
          if (Array.isArray(state.followRelationships)) {
            state.followRelationships = new Map(
              state.followRelationships as unknown as [number, FollowRelationship][],
            );
          }
          if (Array.isArray(state.followerCounts)) {
            state.followerCounts = new Map(state.followerCounts as unknown as [number, number][]);
          }
          if (Array.isArray(state.followingCounts)) {
            state.followingCounts = new Map(state.followingCounts as unknown as [number, number][]);
          }
          // Initialize empty Maps for non-persisted cache
          state.followersCache = new Map();
          state.followersLastFetch = new Map();
          state.followingCache = new Map();
          state.followingLastFetch = new Map();
          state.loadingFollowState = new Set();
        }
      },
    },
  ),
);

/**
 * Hook: Get follow state for a user
 */
export const useFollowState = (userId: number) => {
  return useSocialStore(state => ({
    isFollowing: state.followRelationships.get(userId)?.isFollowing ?? false,
    isFollowedBy: state.followRelationships.get(userId)?.isFollowedBy ?? false,
    isLoading: state.loadingFollowState.has(userId),
    followerCount: state.followerCounts.get(userId) ?? 0,
    followingCount: state.followingCounts.get(userId) ?? 0,
  }));
};

/**
 * Hook: Get followers for a user
 */
export const useFollowersList = (userId: number) => {
  return useSocialStore(state => state.followersCache.get(userId) ?? []);
};

/**
 * Hook: Get following for a user
 */
export const useFollowingList = (userId: number) => {
  return useSocialStore(state => state.followingCache.get(userId) ?? []);
};

export default useSocialStore;
