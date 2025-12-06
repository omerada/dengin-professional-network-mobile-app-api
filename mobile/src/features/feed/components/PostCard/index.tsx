// src/features/feed/components/PostCard/PostCard.tsx
// Meslektaş Design System - Modern PostCard Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';

import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostImages } from './PostImages';
import { PostActions } from './PostActions';
import { styles } from './PostCard.styles';
import type { PostCardProps } from './PostCard.types';

/**
 * Modern PostCard Component
 *
 * Features:
 * - Double-tap to like with heart animation
 * - Spring-based press animations
 * - Staggered entrance animation
 * - Haptic feedback on interactions
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <PostCard
 *   post={post}
 *   index={0}
 *   onLike={(id, isLiked) => handleLike(id, isLiked)}
 *   onComment={(id) => handleComment(id)}
 *   onShare={(id) => handleShare(id)}
 *   onBookmark={(id, isSaved) => handleBookmark(id, isSaved)}
 *   onMenuPress={(id) => handleMenu(id)}
 * />
 * ```
 */
export const PostCard: React.FC<PostCardProps> = memo(
  ({ post, index = 0, onLike, onComment, onShare, onBookmark, onMenuPress, style, testID }) => {
    const colors = useColors();
    const { trigger } = useHaptic();
    const navigation = useNavigation();

    // Animation values
    const cardScale = useSharedValue(1);
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);

    // Get post ID (backward compatible)
    const postId = post.id ?? (post.postId ? Number(post.postId) : 0);

    // Get user interaction state (backward compatible)
    const isLiked = post.liked ?? post.userInteraction?.isLiked ?? false;
    const isSaved = post.userInteraction?.isSaved ?? false;

    // Get stats (backward compatible)
    const stats = {
      likeCount: post.likeCount ?? post.stats?.likeCount ?? 0,
      commentCount: post.commentCount ?? post.stats?.commentCount ?? 0,
      viewCount: post.stats?.viewCount ?? 0,
    };

    // Card animated style
    const cardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    // Heart overlay animated style
    const heartAnimatedStyle = useAnimatedStyle(() => ({
      opacity: heartOpacity.value,
      transform: [{ scale: heartScale.value }],
    }));

    // Double-tap like handler
    const handleDoubleTapLike = useCallback(() => {
      if (!isLiked) {
        trigger('success');
        // Animate heart
        heartScale.value = withSpring(1.2, { damping: 10, stiffness: 300 });
        heartOpacity.value = 1;
        // Hide after delay
        heartScale.value = withDelay(600, withSpring(0, { damping: 15 }));
        heartOpacity.value = withDelay(600, withSpring(0));
        // Trigger callback
        onLike?.(postId, isLiked);
      }
    }, [isLiked, postId, onLike, trigger, heartScale, heartOpacity]);

    // Double-tap gesture - using .runOnJS(true) for modern pattern
    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .runOnJS(true)
      .onEnd(() => {
        handleDoubleTapLike();
      });

    // Navigation handlers
    const handlePostPress = useCallback(() => {
      trigger('light');
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('PostDetail', { postId });
    }, [postId, navigation, trigger]);

    const handleAuthorPress = useCallback(() => {
      trigger('light');
      const userId = post.author.userId ?? post.author.id;
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('UserProfile', { userId });
    }, [post.author, navigation, trigger]);

    // Action handlers
    const handleLike = useCallback(() => {
      onLike?.(postId, isLiked);
    }, [postId, isLiked, onLike]);

    const handleComment = useCallback(() => {
      onComment?.(postId);
    }, [postId, onComment]);

    const handleShare = useCallback(() => {
      onShare?.(postId);
    }, [postId, onShare]);

    const handleBookmark = useCallback(() => {
      onBookmark?.(postId, isSaved);
    }, [postId, isSaved, onBookmark]);

    const handleMenuPress = useCallback(() => {
      onMenuPress?.(postId);
    }, [postId, onMenuPress]);

    // Convert images to correct format
    const images =
      post.images?.map((img, idx) => {
        if (typeof img === 'string') {
          return { id: `img-${idx}`, url: img };
        }
        return {
          id: `img-${idx}`,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          width: img.width,
          height: img.height,
          blurhash: img.blurhash,
        };
      }) ?? [];

    return (
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(300)}
        layout={Layout.springify()}
        style={[
          styles.container,
          { backgroundColor: colors.background.primary },
          cardAnimatedStyle,
          style,
        ]}
        testID={testID}>
        <GestureDetector gesture={doubleTapGesture}>
          <Pressable onPress={handlePostPress}>
            {/* Header */}
            <PostHeader
              author={post.author}
              createdAt={post.createdAt}
              onAuthorPress={handleAuthorPress}
              onMenuPress={handleMenuPress}
            />

            {/* Content */}
            <PostContent content={post.content} maxLines={5} onMorePress={handlePostPress} />

            {/* Images */}
            {images.length > 0 && <PostImages images={images} postId={postId} />}

            {/* Double-tap heart overlay */}
            <Animated.View style={[styles.heartOverlay, heartAnimatedStyle]} pointerEvents="none">
              <Icon name="heart" size={80} color="#FFFFFF" />
            </Animated.View>
          </Pressable>
        </GestureDetector>

        {/* Actions */}
        <PostActions
          postId={postId}
          stats={stats}
          userInteraction={{ isLiked, isSaved }}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onBookmark={handleBookmark}
        />
      </Animated.View>
    );
  },
);

PostCard.displayName = 'PostCard';

export default PostCard;
