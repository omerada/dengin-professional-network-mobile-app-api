// src/features/notifications/components/NotificationSkeleton.tsx
// Skeleton loader for notification list items
// Production-ready component

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { Skeleton } from '@shared/components';
import { spacing } from '@theme';
import { UNIFIED_TIMING } from '@constants';

interface NotificationSkeletonProps {
  /**
   * Number of skeleton items to render
   * @default 10
   */
  count?: number;
}

/**
 * NotificationSkeleton Component
 *
 * Displays skeleton placeholders for notification list items.
 * Used during initial loading state.
 *
 * @example
 * ```tsx
 * {isLoading && <NotificationSkeleton count={10} />}
 * ```
 */
export const NotificationSkeleton: React.FC<NotificationSkeletonProps> = memo(({ count = 10 }) => {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeIn.duration(UNIFIED_TIMING.componentEnter)}
      style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`skeleton-${index}`}
          style={[
            styles.itemContainer,
            {
              backgroundColor: colors.background.primary,
              borderBottomColor: colors.border.subtle,
            },
          ]}>
          {/* Icon/Avatar */}
          <Skeleton width={40} height={40} borderRadius={20} />

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Skeleton width="70%" height={14} borderRadius={4} style={styles.title} />

            {/* Message */}
            <Skeleton width="90%" height={12} borderRadius={4} style={styles.message} />

            {/* Time */}
            <Skeleton width={60} height={10} borderRadius={4} style={styles.time} />
          </View>

          {/* Unread indicator space */}
          <View style={styles.indicatorSpace} />
        </View>
      ))}
    </Animated.View>
  );
});

NotificationSkeleton.displayName = 'NotificationSkeleton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginLeft: spacing['3'],
  },
  indicatorSpace: {
    marginLeft: spacing['2'],
    width: 8,
  },
  itemContainer: {
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  message: {
    marginBottom: spacing['1'],
  },
  time: {
    marginTop: spacing['0.5'],
  },
  title: {
    marginBottom: spacing['1'],
  },
});
