// src/features/feed/hooks/useFeed.ts
// Feed hook (React Query - Infinite Query)
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services';
import { useFeedStore } from '../stores';
import type { FeedResponse, FeedFilter } from '../types';

/**
 * Query keys
 */
export const FEED_QUERY_KEY = 'feed';

/**
 * Feed hook - infinite scroll destekli
 */
export function useFeed(filterOverride?: FeedFilter) {
  const storeFilter = useFeedStore((state) => state.filter);
  const filter = filterOverride ?? storeFilter;

  return useInfiniteQuery<FeedResponse, Error>({
    queryKey: [FEED_QUERY_KEY, filter],
    queryFn: async ({ pageParam }) => {
      return feedService.getFeed(pageParam as string | undefined, filter);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
}

/**
 * Feed'i yenile hook'u
 */
export function useRefreshFeed() {
  const queryClient = useQueryClient();
  const filter = useFeedStore((state) => state.filter);

  return () => {
    queryClient.invalidateQueries({ queryKey: [FEED_QUERY_KEY, filter] });
  };
}

/**
 * Feed data helper
 */
export function useFeedPosts(filterOverride?: FeedFilter) {
  const { data, ...rest } = useFeed(filterOverride);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.pagination.totalCount ?? 0;

  return {
    posts,
    totalCount,
    ...rest,
  };
}

export default useFeed;
