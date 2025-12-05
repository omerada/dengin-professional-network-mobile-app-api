// src/shared/hooks/useDebounce.ts
// Meslektaş Design System - Debounce Hook
// Oku: mobile-development-guide/ui-ux-modernization/15-PERFORMANCE-OPTIMIZATION.md

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useDebounce Hook
 * Debounces a value by the specified delay
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // API call with debounced value
 *   searchApi(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback Hook
 * Returns a debounced version of the callback function
 *
 * @example
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   searchApi(term);
 * }, 300);
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );

  return debouncedCallback;
}

/**
 * useThrottle Hook
 * Throttles a value - only updates at most once per delay period
 *
 * @example
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now - lastUpdated.current >= delay) {
      setThrottledValue(value);
      lastUpdated.current = now;
      return;
    }

    const handler = setTimeout(
      () => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      },
      delay - (now - lastUpdated.current),
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}

/**
 * useThrottledCallback Hook
 * Returns a throttled version of the callback function
 *
 * @example
 * const handleScroll = useThrottledCallback((event) => {
 *   updateScrollPosition(event.nativeEvent.contentOffset.y);
 * }, 100);
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const lastCalled = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = delay - (now - lastCalled.current);

      if (remaining <= 0) {
        lastCalled.current = now;
        callbackRef.current(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCalled.current = Date.now();
          timeoutRef.current = null;
          callbackRef.current(...args);
        }, remaining);
      }
    },
    [delay],
  );

  return throttledCallback;
}

export default useDebounce;
