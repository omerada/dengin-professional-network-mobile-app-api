// src/features/messaging/hooks/useSendMessage.ts
// Mesaj gönderme hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { messagingService, messageQueue, socketClient } from '../services';
import { MESSAGES_QUERY_KEY } from './useMessages';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';
import type { Message, MessagesResponse, SendMessageDto, MessageStatus, MessageType } from '../types';

/**
 * Mesaj gönderme hook'u
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, { content: string; replyToId?: string }>({
    mutationFn: async ({ content, replyToId }) => {
      // Online değilse kuyruğa ekle
      if (!socketClient.isConnected()) {
        await messageQueue.add(conversationId, content, 'text' as MessageType, undefined, replyToId);
        throw new Error('Offline - message queued');
      }

      return messagingService.sendMessage({
        conversationId,
        content,
        replyToId,
      });
    },

    onMutate: async ({ content, replyToId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [MESSAGES_QUERY_KEY, conversationId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<InfiniteData<MessagesResponse>>(
        [MESSAGES_QUERY_KEY, conversationId]
      );

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        conversationId,
        senderId: 'current_user', // Will be replaced by actual ID
        content,
        type: 'text' as MessageType,
        status: 'sending' as MessageStatus,
        attachments: [],
        replyTo: replyToId ? { id: replyToId, content: '', senderName: '' } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add message
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

      return { previousMessages, optimisticMessageId: optimisticMessage.id };
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

      // Update conversations list
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
    },
  });
}

export default useSendMessage;
