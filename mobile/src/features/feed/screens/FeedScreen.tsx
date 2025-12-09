// src/features/feed/screens/FeedScreen.tsx
// Meslektaş Feed Ekranı - Production Ready Implementation
// Oku: MOBILE-APP-HOME-SCREEN.md, mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { useCallback, useMemo, useState, memo } from 'react';
import { RefreshControl, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useFeedPosts, useLikePost, useBookmarkPost, useDeletePost } from '../hooks';
import { PostCard, FeedHeader, EmptyFeed, FeedSkeleton } from '../components';
import { VerificationPromptCard } from '../components/VerificationPromptCard';
import { AITrendInsightCard } from '../components/AITrendInsightCard';
import { SuggestedExpertsCarousel } from '../components/SuggestedExpertsCarousel';
import { ActionSheet, type ActionSheetOption } from '@shared/components';
import { sharePost, showShareError } from '@shared/utils/share';
import { useAuthStore } from '@features/auth/stores';
import { useFollow, useUnfollow } from '@features/social/hooks';
import type { Post } from '../types';

/**
 * FeedScreen - Production-ready Instagram-style feed with FlashList
 *
 * Features:
 * - FlashList for optimal scroll performance (60 FPS target)
 * - Optimistic updates for like/bookmark (React Query)
 * - Pull-to-refresh with haptic feedback
 * - Infinite scroll with cursor-based pagination
 * - Skeleton loading states
 * - Empty state variants
 * - Memoized render items
 * - Full accessibility support
 *
 * Performance optimizations:
 * - FlashList: estimatedItemSize, removeClippedSubviews
 * - windowSize, maxToRenderPerBatch for optimal rendering
 * - React.memo for PostCard
 * - useCallback for all handlers
 */
export const FeedScreen: React.FC = memo(() => {
  const colors = useColors();
  const navigation = useNavigation();
  const { medium } = useHaptic();
  const currentUserId = useAuthStore(state => state.user?.id);

  // Action sheet state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // Follow/Unfollow mutations
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  // Feed data with infinite scroll
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFeedPosts();

  // Mutations with optimistic updates
  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();
  const deletePost = useDeletePost();

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreatePost' as never);
  }, [navigation]);

  /**
   * Handle like post with optimistic update
   */
  const handleLike = useCallback(
    (postId: number, isLiked: boolean) => {
      likePost.mutate({ postId, isLiked });
    },
    [likePost],
  );

  /**
   * Handle comment navigation
   */
  const handleComment = useCallback(
    (postId: number) => {
      // @ts-expect-error - Comments route not yet defined in types
      navigation.navigate('Comments', { postId });
    },
    [navigation],
  );

  /**
   * Handle share with native share sheet
   */
  const handleShare = useCallback(
    async (postId: number) => {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const result = await sharePost({
          postId: post.id,
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

  /**
   * Handle bookmark with optimistic update
   */
  const handleBookmark = useCallback(
    (postId: number, isSaved: boolean) => {
      bookmarkPost.mutate({ postId, isSaved });
    },
    [bookmarkPost],
  );

  /**
   * Handle menu press - show action sheet
   */
  const handleMenuPress = useCallback(
    (postId: number) => {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setSelectedPost(post);
        setActionSheetVisible(true);
      }
    },
    [posts],
  );

  /**
   * Handle pull-to-refresh with haptic feedback
   */
  const handleRefresh = useCallback(() => {
    medium();
    refetch();
  }, [medium, refetch]);

  /**
   * Handle infinite scroll - load more posts
   */
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * Close action sheet
   */
  const handleCloseActionSheet = useCallback(() => {
    setActionSheetVisible(false);
    setSelectedPost(null);
  }, []);

  /**
   * Delete post with confirmation
   */
  const handleDeletePost = useCallback(() => {
    if (selectedPost) {
      Alert.alert('Gönderiyi Sil', 'Bu gönderiyi silmek istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deletePost.mutate(selectedPost.id);
            handleCloseActionSheet();
          },
        },
      ]);
    }
  }, [selectedPost, deletePost, handleCloseActionSheet]);

  /**
   * Report post
   */
  const handleReportPost = useCallback(() => {
    if (selectedPost) {
      handleCloseActionSheet();
      // @ts-expect-error - ReportContent route not yet defined in types
      navigation.navigate('ReportContent', {
        contentId: selectedPost.id,
        contentType: 'POST',
      });
    }
  }, [selectedPost, navigation, handleCloseActionSheet]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  /**
   * Action sheet options based on post ownership
   */
  const actionSheetOptions = useMemo((): ActionSheetOption[] => {
    if (!selectedPost) return [];

    const isOwnPost = selectedPost.author.id === currentUserId;

    const options: ActionSheetOption[] = [
      {
        id: 'share',
        label: 'Paylaş',
        icon: 'share-outline',
        onPress: () => handleShare(selectedPost.id),
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

  // ============================================================================
  // Render Functions
  // ============================================================================

  /**
   * Render single post item with suggested experts carousel every 5th post
   * Memoized for FlashList performance
   */
  const renderPost = useCallback(
    ({ item, index }: ListRenderItemInfo<Post>) => (
      <>
        {/* Show suggested experts carousel every 5th post (after 1st, 6th, 11th...) */}
        {index > 0 && index % 5 === 0 && (
          <SuggestedExpertsCarousel
            onExpertPress={expertId => {
              // @ts-expect-error - UserProfile route not yet defined in types
              navigation.navigate('UserProfile', { userId: expertId });
            }}
            onFollowToggle={(expertId, isFollowing) => {
              if (isFollowing) {
                unfollowMutation.mutate(expertId);
              } else {
                followMutation.mutate(expertId);
              }
            }}
          />
        )}
        <PostCard
          post={item}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onBookmark={handleBookmark}
          onMenuPress={handleMenuPress}
        />
      </>
    ),
    [handleLike, handleComment, handleShare, handleBookmark, handleMenuPress, navigation],
  );

  /**
   * Key extractor for FlashList
   */
  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  /**
   * List header - feed header with new home screen components
   */
  const ListHeaderComponent = useMemo(() => {
    const user = useAuthStore.getState().user;

    return (
      <>
        <FeedHeader
          onCreatePress={handleCreatePress}
          sector={
            user?.sector
              ? {
                  name: user.sector.name,
                  code: user.sector.code,
                }
              : undefined
          }
          onSectorPress={() => console.log('Sector detail pressed')}
        />
        {/* Show verification prompt for unverified users */}
        {user?.verificationStatus !== 'APPROVED' && (
          <VerificationPromptCard
            onPress={() => navigation.navigate('VerificationIntro' as never)}
          />
        )}
        {/* Always show AI trend insights */}
        <AITrendInsightCard
          professionCategory={user?.sector?.code}
          onTrendPress={trend => console.log('Trend pressed:', trend)}
          onMorePress={() => console.log('More trends pressed')}
        />
      </>
    );
  }, [handleCreatePress, navigation]);

  /**
   * Empty state component
   */
  const ListEmptyComponent = useMemo(() => {
    if (isLoading && posts.length === 0) {
      return <FeedSkeleton count={3} showImages />;
    }

    return (
      <EmptyFeed
        title="Henüz gönderi yok"
        message="İlk gönderiyi paylaşan siz olun!"
        actionLabel="Gönderi Oluştur"
        onAction={handleCreatePress}
        icon="newspaper-outline"
      />
    );
  }, [isLoading, posts.length, handleCreatePress]);

  /**
   * Footer component - loading more indicator
   */
  const ListFooterComponent = useMemo(() => {
    if (!isFetchingNextPage) return null;

    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.footer}>
        <ActivityIndicator size="small" color={colors.interactive.default} />
      </Animated.View>
    );
  }, [isFetchingNextPage, colors.interactive]);

  /**
   * Refresh control component
   */
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

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        {/* FlashList for optimized performance */}
        <FlashList
          data={posts}
          renderItem={renderPost}
          keyExtractor={keyExtractor}
          // Performance optimizations
          removeClippedSubviews
          // Scroll behavior
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          // Components
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          refreshControl={refreshControl}
          // Accessibility
          accessible
          accessibilityRole="list"
          accessibilityLabel="Gönderi akışı"
          // Visual
          showsVerticalScrollIndicator={false}
        />

        {/* Action Sheet */}
        <ActionSheet
          visible={actionSheetVisible}
          onClose={handleCloseActionSheet}
          options={actionSheetOptions}
        />
      </Animated.View>
    </SafeAreaView>
  );
});

FeedScreen.displayName = 'FeedScreen';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonItem: {
    marginBottom: 16,
  },
});

export default FeedScreen;
