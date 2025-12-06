// src/features/messaging/components/MessageBubble/MessageStatusIcon.tsx
// Animated message status icon component
// ✓ → ✓✓ → blue ✓✓ animasyonu

import React, { memo, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import type { MessageStatusIconProps } from './MessageBubble.types';

/**
 * MessageStatusIcon - Animasyonlu mesaj durumu ikonu
 *
 * Backend MessageStatus ile uyumlu:
 * - SENDING: Loading spinner
 * - SENT: Single checkmark
 * - DELIVERED: Double checkmark
 * - READ: Blue double checkmark
 * - FAILED: Error icon
 */
export const MessageStatusIcon: React.FC<MessageStatusIconProps> = memo(
  ({ status, animated = true }) => {
    const colors = useColors();
    const scale = useSharedValue(1);

    // Animate on status change
    useEffect(() => {
      if (animated && (status === 'READ' || status === 'DELIVERED')) {
        scale.value = withSequence(
          withSpring(1.3, { damping: 10 }),
          withSpring(1, { damping: 15 }),
        );
      }
    }, [status, animated, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    switch (status) {
      case 'SENDING':
        return <ActivityIndicator size={12} color={colors.text.tertiary} />;

      case 'SENT':
        return (
          <Animated.View
            entering={animated ? FadeIn.duration(200) : undefined}
            style={animatedStyle}>
            <Icon name="checkmark" size={14} color={colors.text.tertiary} />
          </Animated.View>
        );

      case 'DELIVERED':
        return (
          <Animated.View
            entering={animated ? FadeIn.duration(200) : undefined}
            style={animatedStyle}>
            <Icon name="checkmark-done" size={14} color={colors.text.tertiary} />
          </Animated.View>
        );

      case 'READ':
        return (
          <Animated.View
            entering={animated ? FadeIn.duration(200) : undefined}
            style={animatedStyle}>
            <Icon name="checkmark-done" size={14} color={colors.interactive.default} />
          </Animated.View>
        );

      case 'FAILED':
        return (
          <Animated.View entering={animated ? FadeIn.duration(200) : undefined}>
            <Icon name="alert-circle" size={14} color={colors.status.error} />
          </Animated.View>
        );

      default:
        return null;
    }
  },
);

MessageStatusIcon.displayName = 'MessageStatusIcon';
