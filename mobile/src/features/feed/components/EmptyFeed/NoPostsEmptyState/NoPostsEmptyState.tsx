// src/features/feed/components/EmptyFeed/NoPostsEmptyState/NoPostsEmptyState.tsx
// No posts empty state with AI seed content
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1634-1657
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 412-455

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';

import { styles } from './NoPostsEmptyState.styles';
import type { NoPostsEmptyStateProps } from './NoPostsEmptyState.types';
import { getTrendsByProfession } from './NoPostsEmptyState.types';

/**
 * NoPostsEmptyState Component
 *
 * Displays AI-powered seed content when user follows people but no posts yet.
 *
 * Features:
 * - Conditional rendering (posts.length === 0 && user.followingCount > 0)
 * - AI seed content: 2 trending topics based on profession
 * - CTA buttons: "Trendleri Keşfet" (primary), "İlk Paylaşımını Yap" (secondary)
 * - Haptic feedback on interactions
 * - Stagger animations (FadeIn + FadeInDown)
 *
 * Design Spec: MOBILE-APP-HOME-SCREEN.md Lines 1634-1657
 *
 * @example
 * ```tsx
 * const handleExploreTrends = () => {
 *   navigation.navigate('Discover', { tab: 'trends' });
 * };
 *
 * const handleCreatePost = () => {
 *   navigation.navigate('CreatePost');
 * };
 *
 * {posts.length === 0 && user.followingCount > 0 && (
 *   <NoPostsEmptyState
 *     profession={user.profession}
 *     onExploreTrends={handleExploreTrends}
 *     onCreatePost={handleCreatePost}
 *   />
 * )}
 * ```
 */
export const NoPostsEmptyState: React.FC<NoPostsEmptyStateProps> = memo(
  ({ profession, onExploreTrends, onCreatePost, testID = 'no-posts-empty-state' }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    // Get AI-powered trends based on profession
    const trends = useMemo(() => getTrendsByProfession(profession), [profession]);

    // Handle explore trends press
    const handleExplorePress = useCallback(() => {
      trigger('medium');
      onExploreTrends();
    }, [onExploreTrends, trigger]);

    // Handle create post press
    const handleCreatePostPress = useCallback(() => {
      trigger('medium');
      onCreatePost?.();
    }, [onCreatePost, trigger]);

    // Handle trend card press
    const handleTrendPress = useCallback(
      (trendId: string) => {
        trigger('light');
        // TODO: Navigate to trend details or search
        console.log(`Trend pressed: ${trendId}`);
      },
      [trigger],
    );

    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container} testID={testID}>
        {/* Newspaper Icon */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.iconContainer}>
          <Icon name="newspaper-outline" size={80} color={colors.interactive.default} />
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.title, { color: colors.text.primary }]}>
          Takip Ettiklerin Henüz Gönderi Paylaşmadı
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.subtitle, { color: colors.text.secondary }]}>
          AI-powered önerilerle ilginizi çekebilecek içerikleri keşfedin
        </Animated.Text>

        {/* AI Seed Content: Trending Topics */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.trendsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
            Senin için önerilen trendler
          </Text>

          {trends.map((trend, index) => (
            <Animated.View
              key={trend.id}
              entering={FadeInDown.delay(450 + index * 50).duration(400)}>
              <Pressable
                style={[
                  styles.trendCard,
                  {
                    borderColor: colors.border.default,
                    backgroundColor: colors.background.elevated,
                  },
                ]}
                onPress={() => handleTrendPress(trend.id)}
                accessibilityRole="button"
                accessibilityLabel={`${trend.title}, ${trend.category} kategorisi`}
                accessibilityHint="Trend detaylarını görmek için dokun">
                {/* Trend Icon */}
                <View
                  style={[
                    styles.trendIconContainer,
                    { backgroundColor: colors.background.tertiary },
                  ]}>
                  <Icon name={trend.icon as any} size={20} color={colors.interactive.default} />
                </View>

                {/* Trend Info */}
                <View style={styles.trendInfo}>
                  <Text style={[styles.trendTitle, { color: colors.text.primary }]}>
                    {trend.title}
                  </Text>
                  <Text style={[styles.trendCategory, { color: colors.text.secondary }]}>
                    {trend.category}
                  </Text>
                </View>

                {/* Arrow */}
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.trendArrow}
                />
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        {/* CTA Buttons */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          style={styles.ctaButtonsContainer}>
          {/* Primary Button: Trendleri Keşfet */}
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.interactive.default }]}
            onPress={handleExplorePress}
            accessibilityRole="button"
            accessibilityLabel="Trendleri keşfet"
            accessibilityHint="Trend sayfasına git">
            <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>
              Trendleri Keşfet
            </Text>
          </Pressable>

          {/* Secondary Button: İlk Paylaşımını Yap */}
          {onCreatePost && (
            <Pressable
              style={[styles.secondaryButton, { borderColor: colors.border.default }]}
              onPress={handleCreatePostPress}
              accessibilityRole="button"
              accessibilityLabel="İlk paylaşımını yap"
              accessibilityHint="Gönderi oluşturma ekranına git">
              <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>
                İlk Paylaşımını Yap
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>
    );
  },
);

NoPostsEmptyState.displayName = 'NoPostsEmptyState';

export default NoPostsEmptyState;
