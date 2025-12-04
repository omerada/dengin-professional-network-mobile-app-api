// src/features/feed/hooks/useFeed.ts
// Feed hook (React Query - Infinite Query)
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services';
import { useFeedStore } from '../stores';
import type { FeedResponse, FeedFilter } from '../types';

/**
 * Query keys
 */
export const FEED_QUERY_KEY = 'feed';
export const TRENDING_FEED_KEY = 'trending-feed';

/**
 * Feed hook - infinite scroll destekli
 * GET /api/feed with page-based pagination
 */
export function useFeed(professionFilter?: number) {
  return useInfiniteQuery<FeedResponse, Error>({
    queryKey: [FEED_QUERY_KEY, professionFilter],
    queryFn: async ({ pageParam = 0 }) => {
      return feedService.getFeed(pageParam as number, 20, professionFilter);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
}

/**
 * Trending Feed hook
 * GET /api/feed/trending
 */
export function useTrendingFeed(limit = 20) {
  return useInfiniteQuery<FeedResponse, Error>({
    queryKey: [TRENDING_FEED_KEY],
    queryFn: async () => {
      return feedService.getTrendingFeed(limit);
    },
    initialPageParam: 0,
    getNextPageParam: () => undefined, // Trending has no pagination
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 15 * 60 * 1000, // 15 dakika
  });
}

/**
 * Feed'i yenile hook'u
 */
export function useRefreshFeed() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [FEED_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [TRENDING_FEED_KEY] });
  };
}

/**
 * Feed data helper
 */
export function useFeedPosts(professionFilter?: number) {
  const { data, ...rest } = useFeed(professionFilter);

  const posts = data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? 0;

  return {
    posts,
    totalCount,
    ...rest,
  };
}

export default useFeed;
