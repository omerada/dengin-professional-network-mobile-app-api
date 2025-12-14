// src/shared/components/PulseLoader/PulseLoader.tsx
// Elegant pulse loading animation
// Production-ready micro-interaction

import React, { memo, useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';

interface PulseLoaderProps {
  /** Size of the pulse (default: 48) */
  size?: number;
  /** Custom color */
  color?: string;
  /** Number of pulse rings (default: 3) */
  rings?: number;
  /** Animation duration in ms (default: 2000) */
  duration?: number;
  /** Additional container style */
  style?: ViewStyle;
}

/**
 * PulseLoader Component
 *
 * Elegant pulsing animation for loading states.
 * Multiple concentric rings with staggered timing.
 *
 * Features:
 * - Smooth scale + opacity animation
 * - Configurable ring count
 * - Brand color integration
 * - Lightweight performance
 *
 * Usage:
 * ```tsx
 * <PulseLoader size={64} rings={3} />
 * ```
 */
export const PulseLoader = memo<PulseLoaderProps>(
  ({ size = 48, color, rings = 3, duration = 2000, style }) => {
    const colors = useColors();
    const pulseColor = color || colors.interactive.default;

    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        {Array.from({ length: rings }).map((_, index) => (
          <PulseRing
            key={index}
            size={size}
            color={pulseColor}
            delay={(duration / rings) * index}
            duration={duration}
          />
        ))}
      </View>
    );
  },
);

PulseLoader.displayName = 'PulseLoader';

interface PulseRingProps {
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const PulseRing = memo<PulseRingProps>(({ size, color, delay, duration }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Initial delay
    const timer = setTimeout(() => {
      // Start pulsing animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: duration * 0.5,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, {
            duration: duration * 0.3,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(0, {
            duration: duration * 0.2,
            easing: Easing.in(Easing.cubic),
          }),
        ),
        -1,
        false,
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
});

PulseRing.displayName = 'PulseRing';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    borderWidth: 2,
    position: 'absolute',
  },
});

export default PulseLoader;
