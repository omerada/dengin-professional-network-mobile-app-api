// src/shared/components/StepSuccess/StepSuccess.tsx
// Step completion success animation component
// Shows a professional success animation when user completes a registration step

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';

export interface StepSuccessProps {
  /** Called when animation completes */
  onComplete?: () => void;
  /** Duration of the animation in ms */
  duration?: number;
}

/**
 * StepSuccess Component
 *
 * Professional success animation shown between registration steps.
 * Creates a positive emotional response for step completion.
 *
 * Features:
 * - Multi-layer animation with ripple effect
 * - Professional checkmark with smooth transitions
 * - Success message with elegant typography
 * - Corporate-grade design matching app aesthetics
 */
export const StepSuccess: React.FC<StepSuccessProps> = ({ onComplete, duration = 1200 }) => {
  const colors = useColors();

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const checkRotate = useSharedValue(-90);
  const checkOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0.6);

  useEffect(() => {
    // 1. Overlay fade in
    overlayOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });

    // 2. Card entrance
    cardOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
    cardScale.value = withDelay(
      100,
      withSpring(1, {
        damping: 15,
        stiffness: 200,
      }),
    );

    // 3. Ripple effect
    setTimeout(() => {
      rippleScale.value = withTiming(1.5, { duration: 600, easing: Easing.out(Easing.cubic) });
      rippleOpacity.value = withTiming(0, { duration: 600 });
    }, 250);

    // 4. Check animation
    setTimeout(() => {
      checkOpacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 250 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
      checkRotate.value = withSpring(0, { damping: 15, stiffness: 180 });
    }, 300);

    // 5. Exit animation - kartı ve checkmark'ı önce kaldır, sonra overlay
    const exitTimeout = setTimeout(() => {
      cardScale.value = withTiming(0.9, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 200 });

      // Overlay'i card tamamen kaybolduktan sonra kaldır (gölge sorunu çözümü)
      setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 150 }, finished => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 200);
    }, duration - 400);

    return () => clearTimeout(exitTimeout);
  }, [
    duration,
    onComplete,
    overlayOpacity,
    cardScale,
    cardOpacity,
    checkScale,
    checkRotate,
    checkOpacity,
    rippleScale,
    rippleOpacity,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const checkContainerStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }, { rotate: `${checkRotate.value}deg` }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Ripple effect */}
        <Animated.View
          style={[
            styles.ripple,
            rippleStyle,
            {
              backgroundColor: colors.status.success,
            },
          ]}
        />

        {/* Check circle */}
        <View
          style={[
            styles.checkCircle,
            {
              backgroundColor: colors.status.success,
            },
          ]}>
          <Animated.View style={checkContainerStyle}>
            <Icon name="check" size={56} color={colors.text.inverse} />
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 24,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  checkCircle: {
    alignItems: 'center',
    borderRadius: 70,
    elevation: 16,
    height: 140,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    width: 140,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    zIndex: 9999,
  },
  ripple: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    height: 200,
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
    opacity: 0.3,
    position: 'absolute',
    top: '50%',
    width: 200,
  },
});
