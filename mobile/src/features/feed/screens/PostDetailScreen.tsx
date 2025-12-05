// src/features/feed/screens/PostDetailScreen.tsx
// Post detay ekranı - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores';
import {
  usePost,
  useLikePost,
  useBookmarkPost,
  useCommentsData,
  useAddComment,
  useLikeComment,
  useDeletePost,
} from '../hooks';
import { ActionSheet, ActionSheetOption } from '@shared/components';
import { sharePost } from '@shared/utils/share';
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
import type { Comment, AddCommentRequest } from '../types';

type PostDetailRouteProp = RouteProp<FeedStackParamList, 'PostDetail'>;

export const PostDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params; // postId: number
  const currentUserId = useAuthStore(state => state.user?.id);

  // Action Sheet state
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);

  // Data fetching
  const { data: post, isLoading, refetch, isRefetching } = usePost(postId);
  const { comments, isLoading: commentsLoading } = useCommentsData(postId);

  // Mutations
  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();
  const addComment = useAddComment();
  const likeComment = useLikeComment(postId);
  const deletePost = useDeletePost();

  const handleAuthorPress = useCallback(() => {
    if (post?.author.id) {
      navigation.navigate('UserProfile' as never, { userId: post.author.id } as never);
    }
  }, [navigation, post?.author.id]);

  const handleLike = useCallback(() => {
    if (post) {
      // Backend API: postId: number, isLiked from userInteraction
      likePost.mutate({ postId: post.postId, isLiked: post.userInteraction.isLiked });
    }
  }, [likePost, post]);

  const handleComment = useCallback(() => {
    // Focus on comment input - handled by AddCommentForm autoFocus
  }, []);

  const handleShare = useCallback(async () => {
    if (!post) return;
    await sharePost({
      postId: post.postId,
      content: post.content,
      author: { name: post.author.name, surname: post.author.surname },
    });
  }, [post]);

  const handleBookmark = useCallback(() => {
    if (post) {
      // Backend API: postId: number, isSaved from userInteraction
      bookmarkPost.mutate({ postId: post.postId, isSaved: post.userInteraction.isSaved });
    }
  }, [bookmarkPost, post]);

  const handleMenuPress = useCallback(() => {
    setShowActionSheet(true);
  }, []);

  const handleCommentLike = useCallback(
    (commentId: string, isLiked: boolean) => {
      likeComment.mutate({ commentId, isLiked });
    },
    [likeComment],
  );

  const handleCommentReply = useCallback((commentId: string) => {
    setReplyToCommentId(commentId);
    // AddCommentForm will handle the reply context
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToCommentId(null);
  }, []);

  const handleCommentAuthorPress = useCallback(
    (userId: number) => {
      navigation.navigate('UserProfile' as never, { userId } as never);
    },
    [navigation],
  );

  const handleAddComment = useCallback(
    (content: string) => {
      if (postId) {
        const request: AddCommentRequest = {
          content,
          parentId: replyToCommentId ?? undefined,
        };
        addComment.mutate(
          { postId, request },
          {
            onSuccess: () => {
              setReplyToCommentId(null);
            },
          },
        );
      }
    },
    [addComment, postId, replyToCommentId],
  );

  // Action Sheet Options
  const getActionSheetOptions = useCallback((): ActionSheetOption[] => {
    if (!post) return [];

    const isOwnPost = post.author.id === currentUserId;
    const options: ActionSheetOption[] = [];

    if (isOwnPost) {
      options.push({
        id: 'delete',
        label: 'Gönderiyi Sil',
        icon: 'trash-outline',
        destructive: true,
        onPress: () => {
          Alert.alert('Gönderiyi Sil', 'Bu gönderiyi silmek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Sil',
              style: 'destructive',
              onPress: () => deletePost.mutate(post.postId),
            },
          ]);
        },
      });
    } else {
      options.push(
        {
          id: 'report',
          label: 'Gönderiyi Şikayet Et',
          icon: 'flag-outline',
          onPress: () => {
            navigation.navigate(
              'Report' as never,
              {
                type: 'POST',
                targetId: post.postId,
              } as never,
            );
          },
        },
        {
          id: 'hide',
          label: 'Bu Gönderiyi Gizle',
          icon: 'eye-off-outline',
          onPress: () => {
            Alert.alert('Bilgi', 'Bu gönderi artık akışınızda görünmeyecek.');
          },
        },
      );
    }

    return options;
  }, [post, currentUserId, deletePost, navigation]);

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
        showsVerticalScrollIndicator={false}>
        {/* Post */}
        <View style={styles.postContainer}>
          <PostHeader
            author={post.author}
            createdAt={post.createdAt}
            onAuthorPress={handleAuthorPress}
            onMenuPress={handleMenuPress}
          />

          <PostContent content={post.content} expandable={false} />

          {post.images.length > 0 && <PostImages images={post.images} postId={post.postId} />}

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
        replyToId={replyToCommentId}
        onCancelReply={handleCancelReply}
      />

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        options={getActionSheetOptions()}
        title="Gönderi Seçenekleri"
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
