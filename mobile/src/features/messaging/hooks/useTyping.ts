// src/features/messaging/hooks/useTyping.ts
// Typing indicator hook
// Backend WebSocket: /app/chat.typing, /user/queue/typing
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { stompClient } from '../services/socketClient';
import type { WsTypingNotification } from '../types';
import { useMessagingStore } from '../stores';
import { useAuthStore } from '@features/auth/stores';

const TYPING_TIMEOUT = 3000; // 3 seconds until typing stops
const TYPING_DEBOUNCE = 500; // Debounce typing events

/**
 * Typing indicator hook
 * Manages sending and receiving typing indicators
 * Backend WsTypingNotification ile uyumlu
 */
export function useTyping(conversationId: string) {
  const { user } = useAuthStore();
  const { addTypingUser, removeTypingUser, typingUsers } = useMessagingStore();

  const [typingUserNames, setTypingUserNames] = useState<string[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const recipientIdRef = useRef<string | null>(null);

  // Get typing users for this conversation
  const conversationTypingUsers = useMemo(
    () => typingUsers[conversationId] || [],
    [typingUsers, conversationId],
  );

  // Subscribe to typing events
  useEffect(() => {
    const handleTyping = (data: WsTypingNotification) => {
      if (data.conversationId !== conversationId) return;
      // Ignore own typing - recipientId is who the notification was sent TO
      // We receive typing from the other person
      if (data.recipientId === user?.id?.toString()) {
        // This is a typing notification FOR us, FROM the other person
        // The sender is not the recipientId
        return;
      }

      if (data.isTyping) {
        addTypingUser(conversationId, data.recipientId);
      } else {
        removeTypingUser(conversationId, data.recipientId);
      }
    };

    stompClient.on<WsTypingNotification>('typing', handleTyping);

    return () => {
      stompClient.off<WsTypingNotification>('typing', handleTyping);
    };
  }, [conversationId, user?.id, addTypingUser, removeTypingUser]);

  /**
   * Set recipient ID for typing notifications
   */
  const setRecipientId = useCallback((id: string) => {
    recipientIdRef.current = id;
  }, []);

  /**
   * Start typing indicator
   */
  const startTyping = useCallback(() => {
    if (!conversationId || !recipientIdRef.current) return;

    // Debounce typing events
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // Only send if not already typing
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        stompClient.sendTyping(conversationId, recipientIdRef.current!, true);
      }

      // Reset timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after timeout
      typingTimeoutRef.current = setTimeout(() => {
        stopTypingInternal();
      }, TYPING_TIMEOUT);
    }, TYPING_DEBOUNCE);
  }, [conversationId]);

  /**
   * Stop typing indicator (internal)
   */
  const stopTypingInternal = useCallback(() => {
    if (isTypingRef.current && recipientIdRef.current) {
      isTypingRef.current = false;
      stompClient.sendTyping(conversationId, recipientIdRef.current, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId]);

  /**
   * Stop typing indicator (public)
   */
  const stopTyping = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    stopTypingInternal();
  }, [stopTypingInternal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && recipientIdRef.current) {
        stompClient.sendTyping(conversationId, recipientIdRef.current, false);
      }
    };
  }, [conversationId]);

  /**
   * Get typing text for display
   */
  const getTypingText = useCallback((): string | null => {
    if (conversationTypingUsers.length === 0) return null;
    if (conversationTypingUsers.length === 1) return 'yazıyor...';
    return `${conversationTypingUsers.length} kişi yazıyor...`;
  }, [conversationTypingUsers]);

  return {
    typingUsers: conversationTypingUsers,
    typingUserNames,
    isTyping: conversationTypingUsers.length > 0,
    startTyping,
    stopTyping,
    setRecipientId,
    getTypingText,
    // Backward compatibility
    sendTypingEvent: startTyping,
  };
}

export default useTyping;
