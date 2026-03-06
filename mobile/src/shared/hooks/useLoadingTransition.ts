// src/shared/hooks/useLoadingTransition.ts
// Unified Loading Transition Hook - Production Ready
// Provides consistent crossfade transitions for loading states
// Oku: UX-IYILESTIRME-GELISTIRME-PLANI.md - Sprint 2 Task 2.2

import { useEffect } from 'react';
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';

export interface UseLoadingTransitionOptions {
  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Custom transition duration
   * @default UNIFIED_TIMING.loadingCrossfade (250ms)
   */
  duration?: number;
}

export interface UseLoadingTransitionResult {
  /**
   * Opacity shared value for animations
   */
  opacity: ReturnType<typeof useSharedValue<number>>;

  /**
   * Animated style for loading container
   */
  loadingStyle: ReturnType<typeof useAnimatedStyle>;

  /**
   * Animated style for content container
   */
  contentStyle: ReturnType<typeof useAnimatedStyle>;
}

/**
 * Hook for unified loading → content crossfade transitions
 *
 * Provides smooth 250ms crossfade between loading skeleton/spinner and actual content.
 * Eliminates jarring instant swaps for polished UX.
 *
 * @param options - Configuration options
 * @returns Animation values and styles
 *
 * @example
 * ```tsx
 * const { isLoading, posts } = useFeedPosts();
 * const { loadingStyle, contentStyle } = useLoadingTransition({ isLoading: isLoading && posts.length === 0 });
 *
 * return (
 *   <>
 *     {isLoading && posts.length === 0 && (
 *       <Animated.View style={loadingStyle}>
 *         <FeedSkeleton count={8} />
 *       </Animated.View>
 *     )}
 *     {!isLoading && (
 *       <Animated.View style={contentStyle}>
 *         <FlashList data={posts} ... />
 *       </Animated.View>
 *     )}
 *   </>
 * );
 * ```
 */
export function useLoadingTransition({
  isLoading,
  duration = UNIFIED_TIMING.loadingCrossfade,
}: UseLoadingTransitionOptions): UseLoadingTransitionResult {
  const opacity = useSharedValue(isLoading ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(isLoading ? 1 : 0, {
      duration,
    });
  }, [isLoading, opacity, duration]);

  // Loading container style (visible when loading)
  const loadingStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    position: opacity.value === 0 ? 'absolute' : 'relative',
  }));

  // Content container style (visible when not loading)
  const contentStyle = useAnimatedStyle(() => ({
    opacity: 1 - opacity.value,
    flex: 1,
  }));

  return {
    opacity,
    loadingStyle,
    contentStyle,
  };
}
