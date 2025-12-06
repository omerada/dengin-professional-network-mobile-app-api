// src/features/feed/hooks/useUserPosts.ts
// Kullanıcının postlarını getiren hook
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useInfiniteQuery } from '@tanstack/react-query';
import { feedService } from '../services';
import type { Post } from '../types';

export const USER_POSTS_QUERY_KEY = 'user-posts';

interface UseUserPostsOptions {
  userId: number | undefined;
  enabled?: boolean;
}

interface UseUserPostsResult {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  isRefetching: boolean;
}

/**
 * Hook to fetch user's posts with infinite scroll
 * Backend: GET /api/users/{userId}/posts
 */
export function useUserPosts({ userId, enabled = true }: UseUserPostsOptions): UseUserPostsResult {
  const query = useInfiniteQuery({
    queryKey: [USER_POSTS_QUERY_KEY, userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) throw new Error('userId is required');
      return feedService.getUserPosts(userId, pageParam, 10);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNext) return undefined;
      return allPages.length;
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const posts = query.data?.pages.flatMap(page => page.content) ?? [];

  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}
