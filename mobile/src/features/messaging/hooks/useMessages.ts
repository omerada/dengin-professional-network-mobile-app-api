// src/features/messaging/hooks/useMessages.ts
// Messages list hook with real-time sync
// Backend: ConversationController - GET /api/conversations/{id}/messages
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import { useInfiniteQuery, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useEffect, useCallback, useMemo } from 'react';
import { stompClient } from '../services/socketClient';
import type { WsMessageResponse, WsReadReceipt, MessageListResponse, Message } from '../types';
import { messagingService } from '../services';

export const MESSAGES_QUERY_KEY = 'messages';

/**
 * Messages list hook with real-time updates
 * Backend MessageListResponse ile uyumlu
 */
export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();

  // Subscribe to real-time message events
  useEffect(() => {
    if (!conversationId) return;

    // Handle new message received
    const handleNewMessage = (data: WsMessageResponse) => {
      if (data.conversationId !== conversationId) return;

      // Convert WebSocket response to Message type
      const newMessage: Message = {
        messageId: data.messageId,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: '', // Will be populated from conversation participant
        content: data.content,
        attachment: data.attachment,
        status: data.status,
        read: false,
        sentByMe: false, // Backend will determine this
        sentAt: data.sentAt,
        readAt: null,
      };

      // Update cache - add message to beginning of first page
      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        old => {
          if (!old) return old;

          // Check if message already exists
          const exists = old.pages.some(page =>
            page.messages.some(m => m.messageId === newMessage.messageId),
          );
          if (exists) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              messages: [newMessage, ...newPages[0].messages],
              totalMessages: newPages[0].totalMessages + 1,
            };
          }

          return { ...old, pages: newPages };
        },
      );
    };

    // Handle read receipts
    const handleReadReceipt = (data: WsReadReceipt) => {
      if (data.conversationId !== conversationId) return;

      // Update message statuses to 'READ'
      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        old => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              messages: page.messages.map(msg => ({
                ...msg,
                status: 'READ' as const,
                read: true,
                readAt: data.readAt,
              })),
            })),
          };
        },
      );
    };

    stompClient.on<WsMessageResponse>('message:new', handleNewMessage);
    stompClient.on<WsReadReceipt>('read', handleReadReceipt);

    return () => {
      stompClient.off<WsMessageResponse>('message:new', handleNewMessage);
      stompClient.off<WsReadReceipt>('read', handleReadReceipt);
    };
  }, [conversationId, queryClient]);

  const query = useInfiniteQuery<MessageListResponse, Error>({
    queryKey: [MESSAGES_QUERY_KEY, conversationId],
    queryFn: async ({ pageParam = 0 }) => {
      return messagingService.getMessages(conversationId, {
        page: pageParam as number,
        size: 30,
      });
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage.hasMore) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    enabled: !!conversationId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Flatten messages from all pages
  const messages = useMemo(() => {
    return query.data?.pages.flatMap(page => page.messages) ?? [];
  }, [query.data]);

  // Total messages count
  const totalMessages = query.data?.pages[0]?.totalMessages ?? 0;

  // Mark messages as read when viewing
  const markAsRead = useCallback(() => {
    if (!conversationId) return;

    // Use HTTP endpoint
    messagingService.markAsRead(conversationId).catch(console.error);

    // Also send via WebSocket if connected
    if (stompClient.isConnected() && messages.length > 0) {
      const lastMessage = messages[0];
      stompClient.sendReadReceipt(conversationId, lastMessage.messageId);
    }
  }, [conversationId, messages]);

  return {
    ...query,
    messages,
    totalMessages,
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
