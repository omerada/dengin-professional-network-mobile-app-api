// src/shared/components/BackButton/BackButton.tsx
// Dengin Design System - Standardized Back Button
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Section 1.1

import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { spring } from '@theme/animations';

import type { BackButtonProps } from './BackButton.types';
import { BACK_BUTTON_SIZES } from './BackButton.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * BackButton Component
 *
 * Standardized back button for all screens.
 * Ensures consistent behavior, styling, and animations across the app.
 *
 * Features:
 * - Consistent press animation
 * - Haptic feedback
 * - Multiple variants (default, circular)
 * - Size options (sm, md, lg)
 * - Auto navigation.goBack() if no custom handler
 *
 * @example
 * ```tsx
 * // Default usage - auto goBack()
 * <BackButton />
 *
 * // With custom handler
 * <BackButton onPress={() => navigation.replace('Welcome')} />
 *
 * // Circular variant
 * <BackButton variant="circular" size="lg" />
 *
 * // Close icon
 * <BackButton icon="close" />
 * ```
 */
export const BackButton = memo<BackButtonProps>(
  ({
    onPress,
    icon = 'arrow-back',
    variant = 'default',
    size = 'md',
    disabled = false,
    color,
    testID = 'back-button',
  }) => {
    const colors = useColors();
    const navigation = useNavigation();
    const { triggerNavigation } = useSemanticHaptic();

    // Animation value
    const scale = useSharedValue(1);

    // Handle press
    const handlePress = useCallback(() => {
      if (disabled) return;

      triggerNavigation('back');

      if (onPress) {
        onPress();
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }, [onPress, navigation, triggerNavigation, disabled]);

    // Animated style
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Size config
    const sizeConfig = BACK_BUTTON_SIZES[size];
    const iconColor = color || colors.text.primary;

    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          if (!disabled) {
            scale.value = withSpring(0.96, spring.press);
          }
        }}
        onPressOut={() => {
          if (!disabled) {
            scale.value = withSpring(1, spring.snappy);
          }
        }}
        disabled={disabled}
        style={[
          styles.button,
          animatedStyle,
          variant === 'circular' && {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
            backgroundColor: colors.background.secondary,
          },
          disabled && styles.disabled,
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        testID={testID}
        accessibilityLabel="Geri"
        accessibilityRole="button"
        accessibilityState={{ disabled }}>
        <Icon name={icon} size={sizeConfig.icon} color={iconColor} />
      </AnimatedPressable>
    );
  },
);

BackButton.displayName = 'BackButton';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
