// src/features/profile/screens/ProfileScreen.modern.tsx
// Modern Minimal Profile Screen - Instagram Style
// Design: Instagram inspired, clean and minimal
// Backend: %100 uyumlu - GET /api/users/me, GET /api/users/{id}

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuthStore } from '@features/auth/stores';
import { useFollow, useUnfollow } from '@features/social/hooks/useFollow';
import { useUserPosts } from '@features/feed/hooks';
import { PostCard } from '@features/feed/components';
import { ImageViewer } from '@shared/components';
import { useMyProfile, useProfile, useProfileStats } from '../hooks';
import type { ProfileStats as ProfileStatsType } from '../types';
import type { Post } from '@features/feed/types';
import { modernStyles as styles } from './ProfileScreen.modern.styles';

interface RouteParams {
  userId?: string;
}

/**
 * Modern ProfileScreen - Instagram Style
 *
 * Features:
 * ✅ Sol tarafa hizalanmış profil fotoğrafı
 * ✅ Tıklanabilir avatar (tam ekran görüntüleme)
 * ✅ fullName (Backend API uyumlu)
 * ✅ İstatistikler: postCount, followerCount, followingCount (sağ tarafta)
 * ✅ Meslek bilgisi ve bio
 * ✅ Gönderiler bölümü (empty state ile)
 * ✅ Instagram benzeri minimal tasarım
 */
export const ModernProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const currentUser = useAuthStore(state => state.user);
  
  // Image viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

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
      (navigation as any).navigate('PostDetail', { postId });
    },
    [navigation],
  );

  const handleLoadMorePosts = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFollowToggle = useCallback(() => {
    if (!viewedUserId) return;

    if (otherProfile?.isFollowing) {
      unfollowMutation.mutate(viewedUserId);
    } else {
      followMutation.mutate(viewedUserId);
    }
  }, [viewedUserId, otherProfile, followMutation, unfollowMutation]);

  const handleMessagePress = useCallback(() => {
    if (!viewedUserId) return;
    (navigation as any).navigate('Chat', { userId: viewedUserId });
  }, [navigation, viewedUserId]);

  // Generate initials
  const initials = useMemo(() => {
    if (!profile) return '';
    const names = profile.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0]?.substring(0, 2).toUpperCase() ?? '';
  }, [profile]);

  // Loading state
  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E42" />
          <Text style={styles.errorText}>Profil yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Icon name="person-outline" size={64} color="#E0E0E0" />
          <Text style={styles.errorText}>Profil bulunamadı</Text>
          <Pressable style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#F59E42"
            colors={['#F59E42']}
          />
        }>
        {/* ========================================
            Profile Header Section - Instagram Style
            ======================================== */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.instagramHeader}>
          {/* Left: Avatar (Tıklanabilir) */}
          <Pressable
            onPress={() => profile.avatarUrl && setImageViewerVisible(true)}
            style={styles.avatarSection}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </Pressable>

          {/* Right: Stats (Gönderi, Takipçi, Takip) */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsSection}>
            <Pressable style={styles.statColumn}>
              <Text style={styles.statValue}>{stats.postCount}</Text>
              <Text style={styles.statLabel}>Gönderi</Text>
            </Pressable>

            <Pressable style={styles.statColumn}>
              <Text style={styles.statValue}>{stats.followerCount}</Text>
              <Text style={styles.statLabel}>Takipçi</Text>
            </Pressable>

            <Pressable style={styles.statColumn}>
              <Text style={styles.statValue}>{stats.followingCount}</Text>
              <Text style={styles.statLabel}>Takip</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* ========================================
            Name + Bio Section
            ======================================== */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.infoSection}>
          {/* Full Name */}
          <View style={styles.nameRow}>
            <Text style={styles.fullName}>{profile.fullName}</Text>
            {isOwnProfile && (
              <Pressable onPress={handleEditPress} style={styles.editIconButton}>
                <Icon name="pencil" size={16} color="#666" />
              </Pressable>
            )}
          </View>

          {/* Profession (professionName from API) */}
          {'professionName' in profile && profile.professionName && (
            <View style={styles.professionRow}>
              <Text style={styles.professionText}>{profile.professionName}</Text>
              {profile.isProfessionVerified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="shield-checkmark" size={12} color="#10C55F" />
                </View>
              )}
            </View>
          )}

          {/* Bio */}
          {'bio' in profile && profile.bio && (
            <Text style={styles.bioText}>{profile.bio}</Text>
          )}
        </Animated.View>

        {/* ========================================
            Actions Section
            ======================================== */}
        {isOwnProfile ? (
          /* Kendi Profilim - Profil Düzenle + Ayarlar */
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.actionsContainer}>
            <Pressable onPress={handleEditPress} style={styles.editProfileButton}>
              <Text style={styles.editProfileButtonText}>Profili Düzenle</Text>
            </Pressable>
            
            <Pressable onPress={handleSettingsPress} style={styles.settingsIconButton}>
              <Icon name="settings-outline" size={22} color="#1A1A1A" />
            </Pressable>
          </Animated.View>
        ) : (
          /* Başkasının Profili - Takip Et + Mesaj Gönder */
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.actionsContainer}>
            <Pressable
              onPress={handleFollowToggle}
              style={[
                styles.followButton,
                otherProfile?.isFollowing && styles.followingButton,
              ]}
              disabled={followMutation.isPending || unfollowMutation.isPending}>
              {followMutation.isPending || unfollowMutation.isPending ? (
                <ActivityIndicator size="small" color={otherProfile?.isFollowing ? '#1A1A1A' : '#FFFFFF'} />
              ) : (
                <Text
                  style={[
                    styles.followButtonText,
                    otherProfile?.isFollowing && styles.followingButtonText,
                  ]}>
                  {otherProfile?.isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={handleMessagePress} style={styles.messageButton}>
              <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ========================================
            Posts Section
            ======================================== */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.postsSection}>
          <View style={styles.postsSectionHeader}>
            <Text style={styles.sectionTitle}>Gönderiler</Text>
            <Text style={styles.postsCount}>{userPosts.length}</Text>
          </View>

          {isLoadingPosts && userPosts.length === 0 ? (
            <View style={styles.postsLoading}>
              <ActivityIndicator size="large" color="#F59E42" />
            </View>
          ) : userPosts.length === 0 ? (
            <View style={styles.emptyPosts}>
              <Icon name="images-outline" size={72} color="#E0E0E0" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>
                {isOwnProfile
                  ? 'Henüz gönderi paylaşmadınız.\nİlk gönderinizi oluşturun!'
                  : 'Bu kullanıcının henüz gönderisi yok.'}
              </Text>
            </View>
          ) : (
            <View style={styles.postsList}>
              {userPosts.map((post: Post, index: number) => {
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
                <Pressable style={styles.loadMoreButton} onPress={handleLoadMorePosts}>
                  <View style={styles.loadMoreButtonInner}>
                    {isFetchingNextPage ? (
                      <ActivityIndicator size="small" color="#666" />
                    ) : (
                      <Text style={styles.loadMoreText}>Daha Fazla Göster</Text>
                    )}
                  </View>
                </Pressable>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Image Viewer - Tam Ekran Avatar Görüntüleme */}
      {profile.avatarUrl && (
        <ImageViewer
          uri={profile.avatarUrl}
          visible={imageViewerVisible}
          onClose={() => setImageViewerVisible(false)}
          alt={`${profile.fullName} profil fotoğrafı`}
        />
      )}
    </SafeAreaView>
  );
};

export default ModernProfileScreen;
