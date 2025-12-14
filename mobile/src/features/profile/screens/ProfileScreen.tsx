// src/features/profile/screens/ProfileScreen.tsx
// Modern Minimal Profile Screen - Backend %100 Uyumlu
// Design: Instagram + BeReal inspired, Soft Orange Theme
// Backend: GET /api/users/me, GET /api/users/{id}

import React, { useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Text,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SCREEN_ANIMATIONS, SAFE_AREA_EDGES, UNIFIED_TIMING, getListItemDelay } from '@constants';
import {
  navigateToPostDetail,
  navigateToEditProfile,
  navigateToSettings,
  navigateToFollowersList,
  navigateToFollowingList,
} from '@core/navigation';

import { useColors } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores';
import { useFollow, useUnfollow } from '@features/social/hooks/useFollow';
import { useUserPosts } from '@features/feed/hooks';
import { PostCard } from '@features/feed/components';
import { Button, Loading, SkeletonProfileHeader, AnimatedCounter } from '@shared/components';
import { ProfileBio, ProfileActions } from '../components';
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
export const ProfileScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const currentUser = useAuthStore(state => state.user);

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
    if (profile?.stats) {
      return profile.stats;
    }
    if (profileStats) {
      return profileStats;
    }
    return {
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
    };
  }, [profile?.stats, profileStats]);

  // Handlers
  const handleAvatarPress = useCallback(() => {
    // @ts-expect-error - Navigation prop type mismatch
    navigateToEditProfile(navigation);
  }, [navigation]);

  const handleEditPress = useCallback(() => {
    // @ts-expect-error - Navigation prop type mismatch
    navigateToEditProfile(navigation);
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    // @ts-expect-error - Navigation prop type mismatch
    navigateToSettings(navigation);
  }, [navigation]);

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
      // @ts-expect-error - Navigation prop type mismatch
      navigateToPostDetail(navigation, { postId });
    },
    [navigation],
  );

  const handleLoadMorePosts = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFollowChange = useCallback(
    (isFollowing: boolean) => {
      if (!viewedUserId) return;

      if (isFollowing) {
        // Currently following, so unfollow
        unfollowMutation.mutate(viewedUserId, {
          onError: () => {
            Alert.alert('Hata', 'Takipten çıkılamadı. Lütfen tekrar deneyin.');
          },
        });
      } else {
        // Not following, so follow
        followMutation.mutate(viewedUserId, {
          onError: () => {
            Alert.alert('Hata', 'Takip edilemedi. Lütfen tekrar deneyin.');
          },
        });
      }
    },
    [viewedUserId, followMutation, unfollowMutation],
  );

  // Loading state
  if (isLoading && !profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={SAFE_AREA_EDGES.standard}>
        <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={styles.container}>
          <SkeletonProfileHeader />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={SAFE_AREA_EDGES.standard}>
        <Loading message="Profil bulunamadı" />
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
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.interactive.default}
          />
        }>
        {/* Modern Premium Header */}
        <View style={styles.premiumHeader}>
          {/* Blurred Background */}
          <View style={[styles.blurredBackground, { backgroundColor: colors.interactive.focus }]} />

          {/* Settings Button */}
          {isOwnProfile && (
            <TouchableOpacity
              onPress={handleSettingsPress}
              style={[styles.settingsButtonTop, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Centered Profile Content */}
          <View style={styles.profileContent}>
            {/* Avatar with Glow */}
            <Animated.View
              entering={SCREEN_ANIMATIONS.heroEnter}
              style={styles.avatarGlowContainer}>
              <View style={[styles.avatarGlow, { backgroundColor: colors.interactive.default }]} />
              <Pressable onPress={isOwnProfile ? handleAvatarPress : undefined}>
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
              </Pressable>
            </Animated.View>

            {/* Profession Name - Big Bold */}
            <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(0)}>
              <Text style={[styles.professionTitle, { color: colors.text.primary }]}>
                {('professionName' in profile
                  ? profile.professionName
                  : profile.profession?.name) || profile.fullName}
              </Text>
            </Animated.View>

            {/* Username - Small */}
            <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(1)}>
              <Text style={[styles.usernameSmall, { color: colors.text.secondary }]}>
                @{profile.fullName.toLowerCase().replace(/\s+/g, '_')}
              </Text>
            </Animated.View>

            {/* Stats - Horizontal Big Numbers */}
            <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(2)} style={styles.statsRow}>
              <View style={styles.statBox}>
                <AnimatedCounter
                  value={stats.postCount}
                  duration={800}
                  style={[styles.statNumber, { color: colors.text.primary }]}
                />
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Gönderi</Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border.subtle }]} />

              <Pressable
                style={styles.statBox}
                onPress={() => {
                  if (profileUserId) {
                    // @ts-expect-error - Navigation prop type mismatch
                    navigateToFollowersList(navigation, { userId: profileUserId });
                  }
                }}>
                <AnimatedCounter
                  value={stats.followerCount}
                  duration={800}
                  style={[styles.statNumber, { color: colors.text.primary }]}
                />
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Takipçi</Text>
              </Pressable>

              <View style={[styles.statDivider, { backgroundColor: colors.border.subtle }]} />

              <Pressable
                style={styles.statBox}
                onPress={() => {
                  if (profileUserId) {
                    // @ts-expect-error - Navigation prop type mismatch
                    navigateToFollowingList(navigation, { userId: profileUserId });
                  }
                }}>
                <AnimatedCounter
                  value={stats.followingCount}
                  duration={800}
                  style={[styles.statNumber, { color: colors.text.primary }]}
                />
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Takip</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* Bio */}
        {'bio' in profile && profile.bio && <ProfileBio bio={profile.bio} />}

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
            entering={FadeInDown.delay(350).duration(400)}
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
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.postsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Gönderiler</Text>
          {isLoadingPosts && userPosts.length === 0 ? (
            <View style={styles.postsLoading}>
              <ActivityIndicator size="small" color={colors.interactive.default} />
            </View>
          ) : userPosts.length === 0 ? (
            <View style={styles.emptyPosts}>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                Henüz gönderi yok
              </Text>
            </View>
          ) : (
            <>
              {userPosts.map((post: Post, index: number) => {
                // Ensure post has all required fields for PostCard
                if (!post || !post.postId) return null;

                const animationDelay = getListItemDelay(index);

                return (
                  <Animated.View
                    key={post.postId}
                    entering={FadeInDown.delay(animationDelay).duration(
                      UNIFIED_TIMING.listItemDuration,
                    )}>
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
};

export default ProfileScreen;
