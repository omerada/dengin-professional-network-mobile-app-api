// src/shared/components/Button/Button.tsx
// Dengin Design System - Modern Button Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useMemo } from 'react';
import { Text, View, ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { PRESS_ANIMATION_CONFIG } from '@constants/unifiedGestures';

import { styles, getVariantStyles } from './Button.styles';
import { ButtonProps, BUTTON_SIZE_CONFIG } from './Button.types';

// Create animated pressable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern Button Component
 *
 * Features:
 * - Spring animations on press
 * - Haptic feedback
 * - Multiple variants (primary, secondary, outline, ghost, danger, success, gradient, premium)
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Loading state
 * - Icon support
 * - Full accessibility
 *
 * @example
 * <Button
 *   title="Submit"
 *   variant="primary"
 *   size="md"
 *   onPress={handleSubmit}
 * />
 */
export const Button = memo<ButtonProps>(
  ({
    children,
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    onPress,
    onLongPress,
    hapticType = 'light',
    style,
    textStyle,
    loadingColor,
    testID,
    accessibilityLabel,
    accessibilityHint,
    ...accessibilityProps
  }) => {
    // Hooks
    const { colors } = useTheme();
    const { triggerSystem } = useSemanticHaptic();

    // Animation value
    const pressed = useSharedValue(0);

    // Get configuration
    const sizeConfig = BUTTON_SIZE_CONFIG[size];
    const variantStyles = useMemo(() => getVariantStyles(variant, colors), [variant, colors]);

    // Determine loading indicator color
    const indicatorColor = useMemo(() => {
      if (loadingColor) return loadingColor;
      if (variant === 'outline' || variant === 'ghost') {
        return colors.interactive.default;
      }
      return '#FFFFFF';
    }, [loadingColor, variant, colors]);

    // Animation handlers - PRODUCTION STANDARD: Unified press animation
    const handlePressIn = useCallback(() => {
      const config =
        variant === 'danger' ? PRESS_ANIMATION_CONFIG.DESTRUCTIVE : PRESS_ANIMATION_CONFIG.STANDARD;
      pressed.value = withSpring(config.scale, config.spring);
    }, [pressed, variant]);

    const handlePressOut = useCallback(() => {
      const config = PRESS_ANIMATION_CONFIG.STANDARD;
      pressed.value = withSpring(1, config.spring);
    }, [pressed]);

    const handlePress = useCallback(() => {
      if (disabled || loading) return;
      // Semantic mapping based on variant
      if (variant === 'danger') {
        triggerSystem('alert');
      } else if (variant === 'success') {
        triggerSystem('success');
      } else {
        triggerSystem('confirm');
      }
      onPress?.();
    }, [disabled, loading, triggerSystem, variant, onPress]);

    const handleLongPress = useCallback(() => {
      if (disabled || loading || !onLongPress) return;
      triggerSystem('confirm');
      onLongPress();
    }, [disabled, loading, triggerSystem, onLongPress]);

    // Animated styles - PRODUCTION STANDARD: Dynamic scale based on variant
    const animatedContainerStyle = useAnimatedStyle(() => {
      // pressed.value: 0 = not pressed, 1 = pressed
      // When pressed, use scale from config; when not pressed, use 1
      return {
        transform: [{ scale: pressed.value }],
      };
    });

    const animatedBgStyle = useAnimatedStyle(() => {
      const opacityValue = interpolate(pressed.value, [0, 1], [1, 0.9]);
      return {
        opacity: opacityValue,
      };
    });

    // Display text
    const displayText = title || (typeof children === 'string' ? children : null);

    // Accessibility label
    const a11yLabel = accessibilityLabel || displayText || 'Button';

    // Container style
    const containerStyle = useMemo(
      () => [
        styles.container,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingX,
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth,
          borderRadius: sizeConfig.borderRadius,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ],
      [sizeConfig, variantStyles, fullWidth, disabled, style],
    );

    // Gradient button rendering
    if (variant === 'gradient' || variant === 'premium') {
      const gradientColors =
        variant === 'premium' ? colors.gradient.premium : colors.gradient.primary;

      return (
        <AnimatedPressable
          testID={testID}
          style={[containerStyle, animatedContainerStyle]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={onLongPress ? handleLongPress : undefined}
          disabled={disabled || loading}
          accessible
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: disabled || loading, busy: loading }}
          {...accessibilityProps}>
          <Animated.View
            style={[styles.gradient, { borderRadius: sizeConfig.borderRadius }, animatedBgStyle]}>
            <LinearGradient
              colors={gradientColors as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradient, { borderRadius: sizeConfig.borderRadius }]}
            />
          </Animated.View>

          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator size="small" color={indicatorColor} />
            ) : (
              <>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                {displayText && (
                  <Text
                    style={[
                      styles.text,
                      { fontSize: sizeConfig.fontSize, color: variantStyles.textColor },
                      textStyle,
                    ]}>
                    {displayText}
                  </Text>
                )}
                {!displayText && typeof children !== 'string' && children}
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
              </>
            )}
          </View>
        </AnimatedPressable>
      );
    }

    // Standard button rendering
    return (
      <AnimatedPressable
        testID={testID}
        style={[containerStyle, animatedContainerStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={onLongPress ? handleLongPress : undefined}
        disabled={disabled || loading}
        accessible
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        {...accessibilityProps}>
        {loading ? (
          <ActivityIndicator size="small" color={indicatorColor} />
        ) : (
          <View style={styles.content}>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            {displayText && (
              <Text
                style={[
                  styles.text,
                  { fontSize: sizeConfig.fontSize, color: variantStyles.textColor },
                  textStyle,
                ]}>
                {displayText}
              </Text>
            )}
            {!displayText && typeof children !== 'string' && children}
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </View>
        )}
      </AnimatedPressable>
    );
  },
);

Button.displayName = 'Button';

export default Button;
