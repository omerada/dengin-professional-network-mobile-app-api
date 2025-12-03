// src/features/messaging/hooks/useSocket.ts
// Socket connection hook for messaging
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md
// Oku: mobile-development-guide/core/13-REAL-TIME.md

import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  stompClient,
  connectionMonitor,
  setupSocketEvents,
  cleanupSocketEvents,
  SocketStatus,
} from '@core/socket';
import { useAuthStore } from '@features/auth/stores';

/**
 * Socket connection hook
 * Manages WebSocket connection lifecycle based on auth state
 */
export function useSocket() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [status, setStatus] = useState<SocketStatus>(SocketStatus.DISCONNECTED);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket
      stompClient.connect();

      // Setup event handlers with query client
      setupSocketEvents(queryClient);

      // Start connection monitoring
      connectionMonitor.start();

      // Subscribe to connection status
      const unsubConnect = stompClient.on('connect', () => {
        setStatus(SocketStatus.CONNECTED);
        setIsConnected(true);
      });

      const unsubDisconnect = stompClient.on('disconnect', () => {
        setStatus(SocketStatus.DISCONNECTED);
        setIsConnected(false);
      });

      // Update online status from connection monitor
      setIsOnline(connectionMonitor.isNetworkAvailable());

      return () => {
        unsubConnect();
        unsubDisconnect();
        cleanupSocketEvents();
        connectionMonitor.stop();
        stompClient.disconnect();
      };
    } else {
      // Disconnect if not authenticated
      cleanupSocketEvents();
      connectionMonitor.stop();
      stompClient.disconnect();
      setStatus(SocketStatus.DISCONNECTED);
      setIsConnected(false);
    }
  }, [isAuthenticated, queryClient]);

  /**
   * Manual connect
   */
  const connect = useCallback(async () => {
    setStatus(SocketStatus.CONNECTING);
    await stompClient.connect();
  }, []);

  /**
   * Manual disconnect
   */
  const disconnect = useCallback(() => {
    stompClient.disconnect();
    setStatus(SocketStatus.DISCONNECTED);
    setIsConnected(false);
  }, []);

  /**
   * Force reconnect
   */
  const reconnect = useCallback(async () => {
    setStatus(SocketStatus.RECONNECTING);
    await connectionMonitor.forceReconnect();
  }, []);

  return {
    status,
    connectionState: status, // Backward compatibility
    isConnected,
    isOnline,
    isReconnecting: status === SocketStatus.RECONNECTING,
    connect,
    disconnect,
    reconnect,
  };
}

export default useSocket;
