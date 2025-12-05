// src/features/feed/components/FeedHeader/index.tsx
// Meslektaş Design System - Modern FeedHeader Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';
import { useFeedStore } from '../../stores';
import type { FeedFilter } from '../../types';

import { styles } from './FeedHeader.styles';
import { FILTER_OPTIONS, type FeedHeaderProps, type FilterOption } from './FeedHeader.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern FeedHeader Component
 *
 * Features:
 * - Horizontal scrollable filter chips
 * - Animated filter selection
 * - Spring-based button animations
 * - Haptic feedback on interactions
 *
 * @example
 * ```tsx
 * <FeedHeader
 *   onCreatePress={() => navigation.navigate('CreatePost')}
 * />
 * ```
 */
export const FeedHeader: React.FC<FeedHeaderProps> = memo(({ onCreatePress, testID }) => {
  const colors = useColors();
  const { trigger } = useHaptic();

  // Store state
  const filter = useFeedStore(state => state.filter);
  const setFilter = useFeedStore(state => state.setFilter);

  // Create button animation
  const createScale = useSharedValue(1);

  const createAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createScale.value }],
  }));

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

  // Handle create press
  const handleCreatePress = useCallback(() => {
    trigger('light');
    createScale.value = withSpring(0.9, spring.press);
    setTimeout(() => {
      createScale.value = withSpring(1, spring.snappy);
    }, 100);
    onCreatePress?.();
  }, [onCreatePress, trigger, createScale]);

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
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {FILTER_OPTIONS.map((option, index) => renderFilterChip(option, index))}
      </ScrollView>

      {/* Create button */}
      {onCreatePress && (
        <AnimatedPressable
          style={[
            styles.createButton,
            { backgroundColor: colors.interactive.default },
            createAnimatedStyle,
          ]}
          onPress={handleCreatePress}
          accessibilityRole="button"
          accessibilityLabel="Yeni gönderi oluştur">
          <Icon name="add" size={24} color={colors.text.inverse} />
        </AnimatedPressable>
      )}
    </Animated.View>
  );
});

FeedHeader.displayName = 'FeedHeader';

export default FeedHeader;
