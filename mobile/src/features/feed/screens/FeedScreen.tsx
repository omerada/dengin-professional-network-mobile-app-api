// src/features/feed/screens/FeedScreen.tsx
// Ana feed ekranı - Modern Design System ile güncellendi
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { useColors } from '@contexts/ThemeContext';
import { useFeedPosts, useLikePost, useBookmarkPost, useDeletePost } from '../hooks';
import { PostCard, FeedHeader, EmptyFeed } from '../components';
import { ActionSheet, type ActionSheetOption, Skeleton } from '@shared/components';
import { sharePost, showShareError } from '@shared/utils/share';
import { useAuthStore } from '@features/auth/stores';
import type { Post } from '../types';
import { styles } from './FeedScreen.styles';

/**
 * FeedScreen - Modern Instagram-kalitesinde feed deneyimi
 *
 * Features:
 * - Staggered post animations
 * - Pull-to-refresh with haptic feedback
 * - Infinite scroll with skeleton loading
 * - Optimized list performance
 */
export const FeedScreen: React.FC = () => {
  const colors = useColors();
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
    ({ item, index }: { item: Post; index: number }) => (
      <PostCard
        post={item}
        index={index}
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
      <Animated.View entering={FadeIn.duration(200)} style={styles.footer}>
        <ActivityIndicator size="small" color={colors.interactive.default} />
      </Animated.View>
    );
  }, [isFetchingNextPage, colors.interactive]);

  // Skeleton loading for initial load
  const LoadingSkeleton = useMemo(
    () => (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.skeletonContainer, { backgroundColor: colors.background.primary }]}>
        {[0, 1, 2].map(index => (
          <View key={index} style={styles.skeletonItem}>
            <Skeleton variant="postCard" />
          </View>
        ))}
      </Animated.View>
    ),
    [colors.background.primary],
  );

  if (isLoading && posts.length === 0) {
    return LoadingSkeleton;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, { backgroundColor: colors.background.primary }]}>
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
            tintColor={colors.interactive.default}
            colors={[colors.interactive.default]}
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
    </Animated.View>
  );
};

export default FeedScreen;
