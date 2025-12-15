// src/shared/components/SwipeableCard/SwipeableCard.tsx
// Swipeable card with gesture feedback and actions
// Provides smooth swipe animations with haptic feedback

import React, { memo, useCallback, useRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSemanticHaptic } from '@shared/hooks';
import { spring } from '@theme/animations';

export interface SwipeableCardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Enable left swipe
   * @default true
   */
  enableLeftSwipe?: boolean;
  /**
   * Enable right swipe
   * @default true
   */
  enableRightSwipe?: boolean;
  /**
   * Threshold to trigger action (0-1)
   * @default 0.3
   */
  threshold?: number;
  /**
   * Callback when swiped left beyond threshold
   */
  onSwipeLeft?: () => void;
  /**
   * Callback when swiped right beyond threshold
   */
  onSwipeRight?: () => void;
  /**
   * Left swipe action render
   */
  renderLeftAction?: () => React.ReactNode;
  /**
   * Right swipe action render
   */
  renderRightAction?: () => React.ReactNode;
  /**
   * Additional container style
   */
  style?: ViewStyle;
}

/**
 * SwipeableCard Component
 *
 * Provides swipeable card with smooth gesture animations.
 * Includes haptic feedback at swipe threshold.
 *
 * Features:
 * - Spring-based physics for natural movement
 * - Haptic feedback at action threshold
 * - Configurable left/right swipe actions
 * - Auto-reset after swipe
 * - Visual action indicators
 *
 * @example
 * ```tsx
 * <SwipeableCard
 *   onSwipeLeft={() => handleDelete()}
 *   onSwipeRight={() => handleArchive()}
 *   renderLeftAction={() => <DeleteIcon />}
 *   renderRightAction={() => <ArchiveIcon />}
 * >
 *   <PostCard {...postData} />
 * </SwipeableCard>
 * ```
 */
export const SwipeableCard: React.FC<SwipeableCardProps> = memo(
  ({
    children,
    enableLeftSwipe = true,
    enableRightSwipe = true,
    threshold = 0.3,
    onSwipeLeft,
    onSwipeRight,
    renderLeftAction,
    renderRightAction,
    style,
  }) => {
    const { triggerSystem } = useSemanticHaptic();

    const translateX = useSharedValue(0);
    const contextX = useSharedValue(0);
    const hasTriggeredHaptic = useRef(false);

    const triggerHaptic = useCallback(() => {
      triggerSystem('confirm');
    }, [triggerSystem]);

    const resetPosition = useCallback(() => {
      translateX.value = withSpring(0, spring.press);
      hasTriggeredHaptic.current = false;
    }, [translateX]);

    const pan = Gesture.Pan()
      .onStart(() => {
        contextX.value = translateX.value;
      })
      .onUpdate(event => {
        const newValue = contextX.value + event.translationX;

        // Limit swipe based on enabled directions
        if (!enableLeftSwipe && newValue < 0) {
          translateX.value = 0;
          return;
        }
        if (!enableRightSwipe && newValue > 0) {
          translateX.value = 0;
          return;
        }

        translateX.value = newValue;

        // Trigger haptic at threshold
        const progress = Math.abs(newValue) / 100; // Assuming 100px is full width
        if (progress >= threshold && !hasTriggeredHaptic.current) {
          runOnJS(triggerHaptic)();
          hasTriggeredHaptic.current = true;
        }
      })
      .onEnd(() => {
        const translation = translateX.value;
        const progress = Math.abs(translation) / 100;

        // Check if threshold met
        if (progress >= threshold) {
          if (translation < 0 && enableLeftSwipe && onSwipeLeft) {
            runOnJS(onSwipeLeft)();
          } else if (translation > 0 && enableRightSwipe && onSwipeRight) {
            runOnJS(onSwipeRight)();
          }
        }

        // Always reset position
        runOnJS(resetPosition)();
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    const leftActionStyle = useAnimatedStyle(() => {
      const opacity = interpolate(translateX.value, [0, 100], [0, 1], Extrapolation.CLAMP);

      return {
        opacity,
      };
    });

    const rightActionStyle = useAnimatedStyle(() => {
      const opacity = interpolate(translateX.value, [-100, 0], [1, 0], Extrapolation.CLAMP);

      return {
        opacity,
      };
    });

    return (
      <View style={[styles.container, style]}>
        {/* Left action */}
        {renderLeftAction && (
          <Animated.View
            style={[
              styles.actionContainer,
              styles.leftAction,
              leftActionStyle,
              { backgroundColor: '#4CAF50' },
            ]}>
            {renderLeftAction()}
          </Animated.View>
        )}

        {/* Right action */}
        {renderRightAction && (
          <Animated.View
            style={[
              styles.actionContainer,
              styles.rightAction,
              rightActionStyle,
              { backgroundColor: '#F44336' },
            ]}>
            {renderRightAction()}
          </Animated.View>
        )}

        {/* Card content */}
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, animatedStyle]}>{children}</Animated.View>
        </GestureDetector>
      </View>
    );
  },
);

SwipeableCard.displayName = 'SwipeableCard';

const styles = StyleSheet.create({
  actionContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 80,
  },
  card: {
    backgroundColor: 'transparent',
  },
  container: {
    position: 'relative',
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
});
