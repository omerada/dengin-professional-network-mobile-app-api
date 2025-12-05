// src/features/feed/hooks/useFeed.ts
// Feed hook (React Query - Infinite Query)
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md
//
// NOT: Backend FeedController 'page' parametresi KULLANMAZ, sadece 'limit' alır.
// Bu yüzden true infinite scroll yerine "load more" yaklaşımı kullanılır.
// Backend cursor-based pagination desteklerse bu hook güncellenebilir.

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
 * Feed hook
 * GET /api/feed with limit-based loading
 *
 * NOT: Backend pagination DESTEKLEMEZ (page parametresi yok).
 * Her request'te 'limit' kadar post getirilir.
 * Şu anki implementasyon ilk sayfa için çalışır.
 *
 * @param professionFilter - Meslek filtresi (optional)
 * @param limit - Kaç post getirilecek (max 50, default 20)
 */
export function useFeed(professionFilter?: number, limit = 20) {
  return useInfiniteQuery<FeedResponse, Error>({
    queryKey: [FEED_QUERY_KEY, professionFilter, limit],
    queryFn: async () => {
      // Backend sadece 'limit' parametresi alır, pagination yok
      return feedService.getFeed(limit, professionFilter);
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      // Backend pagination desteklemediği için şimdilik devre dışı
      // Cursor-based pagination eklenirse burası güncellenecek
      if (lastPage.hasNext && lastPage.content.length > 0) {
        // Backend'de lastId/cursor desteği gelince:
        // return lastPage.content[lastPage.content.length - 1].id;
        return undefined; // Şimdilik pagination devre dışı
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
