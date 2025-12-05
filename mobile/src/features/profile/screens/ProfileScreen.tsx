// src/features/profile/screens/ProfileScreen.tsx
// Full profile screen implementation
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md
// Backend: UserController, UserProfileController

import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores';
import { useLogout } from '@features/auth/hooks';
import { useFollow, useUnfollow } from '@features/social/hooks/useFollow';
import { useUserPosts } from '@features/feed/hooks';
import { PostCard } from '@features/feed/components';
import { Button, Loading } from '@shared/components';
import { spacing } from '@theme';
import { ProfileHeader, ProfileStats, ProfileBio, ProfileActions } from '../components';
import { useMyProfile, useProfile, useProfileStats } from '../hooks';
import type { ProfileStats as ProfileStatsType } from '../types';
import type { Post } from '@features/feed/types';

interface RouteParams {
  userId?: string;
}

/**
 * ProfileScreen
 *
 * Displays user profile with:
 * - Header (avatar, name, profession)
 * - Stats (posts, followers, following)
 * - Bio
 * - Actions (for other users: follow, message)
 * - Settings button (for own profile)
 *
 * Handles both:
 * - Own profile (no userId in route)
 * - Other user's profile (userId in route)
 */
export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
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
        style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
        edges={['top']}>
        <Loading message="Profil yükleniyor..." />
      </SafeAreaView>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
        edges={['top']}>
        <Loading message="Profil bulunamadı" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
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
          <View style={styles.ownProfileActions}>
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
          </View>
        )}

        {/* Posts section */}
        <View style={styles.postsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Gönderiler
          </Text>
          {isLoadingPosts && userPosts.length === 0 ? (
            <View style={styles.postsLoading}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            </View>
          ) : userPosts.length === 0 ? (
            <View style={styles.emptyPosts}>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                Henüz gönderi yok
              </Text>
            </View>
          ) : (
            <>
              {userPosts.map((post: Post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onPress={() => handlePostPress(post.postId)}
                  onLike={() => {}}
                  onComment={() => handlePostPress(post.postId)}
                  onShare={() => {}}
                  onBookmark={() => {}}
                  onMenuPress={() => {}}
                />
              ))}
              {hasNextPage && (
                <Button
                  title={isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                  onPress={handleLoadMorePosts}
                  variant="ghost"
                  size="sm"
                  loading={isFetchingNextPage}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  ownProfileActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  postsSection: {
    flex: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  postsLoading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyPosts: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
