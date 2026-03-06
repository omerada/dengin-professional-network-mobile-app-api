// src/shared/components/ShakeAnimation/ShakeAnimation.tsx
// Shake animation for form errors and invalid inputs
// Production component - no example code

import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useHaptic } from '@shared/hooks';

interface ShakeAnimationProps {
  /**
   * Trigger shake animation when this changes to true
   */
  trigger: boolean;
  /**
   * Number of shake cycles
   * @default 3
   */
  intensity?: number;
  /**
   * Distance of shake in pixels
   * @default 10
   */
  distance?: number;
  /**
   * Duration of single shake cycle in ms
   * @default 80
   */
  duration?: number;
  /**
   * Enable haptic feedback on shake
   * @default true
   */
  enableHaptic?: boolean;
}

/**
 * ShakeAnimation Component
 *
 * Wraps children with shake animation for form errors and validation feedback.
 * Automatically triggers haptic feedback with animation.
 *
 * @example
 * ```tsx
 * const [hasError, setHasError] = useState(false);
 *
 * <ShakeAnimation trigger={hasError}>
 *   <TextInput
 *     value={email}
 *     onChangeText={(text) => {
 *       setEmail(text);
 *       setHasError(false);
 *     }}
 *   />
 * </ShakeAnimation>
 * ```
 */
export const ShakeAnimation: React.FC<PropsWithChildren<ShakeAnimationProps>> = ({
  children,
  trigger,
  intensity = 3,
  distance = 10,
  duration = 80,
  enableHaptic = true,
}) => {
  const translateX = useSharedValue(0);
  const { trigger: triggerHaptic } = useHaptic();

  useEffect(() => {
    if (trigger) {
      // Haptic feedback at start of shake
      if (enableHaptic) {
        triggerHaptic('notificationError');
      }

      // Shake animation: left -> right -> left -> center
      translateX.value = withSequence(
        withRepeat(
          withTiming(distance, {
            duration: duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          intensity * 2, // Each repeat goes left->right, so multiply by 2
          true, // Reverse direction each time
        ),
        withTiming(0, {
          duration: duration / 2,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
      );
    }
  }, [trigger, translateX, distance, duration, intensity, enableHaptic, triggerHaptic]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default ShakeAnimation;
