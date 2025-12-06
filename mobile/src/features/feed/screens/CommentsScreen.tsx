// src/features/feed/screens/CommentsScreen.tsx
// Yorumlar ekranı - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { FlatList } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores';
import { useCommentsData, useAddComment, useLikeComment, useDeleteComment } from '../hooks';
import { CommentCard, AddCommentForm, EmptyFeed } from '../components';
import { ActionSheet, ActionSheetOption } from '@shared/components';
import type { Comment, AddCommentRequest } from '../types';
import type { FeedStackParamList } from '@shared/types';

type CommentsRouteProp = RouteProp<FeedStackParamList, 'Comments'>;
type CommentsNavigationProp = NativeStackNavigationProp<FeedStackParamList, 'Comments'>;

export const CommentsScreen: React.FC = () => {
  const colors = useColors();
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
          Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Sil',
              style: 'destructive',
              onPress: () => deleteComment.mutate(selectedComment.id),
            },
          ]);
        },
      });
    } else {
      options.push({
        id: 'report',
        label: 'Yorumu Şikayet Et',
        icon: 'flag-outline',
        onPress: () => {
          // Report screen is in root navigator, use untyped navigation
          (navigation as any).navigate('Report', {
            type: 'COMMENT',
            targetId: selectedComment.id,
          });
        },
      });
    }

    return options;
  }, [selectedComment, currentUserId, deleteComment, navigation]);

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

  if (isLoading && comments.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.interactive.default} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.interactive.default}
          />
        }
        showsVerticalScrollIndicator={false}
        estimatedItemSize={100}
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
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default CommentsScreen;
