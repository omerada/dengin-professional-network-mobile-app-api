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
import Icon from 'react-native-vector-icons/Ionicons';
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
  icon: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Tümü', icon: 'grid-outline' },
  { key: 'following', label: 'Takip', icon: 'people-outline' },
  { key: 'popular', label: 'Popüler', icon: 'flame-outline' },
  { key: 'nearby', label: 'Yakın', icon: 'location-outline' },
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
    scale.value = withSequence(withSpring(0.9, spring.press), withSpring(1, spring.snappy));
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
          backgroundColor: isActive ? colors.interactive.default : colors.background.secondary,
        },
        animatedStyle,
      ]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={option.label}>
      <Icon
        name={option.icon}
        size={18}
        color={isActive ? colors.text.inverse : colors.text.secondary}
      />
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
          <Icon name="add" size={26} color={colors.text.inverse} />
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
    paddingVertical: 14,
  },
  filtersContainer: {
    flex: 1,
    marginRight: 10,
  },
  createButton: {
    alignItems: 'center',
    borderRadius: 22,
    elevation: 2,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: 44,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  filters: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
});

export default FeedHeader;
