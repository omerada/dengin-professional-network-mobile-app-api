// src/shared/components/Badge/Badge.tsx
// Dengin Design System - Modern Badge Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useEffect, useMemo } from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { useTheme } from '@contexts/ThemeContext';

// ============================================================================
// Types
// ============================================================================

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Number to display in the badge */
  count?: number;
  /** Maximum count to display (shows "99+" if exceeded) */
  maxCount?: number;
  /** Color variant of the badge */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Show as dot instead of count */
  dot?: boolean;
  /** Animate count changes */
  animated?: boolean;
  /** Pulse animation for attention */
  pulse?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional text styles */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SIZES: Record<
  BadgeSize,
  { minWidth: number; height: number; fontSize: number; padding: number }
> = {
  sm: { minWidth: 16, height: 16, fontSize: 10, padding: 4 },
  md: { minWidth: 20, height: 20, fontSize: 11, padding: 5 },
  lg: { minWidth: 24, height: 24, fontSize: 12, padding: 6 },
};

// ============================================================================
// Badge Component
// ============================================================================

/**
 * Modern Badge Component
 *
 * Features:
 * - Animated count changes with spring physics
 * - Pulse animation for attention
 * - Multiple variants and sizes
 * - Dot mode for simple indicators
 * - Theme-aware colors
 *
 * @example
 * ```tsx
 * // With count
 * <Badge count={5} variant="error" />
 *
 * // With max count
 * <Badge count={150} maxCount={99} /> // Shows "99+"
 *
 * // With pulse animation
 * <Badge count={3} pulse variant="error" />
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
    animated = true,
    pulse = false,
    style,
    textStyle,
    testID,
  }) => {
    const { colors } = useTheme();
    const sizeConfig = SIZES[size];

    // Animation values
    const scale = useSharedValue(1);
    const pulseScale = useSharedValue(1);

    // Get background color based on variant
    const backgroundColor = useMemo(() => {
      switch (variant) {
        case 'primary':
          return colors.interactive.default;
        case 'secondary':
          return colors.background.tertiary;
        case 'success':
          return colors.status.success;
        case 'warning':
          return colors.status.warning;
        case 'error':
          return colors.status.error;
        case 'info':
          return colors.status.info;
        default:
          return colors.interactive.default;
      }
    }, [variant, colors]);

    // Animate on count change
    useEffect(() => {
      if (animated && count !== undefined && count > 0) {
        scale.value = withSequence(
          withSpring(1.3, { damping: 8, stiffness: 400 }),
          withSpring(1, { damping: 12, stiffness: 200 }),
        );
      }
    }, [count, animated, scale]);

    // Pulse animation
    useEffect(() => {
      if (pulse) {
        const interval = setInterval(() => {
          pulseScale.value = withSequence(
            withTiming(1.15, { duration: 200 }),
            withTiming(1, { duration: 200 }),
          );
        }, 2000);

        return () => clearInterval(interval);
      }
      return undefined;
    }, [pulse, pulseScale]);

    // Animated styles
    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value * pulseScale.value }],
    }));

    // Dot mode
    if (dot) {
      return (
        <Animated.View
          entering={ZoomIn.springify()}
          exiting={ZoomOut.springify()}
          style={[
            styles.dot,
            {
              width: sizeConfig.height / 2,
              height: sizeConfig.height / 2,
              borderRadius: sizeConfig.height / 4,
              backgroundColor,
            },
            animatedContainerStyle,
            style,
          ]}
          testID={testID}
          accessible
          accessibilityRole="text"
          accessibilityLabel="Yeni bildirim"
        />
      );
    }

    // No count or zero
    if (count === undefined || count === 0) {
      return null;
    }

    const displayText = count > maxCount ? `${maxCount}+` : count.toString();

    return (
      <Animated.View
        entering={ZoomIn.springify()}
        exiting={ZoomOut.springify()}
        style={[
          styles.container,
          {
            minWidth: sizeConfig.minWidth,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.padding,
            borderRadius: sizeConfig.height / 2,
            backgroundColor,
          },
          animatedContainerStyle,
          style,
        ]}
        testID={testID}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${count} bildirim`}>
        <Text style={[styles.text, { fontSize: sizeConfig.fontSize }, textStyle]}>
          {displayText}
        </Text>
      </Animated.View>
    );
  },
);

Badge.displayName = 'Badge';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Badge;
