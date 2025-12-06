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
export function useMessages(conversationId: string, currentUserId?: string) {
  const queryClient = useQueryClient();

  // Subscribe to real-time message events
  useEffect(() => {
    if (!conversationId) return;

    // Handle new message received
    const handleNewMessage = (data: WsMessageResponse) => {
      if (String(data.conversationId) !== conversationId) return;

      // Convert WebSocket response to Message type
      const newMessage: Message = {
        messageId: String(data.messageId),
        conversationId: String(data.conversationId),
        senderId: data.senderId, // number (Long from backend)
        senderName: '', // Will be populated from conversation participant
        content: data.content || '',
        attachment: data.attachment || null,
        status: data.status as any,
        read: false,
        sentByMe: currentUserId ? data.senderId === Number(currentUserId) : false,
        sentAt: data.sentAt ? String(data.sentAt) : new Date().toISOString(),
        readAt: null,
      };

      // Update cache - add message to beginning of first page
      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        old => {
          if (!old) return old;

          // Check if message already exists (prevent duplicates)
          const exists = old.pages.some(page =>
            page.messages.some(m => m.messageId === newMessage.messageId),
          );
          if (exists) {
            console.log('[useMessages] Message already exists, skipping duplicate');
            return old;
          }

          const newPages = [...old.pages];
          if (newPages[0]) {
            // Add to end of first page (backend sends in ASC order)
            newPages[0] = {
              ...newPages[0],
              messages: [...newPages[0].messages, newMessage],
              totalMessages: newPages[0].totalMessages + 1,
            };
          }

          return { ...old, pages: newPages };
        },
      );

      // Invalidate query to trigger UI update
      queryClient.invalidateQueries({
        queryKey: [MESSAGES_QUERY_KEY, conversationId],
        refetchType: 'none', // Don't refetch, just use updated cache
      });
    };

    // Handle read receipts
    const handleReadReceipt = (data: WsReadReceipt) => {
      if (String(data.conversationId) !== conversationId) return;

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
                readAt: data.readAt ? String(data.readAt) : null,
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

  // Flatten messages from all pages and reverse to show newest first
  const messages = useMemo(() => {
    const allMessages = query.data?.pages.flatMap(page => page.messages) ?? [];
    // Backend sends in ascending order (oldest first), reverse for inverted list (newest first)
    return allMessages.reverse();
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
