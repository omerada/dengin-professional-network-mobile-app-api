// src/shared/hooks/useLifecycle.ts
// Meslektaş Design System - Lifecycle Hooks
// Oku: mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md

import { useEffect, useRef, useCallback } from 'react';

/**
 * usePrevious Hook
 * Returns the previous value of a variable
 *
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * // When count changes from 0 to 1, prevCount will be 0
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * useMount Hook
 * Runs a callback only on component mount
 *
 * @example
 * useMount(() => {
 *   console.log('Component mounted');
 *   initializeData();
 * });
 */
export function useMount(callback: () => void | (() => void)): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return callback();
  }, []);
}

/**
 * useUnmount Hook
 * Runs a callback only on component unmount
 *
 * @example
 * useUnmount(() => {
 *   console.log('Component unmounting');
 *   cleanup();
 * });
 */
export function useUnmount(callback: () => void): void {
  const callbackRef = useRef(callback);

  // Update ref to always have latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, []);
}

/**
 * useUpdateEffect Hook
 * Like useEffect but skips the first render (mount)
 *
 * @example
 * useUpdateEffect(() => {
 *   console.log('Value updated (not on mount)');
 * }, [value]);
 */
export function useUpdateEffect(
  callback: () => void | (() => void),
  dependencies: React.DependencyList,
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * useIsMounted Hook
 * Returns a function that returns whether the component is still mounted
 * Useful for async operations to prevent state updates on unmounted components
 *
 * @example
 * const isMounted = useIsMounted();
 *
 * const fetchData = async () => {
 *   const result = await api.getData();
 *   if (isMounted()) {
 *     setData(result);
 *   }
 * };
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

/**
 * useFirstRender Hook
 * Returns true only on the first render
 *
 * @example
 * const isFirstRender = useFirstRender();
 * if (isFirstRender) {
 *   // Do something only on first render
 * }
 */
export function useFirstRender(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}

/**
 * useRenderCount Hook
 * Returns the number of times the component has rendered
 * Useful for debugging and performance monitoring
 *
 * @example
 * const renderCount = useRenderCount();
 * console.log(`Rendered ${renderCount} times`);
 */
export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
