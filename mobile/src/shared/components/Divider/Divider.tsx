// src/shared/components/Divider/Divider.tsx
// Divider bileşeni - Görsel ayırıcı
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';

/**
 * Divider orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Divider variant
 */
export type DividerVariant = 'fullWidth' | 'inset' | 'middle';

/**
 * Divider props
 */
interface DividerProps {
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
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Test ID */
  testID?: string;
}

/**
 * Divider component
 *
 * Visual separator for content sections. Supports horizontal and vertical
 * orientations, with optional text labels for section titles.
 */
export const Divider = React.memo<DividerProps>(
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
    const { theme } = useTheme();

    const dividerColor = color || theme.colors.border.light;

    // Spacing values
    const spacingValues = {
      none: 0,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    };

    const spacingValue = spacingValues[spacingProp];

    // Variant-specific insets
    const getInset = (): { left?: number; right?: number } => {
      switch (variant) {
        case 'inset':
          return { left: spacing.xl };
        case 'middle':
          return { left: spacing.lg, right: spacing.lg };
        case 'fullWidth':
        default:
          return {};
      }
    };

    const inset = getInset();

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
                    height: thickness,
                    flex: labelPosition === 'center' ? 1 : undefined,
                    width: labelPosition === 'right' ? 40 : undefined,
                  },
                ]}
              />
            )}
            <Text style={[styles.label, { color: theme.colors.text.secondary }, labelStyle]}>
              {label}
            </Text>
            {(labelPosition === 'center' || labelPosition === 'left') && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: dividerColor,
                    height: thickness,
                    flex: labelPosition === 'center' ? 1 : undefined,
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
              marginVertical: spacingValue,
              marginLeft: inset.left,
              marginRight: inset.right,
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
            width: thickness,
            marginHorizontal: spacingValue,
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

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    alignSelf: 'stretch',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
  },
});

export default Divider;
