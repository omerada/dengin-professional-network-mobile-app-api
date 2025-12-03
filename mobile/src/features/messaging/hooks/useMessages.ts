// src/features/messaging/hooks/useMessages.ts
// Mesaj listesi hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useInfiniteQuery, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { messagingService, socketClient } from '../services';
import type { MessagesResponse, Message, MessageStatusEvent } from '../types';

export const MESSAGES_QUERY_KEY = 'messages';

/**
 * Mesaj listesi hook'u
 */
export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();

  // Socket event listener'ları
  useEffect(() => {
    if (!conversationId) return;

    // Konuşmaya katıl
    socketClient.joinConversation(conversationId);

    const handleNewMessage = (message: Message) => {
      if (message.conversationId !== conversationId) return;

      // Cache'i güncelle - yeni mesajı en başa ekle
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        (old) => {
          if (!old) return old;

          // Mesaj zaten varsa ekleme
          const existingMessage = old.pages.some((page) =>
            page.data.some((m) => m.id === message.id)
          );
          if (existingMessage) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              data: [message, ...newPages[0].data],
            };
          }

          return { ...old, pages: newPages };
        }
      );
    };

    const handleMessageStatus = (event: MessageStatusEvent) => {
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg.id === event.messageId
                  ? { ...msg, status: event.status }
                  : msg
              ),
            })),
          };
        }
      );
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((msg) => msg.id !== data.messageId),
            })),
          };
        }
      );
    };

    socketClient.on('message:new', handleNewMessage);
    socketClient.on('message:status', handleMessageStatus);
    socketClient.on('message:deleted', handleMessageDeleted);

    return () => {
      socketClient.leaveConversation(conversationId);
      socketClient.off('message:new', handleNewMessage);
      socketClient.off('message:status', handleMessageStatus);
      socketClient.off('message:deleted', handleMessageDeleted);
    };
  }, [conversationId, queryClient]);

  return useInfiniteQuery<MessagesResponse, Error>({
    queryKey: [MESSAGES_QUERY_KEY, conversationId],
    queryFn: async ({ pageParam }) => {
      return messagingService.getMessages(conversationId, pageParam as string | undefined);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 60 * 1000, // 1 dakika
  });
}

/**
 * Mesaj listesi data helper
 */
export function useMessagesData(conversationId: string) {
  const { data, ...rest } = useMessages(conversationId);

  const messages = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    messages,
    ...rest,
  };
}

/**
 * Son mesajı al (optimistic update için)
 */
export function useLastMessage(conversationId: string) {
  const { messages } = useMessagesData(conversationId);
  return messages[0] ?? null;
}

export default useMessages;
