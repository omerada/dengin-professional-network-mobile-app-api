// src/features/feed/screens/PostDetailScreen.tsx
// Post detay ekranı
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { usePost, useLikePost, useBookmarkPost, useCommentsData, useAddComment } from '../hooks';
import {
  PostHeader,
  PostContent,
  PostImages,
  PostActions,
  CommentCard,
  AddCommentForm,
  EmptyFeed,
} from '../components';
import type { FeedStackParamList } from '@shared/types';
import type { Comment } from '../types';

type PostDetailRouteProp = RouteProp<FeedStackParamList, 'PostDetail'>;

export const PostDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params;

  // Data fetching
  const { data: post, isLoading, refetch, isRefetching } = usePost(postId);
  const { comments, isLoading: commentsLoading } = useCommentsData(postId);

  // Mutations
  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();
  const addComment = useAddComment();

  const handleAuthorPress = useCallback(() => {
    if (post?.author.id) {
      navigation.navigate('UserProfile' as never, { userId: post.author.id } as never);
    }
  }, [navigation, post?.author.id]);

  const handleLike = useCallback(() => {
    if (post) {
      likePost.mutate({ postId: post.id, isLiked: post.isLiked });
    }
  }, [likePost, post]);

  const handleComment = useCallback(() => {
    // Focus on comment input - handled by AddCommentForm autoFocus
  }, []);

  const handleShare = useCallback(() => {
    // TODO: Implement share
  }, []);

  const handleBookmark = useCallback(() => {
    if (post) {
      bookmarkPost.mutate({ postId: post.id, isBookmarked: post.isBookmarked });
    }
  }, [bookmarkPost, post]);

  const handleMenuPress = useCallback(() => {
    // TODO: Show action sheet
  }, []);

  const handleCommentLike = useCallback((_commentId: string, _isLiked: boolean) => {
    // TODO: Implement comment like
  }, []);

  const handleCommentReply = useCallback((_commentId: string) => {
    // TODO: Implement reply
  }, []);

  const handleCommentAuthorPress = useCallback((userId: string) => {
    navigation.navigate('UserProfile' as never, { userId } as never);
  }, [navigation]);

  const handleAddComment = useCallback((content: string) => {
    addComment.mutate({ postId, content });
  }, [addComment, postId]);

  if (isLoading || !post) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Post */}
        <View style={styles.postContainer}>
          <PostHeader
            author={post.author}
            createdAt={post.createdAt}
            onAuthorPress={handleAuthorPress}
            onMenuPress={handleMenuPress}
          />

          <PostContent content={post.content} expandable={false} />

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
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />

        {/* Comments */}
        <View style={styles.commentsContainer}>
          {commentsLoading ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            </View>
          ) : comments.length === 0 ? (
            <EmptyFeed
              title="Henüz yorum yok"
              message="İlk yorumu siz yapın!"
              icon="chatbubble-outline"
            />
          ) : (
            comments.map((comment: Comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onLike={handleCommentLike}
                onReply={handleCommentReply}
                onAuthorPress={handleCommentAuthorPress}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Comment Form */}
      <AddCommentForm
        postId={postId}
        onSubmit={handleAddComment}
        isLoading={addComment.isPending}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    paddingTop: 12,
  },
  divider: {
    height: 8,
    marginVertical: 8,
  },
  commentsContainer: {
    paddingBottom: 16,
  },
  commentsLoading: {
    padding: 24,
    alignItems: 'center',
  },
});
