// src/features/feed/components/SuggestedExpertsCarousel/SuggestedExpertsCarousel.tsx
// Horizontal scrollable carousel of suggested experts
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 419, 1971-1987
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

import React, { memo, useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { useSuggestedUsers } from '../../hooks/useSuggestedUsers';

import { ExpertCard } from './ExpertCard';
import { styles } from './SuggestedExpertsCarousel.styles';
import type {
  SuggestedExpertsCarouselProps,
  SuggestedExpert,
} from './SuggestedExpertsCarousel.types';

/**
 * SuggestedExpertsCarousel Component
 *
 * Horizontal scrollable carousel showing suggested experts to follow.
 *
 * Features:
 * - Backend API integration (GET /api/users/suggested)
 * - Algorithm-based suggestions (profession + engagement + verified)
 * - Horizontal ScrollView with snap to interval
 * - 8 suggested experts (configurable)
 * - Expert cards (120px width, 140px height)
 * - Follow/Unfollow optimistic update
 * - Haptic feedback on interactions
 * - Loading and error states
 *
 * Replaces: mockExperts.ts (MOCK_SUGGESTED_EXPERTS)
 *
 * Design Spec: MOBILE-APP-HOME-SCREEN.md Lines 419, 1971-1987
 *
 * Usage: Rendered every 5 posts in feed (index % 5 === 0)
 *
 * @example
 * ```tsx
 * const handleExpertPress = (userId: number) => {
 *   navigation.navigate('Profile', { userId });
 * };
 *
 * const handleFollowToggle = (userId: number, isFollowing: boolean) => {
 *   // Optimistic update + API call
 *   followUserMutation.mutate({ userId, action: isFollowing ? 'unfollow' : 'follow' });
 * };
 *
 * <SuggestedExpertsCarousel
 *   onExpertPress={handleExpertPress}
 *   onFollowToggle={handleFollowToggle}
 * />
 * ```
 */
export const SuggestedExpertsCarousel: React.FC<SuggestedExpertsCarouselProps> = memo(
  ({ onExpertPress, onFollowToggle, testID = 'suggested-experts-carousel' }) => {
    const colors = useColors();
    const { triggerNavigation, triggerSocial } = useSemanticHaptic();

    // Fetch suggested users from backend API
    const { data: suggestedUsers, isLoading, isError } = useSuggestedUsers(8);

    // Map backend response to component format
    const experts = useMemo<SuggestedExpert[]>(() => {
      if (!suggestedUsers) return [];
      return suggestedUsers.map(user => ({
        id: user.id,
        fullName: user.fullName,
        profession: user.profession || 'Profesyonel',
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isFollowing: user.isFollowing,
        followerCount: user.followerCount,
      }));
    }, [suggestedUsers]);

    // Local state for optimistic updates
    const [optimisticExperts, setOptimisticExperts] = useState<SuggestedExpert[]>([]);

    // Handle expert card press
    const handleExpertPress = useCallback(
      (userId: number) => {
        triggerNavigation('navigate');
        onExpertPress(userId);
      },
      [onExpertPress, triggerNavigation],
    );

    // Handle follow/unfollow toggle
    const handleFollowToggle = useCallback(
      (userId: number, currentFollowState: boolean) => {
        triggerSocial(currentFollowState ? 'unfollow' : 'follow');

        // Optimistic update
        setOptimisticExperts(prev =>
          prev.map(expert =>
            expert.id === userId ? { ...expert, isFollowing: !currentFollowState } : expert,
          ),
        );

        // Notify parent
        onFollowToggle(userId, !currentFollowState);
      },
      [onFollowToggle, triggerSocial],
    );

    // Use optimistic experts if available, otherwise use fetched experts
    const displayExperts = useMemo(() => {
      if (optimisticExperts.length > 0) {
        return optimisticExperts;
      }
      return experts;
    }, [optimisticExperts, experts]);

    // Update optimistic state when experts change
    React.useEffect(() => {
      if (experts.length > 0 && optimisticExperts.length === 0) {
        setOptimisticExperts(experts);
      }
    }, [experts, optimisticExperts.length]);

    // Loading state
    if (isLoading) {
      return (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.container}
          testID={`${testID}-loading`}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Takip Edebileceğin Uzmanlar
            </Text>
          </View>
          <View
            style={[
              styles.scrollViewContent,
              { justifyContent: 'center', alignItems: 'center', paddingVertical: 32 },
            ]}>
            <ActivityIndicator size="small" color={colors.interactive.default} />
          </View>
        </Animated.View>
      );
    }

    // Error or empty state - hide carousel
    if (isError || displayExperts.length === 0) {
      return null;
    }

    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container} testID={testID}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Takip Edebileceğin Uzmanlar
          </Text>
        </View>

        {/* Horizontal ScrollView */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={132} // 120px card + 12px margin
          decelerationRate="fast"
          contentContainerStyle={styles.scrollViewContent}
          style={styles.scrollView}
          accessibilityRole="list"
          accessibilityLabel="Önerilen uzmanlar listesi">
          {displayExperts.map(expert => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onPress={() => handleExpertPress(expert.id)}
              onFollowPress={() => handleFollowToggle(expert.id, expert.isFollowing)}
              testID={`expert-card-${expert.id}`}
            />
          ))}
        </ScrollView>
      </Animated.View>
    );
  },
);

SuggestedExpertsCarousel.displayName = 'SuggestedExpertsCarousel';

export default SuggestedExpertsCarousel;
