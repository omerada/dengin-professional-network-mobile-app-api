// src/features/feed/components/PostCard.tsx
// Post kartı komponenti
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
  onLike?: (postId: string, isLiked: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string, isBookmarked: boolean) => void;
  onMenuPress?: (postId: string) => void;
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

  const handlePress = useCallback(() => {
    navigation.navigate('PostDetail' as never, { postId: post.id } as never);
  }, [navigation, post.id]);

  const handleAuthorPress = useCallback(() => {
    navigation.navigate('UserProfile' as never, { userId: post.author.id } as never);
  }, [navigation, post.author.id]);

  const handleLike = useCallback(() => {
    onLike?.(post.id, post.isLiked);
  }, [onLike, post.id, post.isLiked]);

  const handleComment = useCallback(() => {
    onComment?.(post.id);
  }, [onComment, post.id]);

  const handleShare = useCallback(() => {
    onShare?.(post.id);
  }, [onShare, post.id]);

  const handleBookmark = useCallback(() => {
    onBookmark?.(post.id, post.isBookmarked);
  }, [onBookmark, post.id, post.isBookmarked]);

  const handleMenu = useCallback(() => {
    onMenuPress?.(post.id);
  }, [onMenuPress, post.id]);

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
        <PostImages images={post.images} postId={post.id} />
      )}

      <PostActions
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        sharesCount={post.sharesCount}
        isLiked={post.isLiked}
        isBookmarked={post.isBookmarked}
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
