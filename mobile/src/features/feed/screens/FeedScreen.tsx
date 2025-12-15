// src/features/feed/screens/FeedScreen.tsx
// Dengin Feed Ekranı - Production Ready Implementation
// Oku: MOBILE-APP-HOME-SCREEN.md, mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { useCallback, useMemo, useState, memo, useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_ANIMATIONS, HAPTIC_TYPES } from '@constants';
import {
  navigateToComments,
  navigateToReportContent,
  navigateToNotifications,
  navigateToVerificationIntro,
} from '@core/navigation';

import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useSemanticHaptic, useLoadingTimeout } from '@shared/hooks';
import { useFeedPosts, useLikePost, useBookmarkPost, useDeletePost } from '../hooks';
import { PostCard, FeedHeader, EmptyFeed, FeedSkeleton } from '../components';
import { VerificationPromptCard } from '../components/VerificationPromptCard';
import { AITrendInsightCard } from '../components/AITrendInsightCard';
import { SuggestedExpertsCarousel } from '../components/SuggestedExpertsCarousel';
import {
  ActionSheet,
  type ActionSheetOption,
  LoadingStateWrapper,
  CustomRefreshControl,
} from '@shared/components';
import { sharePost, showShareError } from '@shared/utils/share';
import { useAuthStore } from '@features/auth/stores';
import { useFollow, useUnfollow } from '@features/social/hooks';
import { useUnreadCount } from '@features/notifications/hooks';
import { asyncStorage } from '@core/storage/asyncStorage';
import { STORAGE_KEYS } from '@core/storage/keys';
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
  const { triggerSocial, triggerContent, triggerSystem } = useSemanticHaptic();
  const toast = useToast();
  const currentUserId = useAuthStore(state => state.user?.id);
  const user = useAuthStore(state => state.user);
  const { unreadCount } = useUnreadCount();

  // Action sheet state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // P2 Addition: Engagement card visibility state
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

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

  // Loading timeout protection
  const { hasTimedOut, retry } = useLoadingTimeout(isLoading && posts.length === 0, {
    timeout: 30000,
    onTimeout: () => {
      Alert.alert(
        'Yükleme Zaman Aşımı',
        'Gönderiler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }],
      );
    },
    onRetry: async () => {
      await refetch();
    },
  });

  // Mutations with optimistic updates
  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();
  const deletePost = useDeletePost();

  // ============================================================================
  // P2 Addition: Engagement Card Frequency Logic
  // ============================================================================

  /**
   * Check if verification prompt should be shown
   * Rules:
   * - Only for unverified users
   * - Show once per session (until dismissed)
   * - Don't show if dismissed within last 24 hours
   */
  useEffect(() => {
    const checkVerificationPrompt = async () => {
      if (user?.verificationStatus === 'APPROVED') {
        setShowVerificationPrompt(false);
        return;
      }

      const promptShown = await asyncStorage.get(STORAGE_KEYS.VERIFICATION_PROMPT_SHOWN);
      const dismissedAt = await asyncStorage.get(STORAGE_KEYS.VERIFICATION_PROMPT_DISMISSED_AT);

      // If dismissed recently (within 24 hours), don't show
      if (dismissedAt && typeof dismissedAt === 'string') {
        const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (daysPassed < 1) {
          setShowVerificationPrompt(false);
          return;
        }
      }

      // Show if not shown in current session
      if (!promptShown) {
        setShowVerificationPrompt(true);
        await asyncStorage.set(STORAGE_KEYS.VERIFICATION_PROMPT_SHOWN, true);
      }
    };

    checkVerificationPrompt();
  }, [user?.verificationStatus]);

  /**
   * Handle verification prompt dismissal
   */
  const handleDismissVerificationPrompt = useCallback(async () => {
    setShowVerificationPrompt(false);
    await asyncStorage.set(STORAGE_KEYS.VERIFICATION_PROMPT_DISMISSED_AT, Date.now().toString());
  }, []);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handle like with optimistic update + feedback
   */
  const handleLike = useCallback(
    (postId: number, isLiked: boolean) => {
      likePost.mutate(
        { postId, isLiked },
        {
          onSuccess: () => {
            triggerSystem('success');
            toast.success(isLiked ? 'Beğeni geri alındı' : 'Gönderi beğenildi');
          },
          onError: () => {
            triggerSystem('error');
            toast.error('İşlem başarısız oldu');
          },
        },
      );
    },
    [likePost, triggerSystem, toast],
  );

  /**
   * Handle comment navigation
   */
  const handleComment = useCallback(
    (postId: number) => {
      // @ts-expect-error - Navigation prop type mismatch
      navigateToComments(navigation, { postId });
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
   * Handle bookmark with optimistic update + feedback
   */
  const handleBookmark = useCallback(
    (postId: number, isSaved: boolean) => {
      bookmarkPost.mutate(
        { postId, isSaved },
        {
          onSuccess: () => {
            triggerSystem('success');
            toast.success(isSaved ? 'Kayıtlardan kaldırıldı' : 'Gönderi kaydedildi');
          },
          onError: () => {
            triggerSystem('error');
            toast.error('İşlem başarısız oldu');
          },
        },
      );
    },
    [bookmarkPost, triggerSystem, toast],
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
    triggerContent('refresh');
    refetch();
  }, [triggerContent, refetch]);

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
      trigger(HAPTIC_TYPES.warning); // Critical action feedback
      Alert.alert('Gönderiyi Sil', 'Bu gönderiyi silmek istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            trigger(HAPTIC_TYPES.delete); // Confirm deletion feedback
            deletePost.mutate(selectedPost.id);
            handleCloseActionSheet();
          },
        },
      ]);
    }
  }, [selectedPost, deletePost, handleCloseActionSheet, trigger]);

  /**
   * Report post
   */
  const handleReportPost = useCallback(() => {
    if (selectedPost) {
      handleCloseActionSheet();
      // @ts-expect-error - Navigation prop type mismatch
      navigateToReportContent(navigation, {
        contentId: selectedPost.id,
        contentType: 'post',
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
   * Render single post item with engagement cards
   * P2 Optimized: Strategic placement based on index
   * - AI Trend: Every 10th post
   * - Suggested Experts: Every 20th post
   * Memoized for FlashList performance
   * Uses UNIFIED_TIMING for consistent list animations (40ms delay)
   */
  const renderPost = useCallback(
    ({ item, index }: ListRenderItemInfo<Post>) => {
      return (
        <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(index)} style={{ flex: 1 }}>
          {/* P2: AI Trend Insight - Every 10th post */}
          {index > 0 && index % 10 === 0 && (
            <AITrendInsightCard
              professionCategory={user?.sector?.code}
              onTrendPress={trend => console.log('Trend pressed:', trend)}
              onMorePress={() => console.log('More trends pressed')}
            />
          )}

          {/* P2: Suggested Experts - Every 20th post */}
          {index > 0 && index % 20 === 0 && (
            <SuggestedExpertsCarousel
              onExpertPress={expertId => {
                // @ts-expect-error - UserProfile route not yet defined in types
                navigation.navigate('UserProfile', { userId: expertId });
              }}
              onFollowToggle={(expertId, isFollowing) => {
                if (isFollowing) {
                  unfollowMutation.mutate(expertId, {
                    onSuccess: () => {
                      trigger('success');
                      toast.success('Takipten çıkıldı');
                    },
                    onError: () => {
                      trigger('error');
                      toast.error('İşlem başarısız oldu');
                    },
                  });
                } else {
                  followMutation.mutate(expertId, {
                    onSuccess: () => {
                      trigger('success');
                      toast.success('Takip edildi');
                    },
                    onError: () => {
                      trigger('error');
                      toast.error('İşlem başarısız oldu');
                    },
                  });
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
        </Animated.View>
      );
    },
    [
      handleLike,
      handleComment,
      user?.sector?.code,
      handleShare,
      handleBookmark,
      handleMenuPress,
      navigation,
      unfollowMutation,
      followMutation,
    ],
  );

  /**
   * Key extractor for FlashList
   */
  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  /**
   * List header - feed header with new home screen components
   */
  const ListHeaderComponent = useMemo(() => {
    return (
      <>
        <FeedHeader
          sector={
            user?.sector
              ? {
                  name: user.sector.name,
                  code: user.sector.code,
                }
              : undefined
          }
          unreadNotifications={unreadCount || 0}
          onSectorPress={() => console.log('Sector detail pressed')}
          onNotificationPress={() => {
            // @ts-expect-error - Navigation prop type mismatch
            navigateToNotifications(navigation);
          }}
          onSearchPress={() => {
            // @ts-expect-error - Navigation prop type mismatch
            navigation.navigate('NewConversation');
          }}
        />
        {/* P2 Optimized: Show verification prompt based on frequency logic */}
        {showVerificationPrompt && (
          <VerificationPromptCard
            onPress={() => {
              // @ts-expect-error - Navigation prop type mismatch
              navigateToVerificationIntro(navigation);
              handleDismissVerificationPrompt();
            }}
            onDismiss={handleDismissVerificationPrompt}
          />
        )}
      </>
    );
  }, [user, navigation, showVerificationPrompt, handleDismissVerificationPrompt]);

  /**
   * Empty state component with smooth crossfade transition
   */
  const ListEmptyComponent = useMemo(() => {
    // If timed out, show error state with retry
    if (hasTimedOut) {
      return (
        <EmptyFeed
          title="Yükleme Zaman Aşımı"
          message="Gönderiler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
          icon="alert-circle-outline"
          action={{
            label: 'Tekrar Dene',
            onPress: retry,
          }}
        />
      );
    }

    return (
      <LoadingStateWrapper
        isLoading={isLoading && posts.length === 0}
        skeleton={<FeedSkeleton count={3} showImages />}
        content={
          <EmptyFeed
            title="Henüz gönderi yok"
            message="Takip ettiğin kişilerin gönderilerini burada göreceksin."
            icon="newspaper-outline"
          />
        }
        transition="crossfade"
      />
    );
  }, [isLoading, posts.length, hasTimedOut, retry]);

  /**
   * Footer component - loading more indicator
   */
  const ListFooterComponent = useMemo(() => {
    if (!isFetchingNextPage) return null;

    return (
      <Animated.View entering={SCREEN_ANIMATIONS.quickFadeIn} style={styles.footer}>
        <ActivityIndicator size="small" color={colors.interactive.default} />
      </Animated.View>
    );
  }, [isFetchingNextPage, colors.interactive]);

  /**
   * Refresh control component
   */
  const refreshControl = useMemo(
    () => <CustomRefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />,
    [isRefetching, handleRefresh],
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
      <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={styles.container}>
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

// Wrap with Error Boundary for production safety
import { ErrorBoundary } from '@core/components';

export default function FeedScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <FeedScreen />
    </ErrorBoundary>
  );
}
