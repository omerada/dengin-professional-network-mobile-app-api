// src/core/socket/socketEvents.ts
// Socket event handlers and React Query integration
// Oku: mobile-development-guide/core/13-REAL-TIME.md

import { QueryClient } from '@tanstack/react-query';
import { stompClient } from './stompClient';
import type {
  WsMessageResponse,
  WsReadReceipt,
  WsNotification,
  WsTypingNotification,
  WsPresenceUpdate,
  WsErrorResponse,
} from './types';

// Store unsubscribe functions
let unsubscribers: (() => void)[] = [];

/**
 * Setup socket event listeners with React Query integration
 */
export const setupSocketEvents = (queryClient: QueryClient): void => {
  // Clean up existing listeners
  cleanupSocketEvents();

  // New message received
  const unsubMessage = stompClient.on<WsMessageResponse>('message', (data) => {
    console.log('[SocketEvents] New message:', data.messageId);

    // Invalidate messages query to refetch
    queryClient.invalidateQueries({
      queryKey: ['messages', data.conversationId],
    });

    // Update conversations list (for last message preview)
    queryClient.invalidateQueries({
      queryKey: ['conversations'],
    });
  });
  unsubscribers.push(unsubMessage);

  // Typing notification received
  const unsubTyping = stompClient.on<WsTypingNotification>('typing', (data) => {
    console.log('[SocketEvents] Typing notification:', data);
    // Typing state is handled by messaging store, no query update needed
  });
  unsubscribers.push(unsubTyping);

  // Read receipt received
  const unsubRead = stompClient.on<WsReadReceipt>('read', (data) => {
    console.log('[SocketEvents] Read receipt:', data.conversationId);

    // Update message status in cache
    queryClient.setQueriesData(
      { queryKey: ['messages', data.conversationId] },
      (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData;

        const typedData = oldData as {
          pages: Array<{
            data: Array<{ id: string; status: string }>;
          }>;
        };

        return {
          ...typedData,
          pages: typedData.pages.map((page) => ({
            ...page,
            data: page.data.map((msg) => ({
              ...msg,
              status: 'read',
            })),
          })),
        };
      },
    );

    // Update conversation unread count
    queryClient.invalidateQueries({
      queryKey: ['conversations'],
    });
  });
  unsubscribers.push(unsubRead);

  // Presence update received
  const unsubPresence = stompClient.on<WsPresenceUpdate>('presence', (data) => {
    console.log('[SocketEvents] Presence update:', data);
    // Presence state is handled by messaging store
  });
  unsubscribers.push(unsubPresence);

  // Notification received
  const unsubNotification = stompClient.on<WsNotification>('notification', (data) => {
    console.log('[SocketEvents] Notification:', data.type);

    // Invalidate notifications query
    queryClient.invalidateQueries({
      queryKey: ['notifications'],
    });

    // Could trigger local notification here using Notifee
    // notifeeService.displayNotification(data);
  });
  unsubscribers.push(unsubNotification);

  // Error received
  const unsubError = stompClient.on<WsErrorResponse>('error', (data) => {
    console.error('[SocketEvents] Error:', data.code, data.message);
    // Could show toast notification to user
  });
  unsubscribers.push(unsubError);

  // Connection events
  const unsubConnect = stompClient.on('connect', () => {
    console.log('[SocketEvents] Socket connected');

    // Refetch important data on reconnect
    queryClient.invalidateQueries({
      queryKey: ['conversations'],
    });
  });
  unsubscribers.push(unsubConnect);

  const unsubDisconnect = stompClient.on('disconnect', () => {
    console.log('[SocketEvents] Socket disconnected');
  });
  unsubscribers.push(unsubDisconnect);

  console.log('[SocketEvents] Event listeners setup complete');
};

/**
 * Cleanup socket event listeners
 */
export const cleanupSocketEvents = (): void => {
  unsubscribers.forEach((unsub) => unsub());
  unsubscribers = [];
  console.log('[SocketEvents] Event listeners cleaned up');
};
