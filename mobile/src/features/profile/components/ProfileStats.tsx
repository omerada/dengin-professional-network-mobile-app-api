// src/features/profile/components/ProfileStats.tsx
// Profile statistics component (posts, followers, following)
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import type { ProfileStats as ProfileStatsType } from '../types';

interface ProfileStatsProps {
  /**
   * Stats data
   */
  stats: ProfileStatsType;
  /**
   * User ID for navigation to followers/following screens
   */
  userId: number;
  /**
   * Whether stats are interactive (clickable)
   */
  interactive?: boolean;
}

interface StatItemProps {
  label: string;
  value: number;
  onPress?: () => void;
}

const StatItem: React.FC<StatItemProps> = memo(({ label, value, onPress }) => {
  const { theme } = useTheme();

  const formattedValue = value >= 1000
    ? `${(value / 1000).toFixed(1)}K`
    : value.toString();

  const content = (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
        {formattedValue}
      </Text>
      <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

StatItem.displayName = 'StatItem';

/**
 * ProfileStats Component
 *
 * Displays post count, followers, and following counts
 * Clicking on followers/following navigates to respective lists
 */
export const ProfileStats: React.FC<ProfileStatsProps> = memo(
  ({ stats, userId, interactive = true }) => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const handleFollowersPress = useCallback(() => {
      navigation.navigate('FollowersList' as never, { userId } as never);
    }, [navigation, userId]);

    const handleFollowingPress = useCallback(() => {
      navigation.navigate('FollowingList' as never, { userId } as never);
    }, [navigation, userId]);

    return (
      <View
        style={[
          styles.container,
          { borderColor: theme.colors.border.light },
        ]}
      >
        <StatItem label="Gönderi" value={stats.postCount} />

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border.light }]}
        />

        <StatItem
          label="Takipçi"
          value={stats.followerCount}
          onPress={interactive ? handleFollowersPress : undefined}
        />

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border.light }]}
        />

        <StatItem
          label="Takip"
          value={stats.followingCount}
          onPress={interactive ? handleFollowingPress : undefined}
        />
      </View>
    );
  },
);

ProfileStats.displayName = 'ProfileStats';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
  },
});

