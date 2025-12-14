// src/shared/hooks/useInputFocusAnimation.ts
// Input focus animation hook
// Production-ready implementation

import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from './useHaptic';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';

export interface UseInputFocusAnimationConfig {
  /**
   * Scale on focus
   * @default 1.02
   */
  focusScale?: number;
  /**
   * Enable haptic feedback
   * @default true
   */
  haptic?: boolean;
  /**
   * Animate border color
   * @default true
   */
  animateBorderColor?: boolean;
  /**
   * Animation duration
   * @default UNIFIED_TIMING.stateChange (200ms)
   */
  duration?: number;
}

/**
 * useInputFocusAnimation Hook
 *
 * Provides standardized focus animation for input fields.
 * Ensures consistent focus feedback across the app.
 *
 * Features:
 * - Border color transition
 * - Subtle scale animation
 * - Haptic feedback on focus
 *
 * @example
 * ```tsx
 * const { onFocus, onBlur, animatedStyle } = useInputFocusAnimation();
 *
 * <Animated.View style={[styles.input, animatedStyle]}>
 *   <TextInput
 *     onFocus={onFocus}
 *     onBlur={onBlur}
 *     placeholder="Enter text..."
 *   />
 * </Animated.View>
 * ```
 */
export const useInputFocusAnimation = (config: UseInputFocusAnimationConfig = {}) => {
  const {
    focusScale = 1.02,
    haptic = true,
    animateBorderColor = true,
    duration = UNIFIED_TIMING.componentEnter,
  } = config;

  const colors = useColors();
  const { trigger } = useHaptic();

  // Animated values
  const focusProgress = useSharedValue(0);
  const scale = useSharedValue(1);

  const onFocus = useCallback(() => {
    'worklet';
    focusProgress.value = withTiming(1, { duration });
    scale.value = withTiming(focusScale, { duration });
    // Haptic feedback on JS thread
  }, [focusProgress, scale, focusScale, duration]);

  const onBlur = useCallback(() => {
    'worklet';
    focusProgress.value = withTiming(0, { duration });
    scale.value = withTiming(1, { duration });
  }, [focusProgress, scale, duration]);

  // Trigger haptic (called from JS thread)
  const triggerFocusHaptic = useCallback(() => {
    if (haptic) {
      trigger('selection');
    }
  }, [haptic, trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = animateBorderColor
      ? interpolateColor(
          focusProgress.value,
          [0, 1],
          [colors.border.default, colors.interactive.default],
        )
      : colors.border.default;

    return {
      borderColor,
      transform: [{ scale: scale.value }],
    };
  });

  return {
    onFocus,
    onBlur,
    animatedStyle,
    triggerFocusHaptic,
  };
};

/**
 * useInputFocusAnimationWithHaptic Hook
 *
 * Extended version with automatic haptic feedback.
 * Use this for most input fields.
 *
 * @example
 * ```tsx
 * const { handleFocus, handleBlur, animatedStyle } = useInputFocusAnimationWithHaptic();
 *
 * <Animated.View style={[styles.input, animatedStyle]}>
 *   <TextInput
 *     onFocus={handleFocus}
 *     onBlur={handleBlur}
 *     placeholder="Enter text..."
 *   />
 * </Animated.View>
 * ```
 */
export const useInputFocusAnimationWithHaptic = (config: UseInputFocusAnimationConfig = {}) => {
  const { onFocus, onBlur, animatedStyle, triggerFocusHaptic } = useInputFocusAnimation(config);

  const handleFocus = useCallback(() => {
    triggerFocusHaptic();
    onFocus();
  }, [triggerFocusHaptic, onFocus]);

  const handleBlur = useCallback(() => {
    onBlur();
  }, [onBlur]);

  return {
    handleFocus,
    handleBlur,
    animatedStyle,
  };
};
