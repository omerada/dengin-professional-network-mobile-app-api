// src/features/profile/screens/ProfileScreen.tsx
// Modern Minimal Profile Screen - Backend %100 Uyumlu
// Design: Instagram + BeReal inspired, Soft Orange Theme
// Backend: GET /api/users/me, GET /api/users/{id}

import React, { memo, useCallback, useMemo } from 'react';
import { View, ScrollView, Text, ActivityIndicator, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SCREEN_ANIMATIONS, SAFE_AREA_EDGES, NETWORK_CONFIG } from '@constants';
import { navigateToPostDetail, navigateToEditProfile, navigateToSettings } from '@core/navigation';
import { useSemanticHaptic, useLoadingTimeout, useHaptic } from '@shared/hooks';

import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useAuthStore } from '@features/auth/stores';
import { showSuccess, showFollowError, showUnfollowError } from '@shared/utils';
import { useFollow, useUnfollow } from '@features/social/hooks/useFollow';
import { useUserPosts } from '@features/feed/hooks';
import { PostCard } from '@features/feed/components';
import {
  Button,
  UnifiedLoadingState,
  SkeletonProfileHeader,
  CustomRefreshControl,
  PressableScale,
  UnifiedEmptyState,
} from '@shared/components';
import { ProfileBio, ProfileActions, ProfileStats } from '../components';
import { ErrorBoundary } from '@core/components';
import { useMyProfile, useProfile, useProfileStats } from '../hooks';
import type { ProfileStats as ProfileStatsType } from '../types';
import type { Post } from '@features/feed/types';
import { styles } from './ProfileScreen.styles';

interface RouteParams {
  userId?: string;
}

/**
 * ProfileScreen - Modern Instagram-kalitesinde profil deneyimi
 *
 * Features:
 * - Animated component entrances
 * - Pull-to-refresh with haptic feedback
 * - Skeleton loading states
 * - Staggered post animations
 */
export const ProfileScreen: React.FC = memo(() => {
  const colors = useColors();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const currentUser = useAuthStore(state => state.user);
  const { trigger } = useHaptic();
  const { triggerNavigation, triggerSocial, triggerSystem } = useSemanticHaptic();
  const toast = useToast();

  // Follow mutations
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  // Determine if viewing own profile
  const viewedUserId = params?.userId ? parseInt(params.userId, 10) : undefined;
  const isOwnProfile = !viewedUserId || viewedUserId === currentUser?.id;

  // Fetch profile data
  const {
    data: myProfile,
    isLoading: isLoadingMyProfile,
    refetch: refetchMyProfile,
    isRefetching: isRefetchingMyProfile,
  } = useMyProfile();

  const {
    data: otherProfile,
    isLoading: isLoadingOtherProfile,
    refetch: refetchOtherProfile,
    isRefetching: isRefetchingOtherProfile,
  } = useProfile(isOwnProfile ? undefined : viewedUserId);

  // Get the appropriate profile data
  const profile = isOwnProfile ? myProfile : otherProfile;
  const isLoading = isOwnProfile ? isLoadingMyProfile : isLoadingOtherProfile;
  const isRefetching = isOwnProfile ? isRefetchingMyProfile : isRefetchingOtherProfile;

  // Loading timeout protection
  useLoadingTimeout(isLoading && !profile, {
    timeout: NETWORK_CONFIG.TIMEOUT_DURATION,
    onTimeout: () => {
      toast.error('Profil yüklenirken zaman aşımı oluştu. Lütfen tekrar deneyin.');
    },
    onRetry: async () => {
      if (isOwnProfile) {
        await refetchMyProfile();
      } else {
        await refetchOtherProfile();
      }
    },
  });

  // Get user ID for stats
  const profileUserId = isOwnProfile ? (myProfile?.id ?? currentUser?.id) : viewedUserId;

  // Fetch profile stats
  const { data: profileStats } = useProfileStats(profileUserId);

  // Fetch user posts
  const {
    posts: userPosts,
    isLoading: isLoadingPosts,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchPosts,
  } = useUserPosts({ userId: profileUserId, enabled: !!profileUserId });

  // Combine stats from profile or separate query
  const stats: ProfileStatsType = useMemo(() => {
    const result = profile?.stats ||
      profileStats || {
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
      };

    return result;
  }, [profile?.stats, profileStats, profileUserId, isOwnProfile]);

  // Handlers - UNIFIED: Navigation helpers with proper typing
  const handleAvatarPress = useCallback(() => {
    triggerNavigation('navigate');
    navigateToEditProfile(navigation as any);
  }, [navigation, triggerNavigation]);

  const handleEditPress = useCallback(() => {
    triggerNavigation('navigate');
    navigateToEditProfile(navigation as any);
  }, [navigation, triggerNavigation]);

  const handleSettingsPress = useCallback(() => {
    triggerNavigation('navigate');
    navigateToSettings(navigation as any);
  }, [navigation, triggerNavigation]);

  const handleRefresh = useCallback(() => {
    if (isOwnProfile) {
      refetchMyProfile();
    } else {
      refetchOtherProfile();
    }
    refetchPosts();
  }, [isOwnProfile, refetchMyProfile, refetchOtherProfile, refetchPosts]);

  const handlePostPress = useCallback(
    (postId: number) => {
      triggerNavigation('navigate');
      navigateToPostDetail(navigation as any, { postId });
    },
    [navigation, triggerNavigation],
  );

  const handleLoadMorePosts = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFollowChange = useCallback(
    (isFollowing: boolean) => {
      if (!viewedUserId) return;

      // Critical social action
      triggerSocial(isFollowing ? 'unfollow' : 'follow');

      if (isFollowing) {
        // Currently following, so unfollow
        unfollowMutation.mutate(viewedUserId, {
          onSuccess: () => {
            showSuccess(toast, { trigger }, 'Takipten çıkıldı');
          },
          onError: () => {
            showUnfollowError(toast, { trigger }, () => unfollowMutation.mutate(viewedUserId));
          },
        });
      } else {
        // Not following, so follow
        followMutation.mutate(viewedUserId, {
          onSuccess: () => {
            showSuccess(toast, { trigger }, 'Takip edildi');
          },
          onError: () => {
            showFollowError(toast, { trigger }, () => followMutation.mutate(viewedUserId));
          },
        });
      }
    },
    [viewedUserId, followMutation, unfollowMutation, triggerSocial, triggerSystem, toast],
  );

  // Early returns for loading and error states
  if (isLoading && !profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={SAFE_AREA_EDGES.standard}>
        <SkeletonProfileHeader />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={SAFE_AREA_EDGES.standard}>
        <UnifiedLoadingState strategy="spinner" message="Profil bulunamadı" variant="screen" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={SAFE_AREA_EDGES.standard}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <CustomRefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }>
        {/* Modern Premium Header */}
        <View style={styles.premiumHeader}>
          {/* Blurred Background with Avatar */}
          {profile.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.blurredBackground}
              blurRadius={8}
            />
          ) : (
            <View
              style={[styles.blurredBackground, { backgroundColor: colors.interactive.focus }]}
            />
          )}

          {/* Settings Button */}
          {isOwnProfile && (
            <PressableScale
              onPress={handleSettingsPress}
              activeScale={0.9}
              haptic
              hapticType="light"
              style={[styles.settingsButtonTop, { backgroundColor: colors.background.overlay }]}>
              <Icon name="settings-outline" size={22} color={colors.text.inverse} />
            </PressableScale>
          )}

          {/* Centered Profile Content */}
          <View style={styles.profileContent}>
            {/* Avatar with Glow */}
            <Animated.View
              entering={SCREEN_ANIMATIONS.heroEnter}
              style={styles.avatarGlowContainer}>
              <View style={[styles.avatarGlow, { backgroundColor: colors.interactive.default }]} />
              <PressableScale
                onPress={isOwnProfile ? handleAvatarPress : undefined}
                activeScale={0.95}
                disabled={!isOwnProfile}>
                {profile.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.premiumAvatar} />
                ) : (
                  <View
                    style={[
                      styles.premiumAvatar,
                      styles.avatarPlaceholder,
                      { backgroundColor: colors.interactive.focus },
                    ]}>
                    <Text style={[styles.avatarInitials, { color: colors.interactive.default }]}>
                      {profile.fullName
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  </View>
                )}
              </PressableScale>
            </Animated.View>

            {/* Full Name - Big Bold */}
            <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(0)}>
              <Text style={[styles.professionTitle, { color: colors.text.primary }]}>
                {profile.fullName}
              </Text>
            </Animated.View>

            {/* Profession - Subtitle with Icon */}
            {('professionName' in profile && profile.professionName) ||
            ('profession' in profile && profile.profession?.name) ? (
              <Animated.View
                entering={SCREEN_ANIMATIONS.listItemEnter(1)}
                style={styles.professionRow}>
                <Icon
                  name="briefcase"
                  size={14}
                  color={colors.text.secondary}
                  style={styles.professionIcon}
                />
                <Text style={[styles.professionSubtitle, { color: colors.text.secondary }]}>
                  {'professionName' in profile ? profile.professionName : profile.profession?.name}
                </Text>
                {profile.isProfessionVerified && (
                  <Icon
                    name="checkmark-circle"
                    size={16}
                    color={colors.status.success}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </Animated.View>
            ) : null}

            {/* Stats - Modern ProfileStats Component with Haptics */}
            {profileUserId && (
              <ProfileStats stats={stats} userId={profileUserId} interactive={true} />
            )}
          </View>
        </View>

        {/* Bio */}
        {'bio' in profile && profile.bio && (
          <Animated.View entering={SCREEN_ANIMATIONS.contentEnter} style={styles.bioSection}>
            <ProfileBio bio={profile.bio} />
          </Animated.View>
        )}

        {/* Actions for other users */}
        {!isOwnProfile && 'userId' in profile && profile.userId && (
          <ProfileActions
            userId={profile.userId}
            isFollowing={profile.isFollowing ?? false}
            isFollowedBy={profile.isFollowedBy ?? false}
            isBlocked={profile.isBlocked ?? false}
            onFollowChange={handleFollowChange}
          />
        )}

        {/* Own profile action - Edit Profile */}
        {isOwnProfile && (
          <Animated.View
            entering={SCREEN_ANIMATIONS.listItemEnter(2)}
            style={styles.editProfileButton}>
            <Button
              title="Profili Düzenle"
              onPress={handleEditPress}
              variant="outline"
              size="md"
              fullWidth
            />
          </Animated.View>
        )}

        {/* Posts section */}
        <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(3)} style={styles.postsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Gönderiler</Text>
          {isLoadingPosts && userPosts.length === 0 ? (
            <View style={styles.postsLoading}>
              <ActivityIndicator size="small" color={colors.interactive.default} />
            </View>
          ) : userPosts.length === 0 ? (
            <UnifiedEmptyState
              icon="newspaper-outline"
              title="Henüz gönderi yok"
              description={
                isOwnProfile ? 'İlk gönderini paylaş' : 'Bu kullanıcı henüz gönderi paylaşmamış'
              }
            />
          ) : (
            <>
              {userPosts.map((post: Post, index: number) => {
                // Ensure post has all required fields for PostCard
                if (!post || !post.postId) return null;

                return (
                  <Animated.View
                    key={post.postId}
                    entering={SCREEN_ANIMATIONS.listItemEnter(index)}>
                    <PostCard
                      post={post}
                      index={index}
                      onLike={() => {}}
                      onComment={() => handlePostPress(Number(post.postId))}
                      onShare={() => {}}
                      onBookmark={() => {}}
                      onMenuPress={() => {}}
                    />
                  </Animated.View>
                );
              })}
              {hasNextPage && (
                <View style={styles.loadMoreButton}>
                  <Button
                    title={isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                    onPress={handleLoadMorePosts}
                    variant="ghost"
                    size="sm"
                    loading={isFetchingNextPage}
                  />
                </View>
              )}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
});

ProfileScreen.displayName = 'ProfileScreen';

export default function ProfileScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ProfileScreen />
    </ErrorBoundary>
  );
}
