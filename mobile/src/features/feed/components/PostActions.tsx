// src/features/feed/components/PostActions.tsx
// Dengin Design System - Modern Post Actions Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

// ============================================================================
// Types
// ============================================================================

interface PostActionsProps {
  /** Number of likes on the post */
  likesCount: number;
  /** Number of comments on the post */
  commentsCount: number;
  /** Number of shares/views on the post */
  sharesCount: number;
  /** Whether the current user has liked the post */
  isLiked: boolean;
  /** Whether the current user has bookmarked the post */
  isBookmarked: boolean;
  /** Callback when like button is pressed */
  onLike: () => void;
  /** Callback when comment button is pressed */
  onComment: () => void;
  /** Callback when share button is pressed */
  onShare: () => void;
  /** Callback when bookmark button is pressed */
  onBookmark: () => void;
  /** Test ID for testing */
  testID?: string;
}

// Create animated pressable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// Action Button Component
// ============================================================================

interface ActionButtonProps {
  icon: string;
  activeIcon?: string;
  isActive?: boolean;
  count?: number;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  hapticType?: 'light' | 'heavy';
  accessibilityLabel: string;
  testID?: string;
}

const ActionButton = memo<ActionButtonProps>(
  ({
    icon,
    activeIcon,
    isActive = false,
    count,
    activeColor,
    inactiveColor,
    onPress,
    hapticType = 'light',
    accessibilityLabel,
    testID,
  }) => {
    const { trigger } = useHaptic();
    const scale = useSharedValue(1);
    const iconScale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.92, spring.press);
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, spring.press);
    }, [scale]);

    const handlePress = useCallback(() => {
      // Haptic feedback - heavy for like (Instagram style)
      trigger(hapticType);

      // Bounce animation for icon
      iconScale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 300 }),
      );

      onPress();
    }, [trigger, hapticType, iconScale, onPress]);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const iconAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: iconScale.value }],
    }));

    const currentIcon = isActive && activeIcon ? activeIcon : icon;
    const currentColor = isActive ? activeColor : inactiveColor;

    return (
      <AnimatedPressable
        testID={testID}
        style={[styles.action, containerAnimatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: isActive }}>
        <Animated.View style={iconAnimatedStyle}>
          <Icon name={currentIcon} size={24} color={currentColor} />
        </Animated.View>
        {count !== undefined && count > 0 && (
          <Text style={[styles.actionCount, { color: currentColor }]}>{formatCount(count)}</Text>
        )}
      </AnimatedPressable>
    );
  },
);

ActionButton.displayName = 'ActionButton';

// ============================================================================
// Helper Functions
// ============================================================================

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// ============================================================================
// PostActions Component
// ============================================================================

/**
 * Modern Post Actions Component
 *
 * Features:
 * - Spring-based animations using Reanimated 3
 * - Haptic feedback for all interactions
 * - Heavy haptic for like action (Instagram style)
 * - Animated icon transitions
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <PostActions
 *   likesCount={42}
 *   commentsCount={5}
 *   sharesCount={3}
 *   isLiked={false}
 *   isBookmarked={true}
 *   onLike={() => handleLike()}
 *   onComment={() => handleComment()}
 *   onShare={() => handleShare()}
 *   onBookmark={() => handleBookmark()}
 * />
 * ```
 */
export const PostActions = memo<PostActionsProps>(
  ({
    likesCount,
    commentsCount,
    sharesCount,
    isLiked,
    isBookmarked,
    onLike,
    onComment,
    onShare,
    onBookmark,
    testID,
  }) => {
    const { colors } = useTheme();

    // Memoized colors
    const likeActiveColor = colors.status.error;
    const bookmarkActiveColor = colors.interactive.default;
    const inactiveColor = colors.text.secondary;

    return (
      <View style={styles.container} testID={testID}>
        {/* Like Button */}
        <ActionButton
          icon="heart-outline"
          activeIcon="heart"
          isActive={isLiked}
          count={likesCount}
          activeColor={likeActiveColor}
          inactiveColor={inactiveColor}
          onPress={onLike}
          hapticType="heavy"
          accessibilityLabel={
            isLiked ? `Beğeniyi kaldır. ${likesCount} beğeni` : `Beğen. ${likesCount} beğeni`
          }
          testID={testID ? `${testID}-like` : undefined}
        />

        {/* Comment Button */}
        <ActionButton
          icon="chatbubble-outline"
          count={commentsCount}
          activeColor={inactiveColor}
          inactiveColor={inactiveColor}
          onPress={onComment}
          hapticType="light"
          accessibilityLabel={`Yorum yap. ${commentsCount} yorum`}
          testID={testID ? `${testID}-comment` : undefined}
        />

        {/* Share Button */}
        <ActionButton
          icon="share-outline"
          count={sharesCount}
          activeColor={inactiveColor}
          inactiveColor={inactiveColor}
          onPress={onShare}
          hapticType="light"
          accessibilityLabel={`Paylaş. ${sharesCount} görüntülenme`}
          testID={testID ? `${testID}-share` : undefined}
        />

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Bookmark Button */}
        <ActionButton
          icon="bookmark-outline"
          activeIcon="bookmark"
          isActive={isBookmarked}
          activeColor={bookmarkActiveColor}
          inactiveColor={inactiveColor}
          onPress={onBookmark}
          hapticType="light"
          accessibilityLabel={isBookmarked ? 'Kayıtlılardan kaldır' : 'Kaydet'}
          testID={testID ? `${testID}-bookmark` : undefined}
        />
      </View>
    );
  },
);

PostActions.displayName = 'PostActions';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
    minHeight: 44, // Touch target
    minWidth: 44, // Touch target
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
});

export default PostActions;
