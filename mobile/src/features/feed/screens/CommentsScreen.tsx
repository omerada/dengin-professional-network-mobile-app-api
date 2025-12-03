// src/features/feed/screens/CommentsScreen.tsx
// Yorumlar ekranı
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { useCommentsData, useAddComment, useLikeComment, useDeleteComment } from '../hooks';
import { CommentCard, AddCommentForm, EmptyFeed } from '../components';
import type { Comment } from '../types';
import type { FeedStackParamList } from '@shared/types';

type CommentsRouteProp = RouteProp<FeedStackParamList, 'Comments'>;

export const CommentsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<CommentsRouteProp>();
  const { postId } = route.params;

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

  const handleAddComment = useCallback((content: string) => {
    addComment.mutate({ postId, content });
  }, [addComment, postId]);

  const handleLike = useCallback((commentId: string, isLiked: boolean) => {
    likeComment.mutate({ commentId, isLiked });
  }, [likeComment]);

  const handleReply = useCallback((commentId: string) => {
    // TODO: Implement reply functionality
    console.log('Reply to:', commentId);
  }, []);

  const handleAuthorPress = useCallback((userId: string) => {
    navigation.navigate('UserProfile' as never, { userId } as never);
  }, [navigation]);

  const handleMenuPress = useCallback((commentId: string) => {
    // TODO: Show action sheet with delete option
    console.log('Menu for comment:', commentId);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderComment = useCallback(({ item }: { item: Comment }) => (
    <CommentCard
      comment={item}
      onLike={handleLike}
      onReply={handleReply}
      onAuthorPress={handleAuthorPress}
      onMenuPress={handleMenuPress}
    />
  ), [handleLike, handleReply, handleAuthorPress, handleMenuPress]);

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
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  }, [isFetchingNextPage, theme.colors.primary]);

  if (isLoading && comments.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
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
            tintColor={theme.colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <AddCommentForm
        postId={postId}
        onSubmit={handleAddComment}
        isLoading={addComment.isPending}
        autoFocus
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
  listContent: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default CommentsScreen;
