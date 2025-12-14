import React, { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface OptimisticUpdateOptions<TData, TError = Error> {
  /** Immediate optimistic update function */
  optimisticUpdate: () => void;
  /** Revert function if mutation fails */
  revert: () => void;
  /** Actual async mutation function */
  mutationFn: () => Promise<TData>;
  /** Success callback */
  onSuccess?: (data: TData) => void;
  /** Error callback */
  onError?: (error: TError) => void;
  /** Finally callback (runs regardless of success/error) */
  onSettled?: () => void;
  /** Enable haptic feedback (default: true) */
  enableHaptics?: boolean;
}

export interface OptimisticUpdateState {
  /** Is mutation currently in progress */
  isLoading: boolean;
  /** Is optimistic update currently applied */
  isOptimistic: boolean;
  /** Error if mutation failed */
  error: Error | null;
}

/**
 * useOptimisticUpdate Hook
 *
 * Production-ready hook for optimistic UI updates with automatic rollback on failure.
 * Provides instant visual feedback while async operations complete in the background.
 *
 * Key Features:
 * - Instant UI updates before server response
 * - Automatic rollback on error
 * - Haptic feedback for success/error
 * - TypeScript-safe with generics
 * - Loading and error states
 *
 * @example
 * ```tsx
 * const { mutate, state } = useOptimisticUpdate({
 *   optimisticUpdate: () => setLiked(true),
 *   revert: () => setLiked(false),
 *   mutationFn: async () => await likePost(postId),
 *   onSuccess: () => console.log('Post liked!'),
 * });
 *
 * <Button onPress={mutate} disabled={state.isLoading}>
 *   {liked ? 'Unlike' : 'Like'}
 * </Button>
 * ```
 */
export function useOptimisticUpdate<TData, TError = Error>() {
  const [state, setState] = useState<OptimisticUpdateState>({
    isLoading: false,
    isOptimistic: false,
    error: null,
  });

  // Track if component is mounted
  const isMountedRef = useRef(true);
  const activeRequestRef = useRef<Promise<TData> | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mutate = useCallback(async (options: OptimisticUpdateOptions<TData, TError>) => {
    const {
      optimisticUpdate,
      revert,
      mutationFn,
      onSuccess,
      onError,
      onSettled,
      enableHaptics = true,
    } = options;

    // Prevent duplicate requests
    if (activeRequestRef.current) {
      return;
    }

    try {
      // Apply optimistic update immediately
      optimisticUpdate();

      if (isMountedRef.current) {
        setState({
          isLoading: true,
          isOptimistic: true,
          error: null,
        });
      }

      // Light haptic for instant feedback
      if (enableHaptics && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Execute actual mutation
      const mutationPromise = mutationFn();
      activeRequestRef.current = mutationPromise;
      const data = await mutationPromise;

      // Success state
      if (isMountedRef.current) {
        setState({
          isLoading: false,
          isOptimistic: false,
          error: null,
        });
      }

      // Success haptic
      if (enableHaptics && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onSuccess?.(data);
    } catch (error) {
      // Revert optimistic update on error
      revert();

      if (isMountedRef.current) {
        setState({
          isLoading: false,
          isOptimistic: false,
          error: error as Error,
        });
      }

      // Error haptic
      if (enableHaptics && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      onError?.(error as TError);
    } finally {
      activeRequestRef.current = null;
      onSettled?.();
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isOptimistic: false,
      error: null,
    });
  }, []);

  return {
    mutate,
    reset,
    state,
    isLoading: state.isLoading,
    isOptimistic: state.isOptimistic,
    error: state.error,
  };
}

/**
 * useOptimisticToggle Hook
 *
 * Specialized optimistic update hook for boolean toggles (like/unlike, follow/unfollow).
 *
 * @example
 * ```tsx
 * const { value: isFollowing, toggle, isLoading } = useOptimisticToggle({
 *   initialValue: user.isFollowing,
 *   mutationFn: async (newValue) => {
 *     if (newValue) {
 *       return await followUser(user.id);
 *     } else {
 *       return await unfollowUser(user.id);
 *     }
 *   },
 * });
 *
 * <Button onPress={toggle} disabled={isLoading}>
 *   {isFollowing ? 'Unfollow' : 'Follow'}
 * </Button>
 * ```
 */
export function useOptimisticToggle<TData>(options: {
  initialValue: boolean;
  mutationFn: (newValue: boolean) => Promise<TData>;
  onSuccess?: (data: TData, newValue: boolean) => void;
  onError?: (error: Error, revertedValue: boolean) => void;
  enableHaptics?: boolean;
}) {
  const { initialValue, mutationFn, onSuccess, onError, enableHaptics = true } = options;

  const [value, setValue] = useState(initialValue);
  const previousValueRef = useRef(initialValue);
  const { mutate, state } = useOptimisticUpdate<TData>();

  const toggle = useCallback(async () => {
    const newValue = !value;
    previousValueRef.current = value;

    await mutate({
      optimisticUpdate: () => setValue(newValue),
      revert: () => setValue(previousValueRef.current),
      mutationFn: () => mutationFn(newValue),
      onSuccess: data => onSuccess?.(data, newValue),
      onError: error => onError?.(error, previousValueRef.current),
      enableHaptics,
    });
  }, [value, mutate, mutationFn, onSuccess, onError, enableHaptics]);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    toggle,
    reset,
    isLoading: state.isLoading,
    isOptimistic: state.isOptimistic,
    error: state.error,
  };
}

/**
 * useOptimisticCounter Hook
 *
 * Specialized optimistic update hook for numeric counters (likes count, followers count).
 *
 * @example
 * ```tsx
 * const { value: likesCount, increment, decrement } = useOptimisticCounter({
 *   initialValue: post.likesCount,
 *   mutationFn: async (delta) => {
 *     return await updateLikes(post.id, delta);
 *   },
 * });
 *
 * <Text>{likesCount} likes</Text>
 * <Button onPress={increment}>Like</Button>
 * ```
 */
export function useOptimisticCounter<TData>(options: {
  initialValue: number;
  mutationFn: (delta: number) => Promise<TData>;
  onSuccess?: (data: TData, newValue: number) => void;
  onError?: (error: Error, revertedValue: number) => void;
  enableHaptics?: boolean;
  min?: number;
  max?: number;
}) {
  const { initialValue, mutationFn, onSuccess, onError, enableHaptics = true, min, max } = options;

  const [value, setValue] = useState(initialValue);
  const previousValueRef = useRef(initialValue);
  const { mutate, state } = useOptimisticUpdate<TData>();

  const update = useCallback(
    async (delta: number) => {
      const newValue = value + delta;

      // Validate bounds
      if (min !== undefined && newValue < min) return;
      if (max !== undefined && newValue > max) return;

      previousValueRef.current = value;

      await mutate({
        optimisticUpdate: () => setValue(newValue),
        revert: () => setValue(previousValueRef.current),
        mutationFn: () => mutationFn(delta),
        onSuccess: data => onSuccess?.(data, newValue),
        onError: error => onError?.(error, previousValueRef.current),
        enableHaptics,
      });
    },
    [value, mutate, mutationFn, onSuccess, onError, enableHaptics, min, max],
  );

  const increment = useCallback(() => update(1), [update]);
  const decrement = useCallback(() => update(-1), [update]);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    increment,
    decrement,
    update,
    reset,
    isLoading: state.isLoading,
    isOptimistic: state.isOptimistic,
    error: state.error,
  };
}
