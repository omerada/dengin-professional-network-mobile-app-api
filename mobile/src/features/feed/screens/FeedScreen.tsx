// src/features/feed/screens/FeedScreen.tsx
// Ana feed ekranı - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { useFeedPosts, useLikePost, useBookmarkPost, useDeletePost } from '../hooks';
import { PostCard, FeedHeader, EmptyFeed } from '../components';
import { ActionSheet, type ActionSheetOption } from '@shared/components';
import { sharePost, showShareError } from '@shared/utils/share';
import { useAuthStore } from '@features/auth/stores';
import type { Post } from '../types';

export const FeedScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const currentUserId = useAuthStore(state => state.user?.id);

  // Action sheet state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

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
  const deletePost = useDeletePost();

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreatePost' as never);
  }, [navigation]);

  // postId: number - backend API uyumlu
  const handleLike = useCallback(
    (postId: number, isLiked: boolean) => {
      likePost.mutate({ postId, isLiked });
    },
    [likePost],
  );

  const handleComment = useCallback(
    (postId: number) => {
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('Comments', { postId });
    },
    [navigation],
  );

  const handleShare = useCallback(
    async (postId: number) => {
      const post = posts.find(p => p.postId === postId);
      if (post) {
        const result = await sharePost({
          postId: post.postId,
          content: post.content,
          author: post.author,
        });
        if (!result.success && result.error !== 'dismissed') {
          showShareError();
        }
      }
    },
    [posts],
  );

  // isSaved - backend API uyumlu (isBookmarked yerine)
  const handleBookmark = useCallback(
    (postId: number, isSaved: boolean) => {
      bookmarkPost.mutate({ postId, isSaved });
    },
    [bookmarkPost],
  );

  const handleMenuPress = useCallback(
    (postId: number) => {
      const post = posts.find(p => p.postId === postId);
      if (post) {
        setSelectedPost(post);
        setActionSheetVisible(true);
      }
    },
    [posts],
  );

  const handleCloseActionSheet = useCallback(() => {
    setActionSheetVisible(false);
    setSelectedPost(null);
  }, []);

  const handleDeletePost = useCallback(() => {
    if (selectedPost) {
      Alert.alert('Gönderiyi Sil', 'Bu gönderiyi silmek istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deletePost.mutate(selectedPost.postId);
          },
        },
      ]);
    }
  }, [selectedPost, deletePost]);

  const handleReportPost = useCallback(() => {
    if (selectedPost) {
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('ReportContent', {
        contentId: selectedPost.postId,
        contentType: 'POST',
      });
    }
  }, [selectedPost, navigation]);

  const actionSheetOptions = useMemo((): ActionSheetOption[] => {
    if (!selectedPost) return [];

    const isOwnPost = selectedPost.author.id === currentUserId;

    const options: ActionSheetOption[] = [
      {
        id: 'share',
        label: 'Paylaş',
        icon: 'share-outline',
        onPress: () => handleShare(selectedPost.postId),
      },
    ];

    if (isOwnPost) {
      options.push({
        id: 'delete',
        label: 'Sil',
        icon: 'trash-outline',
        destructive: true,
        onPress: handleDeletePost,
      });
    } else {
      options.push({
        id: 'report',
        label: 'Şikayet Et',
        icon: 'flag-outline',
        onPress: handleReportPost,
      });
    }

    return options;
  }, [selectedPost, currentUserId, handleShare, handleDeletePost, handleReportPost]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onBookmark={handleBookmark}
        onMenuPress={handleMenuPress}
      />
    ),
    [handleLike, handleComment, handleShare, handleBookmark, handleMenuPress],
  );

  // postId: number kullanılır
  const keyExtractor = useCallback((item: Post) => String(item.postId), []);

  const ListHeaderComponent = useMemo(
    () => <FeedHeader onCreatePress={handleCreatePress} />,
    [handleCreatePress],
  );

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

      <ActionSheet
        visible={actionSheetVisible}
        onClose={handleCloseActionSheet}
        options={actionSheetOptions}
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
