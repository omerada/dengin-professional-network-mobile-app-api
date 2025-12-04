// src/features/feed/components/PostCard.tsx
// Post kartı komponenti - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostImages } from './PostImages';
import { PostActions } from './PostActions';
import type { Post } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onLike?: (postId: number, isLiked: boolean) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onBookmark?: (postId: number, isSaved: boolean) => void;
  onMenuPress?: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = memo(({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onMenuPress,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Backend API: postId: number
  const handlePress = useCallback(() => {
    navigation.navigate('PostDetail' as never, { postId: post.postId } as never);
  }, [navigation, post.postId]);

  const handleAuthorPress = useCallback(() => {
    navigation.navigate('UserProfile' as never, { userId: post.author.id } as never);
  }, [navigation, post.author.id]);

  const handleLike = useCallback(() => {
    onLike?.(post.postId, post.userInteraction.isLiked);
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

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
      onPress={handlePress}
      android_ripple={{ color: theme.colors.primary[100] }}
    >
      <PostHeader
        author={post.author}
        createdAt={post.createdAt}
        onAuthorPress={handleAuthorPress}
        onMenuPress={handleMenu}
      />

      <PostContent content={post.content} />

      {post.images.length > 0 && (
        <PostImages images={post.images} postId={post.postId} />
      )}

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
      />
    </Pressable>
  );
});

PostCard.displayName = 'PostCard';

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
});

export default PostCard;
