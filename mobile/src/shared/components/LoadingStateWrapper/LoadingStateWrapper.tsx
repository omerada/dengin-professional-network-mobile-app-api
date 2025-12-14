// src/shared/components/LoadingStateWrapper/LoadingStateWrapper.tsx
// Production-ready loading state wrapper component
// Automatically renders appropriate loading component based on strategy

import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { FeedSkeleton } from '@features/feed/components';
import { Loading, LoadingOverlay } from '@shared/components/Loading';
import { useLoadingState, type UseLoadingStateOptions } from '@shared/hooks';

export interface LoadingStateWrapperProps extends UseLoadingStateOptions {
  /**
   * Content to show when not loading
   */
  children: React.ReactNode;

  /**
   * Number of skeleton items (for skeleton strategy)
   */
  skeletonCount?: number;

  /**
   * Whether to show images in skeleton (for skeleton strategy)
   */
  skeletonShowImages?: boolean;
}

/**
 * LoadingStateWrapper Component
 *
 * Automatically handles loading states based on screen type
 * and renders appropriate loading component.
 *
 * @example
 * ```tsx
 * <LoadingStateWrapper screenName="feed" isLoading={isLoading}>
 *   <FlatList data={posts} renderItem={renderItem} />
 * </LoadingStateWrapper>
 * ```
 */
export const LoadingStateWrapper: React.FC<LoadingStateWrapperProps> = memo(
  ({
    children,
    screenName,
    strategy: overrideStrategy,
    message: overrideMessage,
    isLoading = false,
    skeletonCount = 3,
    skeletonShowImages = true,
  }) => {
    const { strategy, message, indicatorColor } = useLoadingState({
      screenName,
      strategy: overrideStrategy,
      message: overrideMessage,
      isLoading,
    });

    if (!isLoading) {
      return <>{children}</>;
    }

    // Render appropriate loading component based on strategy
    switch (strategy) {
      case 'skeleton':
        return <FeedSkeleton count={skeletonCount} showImages={skeletonShowImages} />;

      case 'overlay':
        return (
          <>
            {children}
            <LoadingOverlay message={message} />
          </>
        );

      case 'inline':
        return (
          <View style={styles.inlineContainer}>
            <ActivityIndicator size="small" color={indicatorColor} />
          </View>
        );

      case 'spinner':
      default:
        return <Loading message={message} />;
    }
  },
);

LoadingStateWrapper.displayName = 'LoadingStateWrapper';

const styles = StyleSheet.create({
  inlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
