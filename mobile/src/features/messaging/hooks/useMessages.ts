// src/features/messaging/hooks/useMessages.ts
// Messages list hook with real-time sync
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md
// Oku: mobile-development-guide/core/13-REAL-TIME.md

import { useInfiniteQuery, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useEffect, useCallback, useMemo } from 'react';
import { stompClient } from '@core/socket';
import type { WsMessageResponse, WsReadReceipt } from '@core/socket';
import { messagingService } from '../services';
import type { MessagesResponse, Message, MessageStatus } from '../types';

export const MESSAGES_QUERY_KEY = 'messages';

/**
 * Messages list hook with real-time updates
 */
export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();

  // Subscribe to real-time message events
  useEffect(() => {
    if (!conversationId) return;

    // Handle new message received
    const unsubMessage = stompClient.on<WsMessageResponse>('message', (data) => {
      if (data.conversationId !== conversationId) return;

      // Convert WebSocket response to Message type
      const newMessage: Message = {
        id: data.messageId,
        conversationId: data.conversationId,
        senderId: String(data.senderId),
        content: data.content,
        type: 'text',
        status: data.status.toLowerCase() as MessageStatus,
        attachments: data.attachment ? [{
          id: data.attachment.s3Key,
          type: 'file',
          url: data.attachment.url,
          fileName: data.attachment.fileName,
          fileSize: data.attachment.fileSize,
        }] : [],
        createdAt: data.sentAt,
        updatedAt: data.sentAt,
      };

      // Update cache - add message to beginning of first page
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        (old) => {
          if (!old) return old;

          // Check if message already exists
          const exists = old.pages.some((page) =>
            page.data.some((m) => m.id === newMessage.id)
          );
          if (exists) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              data: [newMessage, ...newPages[0].data],
            };
          }

          return { ...old, pages: newPages };
        }
      );
    });

    // Handle read receipts
    const unsubRead = stompClient.on<WsReadReceipt>('read', (data) => {
      if (data.conversationId !== conversationId) return;

      // Update message statuses to 'read'
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) => ({
                ...msg,
                status: 'read' as MessageStatus,
                readAt: data.readAt,
              })),
            })),
          };
        }
      );
    });

    return () => {
      unsubMessage();
      unsubRead();
    };
  }, [conversationId, queryClient]);

  const query = useInfiniteQuery<MessagesResponse, Error>({
    queryKey: [MESSAGES_QUERY_KEY, conversationId],
    queryFn: async ({ pageParam }) => {
      return messagingService.getMessages(conversationId, pageParam as string | undefined);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Flatten messages from all pages
  const messages = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data) ?? [];
  }, [query.data]);

  // Mark messages as read when viewing
  const markAsRead = useCallback(() => {
    if (conversationId && stompClient.isConnected()) {
      stompClient.markAsRead(conversationId);
    }
  }, [conversationId]);

  return {
    ...query,
    messages,
    markAsRead,
  };
}

/**
 * Get last message for a conversation
 */
export function useLastMessage(conversationId: string) {
  const { messages } = useMessages(conversationId);
  return messages[0] ?? null;
}

export default useMessages;
