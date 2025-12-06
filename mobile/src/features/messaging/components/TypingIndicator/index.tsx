// src/features/messaging/components/TypingIndicator/index.tsx
// Modern TypingIndicator with bouncing dots animation
// WhatsApp/Instagram kalitesinde yazıyor göstergesi

import React, { memo, useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { styles } from './TypingIndicator.styles';
import type { TypingIndicatorProps, AnimatedDotProps } from './TypingIndicator.types';

/**
 * AnimatedDot - Bouncing dot animation
 */
const AnimatedDot: React.FC<AnimatedDotProps> = memo(({ delay, color, size = 6 }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const dotStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
    }),
    [size, color],
  );

  return <Animated.View style={[dotStyle, animatedStyle]} />;
});

AnimatedDot.displayName = 'AnimatedDot';

/**
 * Yazıyor metni oluştur
 */
const getTypingText = (users: string[]): string => {
  if (users.length === 0) return '';
  if (users.length === 1) return `${users[0]} yazıyor`;
  if (users.length === 2) return `${users[0]} ve ${users[1]} yazıyor`;
  return `${users[0]} ve ${users.length - 1} kişi yazıyor`;
};

/**
 * TypingIndicator - Modern yazıyor göstergesi
 *
 * Özellikler:
 * - Bouncing dots animation
 * - Fade in/out animation
 * - Multiple users support
 * - Compact mode
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = memo(
  ({ users, visible = true, compact = false, style }) => {
    const colors = useColors();

    if (!visible || users.length === 0) {
      return null;
    }

    const typingText = getTypingText(users);
    const dotColor = colors.text.secondary;

    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.container, style]}>
        <View style={styles.dotsContainer}>
          <AnimatedDot delay={0} color={dotColor} />
          <AnimatedDot delay={150} color={dotColor} />
          <AnimatedDot delay={300} color={dotColor} />
        </View>
        {!compact && (
          <Text style={[styles.text, { color: colors.text.secondary }]} numberOfLines={1}>
            {typingText}
          </Text>
        )}
      </Animated.View>
    );
  },
);

TypingIndicator.displayName = 'TypingIndicator';

export type { TypingIndicatorProps, AnimatedDotProps } from './TypingIndicator.types';
