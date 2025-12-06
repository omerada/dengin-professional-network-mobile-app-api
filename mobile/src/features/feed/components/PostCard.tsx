// src/features/feed/components/PostCard.tsx
// Meslektaş Design System - Modern Post Card Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
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
      (navigation as any).navigate('PostDetail', { postId: post.id });
    }, [navigation, post.id, buttonPress]);

    const handleAuthorPress = useCallback(() => {
      buttonPress();
      (navigation as any).navigate('UserProfile', { userId: post.author.userId });
    }, [navigation, post.author.userId, buttonPress]);

    // Action handlers
    const handleLike = useCallback(() => {
      onLike?.(post.id, post.liked);
    }, [onLike, post.id, post.liked]);

    const handleDoubleTapLike = useCallback(() => {
      // Only trigger if not already liked
      if (!post.liked) {
        onLike?.(post.id, false);
      }
    }, [onLike, post.id, post.liked]);

    const handleComment = useCallback(() => {
      onComment?.(post.id);
    }, [onComment, post.id]);

    const handleShare = useCallback(() => {
      onShare?.(post.id);
    }, [onShare, post.id]);

    const handleBookmark = useCallback(() => {
      onBookmark?.(post.id, post.userInteraction?.isSaved ?? false);
    }, [onBookmark, post.id, post.userInteraction?.isSaved]);

    const handleMenu = useCallback(() => {
      onMenuPress?.(post.id);
    }, [onMenuPress, post.id]);

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

    // Map PostImageDto[] to string[] for PostImages component
    const imageUrls = useMemo(() => post.images?.map(img => img.url) ?? [], [post.images]);

    return (
      <AnimatedPressable
        testID={testID}
        style={[containerStyle, animatedContainerStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${post.author.name} ${post.author.surname} tarafından paylaşılan gönderi`}
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
          <DoubleTapLike isLiked={post.liked} onDoubleTap={handleDoubleTapLike}>
            <PostImages images={imageUrls} postId={post.id} />
          </DoubleTapLike>
        )}

        {/* Actions */}
        <PostActions
          likesCount={post.likeCount}
          commentsCount={post.commentCount}
          sharesCount={post.stats?.viewCount ?? 0}
          isLiked={post.liked}
          isBookmarked={post.userInteraction?.isSaved ?? false}
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
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.likeCount === nextProps.post.likeCount &&
      prevProps.post.commentCount === nextProps.post.commentCount &&
      prevProps.post.liked === nextProps.post.liked &&
      prevProps.post.userInteraction?.isSaved === nextProps.post.userInteraction?.isSaved
    );
  },
);

PostCard.displayName = 'PostCard';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
});

export default PostCard;
