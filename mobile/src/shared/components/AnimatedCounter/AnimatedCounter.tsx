// src/shared/components/AnimatedCounter/AnimatedCounter.tsx
// Animated Counter Component - Production Ready
// Stats ve number'lar için count-up animation

import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

// const AnimatedText = Animated.createAnimatedComponent(Text); // Not used in current implementation

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
  const [displayText, setDisplayText] = useState(
    `${prefix}${useLocale ? (0).toLocaleString(locale) : '0'}${suffix}`,
  );

  // Update display text when animated value changes
  useAnimatedReaction(
    () => Math.floor(animatedValue.value),
    currentValue => {
      const formattedValue = useLocale
        ? currentValue.toLocaleString(locale)
        : currentValue.toString();
      runOnJS(setDisplayText)(`${prefix}${formattedValue}${suffix}`);
    },
    [useLocale, locale, prefix, suffix],
  );

  // Animate to new value when prop changes
  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, animatedValue]);

  return (
    <Text testID={testID} style={style}>
      {displayText}
    </Text>
  );
};
