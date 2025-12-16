// src/features/social/components/UserSkeleton.tsx
// Skeleton loader for user list items (followers/following)
// Production-ready component

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { Skeleton } from '@shared/components';
import { spacing, borderRadius } from '@theme';
import { UNIFIED_TIMING } from '@constants';

interface UserSkeletonProps {
  /**
   * Number of skeleton items to render
   * @default 12
   */
  count?: number;
  /**
   * Show follow button placeholder
   * @default true
   */
  showFollowButton?: boolean;
}

/**
 * UserSkeleton Component
 *
 * Displays skeleton placeholders for user list items.
 * Used in followers/following lists during initial loading.
 *
 * @example
 * ```tsx
 * {isLoading && <UserSkeleton count={12} />}
 * ```
 */
export const UserSkeleton: React.FC<UserSkeletonProps> = memo(
  ({ count = 12, showFollowButton = true }) => {
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
              {/* Full name */}
              <Skeleton width="60%" height={16} borderRadius={4} style={styles.name} />

              {/* Profession/Bio */}
              <Skeleton width="80%" height={14} borderRadius={4} />
            </View>

            {/* Follow button */}
            {showFollowButton && <Skeleton width={80} height={32} borderRadius={borderRadius.md} />}
          </View>
        ))}
      </Animated.View>
    );
  },
);

UserSkeleton.displayName = 'UserSkeleton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: spacing['3'],
  },
  itemContainer: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  name: {
    marginBottom: spacing['1'],
  },
});
