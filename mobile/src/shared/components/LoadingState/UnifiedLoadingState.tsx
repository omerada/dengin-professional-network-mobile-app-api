// src/shared/components/LoadingState/UnifiedLoadingState.tsx
// Unified Loading State System - Production Ready
// Tüm loading state'leri için standardize edilmiş component

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { Loading } from '../Loading';

export type LoadingStrategy = 'skeleton' | 'spinner' | 'inline' | 'button';
export type LoadingVariant = 'screen' | 'list' | 'section';

export interface UnifiedLoadingStateProps {
  /** Loading strategy */
  strategy: LoadingStrategy;
  /** Loading variant */
  variant?: LoadingVariant;
  /** Custom skeleton component */
  customSkeleton?: React.ReactNode;
  /** Loading message (for spinner strategy) */
  message?: string;
  /** Size for spinner */
  size?: 'small' | 'large';
  /** Full screen mode */
  fullScreen?: boolean;
  /** Minimum loading time (prevents flashing) */
  minLoadingTime?: number;
}

/**
 * Unified Loading State Component
 *
 * Tüm loading state'leri için tek bir standardize edilmiş interface.
 *
 * KULLANIM:
 *
 * ```tsx
 * // Screen loading with custom skeleton
 * if (isLoading) {
 *   return <UnifiedLoadingState strategy="skeleton" customSkeleton={<FeedSkeleton />} />;
 * }
 *
 * // Inline spinner
 * {isLoadingMore && <UnifiedLoadingState strategy="inline" />}
 *
 * // Button spinner
 * <Button loading={isLoading}>
 *   <UnifiedLoadingState strategy="button" size="small" />
 * </Button>
 * ```
 */
export const UnifiedLoadingState: React.FC<UnifiedLoadingStateProps> = ({
  strategy,
  variant = 'screen',
  customSkeleton,
  message,
  size = 'large',
}) => {
  const colors = useColors();

  // Skeleton Strategy
  if (strategy === 'skeleton') {
    if (customSkeleton) {
      return (
        <Animated.View entering={FadeIn.duration(200)} style={styles.skeletonContainer}>
          {customSkeleton}
        </Animated.View>
      );
    }
    // Fallback to spinner if no custom skeleton
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size={size} color={colors.interactive.default} />
      </View>
    );
  }

  // Spinner Strategy
  if (strategy === 'spinner') {
    if (variant === 'screen') {
      return <Loading message={message} />;
    }

    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size={size} color={colors.interactive.default} />
      </View>
    );
  }

  // Inline Strategy (for pagination, load more)
  if (strategy === 'inline') {
    return (
      <Animated.View entering={FadeIn.duration(150)} style={styles.inlineContainer}>
        <ActivityIndicator size="small" color={colors.interactive.default} />
      </Animated.View>
    );
  }

  // Button Strategy (inside buttons)
  if (strategy === 'button') {
    return <ActivityIndicator size="small" color={colors.text.inverse} />;
  }

  return null;
};

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  inlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  skeletonContainer: {
    flex: 1,
  },
});
