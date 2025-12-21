// src/hooks/useLoadingState.ts
// Production-ready loading state management hook
// Automatically determines optimal loading component per screen type

import { useMemo } from 'react';

import { useColors } from '@contexts/ThemeContext';
import { getLoadingStrategy, getLoadingMessage, type LoadingStrategy } from '@constants';

export interface UseLoadingStateOptions {
  /**
   * Screen name to determine loading strategy
   * @example 'feed', 'profile', 'chat'
   */
  screenName?: string;

  /**
   * Override automatic strategy
   */
  strategy?: LoadingStrategy;

  /**
   * Custom loading message
   */
  message?: string;

  /**
   * Loading state
   */
  isLoading?: boolean;
}

export interface LoadingStateResult {
  /**
   * Strategy type being used
   */
  strategy: LoadingStrategy;

  /**
   * Loading message
   */
  message: string;

  /**
   * Indicator color from theme
   */
  indicatorColor: string;

  /**
   * Whether currently loading
   */
  isLoading: boolean;
}

/**
 * Hook for managing loading states consistently
 *
 * Automatically determines the best loading UX based on screen type:
 * - Feed screens → Skeleton loading
 * - Detail screens → Spinner
 * - Actions → Overlay
 *
 * @param options - Configuration options
 * @returns Loading state information
 *
 * @example
 * ```tsx
 * const { strategy, message, indicatorColor, isLoading } = useLoadingState({
 *   screenName: 'feed',
 *   isLoading: true
 * });
 *
 * if (isLoading) {
 *   if (strategy === 'skeleton') return <FeedSkeleton />;
 *   return <Loading message={message} />;
 * }
 * ```
 */
export function useLoadingState(options: UseLoadingStateOptions = {}): LoadingStateResult {
  const colors = useColors();

  const {
    screenName,
    strategy: overrideStrategy,
    message: overrideMessage,
    isLoading = false,
  } = options;

  const strategy = useMemo(() => {
    if (overrideStrategy) return overrideStrategy;
    if (screenName) return getLoadingStrategy(screenName);
    return 'spinner' as LoadingStrategy;
  }, [overrideStrategy, screenName]);

  const message = useMemo(() => {
    if (overrideMessage) return overrideMessage;
    if (screenName) return getLoadingMessage(screenName);
    return 'Yükleniyor...';
  }, [overrideMessage, screenName]);

  return {
    strategy,
    message,
    indicatorColor: colors.interactive.default,
    isLoading,
  };
}
