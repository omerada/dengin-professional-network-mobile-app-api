// src/shared/hooks/useSwipeBackGesture.ts
// Production Swipe Back Gesture Hook
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Phase 3

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useHaptic } from './useHaptic';

export interface UseSwipeBackGestureConfig {
  /** Enable swipe back gesture */
  enabled?: boolean;
  /** Minimum swipe distance to trigger back (in px) */
  threshold?: number;
  /** Enable haptic feedback on trigger */
  enableHaptic?: boolean;
  /** Custom back handler (overrides default navigation.goBack()) */
  onBack?: () => void;
  /** Edge inset from left to start gesture (in px) */
  edgeInset?: number;
}

export interface UseSwipeBackGestureReturn {
  /** Pan gesture handler */
  gesture: ReturnType<typeof Gesture.Pan>;
  /** Translation X value */
  translationX: SharedValue<number>;
  /** Animated style for screen */
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

/**
 * useSwipeBackGesture Hook
 *
 * Provides iOS-style swipe-back gesture for screen navigation.
 * Works with React Navigation gesture handling.
 *
 * Features:
 * - Edge-based swipe detection
 * - Spring-based animation
 * - Haptic feedback on trigger
 * - Configurable threshold
 * - Custom back handler support
 *
 * @example
 * ```tsx
 * function DetailScreen() {
 *   const { gesture, animatedStyle } = useSwipeBackGesture({
 *     enabled: true,
 *     threshold: 120,
 *     enableHaptic: true,
 *   });
 *
 *   return (
 *     <GestureDetector gesture={gesture}>
 *       <Animated.View style={[styles.container, animatedStyle]}>
 *         <Content />
 *       </Animated.View>
 *     </GestureDetector>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom back handler
 * function ModalScreen() {
 *   const { gesture, animatedStyle } = useSwipeBackGesture({
 *     onBack: () => {
 *       // Save draft before going back
 *       saveDraft();
 *       navigation.goBack();
 *     },
 *   });
 *
 *   return (
 *     <GestureDetector gesture={gesture}>
 *       <Animated.View style={animatedStyle}>
 *         <ModalContent />
 *       </Animated.View>
 *     </GestureDetector>
 *   );
 * }
 * ```
 */
export function useSwipeBackGesture(
  config: UseSwipeBackGestureConfig = {},
): UseSwipeBackGestureReturn {
  const { enabled = true, threshold = 100, enableHaptic = true, onBack, edgeInset = 20 } = config;

  const navigation = useNavigation();
  const { trigger } = useHaptic();

  // Animation values
  const translationX = useSharedValue(0);
  const startX = useSharedValue(0);

  // Default back handler
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation, onBack]);

  // Trigger haptic feedback
  const triggerHaptic = useCallback(() => {
    if (enableHaptic) {
      trigger('impactLight');
    }
  }, [enableHaptic, trigger]);

  // Pan gesture
  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([edgeInset, Infinity]) // Only activate from left edge
    .failOffsetX([-5, 0]) // Fail if swiping left
    .onStart(event => {
      'worklet';
      startX.value = event.absoluteX;
    })
    .onUpdate(event => {
      'worklet';
      // Only allow right swipe (positive translation)
      if (event.translationX > 0 && startX.value <= edgeInset) {
        translationX.value = event.translationX;
      }
    })
    .onEnd(event => {
      'worklet';
      const shouldGoBack = event.translationX > threshold && event.velocityX > 0;

      if (shouldGoBack) {
        // Trigger haptic and navigate back
        runOnJS(triggerHaptic)();

        // Animate to full width then go back
        translationX.value = withSpring(
          400, // Full screen width approximation
          {
            damping: 20,
            stiffness: 90,
          },
          finished => {
            if (finished) {
              runOnJS(handleBack)();
            }
          },
        );
      } else {
        // Spring back to original position
        translationX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    });

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translationX.value }],
    };
  });

  return {
    gesture,
    translationX,
    animatedStyle,
  };
}

/**
 * useSwipeBackGestureWithShadow Hook
 *
 * Enhanced version with shadow effect for depth perception.
 * Shows previous screen behind with parallax effect.
 *
 * @example
 * ```tsx
 * function DetailScreen() {
 *   const { gesture, screenStyle, shadowStyle } = useSwipeBackGestureWithShadow();
 *
 *   return (
 *     <>
 *       <Animated.View style={shadowStyle} />
 *       <GestureDetector gesture={gesture}>
 *         <Animated.View style={screenStyle}>
 *           <Content />
 *         </Animated.View>
 *       </GestureDetector>
 *     </>
 *   );
 * }
 * ```
 */
export function useSwipeBackGestureWithShadow(config: UseSwipeBackGestureConfig = {}) {
  const { gesture, translationX, animatedStyle } = useSwipeBackGesture(config);

  // Shadow effect style
  const shadowStyle = useAnimatedStyle(() => {
    const opacity = Math.min(translationX.value / 200, 0.3);

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      opacity: 1 - opacity,
      pointerEvents: 'none',
    };
  });

  return {
    gesture,
    translationX,
    screenStyle: animatedStyle,
    shadowStyle,
  };
}
