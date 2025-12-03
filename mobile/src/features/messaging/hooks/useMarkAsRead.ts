// src/features/messaging/hooks/useMarkAsRead.ts
// Mesaj okundu işaretleme hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import { messagingService, socketClient } from '../services';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';

/**
 * Konuşmayı okundu olarak işaretleme hook'u
 */
export function useMarkAsRead(conversationId: string) {
  const queryClient = useQueryClient();
  const lastMarkedRef = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      await messagingService.markConversationAsRead(conversationId);
    },
    onSuccess: () => {
      // Konuşma listesindeki unread count'u güncelle
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    },
  });

  /**
   * Okundu olarak işaretle (debounced)
   */
  const markAsRead = useCallback(() => {
    // Aynı conversation için tekrar çağrılmasını engelle
    if (lastMarkedRef.current === conversationId) return;
    
    lastMarkedRef.current = conversationId;
    mutation.mutate();

    // Socket üzerinden de bildir
    socketClient.emit('conversation:read', { conversationId });
  }, [conversationId, mutation]);

  /**
   * Belirli bir mesajı okundu olarak işaretle
   */
  const markMessageAsRead = useCallback((messageId: string) => {
    socketClient.markAsRead(conversationId, messageId);
  }, [conversationId]);

  // Cleanup
  useEffect(() => {
    return () => {
      lastMarkedRef.current = null;
    };
  }, [conversationId]);

  return {
    markAsRead,
    markMessageAsRead,
    isLoading: mutation.isPending,
  };
}

export default useMarkAsRead;
