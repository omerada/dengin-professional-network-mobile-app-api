// src/features/messaging/hooks/useTyping.ts
// Typing indicator hook
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md
// Oku: mobile-development-guide/core/13-REAL-TIME.md

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { stompClient } from '@core/socket';
import type { WsTypingNotification } from '@core/socket';
import { useMessagingStore } from '../stores';
import { useAuthStore } from '@features/auth/stores';

const TYPING_TIMEOUT = 3000; // 3 seconds until typing stops
const TYPING_DEBOUNCE = 500; // Debounce typing events

/**
 * Typing indicator hook
 * Manages sending and receiving typing indicators
 */
export function useTyping(conversationId: string) {
  const { user } = useAuthStore();
  const { addTypingUser, removeTypingUser, typingUsers } = useMessagingStore();

  const [typingUserNames, setTypingUserNames] = useState<string[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const recipientIdRef = useRef<number | null>(null);

  // Get typing users for this conversation
  const conversationTypingUsers = useMemo(
    () => typingUsers[conversationId] || [],
    [typingUsers, conversationId],
  );

  // Subscribe to typing events
  useEffect(() => {
    const handleTyping = (data: WsTypingNotification) => {
      if (data.conversationId !== conversationId) return;
      if (data.userId === Number(user?.id)) return; // Ignore own typing

      if (data.isTyping) {
        addTypingUser(conversationId, String(data.userId));
        setTypingUserNames((prev) => {
          if (prev.includes(data.userName)) return prev;
          return [...prev, data.userName];
        });
      } else {
        removeTypingUser(conversationId, String(data.userId));
        setTypingUserNames((prev) => prev.filter((name) => name !== data.userName));
      }
    };

    const unsubscribe = stompClient.on<WsTypingNotification>('typing', handleTyping);

    return () => {
      unsubscribe();
    };
  }, [conversationId, user?.id, addTypingUser, removeTypingUser]);

  /**
   * Set recipient ID for typing notifications
   */
  const setRecipientId = useCallback((id: number) => {
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
    if (typingUserNames.length === 0) return null;
    if (typingUserNames.length === 1) return `${typingUserNames[0]} yazıyor...`;
    if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} ve ${typingUserNames[1]} yazıyor...`;
    }
    return `${typingUserNames.length} kişi yazıyor...`;
  }, [typingUserNames]);

  return {
    typingUsers: conversationTypingUsers,
    typingUserNames,
    isTyping: typingUserNames.length > 0,
    startTyping,
    stopTyping,
    setRecipientId,
    getTypingText,
    // Backward compatibility
    sendTypingEvent: startTyping,
  };
}

export default useTyping;
