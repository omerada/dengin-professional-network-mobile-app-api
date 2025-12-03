// src/features/messaging/hooks/useConversations.ts
// Conversations list hook with real-time sync
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md
// Oku: mobile-development-guide/core/13-REAL-TIME.md

import { useInfiniteQuery, useQueryClient, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { stompClient } from '@core/socket';
import type { WsMessageResponse } from '@core/socket';
import { messagingService } from '../services';
import type { ConversationsResponse, ConversationSummary } from '../types';

export const CONVERSATIONS_QUERY_KEY = 'conversations';
export const UNREAD_COUNT_QUERY_KEY = 'unreadCount';

/**
 * Conversations list hook with real-time updates
 */
export function useConversations() {
  const queryClient = useQueryClient();

  // Subscribe to real-time events
  useEffect(() => {
    // Invalidate conversations on new message
    const unsubMessage = stompClient.on<WsMessageResponse>('message', () => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    });

    // Connection restored - refetch data
    const unsubConnect = stompClient.on('connect', () => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    });

    return () => {
      unsubMessage();
      unsubConnect();
    };
  }, [queryClient]);

  const query = useInfiniteQuery<ConversationsResponse, Error>({
    queryKey: [CONVERSATIONS_QUERY_KEY],
    queryFn: async ({ pageParam }) => {
      return messagingService.getConversations(pageParam as string | undefined);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Flatten conversations from all pages
  const conversations = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data) ?? [];
  }, [query.data]);

  // Total count
  const totalCount = query.data?.pages[0]?.pagination.totalCount ?? 0;

  return {
    ...query,
    conversations,
    totalCount,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
  };
}

/**
 * Unread message count hook
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: [UNREAD_COUNT_QUERY_KEY],
    queryFn: () => messagingService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Calculate total unread count from conversations
 */
export function useTotalUnreadCount() {
  const { conversations } = useConversations();

  return useMemo(() => {
    return conversations.reduce(
      (sum: number, conv: ConversationSummary) => sum + conv.unreadCount,
      0
    );
  }, [conversations]);
}

export default useConversations;
