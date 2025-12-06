// src/features/messaging/hooks/useConversations.ts
// Conversations list hook with real-time sync
// Backend: ConversationController - GET /api/conversations
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import { useInfiniteQuery, useQueryClient, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { stompClient } from '../services/socketClient';
import type { WsMessageResponse, ConversationListResponse, Conversation } from '../types';
import { messagingService } from '../services';

export const CONVERSATIONS_QUERY_KEY = 'conversations';
export const UNREAD_COUNT_QUERY_KEY = 'unreadCount';

/**
 * Conversations list hook with real-time updates
 * Backend ConversationListResponse ile uyumlu
 */
export function useConversations() {
  const queryClient = useQueryClient();

  // Subscribe to real-time events
  useEffect(() => {
    // Invalidate conversations on new message
    const handleNewMessage = (_data: WsMessageResponse) => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    };

    // Connection restored - refetch data
    const handleConnect = () => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    };

    stompClient.on<WsMessageResponse>('message:new', handleNewMessage);
    stompClient.on('connect', handleConnect);

    return () => {
      stompClient.off<WsMessageResponse>('message:new', handleNewMessage);
      stompClient.off('connect', handleConnect);
    };
  }, [queryClient]);

  const query = useInfiniteQuery<ConversationListResponse, Error>({
    queryKey: [CONVERSATIONS_QUERY_KEY],
    queryFn: async ({ pageParam = 0 }) => {
      return messagingService.getConversations({
        page: pageParam as number,
        size: 20,
      });
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage.hasMore) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Flatten conversations from all pages
  const conversations = useMemo(() => {
    return query.data?.pages.flatMap(page => page.conversations) ?? [];
  }, [query.data]);

  // Total count
  const totalCount = query.data?.pages[0]?.totalElements ?? 0;

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
    return conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
  }, [conversations]);
}

export default useConversations;
