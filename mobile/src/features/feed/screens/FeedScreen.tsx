// src/features/feed/screens/FeedScreen.tsx
// Ana feed ekranı
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { useFeedPosts, useLikePost, useBookmarkPost } from '../hooks';
import { PostCard, FeedHeader, EmptyFeed } from '../components';
import type { Post } from '../types';

export const FeedScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFeedPosts();

  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreatePost' as never);
  }, [navigation]);

  const handleLike = useCallback((postId: string, isLiked: boolean) => {
    likePost.mutate({ postId, isLiked });
  }, [likePost]);

  const handleComment = useCallback((postId: string) => {
    navigation.navigate('Comments' as never, { postId } as never);
  }, [navigation]);

  const handleShare = useCallback((_postId: string) => {
    // TODO: Implement share functionality
  }, []);

  const handleBookmark = useCallback((postId: string, isBookmarked: boolean) => {
    bookmarkPost.mutate({ postId, isBookmarked });
  }, [bookmarkPost]);

  const handleMenuPress = useCallback((_postId: string) => {
    // TODO: Show action sheet
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onBookmark={handleBookmark}
      onMenuPress={handleMenuPress}
    />
  ), [handleLike, handleComment, handleShare, handleBookmark, handleMenuPress]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const ListHeaderComponent = useMemo(() => (
    <FeedHeader onCreatePress={handleCreatePress} />
  ), [handleCreatePress]);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return null;
    
    return (
      <EmptyFeed
        title="Henüz gönderi yok"
        message="İlk gönderiyi paylaşan siz olun!"
        actionLabel="Gönderi Oluştur"
        onAction={handleCreatePress}
      />
    );
  }, [isLoading, handleCreatePress]);

  const ListFooterComponent = useMemo(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  }, [isFetchingNextPage, theme.colors.primary]);

  if (isLoading && posts.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
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
