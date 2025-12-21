// src/features/messaging/hooks/useMarkAsRead.ts
// Mesaj okundu işaretleme hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import { messagingService } from '../services';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';

/**
 * Konuşmayı okundu olarak işaretleme hook'u
 */
export function useMarkAsRead(conversationId?: string) {
  const queryClient = useQueryClient();
  const lastMarkedRef = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (convId: string) => {
      await messagingService.markAsRead(convId);
    },
    onSuccess: () => {
      // Konuşma listesindeki unread count'u güncelle
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    },
  });

  /**
   * Okundu olarak işaretle (debounced)
   */
  const markAsRead = useCallback(
    (convId?: string) => {
      const targetId = convId || conversationId;
      if (!targetId) return;

      // Aynı conversation için tekrar çağrılmasını engelle
      if (lastMarkedRef.current === targetId) return;

      lastMarkedRef.current = targetId;
      mutation.mutate(targetId);

      // Note: Real-time read receipts are handled by WebSocket server
      // No need to send additional socket message here
    },
    [conversationId, mutation],
  );

  /**
   * Belirli mesajları okundu olarak işaretle
   * Currently unused - kept for future WebSocket integration
   */
  const markMessagesAsRead = useCallback(
    (messageIds: string[], convId?: string) => {
      const targetId = convId || conversationId;
      if (!targetId || messageIds.length === 0) return;

      // Future: Send read receipts via WebSocket
      // Currently handled by REST API only
    },
    [conversationId],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      lastMarkedRef.current = null;
    };
  }, [conversationId]);

  return {
    markAsRead,
    markMessagesAsRead,
    isLoading: mutation.isPending,
  };
}

export default useMarkAsRead;
