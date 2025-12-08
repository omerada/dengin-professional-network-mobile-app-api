// src/features/feed/components/AITrendInsightCard/AITrendInsightCard.tsx
// AI-powered profession-based trending topics card
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 797-810
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useAITrends } from '../../hooks/useAITrends';

import { styles } from './AITrendInsightCard.styles';
import type { AITrendInsightCardProps } from './AITrendInsightCard.types';

/**
 * AITrendInsightCard Component
 *
 * Displays AI-powered trending topics based on user's profession.
 *
 * Features:
 * - OpenRouter AI-generated trends (Turkish)
 * - Backend integration with TrendController
 * - Profession-based trend filtering
 * - 3 trending topics maximum
 * - Stagger animation for trend items
 * - Haptic feedback on interactions
 * - Loading and error states
 *
 * Backend:
 * - Endpoint: GET /api/trends/profession/{category}
 * - AI Model: OpenRouter (gpt-4o-mini)
 * - Cache: 1 hour per profession
 * - Fallback: Static Turkish trends
 *
 * Replaces: mockTrends.ts (getTrendsByProfession)
 *
 * Design Spec: MOBILE-APP-HOME-SCREEN.md Lines 797-810
 *
 * @example
 * ```tsx
 * <AITrendInsightCard
 *   professionCategory="MEDICAL"
 *   onTrendPress={(id) => navigateToTrend(id)}
 *   onMorePress={() => navigateToTrends()}
 * />
 * ```
 */
export const AITrendInsightCard: React.FC<AITrendInsightCardProps> = memo(
  ({ professionCategory, onTrendPress, onMorePress, testID = 'ai-trend-insight-card' }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    // Fetch AI trends from backend
    const { data: trends, isLoading, isError } = useAITrends(professionCategory);

    // Get profession name for title
    const professionName = useMemo(() => {
      if (!professionCategory) return null;

      const categoryNames: Record<string, string> = {
        MEDICAL: 'Sağlık',
        LEGAL: 'Hukuk',
        ENGINEERING: 'Mühendislik',
        EDUCATION: 'Eğitim',
        SERVICE: 'Hizmet',
        CREATIVE: 'Sanat',
        BUSINESS: 'İş',
        OTHER: 'Genel',
      };

      return categoryNames[professionCategory] || professionCategory;
    }, [professionCategory]);

    // Title with profession name
    const cardTitle = useMemo(() => {
      if (professionName) {
        return `Bu Hafta ${professionName}'de Trend`;
      }
      return 'Bu Haftanın Trendleri';
    }, [professionName]);

    // Handle trend item press
    const handleTrendPress = useCallback(
      (trendId: string) => {
        trigger('light');
        onTrendPress?.(trendId);
      },
      [onTrendPress, trigger],
    );

    // Handle "Daha Fazla Gör" press
    const handleMorePress = useCallback(() => {
      trigger('light');
      onMorePress?.();
    }, [onMorePress, trigger]);

    // Don't render if no profession category
    if (!professionCategory) {
      return null;
    }

    // Loading state
    if (isLoading) {
      return (
        <Animated.View
          entering={FadeIn.duration(400).delay(100)}
          style={[
            styles.container,
            {
              backgroundColor: colors.background.elevated,
              borderColor: colors.border.default,
            },
          ]}
          testID={`${testID}-loading`}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.interactive.default} />
            <Text style={[styles.loadingText, { color: colors.text.tertiary }]}>
              AI trendleri yükleniyor...
            </Text>
          </View>
        </Animated.View>
      );
    }

    // Error state - hide card silently
    if (isError || !trends || trends.length === 0) {
      return null;
    }

    return (
      <Animated.View
        entering={FadeIn.duration(400).delay(100)}
        style={[
          styles.container,
          {
            backgroundColor: colors.background.elevated,
            borderColor: colors.border.default,
          },
        ]}
        testID={testID}>
        {/* Header */}
        <View style={styles.header}>
          <Icon
            name="bulb-outline"
            size={28}
            color={colors.interactive.default}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: colors.text.primary }]}>{cardTitle}</Text>
        </View>

        {/* Trend List */}
        <View style={styles.trendList}>
          {trends.map((trend, index) => (
            <Animated.View
              key={trend.id}
              entering={FadeInDown.duration(300).delay(100 + index * 50)}>
              <Pressable
                style={styles.trendItem}
                onPress={() => handleTrendPress(trend.id)}
                accessibilityRole="button"
                accessibilityLabel={`${index + 1}. ${trend.title}`}>
                <Text style={[styles.trendNumber, { color: colors.interactive.default }]}>
                  {index + 1}.
                </Text>
                <Text style={[styles.trendText, { color: colors.text.primary }]} numberOfLines={2}>
                  {trend.title}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* More Button */}
        {onMorePress && (
          <Pressable
            style={styles.moreButton}
            onPress={handleMorePress}
            accessibilityRole="button"
            accessibilityLabel="Daha fazla trend gör">
            <Text style={[styles.moreButtonText, { color: colors.interactive.default }]}>
              Daha Fazla Gör →
            </Text>
          </Pressable>
        )}
      </Animated.View>
    );
  },
);

AITrendInsightCard.displayName = 'AITrendInsightCard';

export default AITrendInsightCard;
