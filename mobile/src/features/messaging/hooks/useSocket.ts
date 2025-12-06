// src/features/messaging/hooks/useSocket.ts
// STOMP WebSocket connection hook for messaging
// Backend: Spring WebSocket + STOMP over SockJS
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { stompClient } from '../services/socketClient';
import { useAuthStore } from '@features/auth/stores';
import { useMessagingStore } from '../stores';

/**
 * STOMP WebSocket connection hook
 * Manages WebSocket connection lifecycle based on auth state
 * Backend STOMP/SockJS ile uyumlu
 */
export function useSocket() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { connectionState } = useMessagingStore();
  const [isOnline, setIsOnline] = useState(true);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      // Connect STOMP client
      stompClient.connect().catch(error => {
        console.error('[useSocket] Connection failed:', error);
      });

      // Subscribe to connection events
      const handleConnect = () => {
        setIsOnline(true);
      };

      const handleDisconnect = () => {
        setIsOnline(false);
      };

      const handleReconnecting = () => {
        // Connection is being restored
      };

      stompClient.on('connect', handleConnect);
      stompClient.on('disconnect', handleDisconnect);
      stompClient.on('reconnecting', handleReconnecting);

      return () => {
        stompClient.off('connect', handleConnect);
        stompClient.off('disconnect', handleDisconnect);
        stompClient.off('reconnecting', handleReconnecting);
        stompClient.disconnect();
      };
    } else {
      // Disconnect if not authenticated
      stompClient.disconnect();
      return undefined;
    }
  }, [isAuthenticated, queryClient]);

  /**
   * Manual connect
   */
  const connect = useCallback(async () => {
    await stompClient.connect();
  }, []);

  /**
   * Manual disconnect
   */
  const disconnect = useCallback(() => {
    stompClient.disconnect();
  }, []);

  /**
   * Force reconnect
   */
  const reconnect = useCallback(async () => {
    stompClient.disconnect();
    await stompClient.connect();
  }, []);

  return {
    status: connectionState,
    connectionState,
    isConnected: connectionState === 'CONNECTED',
    isOnline,
    isReconnecting: connectionState === 'RECONNECTING',
    connect,
    disconnect,
    reconnect,
  };
}

export default useSocket;
