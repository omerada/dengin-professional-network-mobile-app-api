// src/features/feed/hooks/useFeed.ts
// Feed hook (React Query - Infinite Query)
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md
//
// Cursor-based pagination desteklenir:
// - beforeId: Son post ID'sinden önceki postları getirmek için kullanılır
// - Her sayfa için son post'un ID'si cursor olarak kullanılır

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services';

/**
 * Feed list response type (matches feedService response)
 */
interface FeedListResponse {
  posts: import('../types').Post[];
  hasMore: boolean;
  lastId?: number;
}

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
  return useInfiniteQuery({
    queryKey: [FEED_QUERY_KEY, professionFilter, limit] as const,
    queryFn: async ({ pageParam }): Promise<FeedListResponse> => {
      // pageParam = beforeId (son post'un ID'si)
      return feedService.getFeed(limit, professionFilter, pageParam);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: FeedListResponse) => {
      // Sonraki sayfa için son post'un ID'sini cursor olarak kullan
      if (lastPage.hasMore && lastPage.posts.length > 0) {
        const lastPost = lastPage.posts[lastPage.posts.length - 1];
        return lastPost.id; // Son post'un ID'si = bir sonraki sayfa için cursor
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
  return useInfiniteQuery({
    queryKey: [TRENDING_FEED_KEY] as const,
    queryFn: async (): Promise<FeedListResponse> => {
      return feedService.getTrendingFeed(limit);
    },
    initialPageParam: 0 as number,
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

  const posts = data?.pages.flatMap(page => page.posts) ?? [];
  const totalCount = posts.length;

  return {
    posts,
    totalCount,
    ...rest,
  };
}

export default useFeed;
