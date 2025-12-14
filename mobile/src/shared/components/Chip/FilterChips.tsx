// src/shared/components/Chip/FilterChips.tsx
// Production-ready FilterChips component for search and filtering UX
// Oku: UX-FLOW-IYILESTIRME-PLANI.md - Phase 3

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Chip, ChipProps } from './Chip';

// ============================================================================
// Types
// ============================================================================

export interface FilterChip {
  /** Unique identifier */
  id: string;
  /** Chip label */
  label: string;
  /** Selected state */
  selected?: boolean;
  /** Icon name */
  icon?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom value for filtering */
  value?: any;
}

export interface FilterChipsProps {
  /** Array of filter chips */
  chips: FilterChip[];
  /** Selection change callback */
  onSelectionChange: (selectedIds: string[]) => void;
  /** Whether to allow multiple selections */
  multiSelect?: boolean;
  /** Show clear all button when selections exist */
  showClearButton?: boolean;
  /** Clear all button label */
  clearButtonLabel?: string;
  /** Chip size */
  size?: ChipProps['size'];
  /** Chip variant */
  variant?: ChipProps['variant'];
  /** Container style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FilterChips - Horizontal scrollable filter chips for search and filtering
 *
 * @example
 * ```tsx
 * const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
 *
 * <FilterChips
 *   chips={[
 *     { id: '1', label: 'React Native', icon: 'logo-react' },
 *     { id: '2', label: 'TypeScript', icon: 'logo-javascript' },
 *     { id: '3', label: 'Mobile', icon: 'phone-portrait-outline' },
 *   ]}
 *   onSelectionChange={setSelectedFilters}
 *   multiSelect
 *   showClearButton
 * />
 * ```
 */
export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  onSelectionChange,
  multiSelect = false,
  showClearButton = true,
  clearButtonLabel = 'Temizle',
  size = 'md',
  variant = 'outlined',
  style,
  testID,
}) => {
  // Get currently selected chip IDs
  const selectedIds = chips.filter(chip => chip.selected).map(chip => chip.id);
  const hasSelections = selectedIds.length > 0;

  // Handle chip press
  const handleChipPress = useCallback(
    (chipId: string) => {
      let newSelectedIds: string[];

      if (multiSelect) {
        // Multi-select: toggle selection
        if (selectedIds.includes(chipId)) {
          newSelectedIds = selectedIds.filter(id => id !== chipId);
        } else {
          newSelectedIds = [...selectedIds, chipId];
        }
      } else {
        // Single select: replace selection
        newSelectedIds = selectedIds.includes(chipId) ? [] : [chipId];
      }

      onSelectionChange(newSelectedIds);
    },
    [selectedIds, multiSelect, onSelectionChange],
  );

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {chips.map((chip, index) => (
          <Animated.View
            key={chip.id}
            entering={FadeInRight.delay(index * 50).duration(300)}
            exiting={FadeOutLeft.duration(200)}
            style={styles.chipWrapper}>
            <Chip
              label={chip.label}
              selected={chip.selected}
              disabled={chip.disabled}
              leftIcon={chip.icon}
              size={size}
              variant={variant}
              color={chip.selected ? 'primary' : 'neutral'}
              onPress={() => handleChipPress(chip.id)}
              animated
            />
          </Animated.View>
        ))}

        {/* Clear button */}
        {showClearButton && hasSelections && (
          <Animated.View
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(200)}
            style={styles.chipWrapper}>
            <Chip
              label={clearButtonLabel}
              leftIcon="close-circle-outline"
              size={size}
              variant="soft"
              color="error"
              onPress={handleClearAll}
              animated
            />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipWrapper: {
    marginRight: 8,
  },
});
