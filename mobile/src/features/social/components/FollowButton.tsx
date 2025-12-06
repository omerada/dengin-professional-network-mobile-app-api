// src/features/social/components/FollowButton.tsx
// Follow/Unfollow button component
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, ActivityIndicator, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { spring } from '@theme/animations';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useFollow, useUnfollow } from '../hooks';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface FollowButtonProps {
  /**
   * ID of user to follow/unfollow
   */
  userId: number;
  /**
   * Current follow status
   */
  isFollowing: boolean;
  /**
   * Callback when follow state changes
   */
  onFollowChange?: (userId: number, isFollowing: boolean) => void;
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md';
}

/**
 * FollowButton Component
 *
 * Toggles follow/unfollow state for a user.
 * Uses mutations for optimistic updates.
 *
 * @example
 * ```tsx
 * <FollowButton
 *   userId={123}
 *   isFollowing={false}
 *   onFollowChange={(id, following) => console.log(id, following)}
 * />
 * ```
 */
export const FollowButton: React.FC<FollowButtonProps> = memo(
  ({ userId, isFollowing, onFollowChange, size = 'md' }) => {
    const colors = useColors();
    const haptic = useHaptic();
    const follow = useFollow();
    const unfollow = useUnfollow();

    const isLoading = follow.isPending || unfollow.isPending;

    // Animation
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = useCallback(async () => {
      haptic.medium();
      try {
        if (isFollowing) {
          await unfollow.mutateAsync(userId);
          onFollowChange?.(userId, false);
        } else {
          await follow.mutateAsync(userId);
          onFollowChange?.(userId, true);
          haptic.success();
        }
      } catch (error) {
        haptic.error();
        console.error('Follow/Unfollow error:', error);
      }
    }, [userId, isFollowing, follow, unfollow, onFollowChange, haptic]);

    const buttonStyle = useMemo(
      () => [
        styles.button,
        size === 'sm' ? styles.buttonSm : styles.buttonMd,
        isFollowing
          ? {
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.default,
              borderWidth: 1,
            }
          : { backgroundColor: colors.interactive.default },
      ],
      [size, isFollowing, colors],
    );

    const textStyle = useMemo(
      () => [
        styles.text,
        size === 'sm' ? styles.textSm : styles.textMd,
        { color: isFollowing ? colors.text.primary : '#FFFFFF' },
      ],
      [size, isFollowing, colors],
    );

    return (
      <AnimatedPressable
        style={[buttonStyle, animatedStyle]}
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.95, spring.press);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, spring.press);
        }}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={isFollowing ? 'Takipten çık' : 'Takip et'}
        accessibilityState={{ disabled: isLoading }}>
        {isLoading ? (
          <ActivityIndicator size="small" color={isFollowing ? colors.text.primary : '#FFFFFF'} />
        ) : (
          <Text style={textStyle}>{isFollowing ? 'Takipten Çık' : 'Takip Et'}</Text>
        )}
      </AnimatedPressable>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonSm: {
    paddingVertical: spacing['1'],
    paddingHorizontal: spacing['4'],
    minWidth: 90,
  },
  buttonMd: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['6'],
    minWidth: 110,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: fontSize.sm,
  },
  textMd: {
    fontSize: fontSize.base,
  },
});

FollowButton.displayName = 'FollowButton';
