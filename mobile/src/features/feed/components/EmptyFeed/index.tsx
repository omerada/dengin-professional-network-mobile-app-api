// src/features/feed/components/EmptyFeed/index.tsx
// Dengin Design System - Modern EmptyFeed Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

import { styles } from './EmptyFeed.styles';
import type { EmptyFeedProps } from './EmptyFeed.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern EmptyFeed Component
 *
 * Features:
 * - Animated entrance
 * - Spring-based button animations
 * - Haptic feedback on action
 * - Customizable icon, title, message, and action
 *
 * @example
 * ```tsx
 * <EmptyFeed
 *   title="Henüz gönderi yok"
 *   message="İlk gönderiyi paylaşan siz olun!"
 *   actionLabel="Gönderi Oluştur"
 *   onAction={() => navigation.navigate('CreatePost')}
 * />
 * ```
 */
export const EmptyFeed: React.FC<EmptyFeedProps> = memo(
  ({
    title = 'Henüz gönderi yok',
    message = 'Takip ettiğiniz kişilerden gönderiler burada görünecek.',
    actionLabel,
    onAction,
    icon = 'newspaper-outline',
    testID,
  }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    // Button animation
    const buttonScale = useSharedValue(1);

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonScale.value }],
    }));

    // Handle action press
    const handleActionPress = useCallback(() => {
      trigger('light');
      buttonScale.value = withSpring(0.95, spring.press);
      setTimeout(() => {
        buttonScale.value = withSpring(1, spring.snappy);
      }, 100);
      onAction?.();
    }, [onAction, trigger, buttonScale]);

    return (
      <View style={styles.container} testID={testID}>
        {/* Animated icon */}
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          style={[styles.iconContainer, { backgroundColor: colors.interactive.focus }]}>
          <Icon name={icon} size={48} color={colors.interactive.default} />
        </Animated.View>

        {/* Animated title */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.title, { color: colors.text.primary }]}>
          {title}
        </Animated.Text>

        {/* Animated message */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.message, { color: colors.text.secondary }]}>
          {message}
        </Animated.Text>

        {/* Action button */}
        {actionLabel && onAction && (
          <AnimatedPressable
            entering={FadeInDown.delay(400).duration(400)}
            style={[
              styles.actionButton,
              { backgroundColor: colors.interactive.default },
              buttonAnimatedStyle,
            ]}
            onPress={handleActionPress}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </AnimatedPressable>
        )}
      </View>
    );
  },
);

EmptyFeed.displayName = 'EmptyFeed';

export default EmptyFeed;
