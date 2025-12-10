// src/features/feed/components/FeedHeader/index.tsx
// Meslektaş Design System - Modern FeedHeader Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useFeedStore } from '../../stores';
import type { FeedFilter } from '../../types';

import { styles } from './FeedHeader.styles';
import { FILTER_OPTIONS, type FeedHeaderProps, type FilterOption } from './FeedHeader.types';
import { ProfessionIcon } from './ProfessionIcon';

/**
 * Modern FeedHeader Component
 *
 * Features:
 * - Sector icon (left side, dynamic & colorful) - Updated from profession to sector (Sprint 1)
 * - Horizontal scrollable filter chips
 * - Animated filter selection
 * - Spring-based button animations
 * - Haptic feedback on interactions
 *
 * @example
 * ```tsx
 * <FeedHeader
 *   sector={{ name: 'Sağlık', code: 'MEDICAL' }}
 *   onSectorPress={() => navigation.navigate('SectorDetail')}
 *   onCreatePress={() => navigation.navigate('CreatePost')}
 * />
 * ```
 */
export const FeedHeader: React.FC<FeedHeaderProps> = memo(
  ({ sector, profession, onSectorPress, onProfessionPress, testID }) => {
    // Backward compatibility: use profession if sector not provided
    const displaySector = sector || profession;
    const handleSectorPress = onSectorPress || onProfessionPress;
    const colors = useColors();
    const { trigger } = useHaptic();

    // Store state
    const filter = useFeedStore(state => state.filter);
    const setFilter = useFeedStore(state => state.setFilter);

    // Handle filter press
    const handleFilterPress = useCallback(
      (filterKey: FeedFilter) => {
        if (filterKey !== filter) {
          trigger('selection');
          setFilter(filterKey);
        }
      },
      [filter, setFilter, trigger],
    );

    // Render filter chip
    const renderFilterChip = useCallback(
      (option: FilterOption, index: number) => {
        const isActive = filter === option.key;

        return (
          <Animated.View key={option.key} entering={FadeIn.delay(index * 50).duration(200)}>
            <Pressable
              style={[
                styles.filterButton,
                {
                  backgroundColor: isActive
                    ? colors.interactive.default
                    : colors.background.secondary,
                },
              ]}
              onPress={() => handleFilterPress(option.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${option.label} filtresi`}>
              <Icon
                name={option.icon}
                size={16}
                color={isActive ? colors.text.inverse : colors.text.secondary}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterLabel,
                  { color: isActive ? colors.text.inverse : colors.text.secondary },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          </Animated.View>
        );
      },
      [filter, colors, handleFilterPress],
    );

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.container,
          {
            backgroundColor: colors.background.primary,
            borderBottomColor: colors.border.subtle,
          },
        ]}
        testID={testID}>
        {/* Sector icon - Updated from profession icon (Sprint 1) */}
        {displaySector && (
          <ProfessionIcon
            category={displaySector.code as any}
            name={displaySector.name}
            onPress={handleSectorPress}
            testID={`${testID}-sector-icon`}
          />
        )}

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {FILTER_OPTIONS.map((option, index) => renderFilterChip(option, index))}
        </ScrollView>
      </Animated.View>
    );
  },
);

FeedHeader.displayName = 'FeedHeader';

export type { FeedHeaderProps, SectorInfo, ProfessionInfo } from './FeedHeader.types';
export default FeedHeader;
