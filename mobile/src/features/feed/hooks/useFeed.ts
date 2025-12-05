// src/features/feed/hooks/useFeed.ts
// Feed hook (React Query - Infinite Query)
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md
//
// Cursor-based pagination desteklenir:
// - beforeId: Son post ID'sinden önceki postları getirmek için kullanılır
// - Her sayfa için son post'un ID'si cursor olarak kullanılır

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services';
import type { FeedResponse } from '../types';

/**
 * Query keys
 */
export const FEED_QUERY_KEY = 'feed';
export const TRENDING_FEED_KEY = 'trending-feed';

/**
 * Feed hook with cursor-based pagination
 * GET /api/feed with beforeId cursor
 *
 * @param professionFilter - Meslek filtresi (optional)
 * @param limit - Kaç post getirilecek (max 50, default 20)
 */
export function useFeed(professionFilter?: number, limit = 20) {
  return useInfiniteQuery<FeedResponse, Error>({
    queryKey: [FEED_QUERY_KEY, professionFilter, limit],
    queryFn: async ({ pageParam }) => {
      // pageParam = beforeId (son post'un ID'si)
      return feedService.getFeed(limit, professionFilter, pageParam as number | undefined);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: lastPage => {
      // Sonraki sayfa için son post'un ID'sini cursor olarak kullan
      if (lastPage.hasNext && lastPage.content.length > 0) {
        const lastPost = lastPage.content[lastPage.content.length - 1];
        return lastPost.postId; // Son post'un ID'si = bir sonraki sayfa için cursor
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
 * Tüm sayfalardaki postları düz liste olarak döner
 */
export function useFeedPosts(professionFilter?: number, limit = 20) {
  const { data, ...rest } = useFeed(professionFilter, limit);

  const posts = data?.pages.flatMap(page => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? 0;

  return {
    posts,
    totalCount,
    ...rest,
  };
}

export default useFeed;
