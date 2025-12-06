// src/shared/components/Divider/Divider.tsx
// Meslektaş Design System - Modern Divider Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';

// ============================================================================
// Types
// ============================================================================

/** Divider orientation */
export type DividerOrientation = 'horizontal' | 'vertical';

/** Divider variant */
export type DividerVariant = 'fullWidth' | 'inset' | 'middle';

/** Divider spacing */
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

/** Divider props */
export interface DividerProps {
  /** Orientation */
  orientation?: DividerOrientation;
  /** Variant */
  variant?: DividerVariant;
  /** Thickness */
  thickness?: number;
  /** Color override */
  color?: string;
  /** Text label (for horizontal only) */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'center' | 'right';
  /** Custom style */
  style?: ViewStyle;
  /** Label style */
  labelStyle?: TextStyle;
  /** Spacing (margin) */
  spacing?: DividerSpacing;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SPACING_VALUES: Record<DividerSpacing, number> = {
  lg: spacing['6'],
  md: spacing['4'],
  none: 0,
  sm: spacing['2'],
};

// ============================================================================
// Divider Component
// ============================================================================

/**
 * Modern Divider Component
 *
 * Visual separator for content sections. Supports horizontal and vertical
 * orientations, with optional text labels for section titles.
 *
 * @example
 * ```tsx
 * // Basic horizontal divider
 * <Divider />
 *
 * // With label
 * <Divider label="Veya" labelPosition="center" />
 *
 * // Inset variant
 * <Divider variant="inset" />
 *
 * // Vertical divider
 * <Divider orientation="vertical" />
 * ```
 */
export const Divider = memo<DividerProps>(
  ({
    orientation = 'horizontal',
    variant = 'fullWidth',
    thickness = 1,
    color,
    label,
    labelPosition = 'center',
    style,
    labelStyle,
    spacing: spacingProp = 'md',
    testID,
  }) => {
    const colors = useColors();

    const dividerColor = color || colors.border.default;
    const spacingValue = SPACING_VALUES[spacingProp];

    // Variant-specific insets
    const inset = useMemo(() => {
      switch (variant) {
        case 'inset':
          return { left: spacing['6'] };
        case 'middle':
          return { left: spacing['4'], right: spacing['4'] };
        case 'fullWidth':
        default:
          return {};
      }
    }, [variant]);

    // Horizontal divider
    if (orientation === 'horizontal') {
      // With label
      if (label) {
        return (
          <View
            style={[styles.labelContainer, { marginVertical: spacingValue }, style]}
            testID={testID}
            accessibilityRole="separator">
            {(labelPosition === 'center' || labelPosition === 'right') && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: dividerColor,
                    flex: labelPosition === 'center' ? 1 : undefined,
                    height: thickness,
                    width: labelPosition === 'right' ? 40 : undefined,
                  },
                ]}
              />
            )}
            <Text style={[styles.label, { color: colors.text.secondary }, labelStyle]}>
              {label}
            </Text>
            {(labelPosition === 'center' || labelPosition === 'left') && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: dividerColor,
                    flex: labelPosition === 'center' ? 1 : undefined,
                    height: thickness,
                    width: labelPosition === 'left' ? 40 : undefined,
                  },
                ]}
              />
            )}
          </View>
        );
      }

      // Without label
      return (
        <View
          style={[
            styles.horizontal,
            {
              backgroundColor: dividerColor,
              height: thickness,
              marginLeft: inset.left,
              marginRight: inset.right,
              marginVertical: spacingValue,
            },
            style,
          ]}
          testID={testID}
          accessibilityRole="separator"
        />
      );
    }

    // Vertical divider
    return (
      <View
        style={[
          styles.vertical,
          {
            backgroundColor: dividerColor,
            marginHorizontal: spacingValue,
            width: thickness,
          },
          style,
        ]}
        testID={testID}
        accessibilityRole="separator"
      />
    );
  },
);

Divider.displayName = 'Divider';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    paddingHorizontal: spacing['4'],
  },
  labelContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  line: {
    flex: 1,
  },
  vertical: {
    alignSelf: 'stretch',
  },
});

export default Divider;
