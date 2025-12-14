// src/shared/components/AnimatedCounter/AnimatedCounter.tsx
// Animated Counter Component - Production Ready
// Stats ve number'lar için count-up animation

import React, { useEffect } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  /** Counter value */
  value: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Text style */
  style?: StyleProp<TextStyle>;
  /** Suffix (e.g., " Takipçi") */
  suffix?: string;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Format number with locale */
  useLocale?: boolean;
  /** Locale string */
  locale?: string;
  /** Test ID */
  testID?: string;
}

/**
 * Animated Counter Component
 *
 * Number'ları 0'dan hedef değere doğru animate eder.
 * Profile stats, follower counts, notification badges için kullanılır.
 *
 * KULLANIM:
 *
 * ```tsx
 * // Profile stats
 * <AnimatedCounter
 *   value={followerCount}
 *   suffix=" Takipçi"
 *   style={styles.statNumber}
 * />
 *
 * // Notification badge
 * <AnimatedCounter
 *   value={unreadCount}
 *   duration={400}
 *   style={styles.badgeText}
 * />
 * ```
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 800,
  style,
  suffix = '',
  prefix = '',
  useLocale = true,
  locale = 'tr-TR',
  testID,
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, animatedValue]);

  const animatedProps = useAnimatedProps(() => {
    const displayValue = Math.floor(animatedValue.value);
    const formattedValue = useLocale
      ? displayValue.toLocaleString(locale)
      : displayValue.toString();

    return {
      text: `${prefix}${formattedValue}${suffix}`,
    } as any;
  });

  return <AnimatedText testID={testID} animatedProps={animatedProps} style={style} />;
};
