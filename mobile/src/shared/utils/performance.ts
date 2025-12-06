// src/shared/utils/performance.ts
// Performance optimization utilities
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import { useCallback, useRef, useEffect } from 'react';
import { InteractionManager, Platform, Image } from 'react-native';

/**
 * Custom comparison function for React.memo
 * Compares specific keys for shallow equality
 */
export function createMemoComparator<T extends Record<string, unknown>>(
  keys: (keyof T)[]
) {
  return (prevProps: T, nextProps: T): boolean => {
    return keys.every((key) => prevProps[key] === nextProps[key]);
  };
}

/**
 * Debounce hook - delays function execution
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Throttle hook - limits function execution rate
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    },
    [delay]
  );
}

/**
 * Run after interactions to avoid blocking UI
 */
export function runAfterInteractions(callback: () => void): () => void {
  const handle = InteractionManager.runAfterInteractions(callback);
  return () => handle.cancel();
}

/**
 * Defer heavy work until after initial render
 */
export function useDeferredValue<T>(value: T, delay: number = 0): T {
  const [deferredValue, setDeferredValue] = useState<T>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return deferredValue;
}

import { useState } from 'react';

/**
 * Lazy initialization hook
 */
export function useLazyInit<T>(factory: () => T): T {
  const [value] = useState(factory);
  return value;
}

/**
 * Calculate FlatList item layout for fixed-height items
 */
export function getItemLayout(itemHeight: number) {
  return (_data: unknown, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });
}

/**
 * Window size calculator based on screen height
 */
export function calculateWindowSize(itemHeight: number, screenHeight: number): number {
  const visibleItems = Math.ceil(screenHeight / itemHeight);
  // Show 2 extra screens worth of items above and below
  return Math.max(5, Math.ceil(visibleItems * 5));
}

/**
 * Memory-efficient array chunking for batch processing
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Schedule idle callback for non-urgent work
 */
export function scheduleIdleTask(callback: () => void): number {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback);
  }
  // Fallback for environments without requestIdleCallback
  return setTimeout(callback, 1) as unknown as number;
}

/**
 * Cancel scheduled idle callback
 */
export function cancelIdleTask(id: number): void {
  if (typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Measure render time (development only)
 */
export function measureRenderTime(componentName: string) {
  if (__DEV__) {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`[Performance] ${componentName} rendered in ${(endTime - startTime).toFixed(2)}ms`);
    };
  }
  return () => {};
}

/**
 * Performance monitoring for lists
 */
export interface ListPerformanceMetrics {
  renderTime: number;
  itemCount: number;
  viewableItems: number;
  frameRate: number;
}

export function useListPerformance(): {
  onViewableItemsChanged: (info: { viewableItems: unknown[] }) => void;
  getMetrics: () => ListPerformanceMetrics;
} {
  const metricsRef = useRef<ListPerformanceMetrics>({
    renderTime: 0,
    itemCount: 0,
    viewableItems: 0,
    frameRate: 60,
  });

  const onViewableItemsChanged = useCallback(
    (info: { viewableItems: unknown[] }) => {
      metricsRef.current.viewableItems = info.viewableItems.length;
    },
    []
  );

  const getMetrics = useCallback(() => metricsRef.current, []);

  return { onViewableItemsChanged, getMetrics };
}

/**
 * Image preloading utility
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          Image.prefetch(url)
            .then(() => resolve())
            .catch(() => resolve()); // Don't fail on individual image errors
        })
    )
  );
}

/**
 * Platform-specific optimizations
 */
export const PlatformOptimizations = {
  // Android-specific optimizations
  android: {
    removeClippedSubviews: true,
    initialNumToRender: 10,
    maxToRenderPerBatch: 5,
    windowSize: 5,
    updateCellsBatchingPeriod: 50,
  },
  // iOS-specific optimizations
  ios: {
    removeClippedSubviews: false, // Can cause issues on iOS
    initialNumToRender: 15,
    maxToRenderPerBatch: 10,
    windowSize: 7,
    updateCellsBatchingPeriod: 50,
  },
};

export function getListOptimizations() {
  return Platform.select({
    android: PlatformOptimizations.android,
    ios: PlatformOptimizations.ios,
    default: PlatformOptimizations.ios,
  });
}
