// src/shared/components/Pressable/PressableScale.tsx
// Dengin Design System - PressableScale Component
// Oku: mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md

/* eslint-disable react-hooks/exhaustive-deps */
// Note: Reanimated shared values are stable references and don't need to be in deps array

import React, { memo, useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * PressableScale Props
 */
export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /** Scale when pressed (default: 0.96) */
  activeScale?: number;
  /** Spring damping (default: 15) */
  damping?: number;
  /** Spring stiffness (default: 150) */
  stiffness?: number;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children: React.ReactNode;
}

/**
 * PressableScale - Instagram-style press animation with scale effect
 *
 * @example
 * <PressableScale onPress={handlePress}>
 *   <Text>Press me</Text>
 * </PressableScale>
 *
 * @example
 * <PressableScale activeScale={0.9} haptic hapticType="medium">
 *   <Card>...</Card>
 * </PressableScale>
 */
export const PressableScale = memo<PressableScaleProps>(function PressableScale({
  activeScale = 0.96,
  damping = 15,
  stiffness = 150,
  haptic: enableHaptic = false,
  hapticType = 'light',
  style,
  children,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}) {
  const scale = useSharedValue(1);
  const { trigger: triggerHaptic } = useHaptic();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(activeScale, {
        damping,
        stiffness,
      });

      if (enableHaptic) {
        triggerHaptic(hapticType);
      }

      onPressIn?.(event);
    },
    [activeScale, damping, stiffness, enableHaptic, hapticType, triggerHaptic, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(1, {
        damping,
        stiffness,
      });
      onPressOut?.(event);
    },
    [damping, stiffness, onPressOut],
  );

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
});

/**
 * PressableOpacity Props
 */
export interface PressableOpacityProps extends Omit<PressableProps, 'style'> {
  /** Opacity when pressed (default: 0.6) */
  activeOpacity?: number;
  /** Animation duration in ms (default: 100) */
  duration?: number;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children: React.ReactNode;
}

/**
 * PressableOpacity - Opacity-based press animation
 *
 * @example
 * <PressableOpacity onPress={handlePress}>
 *   <Text>Press me</Text>
 * </PressableOpacity>
 */
export const PressableOpacity = memo<PressableOpacityProps>(function PressableOpacity({
  activeOpacity = 0.6,
  duration = 100,
  haptic: enableHaptic = false,
  hapticType = 'light',
  style,
  children,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}) {
  const opacity = useSharedValue(1);
  const { trigger: triggerHaptic } = useHaptic();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      opacity.value = withTiming(activeOpacity, { duration });

      if (enableHaptic) {
        triggerHaptic(hapticType);
      }

      onPressIn?.(event);
    },
    [activeOpacity, duration, enableHaptic, hapticType, triggerHaptic, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      opacity.value = withTiming(1, { duration });
      onPressOut?.(event);
    },
    [duration, onPressOut],
  );

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
});

/**
 * PressableHighlight Props
 */
export interface PressableHighlightProps extends Omit<PressableProps, 'style'> {
  /** Underlay color (default: rgba(0,0,0,0.1)) */
  underlayColor?: string;
  /** Animation duration in ms (default: 100) */
  duration?: number;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children: React.ReactNode;
}

/**
 * PressableHighlight - Background color change on press
 *
 * @example
 * <PressableHighlight onPress={handlePress} underlayColor="rgba(0,0,0,0.1)">
 *   <ListItem>...</ListItem>
 * </PressableHighlight>
 */
export const PressableHighlight = memo<PressableHighlightProps>(function PressableHighlight({
  underlayColor = 'rgba(0, 0, 0, 0.1)',
  duration = 100,
  haptic: enableHaptic = false,
  style,
  children,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}) {
  const pressed = useSharedValue(0);
  const { trigger: triggerHaptic } = useHaptic();

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: pressed.value === 1 ? underlayColor : 'transparent',
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      pressed.value = withTiming(1, { duration });

      if (enableHaptic) {
        triggerHaptic('light');
      }

      onPressIn?.(event);
    },
    [duration, enableHaptic, triggerHaptic, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      pressed.value = withTiming(0, { duration });
      onPressOut?.(event);
    },
    [duration, onPressOut],
  );

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
});

/**
 * PressableBounce - Bouncy scale animation like Twitter/X
 */
export interface PressableBounceProps extends Omit<PressableProps, 'style'> {
  /** Scale when pressed (default: 0.9) */
  activeScale?: number;
  /** Overshoot scale (default: 1.05) */
  overshootScale?: number;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children: React.ReactNode;
}

export const PressableBounce = memo<PressableBounceProps>(function PressableBounce({
  activeScale = 0.9,
  overshootScale = 1.05,
  haptic: enableHaptic = true,
  style,
  children,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}) {
  const scale = useSharedValue(1);
  const { trigger: triggerHaptic } = useHaptic();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(activeScale, spring.bouncy);

      if (enableHaptic) {
        triggerHaptic('light');
      }

      onPressIn?.(event);
    },
    [activeScale, enableHaptic, triggerHaptic, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      // Bounce back with overshoot
      scale.value = withSpring(overshootScale, spring.bouncy, () => {
        scale.value = withSpring(1, spring.bouncy);
      });
      onPressOut?.(event);
    },
    [overshootScale, onPressOut],
  );

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
});
