// src/features/feed/components/SuggestedExpertsCarousel/SuggestedExpertsCarousel.tsx
// Horizontal scrollable carousel of suggested experts
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 419, 1971-1987
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

import React, { memo, useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';

import { ExpertCard } from './ExpertCard';
import { styles } from './SuggestedExpertsCarousel.styles';
import type {
  SuggestedExpertsCarouselProps,
  SuggestedExpert,
} from './SuggestedExpertsCarousel.types';
import { MOCK_SUGGESTED_EXPERTS } from './mockExperts';

/**
 * SuggestedExpertsCarousel Component
 *
 * Horizontal scrollable carousel showing suggested experts to follow.
 *
 * Features:
 * - Horizontal ScrollView with snap to interval
 * - 5-10 suggested experts
 * - Expert cards (120px width, 140px height)
 * - Follow/Unfollow optimistic update
 * - Haptic feedback on interactions
 * - Smooth horizontal scroll
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
    const { trigger } = useHaptic();

    // Local state for optimistic updates
    const [experts, setExperts] = useState<SuggestedExpert[]>(MOCK_SUGGESTED_EXPERTS);

    // Handle expert card press
    const handleExpertPress = useCallback(
      (userId: number) => {
        trigger('light');
        onExpertPress(userId);
      },
      [onExpertPress, trigger],
    );

    // Handle follow/unfollow toggle
    const handleFollowToggle = useCallback(
      (userId: number, currentFollowState: boolean) => {
        trigger('medium');

        // Optimistic update
        setExperts(prev =>
          prev.map(expert =>
            expert.id === userId ? { ...expert, isFollowing: !currentFollowState } : expert,
          ),
        );

        // Notify parent
        onFollowToggle(userId, !currentFollowState);
      },
      [onFollowToggle, trigger],
    );

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
          {experts.map(expert => (
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
