// src/shared/components/AnimatedCheckmark/AnimatedCheckmark.tsx
// Animated success checkmark component
// Production-ready micro-interaction

import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';

interface AnimatedCheckmarkProps {
  /** Show/hide checkmark */
  visible: boolean;
  /** Size of the checkmark (default: 64) */
  size?: number;
  /** Custom color (default: success green) */
  color?: string;
  /** Duration of animation (default: 600ms) */
  duration?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * AnimatedCheckmark Component
 *
 * Features:
 * - Scale + fade animation
 * - Success haptic feel
 * - Auto-dismiss support
 * - Customizable colors
 *
 * Usage:
 * ```tsx
 * <AnimatedCheckmark
 *   visible={showSuccess}
 *   onComplete={() => navigation.goBack()}
 * />
 * ```
 */
export const AnimatedCheckmark = memo<AnimatedCheckmarkProps>(
  ({ visible, size = 64, color, duration = 600, onComplete }) => {
    const colors = useColors();
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    const checkmarkColor = color || colors.status.success;

    useEffect(() => {
      if (visible) {
        // Scale animation: 0 -> 1.2 -> 1
        scale.value = withSequence(
          withSpring(1.2, {
            damping: 10,
            stiffness: 200,
          }),
          withSpring(1, {
            damping: 15,
            stiffness: 300,
          }),
        );

        // Fade in
        opacity.value = withTiming(1, {
          duration: duration * 0.3,
          easing: Easing.out(Easing.cubic),
        });

        // Auto-dismiss after duration
        if (onComplete) {
          const timer = setTimeout(() => {
            // Fade out before calling onComplete
            opacity.value = withTiming(
              0,
              {
                duration: duration * 0.3,
                easing: Easing.in(Easing.cubic),
              },
              finished => {
                if (finished) {
                  runOnJS(onComplete)();
                }
              },
            );
          }, duration);

          return () => clearTimeout(timer);
        }
        return undefined;
      } else {
        // Reset animation
        scale.value = 0;
        opacity.value = 0;
      }
      return undefined;
    }, [visible, duration, onComplete, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    if (!visible) return null;

    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: `${checkmarkColor}20`,
            },
            animatedStyle,
          ]}>
          <Icon name="checkmark-circle" size={size} color={checkmarkColor} />
        </Animated.View>
      </View>
    );
  },
);

AnimatedCheckmark.displayName = 'AnimatedCheckmark';

const styles = StyleSheet.create({
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default AnimatedCheckmark;
