// src/features/messaging/hooks/useSendMessage.ts
// Send message mutation hook with optimistic updates
// Backend: ConversationController - POST /api/messages
// WebSocket: /app/chat.send
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useCallback } from 'react';
import { stompClient } from '../services/socketClient';
import { messagingService } from '../services';
import { MESSAGES_QUERY_KEY } from './useMessages';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';
import { useAuthStore } from '@features/auth/stores';
import type {
  Message,
  ClientMessage,
  MessageListResponse,
  SendMessageRequest,
  WsSendMessageRequest,
  MessageAttachment,
  SendMessageAttachment,
} from '../types';
import { toUUID } from '../types';

interface SendMessageParams {
  content: string;
  recipientId: string;
  attachment?: MessageAttachment;
}

/**
 * Convert MessageAttachment to SendMessageAttachment
 */
function toSendMessageAttachment(attachment: MessageAttachment): SendMessageAttachment {
  return {
    s3Key: '', // S3 key would be set after upload
    url: attachment.url,
    contentType: attachment.contentType,
    fileSize: attachment.fileSize,
    fileName: attachment.fileName,
  };
}

/**
 * Send message mutation hook
 * Uses WebSocket when connected, falls back to HTTP
 * Backend SendMessageRequest ile uyumlu
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const mutation = useMutation<
    Message,
    Error,
    SendMessageParams,
    {
      previousMessages: InfiniteData<MessageListResponse> | undefined;
      optimisticMessageId: string;
    }
  >({
    mutationFn: async ({ content, recipientId, attachment }) => {
      // Validate content
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        throw new Error('Message content cannot be empty');
      }

      // Try WebSocket first (real-time, lower latency)
      if (stompClient.isConnected()) {
        const wsRequest: WsSendMessageRequest = {
          recipientId: toUUID(recipientId),
          content: trimmedContent,
          attachment: attachment ? toSendMessageAttachment(attachment) : undefined,
        };

        stompClient.sendMessage(wsRequest);

        // Return optimistic message (will be replaced by WebSocket response)
        const tempId = `temp_${Date.now()}`;
        return {
          messageId: tempId,
          conversationId,
          senderId: user?.id?.toString() || '',
          senderName: user?.fullName || '',
          content: trimmedContent,
          attachment: attachment || null,
          status: 'SENT' as const,
          read: false,
          sentByMe: true,
          sentAt: new Date().toISOString(),
          readAt: null,
        };
      }

      // Fallback to HTTP when WebSocket is not available
      const request: SendMessageRequest = {
        recipientId: toUUID(recipientId),
        content: trimmedContent,
        attachment: attachment ? toSendMessageAttachment(attachment) : undefined,
      };

      const response = await messagingService.sendMessage(request);

      // Convert response to Message type
      return {
        messageId: response.messageId,
        conversationId: response.conversationId,
        senderId: user?.id?.toString() || '',
        senderName: user?.fullName || '',
        content: response.content,
        attachment: null,
        status: response.status as Message['status'],
        read: false,
        sentByMe: true,
        sentAt: response.sentAt,
        readAt: null,
      };
    },

    onMutate: async ({ content, attachment }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [MESSAGES_QUERY_KEY, conversationId] });

      // Snapshot previous value for rollback
      const previousMessages = queryClient.getQueryData<InfiniteData<MessageListResponse>>([
        MESSAGES_QUERY_KEY,
        conversationId,
      ]);

      // Create optimistic message
      const optimisticMessageId = `temp_${Date.now()}`;
      const optimisticMessage: ClientMessage = {
        messageId: optimisticMessageId,
        conversationId,
        senderId: user?.id?.toString() || '',
        senderName: user?.fullName || '',
        content,
        attachment: attachment || null,
        status: 'SENDING',
        read: false,
        sentByMe: true,
        sentAt: new Date().toISOString(),
        readAt: null,
        tempId: optimisticMessageId,
      };

      // Optimistically add message to cache
      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        old => {
          if (!old) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              messages: [optimisticMessage as unknown as Message, ...newPages[0].messages],
              totalMessages: newPages[0].totalMessages + 1,
            };
          }

          return { ...old, pages: newPages };
        },
      );

      return { previousMessages, optimisticMessageId };
    },

    onSuccess: (newMessage, _variables, context) => {
      // Replace optimistic message with real one
      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        old => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                return {
                  ...page,
                  messages: page.messages.map(msg =>
                    msg.messageId === context?.optimisticMessageId ? newMessage : msg,
                  ),
                };
              }
              return page;
            }),
          };
        },
      );

      // Update conversations list (for last message preview)
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    },

    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData([MESSAGES_QUERY_KEY, conversationId], context.previousMessages);
      }

      // Mark optimistic message as failed
      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        old => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              messages: page.messages.map(msg =>
                msg.messageId === context?.optimisticMessageId
                  ? ({ ...msg, status: 'FAILED' as const } as unknown as Message)
                  : msg,
              ),
            })),
          };
        },
      );
    },
  });

  // Retry failed message
  const retryMessage = useCallback(
    (messageId: string, content: string, recipientId: string) => {
      // Remove failed message from cache
      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        [MESSAGES_QUERY_KEY, conversationId],
        old => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              messages: page.messages.filter(msg => msg.messageId !== messageId),
            })),
          };
        },
      );

      // Resend
      mutation.mutate({ content, recipientId });
    },
    [conversationId, queryClient, mutation],
  );

  return {
    sendMessage: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    retryMessage,
  };
}

export default useSendMessage;
