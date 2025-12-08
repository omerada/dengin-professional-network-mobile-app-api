// src/features/feed/components/EmptyFeed/NoFollowingEmptyState/NoFollowingEmptyState.tsx
// No following empty state with suggested experts preview
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1607-1632
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 376-410

import React, { memo, useCallback, useState, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useSuggestedUsers } from '../../../hooks/useSuggestedUsers';

import { styles } from './NoFollowingEmptyState.styles';
import type {
  NoFollowingEmptyStateProps,
  SuggestedExpertPreview,
} from './NoFollowingEmptyState.types';

/**
 * NoFollowingEmptyState Component
 *
 * Displays suggested experts preview when user follows nobody.
 *
 * Features:
 * - Backend API integration (GET /api/users/suggested?limit=3)
 * - Algorithm-based suggestions
 * - Conditional rendering (user.followingCount === 0)
 * - 3 suggested expert preview cards
 * - Quick follow/unfollow action
 * - CTA buttons: "Keşfet" (primary), "Tüm Önerileri Gör" (secondary)
 * - Haptic feedback on interactions
 * - Stagger animations (FadeIn + FadeInDown)
 * - Loading state
 *
 * Replaces: MOCK_SUGGESTED_EXPERTS from types file
 *
 * Design Spec: MOBILE-APP-HOME-SCREEN.md Lines 1607-1632
 *
 * @example
 * ```tsx
 * const handleDiscover = () => {
 *   navigation.navigate('Discover');
 * };
 *
 * const handleShowAll = () => {
 *   navigation.navigate('SuggestedExperts');
 * };
 *
 * {user.followingCount === 0 && posts.length === 0 && (
 *   <NoFollowingEmptyState
 *     onDiscover={handleDiscover}
 *     onShowAllSuggestions={handleShowAll}
 *   />
 * )}
 * ```
 */
export const NoFollowingEmptyState: React.FC<NoFollowingEmptyStateProps> = memo(
  ({ onDiscover, onShowAllSuggestions, testID = 'no-following-empty-state' }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    // Fetch suggested users from backend API (only 3 for preview)
    const { data: suggestedUsers, isLoading } = useSuggestedUsers(3);

    // Map backend response to component format
    const fetchedExperts = useMemo<SuggestedExpertPreview[]>(() => {
      if (!suggestedUsers) return [];
      return suggestedUsers.map(user => ({
        id: user.id,
        fullName: user.fullName,
        profession: user.profession || 'Profesyonel',
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isFollowing: user.isFollowing,
      }));
    }, [suggestedUsers]);

    // Local state for follow/unfollow (optimistic update)
    const [experts, setExperts] = useState<SuggestedExpertPreview[]>([]);

    // Update experts when fetched data changes
    React.useEffect(() => {
      if (fetchedExperts.length > 0 && experts.length === 0) {
        setExperts(fetchedExperts);
      }
    }, [fetchedExperts, experts.length]);

    // Handle follow/unfollow toggle
    const handleFollowToggle = useCallback(
      (expertId: number) => {
        trigger('medium');

        setExperts(prev =>
          prev.map(expert =>
            expert.id === expertId ? { ...expert, isFollowing: !expert.isFollowing } : expert,
          ),
        );
      },
      [trigger],
    );

    // Handle discover CTA press
    const handleDiscoverPress = useCallback(() => {
      trigger('medium');
      onDiscover();
    }, [onDiscover, trigger]);

    // Handle show all suggestions press
    const handleShowAllPress = useCallback(() => {
      trigger('light');
      onShowAllSuggestions?.();
    }, [onShowAllSuggestions, trigger]);

    // Show loading state while fetching
    if (isLoading) {
      return (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.container}
          testID={`${testID}-loading`}>
          <View style={[styles.iconContainer, { paddingVertical: 48 }]}>
            <ActivityIndicator size="large" color={colors.interactive.default} />
          </View>
        </Animated.View>
      );
    }

    // Don't show if no experts available
    if (experts.length === 0) {
      return null;
    }

    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container} testID={testID}>
        {/* People Icon */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.iconContainer}>
          <Icon name="people-outline" size={80} color={colors.interactive.default} />
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.title, { color: colors.text.primary }]}>
          Henüz Kimseyi Takip Etmiyorsun
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.subtitle, { color: colors.text.secondary }]}>
          Uzmanları keşfet, ilgi alanlarına göre kişileri takip et
        </Animated.Text>

        {/* Suggested Experts Preview */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.expertsPreviewContainer}>
          {experts.map((expert, index) => (
            <Animated.View
              key={expert.id}
              entering={FadeInDown.delay(450 + index * 50).duration(400)}>
              <View
                style={[
                  styles.expertCard,
                  {
                    borderColor: colors.border.default,
                    backgroundColor: colors.background.elevated,
                  },
                ]}>
                {/* Avatar */}
                <View
                  style={[styles.expertAvatar, { backgroundColor: colors.background.tertiary }]}>
                  <Icon name="person" size={24} color={colors.text.tertiary} />
                </View>

                {/* Info */}
                <View style={styles.expertInfo}>
                  <View style={styles.expertNameWithBadge}>
                    <Text style={[styles.expertName, { color: colors.text.primary }]}>
                      {expert.fullName}
                    </Text>
                    {expert.isVerified && (
                      <Icon
                        name="checkmark-circle"
                        size={16}
                        color={colors.status.success}
                        style={styles.verifiedBadge}
                      />
                    )}
                  </View>
                  <Text style={[styles.expertProfession, { color: colors.text.secondary }]}>
                    {expert.profession}
                  </Text>
                </View>

                {/* Follow Button */}
                <Pressable
                  style={[
                    styles.followButton,
                    {
                      backgroundColor: expert.isFollowing
                        ? colors.background.secondary
                        : colors.interactive.default,
                    },
                  ]}
                  onPress={() => handleFollowToggle(expert.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${expert.fullName} ${expert.isFollowing ? 'takipten çık' : 'takip et'}`}
                  accessibilityHint={`${expert.fullName} adlı uzmanı ${expert.isFollowing ? 'takipten çıkarmak' : 'takip etmek'} için dokun`}>
                  <Text
                    style={[
                      styles.followButtonText,
                      {
                        color: expert.isFollowing ? colors.text.secondary : colors.text.inverse,
                      },
                    ]}>
                    {expert.isFollowing ? 'Takiptesin' : 'Takip Et'}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* CTA Buttons */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          style={styles.ctaButtonsContainer}>
          {/* Primary Button: Keşfet */}
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.interactive.default }]}
            onPress={handleDiscoverPress}
            accessibilityRole="button"
            accessibilityLabel="Uzmanları keşfet"
            accessibilityHint="Keşfet ekranına git">
            <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>
              Uzmanları Keşfet
            </Text>
          </Pressable>

          {/* Secondary Button: Tüm Önerileri Gör */}
          {onShowAllSuggestions && (
            <Pressable
              style={[styles.secondaryButton, { borderColor: colors.border.default }]}
              onPress={handleShowAllPress}
              accessibilityRole="button"
              accessibilityLabel="Tüm önerileri gör"
              accessibilityHint="Önerilen uzmanlar ekranına git">
              <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>
                Tüm Önerileri Gör
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>
    );
  },
);

NoFollowingEmptyState.displayName = 'NoFollowingEmptyState';

export default NoFollowingEmptyState;
