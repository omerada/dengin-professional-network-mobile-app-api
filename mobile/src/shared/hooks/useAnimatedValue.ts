// src/shared/hooks/useAnimatedValue.ts
// Dengin Design System - Animated Value Hooks
// Oku: mobile-development-guide/ui-ux-modernization/05-ANIMATION-MOTION.md

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { spring, duration } from '@theme/animations';
import type { SpringPreset } from '@theme/types';

/**
 * useAnimatedValue Hook
 * Returns a shared value with utility functions for animation
 *
 * @example
 * const { value, animate, reset } = useAnimatedValue(0);
 *
 * const handlePress = () => {
 *   animate(1, 'spring', 'bouncy');
 * };
 */
export function useAnimatedValue(initialValue: number = 0) {
  const value = useSharedValue(initialValue);

  const animate = useCallback(
    (toValue: number, type: 'spring' | 'timing' = 'spring', preset?: SpringPreset | number) => {
      'worklet';
      if (type === 'spring') {
        const springConfig = typeof preset === 'string' ? spring[preset] : spring.gentle;
        value.value = withSpring(toValue, springConfig);
      } else {
        const durationMs = typeof preset === 'number' ? preset : duration.normal;
        value.value = withTiming(toValue, { duration: durationMs });
      }
    },
    [value],
  );

  const reset = useCallback(() => {
    'worklet';
    value.value = initialValue;
  }, [value, initialValue]);

  const cancel = useCallback(() => {
    cancelAnimation(value);
  }, [value]);

  return {
    value,
    animate,
    reset,
    cancel,
  };
}

/**
 * useScaleAnimation Hook
 * Provides scale animation for press states
 *
 * @example
 * const { animatedStyle, onPressIn, onPressOut } = useScaleAnimation();
 *
 * <Animated.View style={animatedStyle}>
 *   <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
 *     ...
 *   </Pressable>
 * </Animated.View>
 */
export function useScaleAnimation(config?: { pressedScale?: number; springPreset?: SpringPreset }) {
  const { pressedScale = 0.96, springPreset = 'press' } = config || {};
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    'worklet';
    scale.value = withSpring(pressedScale, spring[springPreset]);
  }, [scale, pressedScale, springPreset]);

  const onPressOut = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, spring[springPreset]);
  }, [scale, springPreset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    scale,
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}

/**
 * useFadeAnimation Hook
 * Provides fade in/out animation
 *
 * @example
 * const { animatedStyle, fadeIn, fadeOut, toggle } = useFadeAnimation();
 */
export function useFadeAnimation(config?: { initialOpacity?: number; duration?: number }) {
  const { initialOpacity = 0, duration: durationMs = duration.normal } = config || {};
  const opacity = useSharedValue(initialOpacity);

  const fadeIn = useCallback(() => {
    opacity.value = withTiming(1, { duration: durationMs });
  }, [opacity, durationMs]);

  const fadeOut = useCallback(() => {
    opacity.value = withTiming(0, { duration: durationMs });
  }, [opacity, durationMs]);

  const toggle = useCallback(() => {
    opacity.value = withTiming(opacity.value === 0 ? 1 : 0, { duration: durationMs });
  }, [opacity, durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return {
    opacity,
    animatedStyle,
    fadeIn,
    fadeOut,
    toggle,
  };
}

/**
 * useSlideAnimation Hook
 * Provides slide animation
 *
 * @example
 * const { animatedStyle, slideIn, slideOut } = useSlideAnimation('up');
 */
export function useSlideAnimation(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  config?: {
    distance?: number;
    springPreset?: SpringPreset;
  },
) {
  const { distance = 50, springPreset = 'gentle' } = config || {};
  const translateValue = useSharedValue(distance);

  const slideIn = useCallback(() => {
    translateValue.value = withSpring(0, spring[springPreset]);
  }, [translateValue, springPreset]);

  const slideOut = useCallback(() => {
    translateValue.value = withSpring(distance, spring[springPreset]);
  }, [translateValue, distance, springPreset]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (direction) {
      case 'up':
        return { transform: [{ translateY: translateValue.value }] };
      case 'down':
        return { transform: [{ translateY: -translateValue.value }] };
      case 'left':
        return { transform: [{ translateX: translateValue.value }] };
      case 'right':
        return { transform: [{ translateX: -translateValue.value }] };
      default:
        return { transform: [{ translateY: translateValue.value }] };
    }
  });

  return {
    translateValue,
    animatedStyle,
    slideIn,
    slideOut,
  };
}

/**
 * usePulseAnimation Hook
 * Provides continuous pulse animation
 *
 * @example
 * const { animatedStyle, start, stop } = usePulseAnimation();
 */
export function usePulseAnimation(config?: {
  minScale?: number;
  maxScale?: number;
  duration?: number;
}) {
  const { minScale = 1, maxScale = 1.05, duration: durationMs = duration.slow } = config || {};
  const scale = useSharedValue(minScale);

  const start = useCallback(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration: durationMs / 2 }),
        withTiming(minScale, { duration: durationMs / 2 }),
      ),
      -1, // Repeat indefinitely
      true, // Reverse
    );
  }, [scale, minScale, maxScale, durationMs]);

  const stop = useCallback(() => {
    cancelAnimation(scale);
    scale.value = withTiming(minScale, { duration: durationMs / 2 });
  }, [scale, minScale, durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    scale,
    animatedStyle,
    start,
    stop,
  };
}

/**
 * useShakeAnimation Hook
 * Provides shake animation for error states
 *
 * @example
 * const { animatedStyle, shake } = useShakeAnimation();
 *
 * if (hasError) {
 *   shake();
 * }
 */
export function useShakeAnimation(config?: {
  intensity?: number;
  count?: number;
  duration?: number;
}) {
  const { intensity = 10, count = 4, duration: durationMs = 400 } = config || {};
  const translateX = useSharedValue(0);

  const shake = useCallback(() => {
    const segments: number[] = [];
    const segmentDuration = durationMs / (count * 2);

    for (let i = 0; i < count; i++) {
      segments.push(
        withTiming(intensity, { duration: segmentDuration / 2 }),
        withTiming(-intensity, { duration: segmentDuration }),
      );
    }
    segments.push(withTiming(0, { duration: segmentDuration / 2 }));

    translateX.value = withSequence(...segments);
  }, [translateX, intensity, count, durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return {
    translateX,
    animatedStyle,
    shake,
  };
}

/**
 * useLikeAnimation Hook
 * Instagram-style like heart animation
 *
 * @example
 * const { animatedStyle, animate } = useLikeAnimation();
 */
export function useLikeAnimation() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const animate = useCallback(
    (onComplete?: () => void) => {
      opacity.value = 1;
      scale.value = 0;

      scale.value = withSequence(
        withSpring(1.3, spring.bouncy),
        withDelay(
          200,
          withTiming(0, { duration: 200 }, () => {
            opacity.value = 0;
            if (onComplete) {
              scheduleOnRN(onComplete);
            }
          }),
        ),
      );
    },
    [scale, opacity],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return {
    scale,
    opacity,
    animatedStyle,
    animate,
  };
}

/**
 * useCountAnimation Hook
 * Animated number counter
 *
 * @example
 * const { displayValue, animateTo } = useCountAnimation(0);
 *
 * animateTo(100);
 */
export function useCountAnimation(initialValue: number = 0) {
  const value = useSharedValue(initialValue);

  const animateTo = useCallback(
    (toValue: number, durationMs: number = 500) => {
      value.value = withTiming(toValue, { duration: durationMs });
    },
    [value],
  );

  return {
    value,
    animateTo,
  };
}

/**
 * useSharedTransition Hook
 * Creates a shared transition value that can be used for coordinated animations
 *
 * @example
 * const { progress, forward, backward, reset } = useSharedTransition();
 *
 * // Use progress for interpolation
 * const animatedStyle = useAnimatedStyle(() => ({
 *   opacity: interpolate(progress.value, [0, 1], [0, 1]),
 *   transform: [{ scale: interpolate(progress.value, [0, 1], [0.8, 1]) }],
 * }));
 */
export function useSharedTransition(config?: {
  initialValue?: number;
  springPreset?: SpringPreset;
  duration?: number;
  useSpring?: boolean;
}) {
  const {
    initialValue = 0,
    springPreset = 'gentle',
    duration: durationMs = duration.normal,
    useSpring: preferSpring = true,
  } = config || {};

  const progress = useSharedValue(initialValue);

  const forward = useCallback(
    (callback?: () => void) => {
      if (preferSpring) {
        progress.value = withSpring(1, spring[springPreset], () => {
          if (callback) scheduleOnRN(callback);
        });
      } else {
        progress.value = withTiming(1, { duration: durationMs }, () => {
          if (callback) scheduleOnRN(callback);
        });
      }
    },
    [progress, preferSpring, springPreset, durationMs],
  );

  const backward = useCallback(
    (callback?: () => void) => {
      if (preferSpring) {
        progress.value = withSpring(0, spring[springPreset], () => {
          if (callback) scheduleOnRN(callback);
        });
      } else {
        progress.value = withTiming(0, { duration: durationMs }, () => {
          if (callback) scheduleOnRN(callback);
        });
      }
    },
    [progress, preferSpring, springPreset, durationMs],
  );

  const toggle = useCallback(
    (callback?: () => void) => {
      const toValue = progress.value === 0 ? 1 : 0;
      if (preferSpring) {
        progress.value = withSpring(toValue, spring[springPreset], () => {
          if (callback) scheduleOnRN(callback);
        });
      } else {
        progress.value = withTiming(toValue, { duration: durationMs }, () => {
          if (callback) scheduleOnRN(callback);
        });
      }
    },
    [progress, preferSpring, springPreset, durationMs],
  );

  const reset = useCallback(() => {
    progress.value = initialValue;
  }, [progress, initialValue]);

  const animateTo = useCallback(
    (value: number, callback?: () => void) => {
      if (preferSpring) {
        progress.value = withSpring(value, spring[springPreset], () => {
          if (callback) scheduleOnRN(callback);
        });
      } else {
        progress.value = withTiming(value, { duration: durationMs }, () => {
          if (callback) scheduleOnRN(callback);
        });
      }
    },
    [progress, preferSpring, springPreset, durationMs],
  );

  return {
    progress,
    forward,
    backward,
    toggle,
    reset,
    animateTo,
  };
}

/**
 * useEnterAnimation Hook
 * Provides enter animation for mounting components
 *
 * @example
 * const { animatedStyle, enter } = useEnterAnimation();
 *
 * useEffect(() => {
 *   enter();
 * }, []);
 */
export function useEnterAnimation(config?: {
  type?: 'fade' | 'slideUp' | 'slideDown' | 'scale' | 'fadeSlideUp';
  delay?: number;
  springPreset?: SpringPreset;
}) {
  const { type = 'fadeSlideUp', delay: delayMs = 0, springPreset = 'gentle' } = config || {};

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(type === 'slideDown' ? -20 : 20);
  const scale = useSharedValue(0.95);

  const enter = useCallback(() => {
    const doAnimation = () => {
      opacity.value = withSpring(1, spring[springPreset]);

      if (type === 'slideUp' || type === 'slideDown' || type === 'fadeSlideUp') {
        translateY.value = withSpring(0, spring[springPreset]);
      }

      if (type === 'scale') {
        scale.value = withSpring(1, spring[springPreset]);
      }
    };

    if (delayMs > 0) {
      opacity.value = withDelay(delayMs, withSpring(1, spring[springPreset]));
      if (type === 'slideUp' || type === 'slideDown' || type === 'fadeSlideUp') {
        translateY.value = withDelay(delayMs, withSpring(0, spring[springPreset]));
      }
      if (type === 'scale') {
        scale.value = withDelay(delayMs, withSpring(1, spring[springPreset]));
      }
    } else {
      doAnimation();
    }
  }, [opacity, translateY, scale, type, delayMs, springPreset]);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'fade':
        return { opacity: opacity.value };
      case 'slideUp':
      case 'slideDown':
        return { transform: [{ translateY: translateY.value }] };
      case 'scale':
        return { opacity: opacity.value, transform: [{ scale: scale.value }] };
      case 'fadeSlideUp':
      default:
        return {
          opacity: opacity.value,
          transform: [{ translateY: translateY.value }],
        };
    }
  });

  return {
    opacity,
    translateY,
    scale,
    animatedStyle,
    enter,
  };
}

export default useAnimatedValue;
