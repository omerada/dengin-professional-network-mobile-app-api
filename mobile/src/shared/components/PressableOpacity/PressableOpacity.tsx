// src/shared/components/PressableOpacity/PressableOpacity.tsx
// Meslektaş Design System - PressableOpacity Component
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Section 3.3

import React, { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useHaptic } from '@shared/hooks/useHaptic';
import type { PressableOpacityProps } from './PressableOpacity.types';

// Create animated pressable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * PressableOpacity Component
 *
 * Provides a smooth opacity animation on press with optional haptic feedback.
 * Alternative to PressableScale for subtle interactions.
 *
 * Features:
 * - Timing-based opacity animation
 * - Optional haptic feedback
 * - Configurable opacity value
 * - Smooth press/release transitions
 * - Full Pressable API support
 *
 * @example
 * ```tsx
 * <PressableOpacity onPress={handlePress}>
 *   <View style={styles.item}>
 *     <Text>Tap me!</Text>
 *   </View>
 * </PressableOpacity>
 *
 * // With custom opacity and haptic
 * <PressableOpacity
 *   onPress={handlePress}
 *   activeOpacity={0.6}
 *   enableHaptic
 *   hapticType="selection"
 * >
 *   <ListItem />
 * </PressableOpacity>
 * ```
 */
export const PressableOpacity = memo<PressableOpacityProps>(
  ({
    children,
    onPress,
    onPressIn,
    onPressOut,
    activeOpacity = 0.7,
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
        pressed.value = withTiming(1, { duration: 100 });
        onPressIn?.(event);
      },
      [pressed, onPressIn],
    );

    // Handle press out
    const handlePressOut = useCallback(
      (event: any) => {
        pressed.value = withTiming(0, { duration: 200 });
        onPressOut?.(event);
      },
      [pressed, onPressOut],
    );

    // Animated style
    const animatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(pressed.value, [0, 1], [1, activeOpacity]);
      return {
        opacity,
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

PressableOpacity.displayName = 'PressableOpacity';
