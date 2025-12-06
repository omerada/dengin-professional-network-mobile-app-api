// src/features/social/hooks/useFollow.ts
// Follow/Unfollow mutations
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../services';
import type { FollowResponse, BlockResponse } from '../types';

// Profile query keys for cache invalidation
const profileKeys = {
  all: ['profile'] as const,
  detail: (id: number) => ['profile', id] as const,
};

/**
 * Hook: Takip et
 */
export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation<FollowResponse, Error, number>({
    mutationFn: socialApi.follow,
    onSuccess: (_data: FollowResponse, userId: number) => {
      // İlgili profil cache'ini invalidate et
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });

      // Optimistic update for followers list
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

/**
 * Hook: Takipten çık
 */
export function useUnfollow() {
  const queryClient = useQueryClient();

  return useMutation<FollowResponse, Error, number>({
    mutationFn: socialApi.unfollow,
    onSuccess: (_data: FollowResponse, userId: number) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

/**
 * Hook: Engelle
 */
export function useBlock() {
  const queryClient = useQueryClient();

  return useMutation<BlockResponse, Error, number>({
    mutationFn: (userId: number) => socialApi.block(userId),
    onSuccess: (_data: BlockResponse, userId: number) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
    },
  });
}

/**
 * Hook: Engeli kaldır
 */
export function useUnblock() {
  const queryClient = useQueryClient();

  return useMutation<BlockResponse, Error, number>({
    mutationFn: socialApi.unblock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
    },
  });
}
