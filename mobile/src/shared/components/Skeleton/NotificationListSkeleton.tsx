// src/shared/components/Skeleton/NotificationListSkeleton.tsx
// Notification List Skeleton - Production Ready

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { UNIFIED_TIMING } from '@constants';

/**
 * Notification List Skeleton
 * NotificationsScreen için skeleton loading state
 */
export const NotificationListSkeleton: React.FC = () => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(index => {
        const delay = Math.min(
          index * UNIFIED_TIMING.listItemDelay,
          UNIFIED_TIMING.listItemDelayMax,
        );

        return (
          <Animated.View
            key={index}
            entering={FadeIn.delay(delay).duration(UNIFIED_TIMING.listItemDuration)}
            style={[styles.notificationItem, { backgroundColor: colors.background.secondary }]}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: colors.border.default }]} />

            {/* Content */}
            <View style={styles.content}>
              <View
                style={[
                  styles.textLine,
                  styles.titleLine,
                  { backgroundColor: colors.border.default },
                ]}
              />
              <View
                style={[
                  styles.textLine,
                  styles.descLine,
                  { backgroundColor: colors.border.subtle },
                ]}
              />
              <View
                style={[
                  styles.textLine,
                  styles.timeLine,
                  { backgroundColor: colors.border.subtle },
                ]}
              />
            </View>

            {/* Icon */}
            <View style={[styles.icon, { backgroundColor: colors.border.default }]} />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  textLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  titleLine: {
    width: '70%',
  },
  descLine: {
    width: '90%',
  },
  timeLine: {
    width: '30%',
    marginBottom: 0,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
});
