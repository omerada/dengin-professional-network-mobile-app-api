// src/features/feed/components/SuggestedExpertsCarousel/ExpertCard.tsx
// Expert card component for carousel
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';

import { styles } from './ExpertCard.styles';
import type { ExpertCardProps } from './SuggestedExpertsCarousel.types';

/**
 * ExpertCard Component
 *
 * Displays a single expert card in the carousel.
 *
 * Features:
 * - Avatar (60px circle)
 * - Full name (14px, 2 lines max)
 * - Profession (12px, 1 line)
 * - Verified badge (if verified)
 * - Follow/Following button
 * - Press animation (scale)
 *
 * Design Spec: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md
 *
 * @example
 * ```tsx
 * <ExpertCard
 *   expert={expert}
 *   onPress={() => navigation.navigate('Profile', { userId: expert.id })}
 *   onFollowPress={() => handleFollowToggle(expert.id, expert.isFollowing)}
 * />
 * ```
 */
export const ExpertCard: React.FC<ExpertCardProps> = memo(
  ({ expert, onPress, onFollowPress, testID }) => {
    const colors = useColors();
    const scale = useSharedValue(1);

    // Animated style for press effect
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Handle card press with animation
    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15 });
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: colors.background.elevated,
              borderColor: colors.border.default,
            },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`${expert.fullName}, ${expert.profession}`}
          accessibilityHint="Profili görüntülemek için dokun"
          testID={testID}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: colors.background.tertiary }]}>
            <Icon name="person" size={28} color={colors.text.tertiary} />
          </View>

          {/* Name with optional verified badge */}
          <View style={styles.nameContainer}>
            {expert.isVerified ? (
              <View style={styles.nameWithBadge}>
                <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={2}>
                  {expert.fullName}
                </Text>
                <Icon
                  name="checkmark-circle"
                  size={14}
                  color={colors.status.success}
                  style={styles.verifiedBadge}
                />
              </View>
            ) : (
              <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={2}>
                {expert.fullName}
              </Text>
            )}
          </View>

          {/* Profession */}
          <Text style={[styles.profession, { color: colors.text.secondary }]} numberOfLines={1}>
            {expert.profession}
          </Text>

          {/* Follow Button */}
          <Pressable
            style={[
              styles.followButton,
              {
                backgroundColor: expert.isFollowing
                  ? colors.background.secondary
                  : colors.interactive.default,
              },
            ]}
            onPress={e => {
              e?.stopPropagation?.();
              onFollowPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={expert.isFollowing ? 'Takipten çık' : 'Takip et'}
            accessibilityHint={`${expert.fullName} adlı uzmanı ${expert.isFollowing ? 'takipten çıkarmak' : 'takip etmek'} için dokun`}>
            <Text
              style={[
                styles.followButtonText,
                {
                  color: expert.isFollowing ? colors.text.secondary : colors.text.inverse,
                },
              ]}>
              {expert.isFollowing ? 'Takiptesin' : 'Takip Et'}
            </Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    );
  },
);

ExpertCard.displayName = 'ExpertCard';

export default ExpertCard;
