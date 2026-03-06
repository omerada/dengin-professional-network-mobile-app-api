// src/features/activity/components/ActivitySkeleton.tsx
// Skeleton loader for activity/achievements list
// Production-ready component

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { Skeleton } from '@shared/components';
import { spacing, borderRadius } from '@theme';
import { UNIFIED_TIMING } from '@constants';

interface ActivitySkeletonProps {
  /**
   * Number of skeleton items to render
   * @default 6
   */
  count?: number;
}

/**
 * ActivitySkeleton Component
 *
 * Displays skeleton placeholders for activity/achievement cards.
 * Used during initial loading state.
 *
 * @example
 * ```tsx
 * {isLoading && <ActivitySkeleton count={6} />}
 * ```
 */
export const ActivitySkeleton: React.FC<ActivitySkeletonProps> = memo(({ count = 6 }) => {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeIn.duration(UNIFIED_TIMING.componentEnter)}
      style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`skeleton-${index}`}
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.subtle,
            },
          ]}>
          {/* Icon */}
          <Skeleton width={48} height={48} borderRadius={24} />

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Skeleton width="70%" height={16} borderRadius={4} style={styles.title} />

            {/* Subtitle */}
            <Skeleton width="90%" height={14} borderRadius={4} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
});

ActivitySkeleton.displayName = 'ActivitySkeleton';

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginBottom: spacing['3'],
    marginHorizontal: spacing['4'],
    padding: spacing['4'],
  },
  container: {
    flex: 1,
    paddingTop: spacing['4'],
  },
  content: {
    flex: 1,
    marginLeft: spacing['3'],
  },
  title: {
    marginBottom: spacing['1.5'],
  },
});
