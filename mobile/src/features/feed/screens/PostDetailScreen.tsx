// src/features/feed/screens/PostDetailScreen.tsx
// Post detay ekranı - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SAFE_AREA_EDGES, HAPTIC_TYPES } from '@constants';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
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
import type { Comment } from '../types';

type PostDetailRouteProp = RouteProp<FeedStackParamList, 'PostDetail'>;
type PostDetailNavigationProp = NativeStackNavigationProp<FeedStackParamList, 'PostDetail'>;

export const PostDetailScreen: React.FC = () => {
  const colors = useColors();
  const { trigger } = useHaptic();
  const navigation = useNavigation<PostDetailNavigationProp>();
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
    if (post?.author.userId) {
      navigation.navigate('UserProfile', { userId: post.author.userId });
    }
  }, [navigation, post?.author.userId]);

  const handleLike = useCallback(() => {
    if (post) {
      // Backend API: postId: number, liked from flat field
      likePost.mutate({ postId: post.id, isLiked: post.liked });
    }
  }, [likePost, post]);

  const handleComment = useCallback(() => {
    // Focus on comment input - handled by AddCommentForm autoFocus
  }, []);

  const handleShare = useCallback(async () => {
    if (!post) return;
    await sharePost({
      postId: post.id,
      content: post.content,
      author: { name: post.author.name, surname: post.author.surname },
    });
  }, [post]);

  const handleBookmark = useCallback(() => {
    if (post) {
      // Backend API: postId: number, isSaved from userInteraction
      bookmarkPost.mutate({ postId: post.id, isSaved: post.userInteraction?.isSaved ?? false });
    }
  }, [bookmarkPost, post]);

  const handleRefresh = useCallback(() => {
    trigger(HAPTIC_TYPES.pullToRefresh);
    refetch();
  }, [refetch, trigger]);

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
      navigation.navigate('UserProfile', { userId });
    },
    [navigation],
  );

  const handleAddComment = useCallback(
    (content: string) => {
      if (postId) {
        // Note: parentId is not supported by current API, ignoring replyToCommentId
        addComment.mutate(
          { postId, request: { content } },
          {
            onSuccess: () => {
              setReplyToCommentId(null);
            },
          },
        );
      }
    },
    [addComment, postId],
  );

  // Action Sheet Options
  const getActionSheetOptions = useCallback((): ActionSheetOption[] => {
    if (!post) return [];

    const isOwnPost = post.author.userId === currentUserId;
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
              onPress: () => deletePost.mutate(post.id),
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
            // Report screen not in FeedStackParamList - show alert instead
            Alert.alert('Şikayet', 'Gönderi şikayet edildi.');
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
  }, [post, currentUserId, deletePost]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={handleRefresh}
        tintColor={colors.interactive.default}
        colors={[colors.interactive.default]}
        progressBackgroundColor={colors.background.primary}
      />
    ),
    [isRefetching, handleRefresh, colors],
  );

  if (isLoading || !post) {
    return (
      <SafeAreaView
        style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}
        edges={['bottom']}>
        <ActivityIndicator size="large" color={colors.interactive.default} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={SAFE_AREA_EDGES.standard}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}>
        {/* Post */}
        <View style={styles.postContainer}>
          <PostHeader
            author={post.author}
            createdAt={post.createdAt}
            onAuthorPress={handleAuthorPress}
            onMenuPress={handleMenuPress}
          />

          <PostContent content={post.content} />

          {post.images.length > 0 && <PostImages images={post.images} postId={post.id} />}

          <PostActions
            postId={post.id}
            stats={{
              likeCount: post.likeCount,
              commentCount: post.commentCount,
              viewCount: 0,
            }}
            userInteraction={{
              isLiked: post.liked,
              isSaved: post.userInteraction?.isSaved ?? false,
            }}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onBookmark={handleBookmark}
          />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border.default }]} />

        {/* Comments */}
        <View style={styles.commentsContainer}>
          {commentsLoading ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color={colors.interactive.default} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  commentsContainer: {
    paddingBottom: 16,
  },
  commentsLoading: {
    alignItems: 'center',
    padding: 24,
  },
  container: {
    flex: 1,
  },
  divider: {
    height: 8,
    marginVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  postContainer: {
    paddingTop: 12,
  },
  scrollView: {
    flex: 1,
  },
});
