// src/shared/components/Card/Card.tsx
// Dengin Design System - Modern Card Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { shadows } from '@theme/shadows';
import { spring } from '@theme/animations';

import { styles, getVariantStyles } from './Card.styles';
import { CARD_PADDING_VALUES, CARD_RADIUS_VALUES, type CardProps } from './Card.types';

// Create animated component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern Card Component
 *
 * Features:
 * - Multiple variants (elevated, outlined, filled, glass, gradient)
 * - Spring-based press animations
 * - Haptic feedback
 * - Glass morphism support
 * - Gradient background support
 * - Header/Footer slots
 * - Selection state
 *
 * @example
 * ```tsx
 * // Basic elevated card
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 *
 * // Interactive card with gradient
 * <Card
 *   variant="gradient"
 *   gradientColors={['#FF6B6B', '#4ECDC4']}
 *   onPress={() => handlePress()}
 *   animated
 * >
 *   <Text>Gradient card</Text>
 * </Card>
 *
 * // Card with header and footer
 * <Card
 *   header={<Text>Header</Text>}
 *   footer={<Text>Footer</Text>}
 * >
 *   <Text>Content</Text>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = memo(
  ({
    children,
    variant = 'elevated',
    padding = 'md',
    size = 'medium',
    onPress,
    onLongPress,
    disabled = false,
    animated = true,
    pressScale = 0.96,
    style,
    testID,
    accessibilityLabel,
    accessibilityHint,
    gradientColors,
    selected = false,
    hapticType = 'light',
    header,
    footer,
  }) => {
    const colors = useColors();
    const { triggerSystem } = useSemanticHaptic();

    // Animation values
    const pressed = useSharedValue(0);

    // Get variant and size config
    const variantStyles = getVariantStyles(variant, colors);
    const paddingValue = CARD_PADDING_VALUES[padding];
    const borderRadius = CARD_RADIUS_VALUES[size];

    // Default gradient colors - ensure at least 2 colors
    const gradientArray = gradientColors ?? colors.gradient.primary;
    const defaultGradientColors = gradientArray.filter(Boolean) as [string, string, ...string[]];

    // Shadow styles (only for elevated and gradient variants)
    const shadowStyle = useMemo(() => {
      if (!variantStyles.shadowEnabled) return {};
      return shadows.card;
    }, [variantStyles.shadowEnabled]);

    // Animated container style
    const animatedContainerStyle = useAnimatedStyle(() => {
      if (!animated || (!onPress && !onLongPress)) {
        return {};
      }

      const scale = interpolate(pressed.value, [0, 1], [1, pressScale]);

      return {
        transform: [{ scale }],
      };
    });

    // Press handlers
    const handlePressIn = useCallback(() => {
      if (!disabled) {
        pressed.value = withSpring(1, spring.press);
      }
    }, [disabled, pressed]);

    const handlePressOut = useCallback(() => {
      pressed.value = withSpring(0, spring.press);
    }, [pressed]);

    const handlePress = useCallback(() => {
      if (hapticType !== 'none') {
        triggerSystem('confirm');
      }
      onPress?.();
    }, [hapticType, onPress, triggerSystem]);

    const handleLongPress = useCallback(() => {
      triggerSystem('confirm');
      onLongPress?.();
    }, [onLongPress, triggerSystem]);

    // Container styles
    const containerStyles = useMemo(
      () => [
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: selected ? colors.interactive.default : variantStyles.borderColor,
          borderRadius,
          borderWidth: selected ? 2 : variantStyles.borderWidth,
          padding: paddingValue,
        },
        shadowStyle,
        disabled && styles.disabled,
        style,
      ],
      [
        variantStyles,
        borderRadius,
        paddingValue,
        shadowStyle,
        disabled,
        selected,
        colors.interactive.default,
        style,
      ],
    );

    // Content wrapper
    const renderContent = () => (
      <>
        {/* Gradient Background */}
        {variant === 'gradient' && (
          <LinearGradient
            colors={defaultGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { borderRadius }]}
          />
        )}

        {/* Header */}
        {header && (
          <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
            {header}
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>{children}</View>

        {/* Footer */}
        {footer && (
          <View style={[styles.footer, { borderTopColor: colors.border.default }]}>{footer}</View>
        )}
      </>
    );

    // Interactive card
    if (onPress || onLongPress) {
      return (
        <AnimatedPressable
          style={[containerStyles, animatedContainerStyle]}
          onPress={handlePress}
          onLongPress={onLongPress ? handleLongPress : undefined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          testID={testID}
          accessible
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled, selected }}>
          {renderContent()}
        </AnimatedPressable>
      );
    }

    // Static card
    return (
      <Animated.View
        style={[containerStyles, animatedContainerStyle]}
        testID={testID}
        accessible
        accessibilityLabel={accessibilityLabel}>
        {renderContent()}
      </Animated.View>
    );
  },
);

Card.displayName = 'Card';
