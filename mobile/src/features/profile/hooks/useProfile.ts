// src/features/profile/hooks/useProfile.ts
// React Query hooks for fetching profile data
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../services';
import type { MyProfileResponse, ProfileResponse, ProfileStats } from '../types';

/**
 * Query keys for profile data
 * Used for cache management and invalidation
 */
export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  detail: (id: number) => [...profileKeys.all, 'detail', id] as const,
  stats: (id: number) => [...profileKeys.all, 'stats', id] as const,
};

/**
 * Hook: Mevcut kullanıcı profili
 *
 * Backend: GET /api/users/me
 *
 * @returns MyProfileResponse with user data
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading, error } = useMyProfile();
 * ```
 */
export function useMyProfile() {
  return useQuery<MyProfileResponse, Error>({
    queryKey: profileKeys.me(),
    queryFn: profileApi.getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika cache (eski cacheTime)
  });
}

/**
 * Hook: Kullanıcı profili by ID
 *
 * Backend: GET /api/users/{id}
 *
 * @param userId - User ID to fetch
 * @returns ProfileResponse with public user data
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading } = useProfile(userId);
 * ```
 */
export function useProfile(userId: number | undefined) {
  return useQuery<ProfileResponse, Error>({
    queryKey: profileKeys.detail(userId!),
    queryFn: () => profileApi.getProfileById(userId!),
    enabled: !!userId && userId > 0,
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika cache
  });
}

/**
 * Hook: Kullanıcı istatistikleri
 *
 * Backend: GET /api/users/{id}/stats
 *
 * @param userId - User ID to fetch stats for
 * @returns ProfileStats with post, follower, following counts
 *
 * @example
 * ```tsx
 * const { data: stats } = useProfileStats(userId);
 * ```
 */
export function useProfileStats(userId: number | undefined) {
  return useQuery<ProfileStats, Error>({
    queryKey: profileKeys.stats(userId!),
    queryFn: () => profileApi.getProfileStats(userId!),
    enabled: !!userId && userId > 0,
    staleTime: 1 * 60 * 1000, // 1 dakika (daha sık güncellenir)
    gcTime: 5 * 60 * 1000, // 5 dakika cache
  });
}
