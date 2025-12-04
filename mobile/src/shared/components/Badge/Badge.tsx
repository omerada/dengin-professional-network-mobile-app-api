// src/shared/components/Badge/Badge.tsx
// Bildirim/sayı badge komponenti
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART4.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  /**
   * Number to display in the badge
   */
  count?: number;
  /**
   * Maximum count to display (shows "99+" if exceeded)
   * @default 99
   */
  maxCount?: number;
  /**
   * Color variant of the badge
   * @default 'primary'
   */
  variant?: BadgeVariant;
  /**
   * Size of the badge
   * @default 'md'
   */
  size?: BadgeSize;
  /**
   * Show as dot instead of count
   */
  dot?: boolean;
  /**
   * Additional container styles
   */
  style?: ViewStyle;
  /**
   * Additional text styles
   */
  textStyle?: TextStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

const SIZES: Record<BadgeSize, { minWidth: number; height: number; fontSize: number; padding: number }> = {
  sm: { minWidth: 16, height: 16, fontSize: 10, padding: 4 },
  md: { minWidth: 20, height: 20, fontSize: 11, padding: 5 },
  lg: { minWidth: 24, height: 24, fontSize: 12, padding: 6 },
};

/**
 * Badge Component
 * 
 * Displays notification counts, status indicators, or simple dots.
 * Commonly used for unread message counts, notification badges.
 * 
 * @example
 * ```tsx
 * // With count
 * <Badge count={5} variant="error" />
 * 
 * // With max count
 * <Badge count={150} maxCount={99} /> // Shows "99+"
 * 
 * // As dot indicator
 * <Badge dot variant="success" />
 * ```
 */
export const Badge: React.FC<BadgeProps> = memo(
  ({
    count,
    maxCount = 99,
    variant = 'primary',
    size = 'md',
    dot = false,
    style,
    textStyle,
    testID,
  }) => {
    const { theme } = useTheme();
    const sizeConfig = SIZES[size];

    const getBackgroundColor = (): string => {
      switch (variant) {
        case 'primary':
          return theme.colors.primary[500];
        case 'secondary':
          return theme.colors.secondary[500];
        case 'success':
          return theme.colors.success.main;
        case 'warning':
          return theme.colors.warning.main;
        case 'error':
          return theme.colors.error.main;
        case 'info':
          return theme.colors.info.main;
        default:
          return theme.colors.primary[500];
      }
    };

    // Dot mode
    if (dot) {
      return (
        <View
          style={[
            styles.dot,
            {
              width: sizeConfig.height / 2,
              height: sizeConfig.height / 2,
              borderRadius: sizeConfig.height / 4,
              backgroundColor: getBackgroundColor(),
            },
            style,
          ]}
          testID={testID}
        />
      );
    }

    // No count or zero
    if (count === undefined || count === 0) {
      return null;
    }

    const displayText = count > maxCount ? `${maxCount}+` : count.toString();

    return (
      <View
        style={[
          styles.container,
          {
            minWidth: sizeConfig.minWidth,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.padding,
            borderRadius: sizeConfig.height / 2,
            backgroundColor: getBackgroundColor(),
          },
          style,
        ]}
        testID={testID}
        accessibilityLabel={`${count} bildirim`}
      >
        <Text style={[styles.text, { fontSize: sizeConfig.fontSize }, textStyle]}>
          {displayText}
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  dot: {},
});

Badge.displayName = 'Badge';
