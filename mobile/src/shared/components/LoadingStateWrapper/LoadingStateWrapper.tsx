// src/shared/components/LoadingStateWrapper/LoadingStateWrapper.tsx
// @deprecated Use UnifiedLoadingState instead
// Kept for backward compatibility only

/**
 * DEPRECATED: Use UnifiedLoadingState component instead
 *
 * ❌ OLD: <LoadingStateWrapper isLoading={isLoading} skeleton={<Skeleton />} content={<Content />} />
 * ✅ NEW: {isLoading ? <UnifiedLoadingState strategy="skeleton" customSkeleton={<Skeleton />} /> : <Content />}
 */

import React, { memo, ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';

// ============================================================================
// Types
// ============================================================================

export interface LoadingStateWrapperProps {
  /**
   * Whether content is loading
   */
  isLoading: boolean;
  /**
   * Skeleton/loading component
   */
  skeleton: ReactNode;
  /**
   * Actual content component
   */
  content: ReactNode;
  /**
   * Transition type
   * @default 'crossfade'
   */
  transition?: 'crossfade' | 'fade' | 'none';
  /**
   * Container style
   */
  style?: ViewStyle;
  /**
   * Test ID
   */
  testID?: string;
}

// ============================================================================
// LoadingStateWrapper Component
// ============================================================================

/**
 * LoadingStateWrapper Component
 *
 * Smooth transitions between loading and content states.
 * Prevents jarring flash of content by using crossfade.
 *
 * @example
 * ```tsx
 * <LoadingStateWrapper
 *   isLoading={isLoading}
 *   skeleton={<FeedSkeleton />}
 *   content={<PostList posts={posts} />}
 *   transition="crossfade"
 * />
 * ```
 */
export const LoadingStateWrapper: React.FC<LoadingStateWrapperProps> = memo(
  ({ isLoading, skeleton, content, transition = 'crossfade', style, testID }) => {
    // Determine animation based on transition type
    const getEnteringAnimation = () => {
      switch (transition) {
        case 'crossfade':
          return FadeIn.duration(UNIFIED_TIMING.loadingCrossfade);
        case 'fade':
          return FadeIn.duration(UNIFIED_TIMING.componentEnter);
        case 'none':
          return undefined;
        default:
          return FadeIn.duration(UNIFIED_TIMING.loadingCrossfade);
      }
    };

    const getExitingAnimation = () => {
      switch (transition) {
        case 'crossfade':
          return FadeOut.duration(UNIFIED_TIMING.componentExit);
        case 'fade':
          return FadeOut.duration(UNIFIED_TIMING.componentExit);
        case 'none':
          return undefined;
        default:
          return FadeOut.duration(UNIFIED_TIMING.componentExit);
      }
    };

    const entering = getEnteringAnimation();
    const exiting = getExitingAnimation();

    return (
      <Animated.View style={[styles.container, style]} testID={testID}>
        {isLoading ? (
          <Animated.View
            key="skeleton"
            entering={entering}
            exiting={exiting}
            style={styles.stateContainer}>
            {skeleton}
          </Animated.View>
        ) : (
          <Animated.View
            key="content"
            entering={entering}
            exiting={exiting}
            style={styles.stateContainer}>
            {content}
          </Animated.View>
        )}
      </Animated.View>
    );
  },
);

LoadingStateWrapper.displayName = 'LoadingStateWrapper';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stateContainer: {
    flex: 1,
  },
});
