// src/shared/components/Card/Card.tsx
// Genel amaçlı kart komponenti
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART4.md

import React, { memo, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, shadows } from '@theme';

type CardVariant = 'elevated' | 'outlined' | 'filled';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  /**
   * Card content
   */
  children: ReactNode;
  /**
   * Visual variant of the card
   * @default 'elevated'
   */
  variant?: CardVariant;
  /**
   * Padding size
   * @default 'md'
   */
  padding?: CardPadding;
  /**
   * Callback when card is pressed (makes card interactive)
   */
  onPress?: () => void;
  /**
   * Disable card interactions
   */
  disabled?: boolean;
  /**
   * Additional container styles
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

const PADDING_VALUES: Record<CardPadding, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

/**
 * Card Component
 * 
 * General purpose container component with elevation, border, or filled variants.
 * Can be made interactive with onPress prop.
 * 
 * @example
 * ```tsx
 * // Elevated card (default)
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 * 
 * // Outlined card
 * <Card variant="outlined" padding="lg">
 *   <Text>Outlined card</Text>
 * </Card>
 * 
 * // Interactive card
 * <Card onPress={() => console.log('pressed')}>
 *   <Text>Clickable card</Text>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = memo(
  ({
    children,
    variant = 'elevated',
    padding = 'md',
    onPress,
    disabled = false,
    style,
    testID,
  }) => {
    const { theme } = useTheme();

    const getContainerStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        borderRadius: 12,
        padding: PADDING_VALUES[padding],
        backgroundColor: theme.colors.background.primary,
      };

      switch (variant) {
        case 'elevated':
          return {
            ...baseStyle,
            ...shadows.md,
          };
        case 'outlined':
          return {
            ...baseStyle,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
          };
        case 'filled':
          return {
            ...baseStyle,
            backgroundColor: theme.colors.background.secondary,
          };
        default:
          return baseStyle;
      }
    };

    if (onPress) {
      return (
        <TouchableOpacity
          style={[getContainerStyle(), style]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.7}
          testID={testID}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[getContainerStyle(), style]} testID={testID}>
        {children}
      </View>
    );
  },
);

Card.displayName = 'Card';
