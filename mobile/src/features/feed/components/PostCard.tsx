// src/features/feed/components/PostCard.tsx
// Meslektaş Design System - Modern Post Card Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostImages } from './PostImages';
import { PostActions } from './PostActions';
import { DoubleTapLike } from './DoubleTapLike';
import type { Post } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Create animated pressable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// Types
// ============================================================================

interface PostCardProps {
  /** Post data */
  post: Post;
  /** Callback when like button is pressed */
  onLike?: (postId: number, isLiked: boolean) => void;
  /** Callback when comment button is pressed */
  onComment?: (postId: number) => void;
  /** Callback when share button is pressed */
  onShare?: (postId: number) => void;
  /** Callback when bookmark button is pressed */
  onBookmark?: (postId: number, isSaved: boolean) => void;
  /** Callback when menu button is pressed */
  onMenuPress?: (postId: number) => void;
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// PostCard Component
// ============================================================================

/**
 * Modern Post Card Component
 *
 * Features:
 * - Instagram-style double tap to like
 * - Spring-based press animations
 * - Haptic feedback on interactions
 * - Optimized with React.memo
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <PostCard
 *   post={post}
 *   onLike={handleLike}
 *   onComment={handleComment}
 *   onShare={handleShare}
 *   onBookmark={handleBookmark}
 * />
 * ```
 */
export const PostCard = memo<PostCardProps>(
  ({ post, onLike, onComment, onShare, onBookmark, onMenuPress, testID }) => {
    const { colors } = useTheme();
    const { buttonPress } = useHaptic();
    const navigation = useNavigation();

    // Animation value for press state
    const pressed = useSharedValue(0);

    // Memoized styles
    const containerStyle = useMemo(
      () => [styles.container, { backgroundColor: colors.background.primary }],
      [colors.background.primary],
    );

    // Navigation handlers
    const handlePress = useCallback(() => {
      buttonPress();
      navigation.navigate('PostDetail' as never, { postId: post.postId } as never);
    }, [navigation, post.postId, buttonPress]);

    const handleAuthorPress = useCallback(() => {
      buttonPress();
      navigation.navigate('UserProfile' as never, { userId: post.author.id } as never);
    }, [navigation, post.author.id, buttonPress]);

    // Action handlers
    const handleLike = useCallback(() => {
      onLike?.(post.postId, post.userInteraction.isLiked);
    }, [onLike, post.postId, post.userInteraction.isLiked]);

    const handleDoubleTapLike = useCallback(() => {
      // Only trigger if not already liked
      if (!post.userInteraction.isLiked) {
        onLike?.(post.postId, false);
      }
    }, [onLike, post.postId, post.userInteraction.isLiked]);

    const handleComment = useCallback(() => {
      onComment?.(post.postId);
    }, [onComment, post.postId]);

    const handleShare = useCallback(() => {
      onShare?.(post.postId);
    }, [onShare, post.postId]);

    const handleBookmark = useCallback(() => {
      onBookmark?.(post.postId, post.userInteraction.isSaved);
    }, [onBookmark, post.postId, post.userInteraction.isSaved]);

    const handleMenu = useCallback(() => {
      onMenuPress?.(post.postId);
    }, [onMenuPress, post.postId]);

    // Animation handlers
    const handlePressIn = useCallback(() => {
      pressed.value = withSpring(1, spring.press);
    }, [pressed]);

    const handlePressOut = useCallback(() => {
      pressed.value = withSpring(0, spring.press);
    }, [pressed]);

    // Animated container style
    const animatedContainerStyle = useAnimatedStyle(() => {
      const scale = interpolate(pressed.value, [0, 1], [1, 0.995]);
      return {
        transform: [{ scale }],
      };
    });

    // Check if post has images
    const hasImages = post.images && post.images.length > 0;

    return (
      <AnimatedPressable
        testID={testID}
        style={[containerStyle, animatedContainerStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${post.author.firstName} ${post.author.lastName} tarafından paylaşılan gönderi`}
        accessibilityHint="Detayları görmek için tıklayın">
        {/* Header */}
        <PostHeader
          author={post.author}
          createdAt={post.createdAt}
          onAuthorPress={handleAuthorPress}
          onMenuPress={handleMenu}
        />

        {/* Content */}
        <PostContent content={post.content} />

        {/* Images with double tap to like */}
        {hasImages && (
          <DoubleTapLike isLiked={post.userInteraction.isLiked} onDoubleTap={handleDoubleTapLike}>
            <PostImages images={post.images} postId={post.postId} />
          </DoubleTapLike>
        )}

        {/* Actions */}
        <PostActions
          likesCount={post.stats.likeCount}
          commentsCount={post.stats.commentCount}
          sharesCount={post.stats.viewCount}
          isLiked={post.userInteraction.isLiked}
          isBookmarked={post.userInteraction.isSaved}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onBookmark={handleBookmark}
          testID={testID ? `${testID}-actions` : undefined}
        />
      </AnimatedPressable>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.post.postId === nextProps.post.postId &&
      prevProps.post.stats.likeCount === nextProps.post.stats.likeCount &&
      prevProps.post.stats.commentCount === nextProps.post.stats.commentCount &&
      prevProps.post.userInteraction.isLiked === nextProps.post.userInteraction.isLiked &&
      prevProps.post.userInteraction.isSaved === nextProps.post.userInteraction.isSaved
    );
  },
);

PostCard.displayName = 'PostCard';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
});

export default PostCard;
