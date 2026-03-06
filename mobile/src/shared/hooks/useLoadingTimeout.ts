// src/shared/hooks/useLoadingTimeout.ts
// Prevents infinite loading states with timeout and retry mechanism

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseLoadingTimeoutConfig {
  /**
   * Timeout duration in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Callback when timeout is reached
   */
  onTimeout?: () => void;

  /**
   * Show retry UI after timeout
   * @default true
   */
  showRetry?: boolean;

  /**
   * Maximum number of automatic retries
   * @default 0
   */
  maxRetries?: number;

  /**
   * Callback for retry action
   */
  onRetry?: () => void | Promise<void>;
}

export interface UseLoadingTimeoutReturn {
  /**
   * Whether the loading has timed out
   */
  hasTimedOut: boolean;

  /**
   * Current retry count
   */
  retryCount: number;

  /**
   * Manually trigger retry
   */
  retry: () => void;

  /**
   * Reset timeout state
   */
  reset: () => void;

  /**
   * Remaining time in seconds (updates every second)
   */
  remainingTime: number;
}

/**
 * Hook to prevent infinite loading states
 *
 * Features:
 * - Automatic timeout after specified duration
 * - Retry mechanism with max retry count
 * - Countdown display support
 * - Manual reset capability
 *
 * @example
 * ```tsx
 * const { hasTimedOut, retry, remainingTime } = useLoadingTimeout({
 *   timeout: 30000,
 *   isLoading: isLoading,
 *   onTimeout: () => console.log('Loading timed out'),
 *   onRetry: async () => {
 *     await refetch();
 *   },
 * });
 *
 * if (hasTimedOut) {
 *   return (
 *     <EmptyState
 *       title="Yükleme zaman aşımına uğradı"
 *       action={{ label: 'Tekrar Dene', onPress: retry }}
 *     />
 *   );
 * }
 * ```
 */
export const useLoadingTimeout = (
  isLoading: boolean,
  config: UseLoadingTimeoutConfig = {},
): UseLoadingTimeoutReturn => {
  const {
    timeout = 30000, // 30 seconds default
    onTimeout,
    maxRetries = 0,
    onRetry,
  } = config;

  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(Math.floor(timeout / 1000));

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Reset timeout state
  const reset = useCallback(() => {
    setHasTimedOut(false);
    setRemainingTime(Math.floor(timeout / 1000));
    clearTimers();
  }, [timeout, clearTimers]);

  // Handle retry
  const retry = useCallback(async () => {
    if (retryCount >= maxRetries && maxRetries > 0) {
      return;
    }

    setRetryCount(prev => prev + 1);
    reset();

    if (onRetry) {
      await onRetry();
    }
  }, [retryCount, maxRetries, reset, onRetry]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    setHasTimedOut(true);
    clearTimers();
    onTimeout?.();

    // Auto-retry if configured
    if (retryCount < maxRetries && maxRetries > 0) {
      setTimeout(() => {
        retry();
      }, 1000); // Wait 1 second before auto-retry
    }
  }, [onTimeout, retryCount, maxRetries, retry, clearTimers]);

  // Setup timeout and countdown
  useEffect(() => {
    if (!isLoading) {
      reset();
      return;
    }

    // Start timeout timer
    startTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(handleTimeout, timeout);

    // Start countdown timer
    countdownRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.floor((timeout - elapsed) / 1000);
        setRemainingTime(Math.max(0, remaining));
      }
    }, 1000);

    return () => {
      clearTimers();
    };
  }, [isLoading, timeout, handleTimeout, reset, clearTimers]);

  return {
    hasTimedOut,
    retryCount,
    retry,
    reset,
    remainingTime,
  };
};
