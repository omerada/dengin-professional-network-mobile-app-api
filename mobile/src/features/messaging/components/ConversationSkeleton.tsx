// src/features/messaging/components/ConversationSkeleton.tsx
// Skeleton loader for conversation list items
// Production-ready component

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { Skeleton } from '@shared/components';
import { spacing } from '@theme';
import { UNIFIED_TIMING } from '@constants';

interface ConversationSkeletonProps {
  /**
   * Number of skeleton items to render
   * @default 8
   */
  count?: number;
}

/**
 * ConversationSkeleton Component
 *
 * Displays skeleton placeholders for conversation list items.
 * Used during initial loading state.
 *
 * @example
 * ```tsx
 * {isLoading && <ConversationSkeleton count={8} />}
 * ```
 */
export const ConversationSkeleton: React.FC<ConversationSkeletonProps> = memo(({ count = 8 }) => {
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
          {/* Avatar */}
          <Skeleton width={48} height={48} borderRadius={24} />

          {/* Content */}
          <View style={styles.content}>
            {/* Name + Time */}
            <View style={styles.header}>
              <Skeleton width="60%" height={16} borderRadius={4} />
              <Skeleton width={40} height={12} borderRadius={4} />
            </View>

            {/* Last message */}
            <View style={styles.messageRow}>
              <Skeleton width="85%" height={14} borderRadius={4} style={styles.messageText} />
            </View>
          </View>

          {/* Badge indicator placeholder */}
          <View style={styles.badgeSpace} />
        </View>
      ))}
    </Animated.View>
  );
});

ConversationSkeleton.displayName = 'ConversationSkeleton';

const styles = StyleSheet.create({
  badgeSpace: {
    marginLeft: spacing['2'],
    width: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: spacing['3'],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['1.5'],
  },
  itemContainer: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  messageText: {
    marginTop: spacing['1'],
  },
});
