// src/features/messaging/hooks/useConversations.ts
// Konuşma listesi hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { messagingService, socketClient } from '../services';
import type { ConversationsResponse, ConversationSummary, Message } from '../types';

export const CONVERSATIONS_QUERY_KEY = 'conversations';

/**
 * Konuşma listesi hook'u
 */
export function useConversations() {
  const queryClient = useQueryClient();

  // Socket event listener'ları
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Konuşma listesini güncelle
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    };

    const handleConversationUpdate = () => {
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    };

    socketClient.on('message:new', handleNewMessage);
    socketClient.on('conversation:update', handleConversationUpdate);

    return () => {
      socketClient.off('message:new', handleNewMessage);
      socketClient.off('conversation:update', handleConversationUpdate);
    };
  }, [queryClient]);

  return useInfiniteQuery<ConversationsResponse, Error>({
    queryKey: [CONVERSATIONS_QUERY_KEY],
    queryFn: async ({ pageParam }) => {
      return messagingService.getConversations(pageParam as string | undefined);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30 * 1000, // 30 saniye
  });
}

/**
 * Konuşma listesi data helper
 */
export function useConversationsData() {
  const { data, ...rest } = useConversations();

  const conversations = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.pagination.totalCount ?? 0;

  return {
    conversations,
    totalCount,
    ...rest,
  };
}

/**
 * Okunmamış mesaj sayısı hook'u
 */
export function useUnreadCount() {
  const { conversations } = useConversationsData();
  
  return conversations.reduce((sum: number, conv: ConversationSummary) => sum + conv.unreadCount, 0);
}

export default useConversations;
