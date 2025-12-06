// src/features/feed/components/FeedHeader.tsx
// Meslektaş Design System - Modern Feed Header
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';
import { useFeedStore } from '../stores';
import type { FeedFilter } from '../types';

// ============================================================================
// Types
// ============================================================================

interface FilterOption {
  key: FeedFilter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'following', label: 'Takip Ettiklerim' },
  { key: 'popular', label: 'Popüler' },
  { key: 'nearby', label: 'Yakınımdakiler' },
];

interface FeedHeaderProps {
  onCreatePress?: () => void;
}

// ============================================================================
// AnimatedPressable
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// FilterButton Component
// ============================================================================

interface FilterButtonProps {
  option: FilterOption;
  isActive: boolean;
  onPress: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = memo(({ option, isActive, onPress }) => {
  const colors = useColors();
  const { trigger } = useHaptic();
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    trigger('selection');
    scale.value = withSequence(withSpring(0.95, spring.press), withSpring(1, spring.snappy));
    onPress();
  }, [onPress, trigger, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.filterButton,
        {
          backgroundColor: isActive ? colors.interactive.default : 'transparent',
          borderWidth: isActive ? 0 : 1,
          borderColor: colors.border.default,
        },
        animatedStyle,
      ]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={option.label}>
      <Text
        style={[
          styles.filterLabel,
          { color: isActive ? colors.text.inverse : colors.text.secondary },
        ]}>
        {option.label}
      </Text>
    </AnimatedPressable>
  );
});

FilterButton.displayName = 'FilterButton';

// ============================================================================
// FeedHeader Component
// ============================================================================

/**
 * Modern FeedHeader Component
 *
 * Features:
 * - Animated filter buttons with spring physics
 * - Haptic feedback on selection
 * - Modern color tokens
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <FeedHeader onCreatePress={() => navigation.navigate('CreatePost')} />
 * ```
 */
export const FeedHeader: React.FC<FeedHeaderProps> = memo(({ onCreatePress }) => {
  const colors = useColors();
  const { trigger } = useHaptic();
  const filter = useFeedStore(state => state.filter);
  const setFilter = useFeedStore(state => state.setFilter);

  // Create button animation
  const createScale = useSharedValue(1);

  const handleCreatePress = useCallback(() => {
    trigger('medium');
    createScale.value = withSequence(withSpring(0.85, spring.press), withSpring(1, spring.snappy));
    onCreatePress?.();
  }, [onCreatePress, trigger, createScale]);

  const createAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createScale.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
          borderBottomColor: colors.border.default,
        },
      ]}>
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {FILTER_OPTIONS.map(option => (
            <FilterButton
              key={option.key}
              option={option}
              isActive={filter === option.key}
              onPress={() => setFilter(option.key)}
            />
          ))}
        </ScrollView>
      </View>

      {onCreatePress && (
        <AnimatedPressable
          style={[
            styles.createButton,
            { backgroundColor: colors.interactive.default },
            createAnimatedStyle,
          ]}
          onPress={handleCreatePress}
          accessibilityLabel="Yeni gönderi oluştur"
          accessibilityRole="button">
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600' }}>+</Text>
        </AnimatedPressable>
      )}
    </View>
  );
});

FeedHeader.displayName = 'FeedHeader';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filtersContainer: {
    flex: 1,
    marginRight: 12,
  },
  createButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 0,
    height: 40,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: 40,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
});

export default FeedHeader;
