// src/shared/components/Skeleton/ActivityScreenSkeleton.tsx
// Activity Screen Skeleton - Production Ready

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { UNIFIED_TIMING } from '@constants';

/**
 * Activity Screen Skeleton
 * ActivityScreen için skeleton loading state
 */
export const ActivityScreenSkeleton: React.FC = () => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {[0, 1, 2].map(index => (
          <Animated.View
            key={`stat-${index}`}
            entering={FadeIn.delay(index * 60).duration(300)}
            style={[styles.statCard, { backgroundColor: colors.background.secondary }]}>
            <View style={[styles.statNumber, { backgroundColor: colors.border.default }]} />
            <View style={[styles.statLabel, { backgroundColor: colors.border.subtle }]} />
          </Animated.View>
        ))}
      </View>

      {/* Activity Items */}
      <View style={styles.activityList}>
        {[0, 1, 2, 3, 4, 5].map(index => {
          const delay = Math.min(
            (index + 3) * UNIFIED_TIMING.listItemDelay,
            UNIFIED_TIMING.listItemDelayMax,
          );

          return (
            <Animated.View
              key={`activity-${index}`}
              entering={FadeIn.delay(delay).duration(UNIFIED_TIMING.listItemDuration)}
              style={[styles.activityItem, { backgroundColor: colors.background.secondary }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.border.default }]} />

              <View style={styles.activityContent}>
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
              </View>

              <View style={[styles.activityBadge, { backgroundColor: colors.border.default }]} />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    width: 40,
    height: 24,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  statLabel: {
    width: 60,
    height: 12,
    borderRadius: 6,
  },
  activityList: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  textLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  titleLine: {
    width: '60%',
  },
  descLine: {
    width: '80%',
    marginBottom: 0,
  },
  activityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
