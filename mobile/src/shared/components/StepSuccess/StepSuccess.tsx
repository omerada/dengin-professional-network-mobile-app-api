// src/shared/components/StepSuccess/StepSuccess.tsx
// Step completion - Modern & Professional
// Premium success indicator for registration step completion

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useColors } from '@contexts/ThemeContext';

export interface StepSuccessProps {
  /** Called when animation completes */
  onComplete?: () => void;
  /** Duration of the animation in ms */
  duration?: number;
}

/**
 * StepSuccess Component
 *
 * Modern, professional success indicator for registration steps.
 * Balanced feedback for engaging, corporate experience.
 *
 * Features:
 * - Elegant scale + fade animation
 * - Subtle glow effect for premium feel
 * - Professional checkmark with draw effect
 * - Smooth entrance/exit for polish
 * - Corporate-grade micro-interactions
 */
export const StepSuccess: React.FC<StepSuccessProps> = ({ onComplete, duration = 1000 }) => {
  const colors = useColors();

  // Animation values - Balanced & Professional
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.7);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Overlay fade in (200ms)
    overlayOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });

    // 2. Card entrance with subtle bounce (250ms)
    cardScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    // 3. Check mark draw (100ms delay, 300ms duration)
    checkOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
    );
    checkScale.value = withDelay(
      100,
      withSpring(1, {
        damping: 10,
        stiffness: 120,
      }),
    );

    // 4. Glow pulse effect (150ms delay)
    glowOpacity.value = withDelay(
      150,
      withSequence(withTiming(0.5, { duration: 300 }), withTiming(0.2, { duration: 400 })),
    );

    // Exit animation sequence
    const exitTimeout = setTimeout(() => {
      // Fade out check and glow first
      checkOpacity.value = withTiming(0, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 200 });

      // Scale down card
      cardScale.value = withTiming(0.8, {
        duration: 250,
        easing: Easing.in(Easing.ease),
      });

      // Fade out overlay
      overlayOpacity.value = withTiming(
        0,
        {
          duration: 250,
          easing: Easing.in(Easing.ease),
        },
        finished => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        },
      );
    }, duration - 250);

    return () => clearTimeout(exitTimeout);
  }, [duration, onComplete, overlayOpacity, cardScale, checkOpacity, checkScale, glowOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0.2, 0.5], [1, 1.15]) }],
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Glow effect - Premium touch */}
        <Animated.View
          style={[styles.glowCircle, glowStyle, { backgroundColor: colors.status.success }]}
        />

        {/* Check circle with gradient */}
        <LinearGradient
          colors={[colors.status.success, colors.status.success]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.checkCircle}>
          <Animated.View style={checkStyle}>
            <Icon name="check" size={42} color={colors.text.inverse} />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const OVERLAY_BG = 'rgba(0, 0, 0, 0.5)';
const TRANSPARENT = 'transparent';
const SHADOW_COLOR = '#000000';

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: TRANSPARENT,
    justifyContent: 'center',
    position: 'relative',
  },
  checkCircle: {
    alignItems: 'center',
    borderRadius: 50,
    elevation: 8,
    height: 90,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    width: 90,
  },
  glowCircle: {
    borderRadius: 60,
    height: 120,
    opacity: 0.3,
    position: 'absolute',
    width: 120,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: OVERLAY_BG,
    justifyContent: 'center',
    zIndex: 9999,
  },
});
