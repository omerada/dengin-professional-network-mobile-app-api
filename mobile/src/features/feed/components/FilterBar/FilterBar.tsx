// src/features/feed/components/FilterBar/FilterBar.tsx
// Feed Filter Bar - Horizontal scrollable filter chips
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 690-706

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useFeedStore } from '../../stores';
import type { FeedFilter } from '../../types';

import { styles } from './FilterBar.styles';
import type { FilterBarProps, FilterOption } from './FilterBar.types';

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Tümü', icon: 'grid-outline' },
  { key: 'following', label: 'Takip', icon: 'people-outline' },
  { key: 'popular', label: 'Popüler', icon: 'flame-outline' },
];

/**
 * FilterBar Component
 *
 * Horizontal scrollable filter chips for feed filtering.
 * Separated from FeedHeader as per MOBILE-APP-HOME-SCREEN.md design.
 *
 * Features:
 * - Horizontal scroll
 * - Animated selection
 * - Haptic feedback
 * - Active state highlight
 */
export const FilterBar: React.FC<FilterBarProps> = memo(({ testID }) => {
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
      <View style={styles.filtersContainer}>
        {FILTER_OPTIONS.map((option, index) => renderFilterChip(option, index))}
      </View>
    </Animated.View>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;
