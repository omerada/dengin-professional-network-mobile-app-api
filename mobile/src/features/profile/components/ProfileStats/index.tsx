// src/features/profile/components/ProfileStats/index.tsx
// Meslektaş Design System - Modern ProfileStats Component
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

import { styles } from './ProfileStats.styles';
import { formatStatValue, type ProfileStatsProps, type StatItemProps } from './ProfileStats.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * StatItem - Individual stat display
 */
const StatItem: React.FC<StatItemProps> = memo(({ label, value, onPress, delay = 0 }) => {
  const colors = useColors();
  const { trigger } = useHaptic();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    if (!onPress) return;

    trigger('light');
    scale.value = withSpring(0.95, spring.press);
    setTimeout(() => {
      scale.value = withSpring(1, spring.snappy);
    }, 100);
    onPress();
  }, [onPress, trigger, scale]);

  const formattedValue = formatStatValue(value);

  const content = (
    <Animated.View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.text.primary }]}>{formattedValue}</Text>
      <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{label}</Text>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(300)}>
        <AnimatedPressable
          onPress={handlePress}
          style={animatedStyle}
          accessibilityRole="button"
          accessibilityLabel={`${formattedValue} ${label}`}>
          {content}
        </AnimatedPressable>
      </Animated.View>
    );
  }

  return <Animated.View entering={FadeInDown.delay(delay).duration(300)}>{content}</Animated.View>;
});

StatItem.displayName = 'StatItem';

/**
 * Modern ProfileStats Component
 *
 * Features:
 * - Animated stat counters
 * - Spring-based press animations
 * - Haptic feedback on interaction
 * - Staggered entrance animations
 * - Navigation to followers/following lists
 *
 * @example
 * ```tsx
 * <ProfileStats
 *   stats={{ postCount: 42, followerCount: 1000, followingCount: 500 }}
 *   userId={123}
 *   interactive={true}
 * />
 * ```
 */
export const ProfileStats: React.FC<ProfileStatsProps> = memo(
  ({ stats, userId, interactive = true, testID }) => {
    const colors = useColors();
    const navigation = useNavigation();

    // Navigation handlers
    const handleFollowersPress = useCallback(() => {
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('FollowersList', { userId });
    }, [navigation, userId]);

    const handleFollowingPress = useCallback(() => {
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('FollowingList', { userId });
    }, [navigation, userId]);

    return (
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.container, { borderColor: colors.border.subtle }]}
        testID={testID}>
        <StatItem label="Gönderi" value={stats.postCount} delay={250} />

        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

        <StatItem
          label="Takipçi"
          value={stats.followerCount}
          onPress={interactive ? handleFollowersPress : undefined}
          delay={300}
        />

        <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />

        <StatItem
          label="Takip"
          value={stats.followingCount}
          onPress={interactive ? handleFollowingPress : undefined}
          delay={350}
        />
      </Animated.View>
    );
  },
);

ProfileStats.displayName = 'ProfileStats';

export default ProfileStats;
