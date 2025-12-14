// src/shared/components/AnimatedListItem/AnimatedListItem.tsx
// Animated List Item Wrapper - Production Ready
// Tüm list item'lar için standardize edilmiş press animation

import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedListItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  hapticType?: 'light' | 'medium' | 'heavy';
  pressScale?: number;
  disabled?: boolean;
  testID?: string;
}

/**
 * Animated List Item Wrapper
 *
 * Tüm list item'lar için tutarlı press animation ve haptic feedback sağlar.
 *
 * KULLANIM:
 *
 * ```tsx
 * // Notification list
 * <AnimatedListItem onPress={() => handleNotificationPress(item)}>
 *   <NotificationCard notification={item} />
 * </AnimatedListItem>
 *
 * // Conversation list with long press
 * <AnimatedListItem
 *   onPress={() => handlePress(item)}
 *   onLongPress={() => handleLongPress(item)}
 *   hapticType="medium"
 * >
 *   <ConversationCard conversation={item} />
 * </AnimatedListItem>
 * ```
 */
export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  onPress,
  onLongPress,
  hapticType = 'light',
  pressScale = 0.98,
  disabled = false,
  testID,
}) => {
  const { trigger } = useHaptic();
  const pressed = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    pressed.value = withSpring(1, spring.press);
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, spring.press);
  }, [pressed]);

  const handlePress = useCallback(() => {
    if (disabled || !onPress) return;
    trigger(hapticType);
    onPress();
  }, [disabled, onPress, trigger, hapticType]);

  const handleLongPress = useCallback(() => {
    if (disabled || !onLongPress) return;
    trigger('medium');
    onLongPress();
  }, [disabled, onLongPress, trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, pressScale]);
    return {
      transform: [{ scale }],
    };
  });

  return (
    <AnimatedPressable
      testID={testID}
      style={animatedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      disabled={disabled}>
      {children}
    </AnimatedPressable>
  );
};
