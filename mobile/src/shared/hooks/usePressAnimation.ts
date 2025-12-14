// src/shared/hooks/usePressAnimation.ts
// Unified button press animation hook
// Production-ready implementation

import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { spring } from '@theme/animations';
import { useHaptic } from './useHaptic';

export interface UsePressAnimationConfig {
  /**
   * Scale value on press
   * @default 0.96
   */
  pressScale?: number;
  /**
   * Enable haptic feedback
   * @default true
   */
  haptic?: boolean;
  /**
   * Haptic type
   * @default 'selection'
   */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
  /**
   * Spring preset
   * @default 'press'
   */
  springPreset?: keyof typeof spring;
}

/**
 * usePressAnimation Hook
 *
 * Provides standardized press animation for all interactive components.
 * Ensures consistent scale feedback across the app.
 *
 * @example
 * ```tsx
 * const { pressIn, pressOut, animatedStyle } = usePressAnimation();
 *
 * <Pressable
 *   onPressIn={pressIn}
 *   onPressOut={pressOut}
 *   style={animatedStyle}
 * >
 *   <Text>Press Me</Text>
 * </Pressable>
 * ```
 */
export const usePressAnimation = (config: UsePressAnimationConfig = {}) => {
  const {
    pressScale = 0.96,
    haptic = true,
    hapticType = 'selection',
    springPreset = 'press',
  } = config;

  const scale = useSharedValue(1);
  const { trigger } = useHaptic();

  const pressIn = useCallback(() => {
    'worklet';
    scale.value = withSpring(pressScale, spring[springPreset]);
    if (haptic) {
      // Use runOnJS for haptic feedback
      // Note: haptic feedback should be called from JS thread
    }
  }, [pressScale, springPreset, scale, haptic]);

  const pressOut = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, spring[springPreset]);
  }, [springPreset, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Trigger haptic on press in (called from JS thread)
  const triggerHaptic = useCallback(() => {
    if (haptic) {
      trigger(hapticType);
    }
  }, [haptic, hapticType, trigger]);

  return {
    pressIn,
    pressOut,
    animatedStyle,
    triggerHaptic,
  };
};

/**
 * usePressAnimationWithHaptic Hook
 *
 * Extended version with automatic haptic feedback.
 * Use this for most interactive components.
 *
 * @example
 * ```tsx
 * const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimationWithHaptic();
 *
 * <Pressable
 *   onPressIn={handlePressIn}
 *   onPressOut={handlePressOut}
 *   style={animatedStyle}
 * >
 *   <Text>Press Me</Text>
 * </Pressable>
 * ```
 */
export const usePressAnimationWithHaptic = (config: UsePressAnimationConfig = {}) => {
  const { pressIn, pressOut, animatedStyle, triggerHaptic } = usePressAnimation(config);

  const handlePressIn = useCallback(() => {
    triggerHaptic();
    pressIn();
  }, [triggerHaptic, pressIn]);

  const handlePressOut = useCallback(() => {
    pressOut();
  }, [pressOut]);

  return {
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};
