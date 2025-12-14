// src/features/feed/components/PostCard/PostActions.tsx
// Dengin Design System - Modern PostActions Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

import { styles } from './PostCard.styles';
import { formatCount, type PostActionsProps } from './PostCard.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern PostActions Component
 *
 * Features:
 * - Spring-based button animations
 * - Haptic feedback on interactions
 * - Animated like heart with scale bounce
 * - Bookmark toggle animation
 *
 * @example
 * ```tsx
 * <PostActions
 *   postId={123}
 *   stats={{ likeCount: 42, commentCount: 5 }}
 *   userInteraction={{ isLiked: false, isSaved: false }}
 *   onLike={() => handleLike()}
 *   onComment={() => handleComment()}
 *   onShare={() => handleShare()}
 *   onBookmark={() => handleBookmark()}
 * />
 * ```
 */
export const PostActions: React.FC<PostActionsProps> = memo(
  ({ stats, userInteraction, onLike, onComment, onShare, onBookmark, testID }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    // Animation values
    const likeScale = useSharedValue(1);
    const bookmarkScale = useSharedValue(1);
    const shareScale = useSharedValue(1);
    const commentScale = useSharedValue(1);

    // Animated styles
    const likeAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: likeScale.value }],
    }));

    const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: bookmarkScale.value }],
    }));

    const shareAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: shareScale.value }],
    }));

    const commentAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: commentScale.value }],
    }));

    // Like handler with bounce animation
    const handleLike = useCallback(() => {
      trigger(userInteraction.isLiked ? 'light' : 'medium');
      likeScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
      onLike();
    }, [onLike, trigger, userInteraction.isLiked, likeScale]);

    // Comment handler
    const handleComment = useCallback(() => {
      trigger('light');
      commentScale.value = withSequence(
        withSpring(1.15, spring.press),
        withSpring(1, spring.snappy),
      );
      onComment();
    }, [onComment, trigger, commentScale]);

    // Share handler
    const handleShare = useCallback(() => {
      trigger('light');
      shareScale.value = withSequence(withSpring(1.15, spring.press), withSpring(1, spring.snappy));
      onShare();
    }, [onShare, trigger, shareScale]);

    // Bookmark handler with animation
    const handleBookmark = useCallback(() => {
      trigger(userInteraction.isSaved ? 'light' : 'medium');
      bookmarkScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 200 }),
      );
      onBookmark();
    }, [onBookmark, trigger, userInteraction.isSaved, bookmarkScale]);

    return (
      <View style={styles.actions} testID={testID}>
        {/* Left Actions - Like, Comment, Share */}
        <View style={styles.leftActions}>
          {/* Like Button */}
          <Pressable
            onPress={handleLike}
            style={styles.action}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={userInteraction.isLiked ? 'Beğeniyi kaldır' : 'Beğen'}
            accessibilityState={{ selected: userInteraction.isLiked }}>
            <Animated.View style={likeAnimatedStyle}>
              <Icon
                name={userInteraction.isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={userInteraction.isLiked ? colors.status.error : colors.text.secondary}
              />
            </Animated.View>
            {stats.likeCount > 0 && (
              <Text
                style={[
                  styles.actionCount,
                  {
                    color: userInteraction.isLiked ? colors.status.error : colors.text.secondary,
                  },
                ]}>
                {formatCount(stats.likeCount)}
              </Text>
            )}
          </Pressable>

          {/* Comment Button */}
          <Pressable
            onPress={handleComment}
            style={styles.action}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Yorum yap">
            <Animated.View style={commentAnimatedStyle}>
              <Icon name="chatbubble-outline" size={22} color={colors.text.secondary} />
            </Animated.View>
            {stats.commentCount > 0 && (
              <Text style={[styles.actionCount, { color: colors.text.secondary }]}>
                {formatCount(stats.commentCount)}
              </Text>
            )}
          </Pressable>

          {/* Share Button */}
          <Pressable
            onPress={handleShare}
            style={styles.action}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Paylaş">
            <Animated.View style={shareAnimatedStyle}>
              <Icon name="paper-plane-outline" size={22} color={colors.text.secondary} />
            </Animated.View>
          </Pressable>
        </View>

        {/* Right Action - Bookmark */}
        <AnimatedPressable
          onPress={handleBookmark}
          style={[styles.bookmarkAction, bookmarkAnimatedStyle]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={userInteraction.isSaved ? 'Kaydı kaldır' : 'Kaydet'}
          accessibilityState={{ selected: userInteraction.isSaved }}>
          <Icon
            name={userInteraction.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={userInteraction.isSaved ? colors.interactive.default : colors.text.secondary}
          />
        </AnimatedPressable>
      </View>
    );
  },
);

PostActions.displayName = 'PostActions';
