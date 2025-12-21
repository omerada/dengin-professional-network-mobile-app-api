// src/shared/hooks/useNetworkStatus.ts
// Network status hook
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  isWifi: boolean;
  isCellular: boolean;
  isOffline: boolean;
  details: NetInfoState['details'];
}

/**
 * Hook for monitoring network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: NetInfoStateType.unknown,
    isWifi: false,
    isCellular: false,
    isOffline: false,
    details: null,
  });

  useEffect(() => {
    // Fetch initial network state
    NetInfo.fetch().then(state => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;
      setNetworkStatus({
        isConnected,
        isInternetReachable,
        type: state.type,
        isWifi: state.type === NetInfoStateType.wifi,
        isCellular: state.type === NetInfoStateType.cellular,
        isOffline: !isConnected || isInternetReachable === false,
        details: state.details,
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;
      setNetworkStatus({
        isConnected,
        isInternetReachable,
        type: state.type,
        isWifi: state.type === NetInfoStateType.wifi,
        isCellular: state.type === NetInfoStateType.cellular,
        isOffline: !isConnected || isInternetReachable === false,
        details: state.details,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkStatus;
}

/**
 * Hook for checking if app is offline
 */
export function useIsOffline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  return !isConnected || isInternetReachable === false;
}

/**
 * Hook for executing callback when network becomes available
 */
export function useOnlineEffect(callback: () => void, deps: any[] = []): void {
  const isOffline = useIsOffline();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
    } else if (wasOffline && !isOffline) {
      callback();
      setWasOffline(false);
    }
  }, [isOffline, wasOffline, ...deps]);
}

/**
 * Hook for retrying failed requests when coming back online
 */
export function useRetryOnReconnect<T>(
  fetcher: () => Promise<T>,
  options?: {
    enabled?: boolean;
    retryDelay?: number;
  },
): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  retry: () => Promise<void>;
} {
  const { enabled = true, retryDelay = 1000 } = options || {};
  const isOffline = useIsOffline();

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRetry, setShouldRetry] = useState(false);

  const fetch = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setShouldRetry(false);
    } catch (err) {
      setError(err as Error);

      // Mark for retry if offline
      if (isOffline) {
        setShouldRetry(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetcher, isOffline]);

  // Initial fetch
  useEffect(() => {
    fetch();
  }, []);

  // Retry when coming back online
  useOnlineEffect(() => {
    if (shouldRetry) {
      setTimeout(fetch, retryDelay);
    }
  }, [shouldRetry, retryDelay]);

  return {
    data,
    error,
    isLoading,
    retry: fetch,
  };
}
