// src/shared/components/PressableScale/PressableScale.tsx
// Meslektaş Design System - PressableScale Component
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Section 3.3

import React, { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';
import type { PressableScaleProps } from './PressableScale.types';

// Create animated pressable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * PressableScale Component
 *
 * Provides a smooth scale animation on press with optional haptic feedback.
 * Perfect for buttons, cards, and interactive elements.
 *
 * Features:
 * - Spring-based scale animation
 * - Optional haptic feedback
 * - Configurable scale value
 * - Smooth press/release transitions
 * - Full Pressable API support
 *
 * @example
 * ```tsx
 * <PressableScale onPress={handlePress}>
 *   <View style={styles.card}>
 *     <Text>Tap me!</Text>
 *   </View>
 * </PressableScale>
 *
 * // With custom scale and haptic
 * <PressableScale
 *   onPress={handlePress}
 *   scaleValue={0.95}
 *   enableHaptic
 *   hapticType="medium"
 * >
 *   <Button title="Submit" />
 * </PressableScale>
 * ```
 */
export const PressableScale = memo<PressableScaleProps>(
  ({
    children,
    onPress,
    onPressIn,
    onPressOut,
    scaleValue = 0.96,
    enableHaptic = false,
    hapticType = 'light',
    style,
    disabled,
    testID,
    ...restProps
  }) => {
    const { trigger } = useHaptic();
    const pressed = useSharedValue(0);

    // Handle press with haptic
    const handlePress = useCallback(
      (event: any) => {
        if (enableHaptic) {
          trigger(hapticType);
        }
        onPress?.(event);
      },
      [onPress, enableHaptic, hapticType, trigger],
    );

    // Handle press in
    const handlePressIn = useCallback(
      (event: any) => {
        pressed.value = withSpring(1, spring.press);
        onPressIn?.(event);
      },
      [pressed, onPressIn],
    );

    // Handle press out
    const handlePressOut = useCallback(
      (event: any) => {
        pressed.value = withSpring(0, spring.snappy);
        onPressOut?.(event);
      },
      [pressed, onPressOut],
    );

    // Animated style
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(pressed.value, [0, 1], [1, scaleValue]);
      return {
        transform: [{ scale }],
      };
    });

    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, style]}
        disabled={disabled}
        testID={testID}
        {...restProps}>
        {children}
      </AnimatedPressable>
    );
  },
);

PressableScale.displayName = 'PressableScale';
