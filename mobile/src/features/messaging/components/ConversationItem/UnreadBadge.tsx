// src/features/messaging/components/ConversationItem/UnreadBadge.tsx
// Okunmamış mesaj sayısı badge'i
// Animated bounce effect

import React, { memo, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { styles } from './ConversationItem.styles';
import type { UnreadBadgeProps } from './ConversationItem.types';

/**
 * UnreadBadge - Okunmamış mesaj sayısı
 *
 * Özellikler:
 * - Bounce animation on appear
 * - Pulsing effect on count change
 * - 99+ for large numbers
 */
export const UnreadBadge: React.FC<UnreadBadgeProps> = memo(({ count }) => {
  const colors = useColors();
  const scale = useSharedValue(0);

  // Bounce animation on mount and count change
  useEffect(() => {
    scale.value = withSequence(withSpring(1.2, { damping: 10 }), withSpring(1, { damping: 15 }));
  }, [count, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayCount = count > 99 ? '99+' : count.toString();

  // Dynamic badge style
  const badgeStyle = StyleSheet.create({
    badge: {
      backgroundColor: colors.interactive.default,
    },
  });

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[styles.badge, badgeStyle.badge, animatedStyle]}>
      <Text style={styles.badgeText}>{displayCount}</Text>
    </Animated.View>
  );
});

UnreadBadge.displayName = 'UnreadBadge';
