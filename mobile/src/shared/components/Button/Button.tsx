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
import { useHaptic } from '@shared/hooks/useHaptic';

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
    pressScale = 0.96, // UNIFIED: Standardized press scale
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
    const { trigger } = useHaptic();

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

    // Animation handlers - UNIFIED: Standardized spring config
    const handlePressIn = useCallback(() => {
      pressed.value = withSpring(1, { damping: 15, stiffness: 500, mass: 0.5 });
    }, [pressed]);

    const handlePressOut = useCallback(() => {
      pressed.value = withSpring(0, { damping: 15, stiffness: 500, mass: 0.5 });
    }, [pressed]);

    const handlePress = useCallback(() => {
      if (disabled || loading) return;
      trigger(hapticType);
      onPress?.();
    }, [disabled, loading, trigger, hapticType, onPress]);

    const handleLongPress = useCallback(() => {
      if (disabled || loading || !onLongPress) return;
      trigger('medium');
      onLongPress();
    }, [disabled, loading, trigger, onLongPress]);

    // Animated styles
    const animatedContainerStyle = useAnimatedStyle(() => {
      const scaleValue = interpolate(pressed.value, [0, 1], [1, pressScale]);
      return {
        transform: [{ scale: scaleValue }],
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
