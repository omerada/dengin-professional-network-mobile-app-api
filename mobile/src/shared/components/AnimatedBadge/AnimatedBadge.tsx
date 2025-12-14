// src/shared/components/AnimatedBadge/AnimatedBadge.tsx
// Animated Badge Component - Production Ready
// Notification badge'leri için pulse ve scale animasyonları

import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeVariant = 'default' | 'error' | 'warning' | 'success';

interface AnimatedBadgeProps {
  /** Badge içeriği (genellikle sayı) */
  count: number;
  /** Badge boyutu */
  size?: BadgeSize;
  /** Badge renk varyantı */
  variant?: BadgeVariant;
  /** Pulse animasyonu göster */
  pulse?: boolean;
  /** Count değiştiğinde scale animasyonu */
  animateOnChange?: boolean;
  /** Max gösterilecek count (örn: 99+) */
  maxCount?: number;
  /** Test ID */
  testID?: string;
}

const SIZE_CONFIG: Record<BadgeSize, { width: number; height: number; fontSize: number }> = {
  sm: { width: 16, height: 16, fontSize: 10 },
  md: { width: 20, height: 20, fontSize: 12 },
  lg: { width: 24, height: 24, fontSize: 14 },
};

/**
 * Animated Badge Component
 *
 * Notification badge'leri ve count gösterimi için animated component.
 * Pulse animasyonu ve count değişiminde scale efekti.
 *
 * KULLANIM:
 *
 * ```tsx
 * // Notification badge with pulse
 * <AnimatedBadge
 *   count={unreadCount}
 *   variant="error"
 *   pulse={unreadCount > 0}
 *   animateOnChange
 * />
 *
 * // Simple counter badge
 * <AnimatedBadge
 *   count={messageCount}
 *   size="sm"
 *   variant="default"
 * />
 * ```
 */
export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  count,
  size = 'md',
  variant = 'error',
  pulse = false,
  animateOnChange = true,
  maxCount = 99,
  testID,
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Count değiştiğinde scale animasyonu
  useEffect(() => {
    if (animateOnChange && count > 0) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 400 }),
      );
    }
  }, [count, animateOnChange, scale]);

  // Pulse animasyonu
  useEffect(() => {
    if (pulse && count > 0) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, // Infinite
        false,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [pulse, count, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  // Renk seçimi
  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'error':
        return colors.status.error;
      case 'warning':
        return colors.status.warning;
      case 'success':
        return colors.status.success;
      case 'default':
      default:
        return colors.interactive.default;
    }
  };

  // Count > 0 değilse gösterme
  if (count <= 0) return null;

  const sizeConfig = SIZE_CONFIG[size];
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          width: sizeConfig.width,
          height: sizeConfig.height,
          minWidth: sizeConfig.width,
        },
        animatedStyle,
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: '#FFFFFF',
            fontSize: sizeConfig.fontSize,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {displayCount}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default AnimatedBadge;
