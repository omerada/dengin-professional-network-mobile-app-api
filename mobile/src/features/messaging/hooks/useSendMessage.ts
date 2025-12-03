// src/features/messaging/hooks/useSendMessage.ts
// Send message mutation hook with optimistic updates
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md
// Oku: mobile-development-guide/core/13-REAL-TIME.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useCallback } from 'react';
import { stompClient } from '@core/socket';
import type { WsSendMessageRequest } from '@core/socket';
import { messagingService } from '../services';
import { MESSAGES_QUERY_KEY } from './useMessages';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';
import { useAuthStore } from '@features/auth/stores';
import type { Message, MessagesResponse, MessageStatus, MessageType } from '../types';

interface SendMessageParams {
  content: string;
  recipientId?: number;
  replyToId?: string;
}

/**
 * Send message mutation hook
 * Uses WebSocket when connected, falls back to HTTP
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const mutation = useMutation<Message, Error, SendMessageParams, {
    previousMessages: InfiniteData<MessagesResponse> | undefined;
    optimisticMessageId: string;
  }>({
    mutationFn: async ({ content, recipientId, replyToId }) => {
      // Validate content
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        throw new Error('Message content cannot be empty');
      }

      // Try WebSocket first (real-time, lower latency)
      if (stompClient.isConnected() && recipientId) {
        const clientMessageId = `temp_${Date.now()}`;
        const wsRequest: WsSendMessageRequest & { conversationId: string; clientMessageId: string } = {
          recipientId,
          content: trimmedContent,
          conversationId,
          clientMessageId,
        };
        const sent = stompClient.sendMessage(wsRequest);

        if (sent) {
          // Return optimistic message (will be replaced by WebSocket response)
          return {
            id: clientMessageId,
            conversationId,
            senderId: user?.id || 'unknown',
            content: trimmedContent,
            type: 'text' as MessageType,
            status: 'sent' as MessageStatus,
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      }

      // Fallback to HTTP when WebSocket is not available
      return messagingService.sendMessage({
        conversationId,
        content: trimmedContent,
        replyToId,
      });
    },

    onMutate: async ({ content, replyToId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [MESSAGES_QUERY_KEY, conversationId] });

      // Snapshot previous value for rollback
      const previousMessages = queryClient.getQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId]
      );

      // Create optimistic message
      const optimisticMessageId = `temp_${Date.now()}`;
      const optimisticMessage: Message = {
        id: optimisticMessageId,
        conversationId,
        senderId: user?.id || 'unknown',
        content,
        type: 'text' as MessageType,
        status: 'sending' as MessageStatus,
        attachments: [],
        replyTo: replyToId ? { id: replyToId, content: '', senderName: '' } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add message to cache
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        (old) => {
          if (!old) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              data: [optimisticMessage, ...newPages[0].data],
            };
          }

          return { ...old, pages: newPages };
        }
      );

      return { previousMessages, optimisticMessageId };
    },

    onSuccess: (newMessage, _variables, context) => {
      // Replace optimistic message with real one
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                return {
                  ...page,
                  data: page.data.map((msg) =>
                    msg.id === context?.optimisticMessageId ? newMessage : msg
                  ),
                };
              }
              return page;
            }),
          };
        }
      );

      // Update conversations list (for last message preview)
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    },

    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          [MESSAGES_QUERY_KEY, conversationId],
          context.previousMessages
        );
      }

      // Mark optimistic message as failed
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg.id === context?.optimisticMessageId
                  ? { ...msg, status: 'failed' as MessageStatus }
                  : msg
              ),
            })),
          };
        }
      );
    },
  });

  // Retry failed message
  const retryMessage = useCallback((messageId: string, content: string, recipientId?: number) => {
    // Remove failed message from cache
    queryClient.setQueryData<InfiniteData<MessagesResponse>>(
      [MESSAGES_QUERY_KEY, conversationId],
      (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((msg) => msg.id !== messageId),
          })),
        };
      }
    );

    // Resend
    mutation.mutate({ content, recipientId });
  }, [conversationId, queryClient, mutation]);

  return {
    sendMessage: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    retryMessage,
  };
}

export default useSendMessage;
