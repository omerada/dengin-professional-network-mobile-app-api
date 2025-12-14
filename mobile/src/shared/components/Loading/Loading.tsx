// src/shared/components/Loading/Loading.tsx
// Dengin Design System - Modern Loading Components
// Oku: mobile-development-guide/ui-ux-modernization/17-LOADING-STATES.md

import React, { memo, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, borderRadius } from '@theme';

// ============================================================================
// Types
// ============================================================================

/**
 * Loading component props
 */
interface LoadingProps {
  /** Size of the loading indicator */
  size?: 'small' | 'medium' | 'large';
  /** Optional message to display */
  message?: string;
  /** Full screen mode */
  fullScreen?: boolean;
  /** Custom color for indicator */
  color?: string;
  /** Loading variant */
  variant?: 'spinner' | 'dots' | 'pulse';
  /** Container style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Dots Loading Props
 */
interface DotsLoadingProps {
  /** Color of the dots */
  color?: string;
  /** Size of the dots */
  dotSize?: number;
  /** Number of dots */
  dotCount?: number;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Test ID */
  testID?: string;
}

/**
 * Spinner Props
 */
interface SpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Color of the spinner */
  color?: string;
  /** Track color */
  trackColor?: string;
  /** Animation duration in ms */
  duration?: number;
  /** Test ID */
  testID?: string;
}

// Size configurations
const SIZE_CONFIG = {
  small: { indicator: 'small' as const, fontSize: 12, dotSize: 6 },
  medium: { indicator: 'small' as const, fontSize: 14, dotSize: 8 },
  large: { indicator: 'large' as const, fontSize: 16, dotSize: 10 },
} as const;

// ============================================================================
// Spinner Component
// ============================================================================

/**
 * Modern Spinner Component
 * Custom animated spinner with smooth rotation
 */
export const Spinner = memo<SpinnerProps>(
  ({ size = 'medium', color, trackColor, duration = 1000, testID }) => {
    const { colors } = useTheme();
    const rotation = useSharedValue(0);

    const spinnerColor = color ?? colors.interactive.default;
    const spinnerTrackColor = trackColor ?? colors.border.subtle;
    const spinnerSize = size === 'small' ? 20 : size === 'large' ? 40 : 28;

    useEffect(() => {
      rotation.value = withRepeat(
        withTiming(360, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      );

      return () => {
        cancelAnimation(rotation);
      };
    }, [duration, rotation]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
      <View
        testID={testID}
        style={[styles.spinnerContainer, { width: spinnerSize, height: spinnerSize }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Yükleniyor">
        {/* Track */}
        <View
          style={[
            styles.spinnerTrack,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: spinnerSize / 2,
              borderColor: spinnerTrackColor,
              borderWidth: spinnerSize * 0.1,
            },
          ]}
        />
        {/* Animated arc */}
        <Animated.View
          style={[
            styles.spinnerArc,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: spinnerSize / 2,
              borderColor: spinnerColor,
              borderWidth: spinnerSize * 0.1,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
            },
            animatedStyle,
          ]}
        />
      </View>
    );
  },
);

Spinner.displayName = 'Spinner';

// ============================================================================
// Dots Loading Component
// ============================================================================

/**
 * Modern Dots Loading Component
 * Animated bouncing dots indicator
 */
export const DotsLoading = memo<DotsLoadingProps>(
  ({ color, dotSize = 8, dotCount = 3, animationDuration = 600, testID }) => {
    const { colors } = useTheme();
    const dotColor = color ?? colors.interactive.default;

    // Create animation values for each dot
    const dot1 = useSharedValue(0);
    const dot2 = useSharedValue(0);
    const dot3 = useSharedValue(0);

    useEffect(() => {
      const staggerDelay = animationDuration / 3;

      dot1.value = withRepeat(
        withSequence(
          withSpring(1, { damping: 6, stiffness: 200 }),
          withSpring(0, { damping: 6, stiffness: 200 }),
        ),
        -1,
        false,
      );

      const timer1 = setTimeout(() => {
        dot2.value = withRepeat(
          withSequence(
            withSpring(1, { damping: 6, stiffness: 200 }),
            withSpring(0, { damping: 6, stiffness: 200 }),
          ),
          -1,
          false,
        );
      }, staggerDelay);

      const timer2 = setTimeout(() => {
        dot3.value = withRepeat(
          withSequence(
            withSpring(1, { damping: 6, stiffness: 200 }),
            withSpring(0, { damping: 6, stiffness: 200 }),
          ),
          -1,
          false,
        );
      }, staggerDelay * 2);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        cancelAnimation(dot1);
        cancelAnimation(dot2);
        cancelAnimation(dot3);
      };
    }, [animationDuration, dot1, dot2, dot3]);

    const animatedStyle1 = useAnimatedStyle(() => ({
      transform: [{ translateY: interpolate(dot1.value, [0, 1], [0, -dotSize]) }],
      opacity: interpolate(dot1.value, [0, 1], [0.4, 1]),
    }));

    const animatedStyle2 = useAnimatedStyle(() => ({
      transform: [{ translateY: interpolate(dot2.value, [0, 1], [0, -dotSize]) }],
      opacity: interpolate(dot2.value, [0, 1], [0.4, 1]),
    }));

    const animatedStyle3 = useAnimatedStyle(() => ({
      transform: [{ translateY: interpolate(dot3.value, [0, 1], [0, -dotSize]) }],
      opacity: interpolate(dot3.value, [0, 1], [0.4, 1]),
    }));

    const dotStyles = [animatedStyle1, animatedStyle2, animatedStyle3];

    return (
      <View
        testID={testID}
        style={styles.dotsContainer}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Yükleniyor">
        {Array.from({ length: Math.min(dotCount, 3) }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
                marginHorizontal: dotSize / 3,
              },
              dotStyles[index],
            ]}
          />
        ))}
      </View>
    );
  },
);

DotsLoading.displayName = 'DotsLoading';

// ============================================================================
// Loading Component
// ============================================================================

/**
 * Modern Loading Component
 *
 * Features:
 * - Multiple variants (spinner, dots, pulse)
 * - Animated transitions
 * - Full screen mode
 * - Optional message display
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Loading />
 *
 * // With message
 * <Loading message="Yükleniyor..." variant="dots" />
 *
 * // Full screen
 * <Loading fullScreen message="Lütfen bekleyin" />
 * ```
 */
export const Loading = memo<LoadingProps>(
  ({ size = 'large', message, fullScreen = false, color, variant = 'spinner', style, testID }) => {
    const { colors } = useTheme();
    const sizeConfig = SIZE_CONFIG[size];
    const indicatorColor = color ?? colors.interactive.default;

    const containerStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing['4'],
      ...(fullScreen && {
        flex: 1,
        backgroundColor: colors.background.primary,
      }),
    };

    const renderIndicator = useCallback(() => {
      switch (variant) {
        case 'dots':
          return <DotsLoading color={indicatorColor} dotSize={sizeConfig.dotSize} />;
        case 'pulse':
          return <Spinner size={size} color={indicatorColor} duration={800} />;
        case 'spinner':
        default:
          return <ActivityIndicator size={sizeConfig.indicator} color={indicatorColor} />;
      }
    }, [variant, indicatorColor, sizeConfig, size]);

    return (
      <View
        testID={testID}
        style={[containerStyle, style]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={message || 'Yükleniyor'}>
        {renderIndicator()}
        {message && (
          <Text
            style={[
              styles.message,
              {
                fontSize: sizeConfig.fontSize,
                color: colors.text.secondary,
              },
            ]}>
            {message}
          </Text>
        )}
      </View>
    );
  },
);

Loading.displayName = 'Loading';

// ============================================================================
// Loading Overlay Component
// ============================================================================

interface LoadingOverlayProps {
  /** Message to display */
  message?: string;
  /** Visible state */
  visible?: boolean;
  /** Loading variant */
  variant?: 'spinner' | 'dots' | 'pulse';
  /** Test ID */
  testID?: string;
}

/**
 * Full screen loading overlay
 * Shows a centered loading indicator with optional message
 */
export const LoadingOverlay = memo<LoadingOverlayProps>(
  ({ message, visible = true, variant = 'spinner', testID }) => {
    const { colors } = useTheme();
    const opacity = useSharedValue(0);

    useEffect(() => {
      opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
    }, [visible, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    if (!visible) return null;

    return (
      <Animated.View
        testID={testID}
        style={[styles.overlay, { backgroundColor: colors.background.overlay }, animatedStyle]}>
        <View
          style={[
            styles.overlayContent,
            {
              backgroundColor: colors.background.elevated,
              borderRadius: borderRadius.xl,
            },
          ]}>
          <Loading message={message} variant={variant} />
        </View>
      </Animated.View>
    );
  },
);

LoadingOverlay.displayName = 'LoadingOverlay';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  dot: {},
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 24,
    justifyContent: 'center',
  },
  message: {
    marginTop: spacing['3'],
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlayContent: {
    alignItems: 'center',
    minWidth: 120,
    padding: spacing['6'],
  },
  spinnerArc: {
    position: 'absolute',
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerTrack: {
    position: 'absolute',
  },
});
