// src/features/messaging/hooks/useSocket.ts
// Socket bağlantı hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { socketClient, messageQueue, SocketConnectionState } from '../services';
import { useAuthStore } from '@features/auth/stores';

/**
 * Socket bağlantı hook'u
 */
export function useSocket() {
  const [connectionState, setConnectionState] = useState<SocketConnectionState>('disconnected');
  const [isOnline, setIsOnline] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Network durumunu dinle
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online ?? false);

      if (online && isAuthenticated && !socketClient.isConnected()) {
        // Çevrimiçi oldu ve bağlı değil, bağlan
        socketClient.connect().catch(() => {
          // Connection error handled by socket client
        });
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Socket bağlantısını yönet
  useEffect(() => {
    if (!isAuthenticated) {
      socketClient.disconnect();
      setConnectionState('disconnected');
      return;
    }

    const handleConnect = () => {
      setConnectionState('connected');
      // Bağlantı kurulunca bekleyen mesajları işle
      messageQueue.processQueue();
    };

    const handleDisconnect = () => {
      setConnectionState('disconnected');
    };

    const handleReconnectAttempt = () => {
      setConnectionState('reconnecting');
    };

    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('reconnect_attempt', handleReconnectAttempt);
    socketClient.on('reconnect', handleConnect);

    // İlk bağlantı
    socketClient.connect().catch(() => {
      // Connection error
    });

    // Message queue'yu yükle
    messageQueue.load();

    return () => {
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('reconnect_attempt', handleReconnectAttempt);
      socketClient.off('reconnect', handleConnect);
    };
  }, [isAuthenticated]);

  /**
   * Manuel bağlanma
   */
  const connect = useCallback(async () => {
    if (socketClient.isConnected()) return;
    
    setConnectionState('connecting');
    try {
      await socketClient.connect();
    } catch {
      setConnectionState('disconnected');
    }
  }, []);

  /**
   * Manuel bağlantı kesme
   */
  const disconnect = useCallback(() => {
    socketClient.disconnect();
    setConnectionState('disconnected');
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isOnline,
    connect,
    disconnect,
  };
}

export default useSocket;
