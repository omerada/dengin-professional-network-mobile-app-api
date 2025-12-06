// src/features/profile/screens/ProfileScreen.tsx
// Modern Profile Screen with Design System integration
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl, Alert, Text, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useColors } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores';
import { useLogout } from '@features/auth/hooks';
import { useFollow, useUnfollow } from '@features/social/hooks/useFollow';
import { useUserPosts } from '@features/feed/hooks';
import { PostCard } from '@features/feed/components';
import { Button, Loading, Skeleton } from '@shared/components';
import { ProfileHeader, ProfileStats, ProfileBio, ProfileActions } from '../components';
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
  const { logout, isLoading: isLoggingOut } = useLogout();

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
    navigation.navigate('EditProfile' as never);
  }, [navigation]);

  const handleEditPress = useCallback(() => {
    navigation.navigate('EditProfile' as never);
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings' as never);
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
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('PostDetail', { postId });
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

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Loading state
  if (isLoading && !profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
          <Skeleton variant="rectangular" />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}>
        <Loading message="Profil bulunamadı" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
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
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onAvatarPress={handleAvatarPress}
          onEditPress={handleEditPress}
        />

        {/* Profile Stats */}
        <ProfileStats stats={stats} userId={profileUserId ?? 0} interactive={!isOwnProfile} />

        {/* Bio */}
        {'bio' in profile && profile.bio && <ProfileBio bio={profile.bio} />}

        {/* Actions for other users */}
        {!isOwnProfile && 'userId' in profile && (
          <ProfileActions
            userId={profile.userId}
            isFollowing={profile.isFollowing}
            isFollowedBy={profile.isFollowedBy}
            isBlocked={profile.isBlocked}
            onFollowChange={handleFollowChange}
          />
        )}

        {/* Own profile actions */}
        {isOwnProfile && (
          <Animated.View
            entering={FadeInDown.delay(350).duration(400)}
            style={styles.ownProfileActions}>
            <Button
              title="Ayarlar"
              onPress={handleSettingsPress}
              variant="outline"
              size="md"
              fullWidth
              leftIcon="settings-outline"
            />
            <View style={styles.logoutButton}>
              <Button
                title="Çıkış Yap"
                onPress={handleLogout}
                loading={isLoggingOut}
                variant="danger"
                size="md"
                fullWidth
              />
            </View>
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

                return (
                  <PostCard
                    key={post.postId}
                    post={post}
                    index={index}
                    onLike={() => {}}
                    onComment={() => handlePostPress(Number(post.postId))}
                    onShare={() => {}}
                    onBookmark={() => {}}
                    onMenuPress={() => {}}
                  />
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
