// src/features/feed/screens/FeedScreen.tsx
// Dengin Feed Ekranı - Production Ready Implementation
// Oku: MOBILE-APP-HOME-SCREEN.md, mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { useCallback, useMemo, useState, memo, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_ANIMATIONS, NETWORK_CONFIG } from '@constants';
import {
  navigateToComments,
  navigateToReportContent,
  navigateToNotifications,
  navigateToVerificationIntro,
  navigateToNewConversation,
  navigateToUserProfile,
} from '@core/navigation';

import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useSemanticHaptic, useLoadingTimeout, useHaptic } from '@shared/hooks';
import { useFeedPosts, useLikePost, useBookmarkPost, useDeletePost } from '../hooks';
import { PostCard } from '../components';
import { VerificationPromptCard } from '../components/VerificationPromptCard';
import { AITrendInsightCard } from '../components/AITrendInsightCard';
import { SuggestedExpertsCarousel } from '../components/SuggestedExpertsCarousel';
import {
  ActionSheet,
  type ActionSheetOption,
  UnifiedEmptyState,
  CustomRefreshControl,
  UnifiedScreenHeader,
  SkeletonList,
  SkeletonPostCard,
} from '@shared/components';
import {
  sharePost,
  showSuccess,
  showLikeError,
  showBookmarkError,
  showFollowError,
  showUnfollowError,
  showOperationError,
} from '@shared/utils';
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
  const { trigger } = useHaptic();
  const { triggerContent, triggerSystem } = useSemanticHaptic();
  const toast = useToast();
  const currentUserId = useAuthStore(state => state.user?.id);
  const user = useAuthStore(state => state.user);
  const { unreadCount } = useUnreadCount();

  // Action sheet state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

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
    timeout: NETWORK_CONFIG.TIMEOUT_DURATION,
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
   * UX IMPROVEMENT: Optimized verification prompt display
   * Rules (UPDATED FOR BETTER UX):
   * - Only for unverified users
   * - Show max 2 times (not 3 - less intrusive)
   * - Wait 7 days between dismissals (not 3 - longer cooldown)
   * - Show after 10th post (not 3rd - let user explore first)
   */
  useEffect(() => {
    const checkVerificationPrompt = async () => {
      if (user?.verificationStatus === 'APPROVED') {
        setShowVerificationPrompt(false);
        return;
      }

      // Get show count
      const shownCount =
        (await asyncStorage.get<number>(STORAGE_KEYS.VERIFICATION_PROMPT_SHOWN_COUNT)) ?? 0;

      // Max 2 times total (less annoying)
      if (shownCount >= 2) {
        setShowVerificationPrompt(false);
        return;
      }

      const dismissedAt = await asyncStorage.get<string>(
        STORAGE_KEYS.VERIFICATION_PROMPT_DISMISSED_AT,
      );

      // If dismissed recently (within 7 days), don't show
      if (dismissedAt) {
        const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (daysPassed < 7) {
          setShowVerificationPrompt(false);
          return;
        }
      }

      // Show after 10th post (let user explore app first)
      if (posts.length > 10) {
        setShowVerificationPrompt(true);
        // Increment count only once per session
        const sessionShown = await asyncStorage.get<boolean>(
          STORAGE_KEYS.VERIFICATION_PROMPT_SESSION_SHOWN,
        );
        if (!sessionShown) {
          await asyncStorage.set(STORAGE_KEYS.VERIFICATION_PROMPT_SHOWN_COUNT, shownCount + 1);
          await asyncStorage.set(STORAGE_KEYS.VERIFICATION_PROMPT_SESSION_SHOWN, true);
        }
      }
    };

    checkVerificationPrompt();
  }, [user?.verificationStatus, posts.length]);

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
            showSuccess(toast, { trigger }, isLiked ? 'Beğeni geri alındı' : 'Gönderi beğenildi');
          },
          onError: () => {
            showLikeError(toast, { trigger }, () => handleLike(postId, isLiked));
          },
        },
      );
    },
    [likePost, triggerSystem, toast, trigger],
  );

  /**
   * Handle comment navigation
   */
  const handleComment = useCallback(
    (postId: number) => {
      navigateToComments(navigation as any, { postId });
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
          showOperationError(toast, { trigger }, 'Paylaşım');
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
            showSuccess(
              toast,
              { trigger },
              isSaved ? 'Kayıtlardan kaldırıldı' : 'Gönderi kaydedildi',
            );
          },
          onError: () => {
            showBookmarkError(toast, { trigger }, () => handleBookmark(postId, isSaved));
          },
        },
      );
    },
    [bookmarkPost, triggerSystem, toast, trigger],
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
   * Delete post with confirmation - show confirmation action sheet
   */
  const handleDeletePost = useCallback(() => {
    if (selectedPost) {
      triggerSystem('alert'); // Critical action feedback
      setShowDeleteConfirm(true);
      setPostToDelete(selectedPost);
      handleCloseActionSheet();
    }
  }, [selectedPost, handleCloseActionSheet, triggerSystem]);

  /**
   * Confirm delete action
   */
  const handleConfirmDelete = useCallback(() => {
    if (postToDelete) {
      triggerSystem('confirm'); // Confirm deletion feedback
      deletePost.mutate(postToDelete.id);
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    }
  }, [postToDelete, deletePost, triggerSystem]);

  /**
   * Report post
   */
  const handleReportPost = useCallback(() => {
    if (selectedPost) {
      handleCloseActionSheet();
      navigateToReportContent(navigation as any, {
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
   * - AI Trend: After 5th post
   * - Suggested Experts: After 10th post
   * Memoized for FlashList performance
   * Uses UNIFIED_TIMING for consistent list animations (40ms delay)
   */
  const renderPost = useCallback(
    ({ item, index }: ListRenderItemInfo<Post>) => {
      return (
        <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(index)} style={{ flex: 1 }}>
          {/* P2: AI Trend Insight - After 5th post */}
          {index === 5 && (
            <AITrendInsightCard
              professionCategory={user?.sector?.code}
              onTrendPress={trend => console.log('Trend pressed:', trend)}
              onMorePress={() => console.log('More trends pressed')}
            />
          )}

          {/* P2: Suggested Experts - After 10th post */}
          {index === 10 && (
            <SuggestedExpertsCarousel
              onExpertPress={expertId => {
                navigateToUserProfile(navigation as any, { userId: expertId });
              }}
              onFollowToggle={(expertId, isFollowing) => {
                if (isFollowing) {
                  unfollowMutation.mutate(expertId, {
                    onSuccess: () => {
                      showSuccess(toast, { trigger }, 'Takipten çıkıldı');
                    },
                    onError: () => {
                      showUnfollowError(toast, { trigger }, () =>
                        unfollowMutation.mutate(expertId),
                      );
                    },
                  });
                } else {
                  followMutation.mutate(expertId, {
                    onSuccess: () => {
                      showSuccess(toast, { trigger }, 'Takip edildi');
                    },
                    onError: () => {
                      showFollowError(toast, { trigger }, () => followMutation.mutate(expertId));
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
        <UnifiedScreenHeader
          variant="feed"
          showBackButton={false}
          feedProps={{
            sector: user?.sector
              ? {
                  name: user.sector.name,
                  code: user.sector.code,
                }
              : undefined,
            unreadCount: unreadCount || 0,
            onSectorPress: () => console.log('Sector detail pressed'),
            onSearchPress: () => {
              navigateToNewConversation(navigation as any);
            },
            onNotificationPress: () => {
              navigateToNotifications(navigation as any);
            },
          }}
        />
        {/* P2 Optimized: Show verification prompt based on frequency logic */}
        {showVerificationPrompt && (
          <VerificationPromptCard
            onPress={() => {
              navigateToVerificationIntro(navigation as any);
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
        <UnifiedEmptyState
          icon="alert-circle-outline"
          title="Yükleme Zaman Aşımı"
          description="Gönderiler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
          primaryAction={{
            label: 'Tekrar Dene',
            onPress: retry,
          }}
        />
      );
    }

    // Content-aware skeleton loading
    if (isLoading && posts.length === 0) {
      return <SkeletonList count={5} ItemSkeleton={SkeletonPostCard} />;
    }

    return (
      <UnifiedEmptyState
        icon="newspaper-outline"
        title="Henüz gönderi yok"
        description="Takip ettiğin kişilerin gönderilerini burada göreceksin."
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

        {/* Delete Confirmation Action Sheet */}
        <ActionSheet
          visible={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setPostToDelete(null);
          }}
          title="Gönderiyi Sil"
          message="Bu gönderiyi silmek istediğinize emin misiniz?"
          options={[
            {
              id: 'delete',
              label: 'Sil',
              destructive: true,
              onPress: handleConfirmDelete,
            },
            {
              id: 'cancel',
              label: 'İptal',
              onPress: () => {
                setShowDeleteConfirm(false);
                setPostToDelete(null);
              },
            },
          ]}
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
