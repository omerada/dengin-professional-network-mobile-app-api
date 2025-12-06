// src/features/social/hooks/useFollowers.ts
// Followers/Following list queries
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import { useInfiniteQuery } from '@tanstack/react-query';
import { socialApi } from '../services';
import type { FollowListResponse } from '../types';

/**
 * Hook: Takipçi listesi (paginated)
 *
 * @param userId - Takipçilerini listelemek istediğimiz kullanıcının ID'si
 */
export function useFollowers(userId: number) {
  return useInfiniteQuery<FollowListResponse, Error>({
    queryKey: ['followers', userId],
    queryFn: ({ pageParam }) => socialApi.getFollowers(userId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage: FollowListResponse) => {
      if (!lastPage.hasNext) return undefined;
      return (lastPage.page ?? 0) + 1;
    },
    enabled: !!userId && userId > 0,
  });
}

/**
 * Hook: Takip edilen listesi (paginated)
 *
 * @param userId - Takip ettiklerini listelemek istediğimiz kullanıcının ID'si
 */
export function useFollowing(userId: number) {
  return useInfiniteQuery<FollowListResponse, Error>({
    queryKey: ['following', userId],
    queryFn: ({ pageParam }) => socialApi.getFollowing(userId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage: FollowListResponse) => {
      if (!lastPage.hasNext) return undefined;
      return (lastPage.page ?? 0) + 1;
    },
    enabled: !!userId && userId > 0,
  });
}
