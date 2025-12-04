// src/features/social/components/FollowButton.tsx
// Follow/Unfollow button component
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { useFollow, useUnfollow } from '../hooks';

interface FollowButtonProps {
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
    const { theme } = useTheme();
    const follow = useFollow();
    const unfollow = useUnfollow();

    const isLoading = follow.isPending || unfollow.isPending;

    const handlePress = useCallback(async () => {
      try {
        if (isFollowing) {
          await unfollow.mutateAsync(userId);
          onFollowChange?.(userId, false);
        } else {
          await follow.mutateAsync(userId);
          onFollowChange?.(userId, true);
        }
      } catch (error) {
        // Error is handled by React Query
        console.error('Follow/Unfollow error:', error);
      }
    }, [userId, isFollowing, follow, unfollow, onFollowChange]);

    const buttonStyle = [
      styles.button,
      size === 'sm' ? styles.buttonSm : styles.buttonMd,
      isFollowing
        ? {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.medium,
            borderWidth: 1,
          }
        : { backgroundColor: theme.colors.primary[500] },
    ];

    const textStyle = [
      styles.text,
      size === 'sm' ? styles.textSm : styles.textMd,
      { color: isFollowing ? theme.colors.text.primary : '#FFFFFF' },
    ];

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isFollowing ? theme.colors.text.primary : '#FFFFFF'}
          />
        ) : (
          <Text style={textStyle}>
            {isFollowing ? 'Takipten Çık' : 'Takip Et'}
          </Text>
        )}
      </TouchableOpacity>
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
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 90,
  },
  buttonMd: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
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

