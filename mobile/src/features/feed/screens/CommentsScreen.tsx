// src/features/feed/screens/CommentsScreen.tsx
// Yorumlar ekranı - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useSemanticHaptic } from '@shared/hooks';
import { useAuthStore } from '@features/auth/stores';
import { useCommentsData, useAddComment, useLikeComment, useDeleteComment } from '../hooks';
import { CommentCard, AddCommentForm, EmptyFeed } from '../components';
import { ActionSheet, ActionSheetOption, CustomRefreshControl } from '@shared/components';
import { showSuccess, showError } from '@shared/utils';
import type { Comment, AddCommentRequest } from '../types';
import type { FeedStackParamList } from '@shared/types';

type CommentsRouteProp = RouteProp<FeedStackParamList, 'Comments'>;
type CommentsNavigationProp = NativeStackNavigationProp<FeedStackParamList, 'Comments'>;

export const CommentsScreen: React.FC = () => {
  const colors = useColors();
  const toast = useToast();
  const { triggerContent, triggerSystem } = useSemanticHaptic();
  const navigation = useNavigation<CommentsNavigationProp>();
  const route = useRoute<CommentsRouteProp>();
  const { postId } = route.params; // postId: number
  const currentUserId = useAuthStore(state => state.user?.id);

  // State
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  // Data
  const {
    comments,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useCommentsData(postId);

  // Mutations
  const addComment = useAddComment();
  const likeComment = useLikeComment(postId);
  const deleteComment = useDeleteComment(postId);

  const handleAddComment = useCallback(
    (content: string) => {
      if (postId) {
        // Note: parentId is not supported in AddCommentRequest
        // Reply functionality would need separate API endpoint
        const request: AddCommentRequest = {
          content,
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
    [addComment, postId],
  );

  const handleLike = useCallback(
    (commentId: string, isLiked: boolean) => {
      likeComment.mutate({ commentId, isLiked });
    },
    [likeComment],
  );

  const handleReply = useCallback((commentId: string) => {
    setReplyToCommentId(commentId);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToCommentId(null);
  }, []);

  const handleAuthorPress = useCallback(
    (userId: number) => {
      navigation.navigate('UserProfile', { userId });
    },
    [navigation],
  );

  const handleMenuPress = useCallback(
    (commentId: string) => {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        setSelectedComment(comment);
        setShowActionSheet(true);
      }
    },
    [comments],
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Delete confirmation handler
  const handleDeleteConfirm = useCallback(() => {
    if (!selectedComment) return;
    triggerSystem('confirm');
    deleteComment.mutate(selectedComment.id, {
      onSuccess: () => {
        showSuccess(toast, { trigger: triggerSystem }, 'Yorum silindi');
      },
      onError: () => {
        showError(toast, { trigger: triggerSystem }, 'Yorum silinemedi');
      },
    });
    setShowDeleteConfirm(false);
    setShowActionSheet(false);
  }, [selectedComment, deleteComment, triggerSystem, toast]);

  // Action Sheet Options
  const getActionSheetOptions = useCallback((): ActionSheetOption[] => {
    if (!selectedComment) return [];

    const isOwnComment = selectedComment.author.id === currentUserId;
    const options: ActionSheetOption[] = [];

    if (isOwnComment) {
      options.push({
        id: 'delete',
        label: 'Yorumu Sil',
        icon: 'trash-outline',
        destructive: true,
        onPress: () => {
          triggerSystem('alert');
          setShowActionSheet(false);
          setShowDeleteConfirm(true);
        },
      });
    } else {
      options.push({
        id: 'report',
        label: 'Yorumu Şikayet Et',
        icon: 'flag-outline',
        onPress: () => {
          showSuccess(toast, { trigger: triggerSystem }, 'Yorum şikayet edildi');
          setShowActionSheet(false);
        },
      });
    }

    return options;
  }, [selectedComment, currentUserId, triggerSystem, toast]);

  const handleRefresh = useCallback(() => {
    triggerContent('refresh');
    refetch();
  }, [refetch, triggerContent]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <CommentCard
        comment={item}
        onLike={handleLike}
        onReply={handleReply}
        onAuthorPress={handleAuthorPress}
        onMenuPress={handleMenuPress}
      />
    ),
    [handleLike, handleReply, handleAuthorPress, handleMenuPress],
  );

  const keyExtractor = useCallback((item: Comment) => item.id, []);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return null;

    return (
      <EmptyFeed
        title="Henüz yorum yok"
        message="Bu gönderiye ilk yorumu siz yapın!"
        icon="chatbubble-outline"
      />
    );
  }, [isLoading]);

  const ListFooterComponent = useMemo(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.interactive.default} />
      </View>
    );
  }, [isFetchingNextPage, colors.interactive.default]);

  const refreshControl = useMemo(
    () => <CustomRefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />,
    [isRefetching, handleRefresh],
  );

  if (isLoading && comments.length === 0) {
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
      edges={['bottom']}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      />

      <AddCommentForm
        postId={postId}
        onSubmit={handleAddComment}
        isLoading={addComment.isPending}
        replyToId={replyToCommentId}
        onCancelReply={handleCancelReply}
        autoFocus
      />

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          setSelectedComment(null);
        }}
        options={getActionSheetOptions()}
        title="Yorum Seçenekleri"
      />

      {/* Delete Confirmation ActionSheet */}
      <ActionSheet
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Yorumu Sil"
        message="Bu yorumu silmek istediğinize emin misiniz?"
        options={[
          {
            label: 'Sil',
            destructive: true,
            onPress: handleDeleteConfirm,
          },
          {
            label: 'İptal',
            onPress: () => setShowDeleteConfirm(false),
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default CommentsScreen;
