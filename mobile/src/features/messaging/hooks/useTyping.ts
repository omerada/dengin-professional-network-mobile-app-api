// src/features/messaging/hooks/useTyping.ts
// Typing indicator hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useCallback, useRef, useEffect, useState } from 'react';
import { socketClient } from '../services';
import { useMessagingStore, selectTypingUsers } from '../stores';
import type { TypingEvent } from '../types';

const TYPING_TIMEOUT = 3000; // 3 saniye sonra typing durur

/**
 * Typing indicator hook'u
 */
export function useTyping(conversationId: string) {
  const typingUsers = useMessagingStore(selectTypingUsers(conversationId));
  const [typingUserNames, setTypingUserNames] = useState<string[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Socket event listener for user names
  useEffect(() => {
    const handleTypingStart = (data: TypingEvent) => {
      if (data.conversationId === conversationId) {
        setTypingUserNames((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      }
    };

    const handleTypingStop = (data: TypingEvent) => {
      if (data.conversationId === conversationId) {
        setTypingUserNames((prev) => prev.filter((name) => name !== data.userName));
      }
    };

    socketClient.on('typing:start', handleTypingStart);
    socketClient.on('typing:stop', handleTypingStop);

    return () => {
      socketClient.off('typing:start', handleTypingStart);
      socketClient.off('typing:stop', handleTypingStop);
    };
  }, [conversationId]);

  /**
   * Typing event gönder
   */
  const sendTypingEvent = useCallback(() => {
    if (!conversationId) return;

    // Eğer zaten typing gönderildiyse tekrar gönderme
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketClient.sendTypingStart(conversationId);
    }

    // Önceki timeout'u temizle
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Belirli süre sonra typing'i durdur
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketClient.sendTypingStop(conversationId);
    }, TYPING_TIMEOUT);
  }, [conversationId]);

  /**
   * Typing'i hemen durdur
   */
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      socketClient.sendTypingStop(conversationId);
    }
  }, [conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        socketClient.sendTypingStop(conversationId);
      }
    };
  }, [conversationId]);

  /**
   * Typing text oluştur
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
    typingUsers,
    typingUserNames,
    isTyping: typingUserNames.length > 0,
    sendTypingEvent,
    stopTyping,
    getTypingText,
  };
}

export default useTyping;
