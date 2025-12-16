// src/shared/components/Input/Input.tsx
// Dengin Design System - Modern Input Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';

import { useColors } from '@contexts/ThemeContext';
import { spring } from '@theme/animations';
import { UNIFIED_TIMING } from '@constants';

import { styles, getVariantStyles } from './Input.styles';
import { INPUT_SIZE_CONFIG, type InputProps, type InputRef } from './Input.types';

// Create animated components
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * Modern Input Component
 *
 * Features:
 * - Floating label animation with spring physics
 * - Multiple variants (outlined, filled, underlined)
 * - Multiple sizes (small, medium, large)
 * - Error/Success states with shake animation
 * - Clear button support
 * - Character count display
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   variant="outlined"
 *   size="medium"
 *   leftIcon={<MailIcon />}
 *   error={errors.email}
 *   required
 * />
 * ```
 */
export const Input = memo(
  forwardRef<InputRef, InputProps>(
    (
      {
        variant = 'outlined',
        size = 'medium',
        label,
        error,
        hint,
        success = false,
        leftIcon,
        rightIcon,
        required = false,
        disabled = false,
        containerStyle,
        inputStyle,
        labelStyle,
        testID,
        onClear,
        clearable = false,
        floatingLabel = true,
        maxLength,
        showCharCount = false,
        accessibilityHint,
        value,
        onFocus,
        onBlur,
        secureTextEntry,
        isPasswordVisible: propPasswordVisible,
        onPasswordVisibilityToggle,
        ...props
      },
      ref,
    ) => {
      const colors = useColors();
      const inputRef = useRef<TextInput>(null);
      const [isFocused, setIsFocused] = useState(false);
      const [localPasswordVisible, setLocalPasswordVisible] = useState(false);

      // Use shared password visibility if available, otherwise use local state
      const isPasswordVisible = propPasswordVisible ?? localPasswordVisible;

      // Animation values
      const focusProgress = useSharedValue(0);
      // labelPosition: 0 = top (label visible above), 1 = inside (label hidden/replaced by placeholder)
      const labelPosition = useSharedValue(value ? 0 : 0);
      const shakeOffset = useSharedValue(0);

      // Get size and variant configs
      const sizeConfig = INPUT_SIZE_CONFIG[size];
      const variantStyles = getVariantStyles(variant, colors);

      // Expose methods via ref
      useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        clear: () => inputRef.current?.clear(),
        isFocused: () => isFocused,
      }));

      // Update label position when value changes
      useEffect(() => {
        // Always keep label on top
        labelPosition.value = withSpring(0, spring.gentle);
      }, [value, labelPosition]);

      // Shake animation on error
      useEffect(() => {
        if (error) {
          shakeOffset.value = withSequence(
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(8, { duration: 50 }),
            withTiming(-8, { duration: 50 }),
            withTiming(0, { duration: 50 }),
          );
        }
      }, [error, shakeOffset]);

      // Floating label animated style
      const animatedLabelStyle = useAnimatedStyle(() => {
        if (!floatingLabel) {
          return {};
        }

        // labelPosition: 0 = always show on top (correct position)
        // We don't animate it anymore, it always stays on top
        const translateY = 0;
        const scale = 0.85; // Always small, on top

        const colorValue = interpolateColor(
          focusProgress.value,
          [0, 1],
          [colors.text.tertiary, colors.interactive.default],
        );

        const labelColor = error
          ? colors.status.error
          : success
            ? colors.status.success
            : colorValue;

        return {
          color: labelColor,
          fontSize: sizeConfig.labelFontSize,
          transform: [{ translateY }, { scale }],
        };
      });

      // Border animated style
      const animatedBorderStyle = useAnimatedStyle(() => {
        const borderColorValue = interpolateColor(
          focusProgress.value,
          [0, 1],
          [variantStyles.borderColor, variantStyles.focusedBorderColor],
        );

        const borderColor = error
          ? colors.status.error
          : success
            ? colors.status.success
            : borderColorValue;

        const borderWidth = withTiming(
          focusProgress.value > 0 ? variantStyles.focusedBorderWidth : variantStyles.borderWidth,
          { duration: UNIFIED_TIMING.inputFocus },
        );

        return {
          borderColor,
          borderWidth,
        };
      });

      // Shake animation style
      const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeOffset.value }],
      }));

      // Focus handler
      const handleFocus = useCallback(
        (e: any) => {
          setIsFocused(true);
          focusProgress.value = withSpring(1, spring.snappy);
          // Keep label on top when focused
          labelPosition.value = withSpring(0, spring.gentle);
          onFocus?.(e);
        },
        [onFocus, focusProgress, labelPosition],
      );

      // Blur handler
      const handleBlur = useCallback(
        (e: any) => {
          setIsFocused(false);
          focusProgress.value = withSpring(0, spring.snappy);
          // Keep label on top always
          labelPosition.value = withSpring(0, spring.gentle);
          onBlur?.(e);
        },
        [value, onBlur, focusProgress, labelPosition],
      );

      // Toggle password visibility
      const togglePasswordVisibility = useCallback(() => {
        if (onPasswordVisibilityToggle) {
          onPasswordVisibilityToggle();
        } else {
          setLocalPasswordVisible(prev => !prev);
        }
      }, [onPasswordVisibilityToggle]);

      // Clear input
      const handleClear = useCallback(() => {
        inputRef.current?.clear();
        onClear?.();
      }, [onClear]);

      // Character count
      const charCount = useMemo(() => {
        const currentLength = value?.length ?? 0;
        return maxLength ? `${currentLength}/${maxLength}` : `${currentLength}`;
      }, [value, maxLength]);

      // Helper text color
      const helperTextColor = useMemo(() => {
        if (error) return colors.status.error;
        if (success) return colors.status.success;
        return colors.text.tertiary;
      }, [error, success, colors]);

      // Underlined variant adjustments
      const isUnderlined = variant === 'underlined';

      return (
        <Animated.View
          style={[styles.container, animatedContainerStyle, containerStyle]}
          testID={testID}>
          {/* Floating Label - Always on top */}
          {label && floatingLabel && (
            <AnimatedText
              style={[
                styles.label,
                {
                  top: -6, // Higher position
                  fontSize: sizeConfig.labelFontSize + 2, // Slightly larger (14px for medium)
                  fontWeight: '600', // Bolder
                  backgroundColor:
                    variant === 'outlined' ? colors.background.primary : 'transparent',
                  paddingHorizontal: variant === 'outlined' ? 4 : 0,
                  marginLeft: 0, // Ensure no left margin
                },
                animatedLabelStyle,
                labelStyle,
              ]}>
              {label}
              {required && (
                <Text style={[styles.requiredStar, { color: colors.status.error }]}> *</Text>
              )}
            </AnimatedText>
          )}

          {/* Static Label (non-floating) */}
          {label && !floatingLabel && (
            <Text
              style={[
                {
                  color: error ? colors.status.error : colors.text.primary,
                  fontSize: sizeConfig.labelFontSize + 2, // Larger
                  fontWeight: '600', // Bolder
                  marginBottom: 8,
                  marginLeft: 0, // Align to left edge
                },
                labelStyle,
              ]}>
              {label}
              {required && (
                <Text style={[styles.requiredStar, { color: colors.status.error }]}> *</Text>
              )}
            </Text>
          )}

          {/* Input Container */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                backgroundColor: variantStyles.backgroundColor,
                borderRadius: isUnderlined ? 0 : sizeConfig.borderRadius,
                minHeight: sizeConfig.height,
                paddingHorizontal: sizeConfig.paddingX,
              },
              isUnderlined && styles.underlinedContainer,
              disabled && styles.disabled,
              animatedBorderStyle,
            ]}>
            {/* Left Icon */}
            {leftIcon && (
              <View style={[styles.leftIcon, { width: sizeConfig.iconSize }]}>{leftIcon}</View>
            )}

            {/* Text Input */}
            <AnimatedTextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: disabled ? colors.text.disabled : colors.text.primary,
                  fontSize: sizeConfig.fontSize,
                  paddingVertical: sizeConfig.paddingY,
                },
                inputStyle,
              ]}
              value={value}
              editable={!disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={props.placeholder}
              placeholderTextColor={colors.text.tertiary}
              selectionColor={colors.interactive.default}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              maxLength={maxLength}
              accessible
              accessibilityLabel={label ?? props.placeholder}
              accessibilityHint={accessibilityHint ?? hint}
              accessibilityState={{ disabled }}
              {...props}
            />

            {/* Password Toggle */}
            {secureTextEntry && (
              <Pressable
                onPress={togglePasswordVisibility}
                style={styles.passwordToggle}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? 'Şifreyi gizle' : 'Şifreyi göster'}>
                {isPasswordVisible ? (
                  <Icon name="eye" size={22} color={colors.text.secondary} />
                ) : (
                  <Icon name="eye-off" size={22} color={colors.text.secondary} />
                )}
              </Pressable>
            )}

            {/* Clear Button */}
            {clearable && value && !secureTextEntry && (
              <Pressable
                onPress={handleClear}
                style={styles.clearButton}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Temizle">
                <Text style={{ color: colors.text.tertiary, fontSize: 18 }}>✕</Text>
              </Pressable>
            )}

            {/* Success Icon */}
            {success && !error && !secureTextEntry && !clearable && !rightIcon && (
              <View style={[styles.rightIcon, { width: sizeConfig.iconSize }]}>
                <Icon
                  name="check-circle"
                  size={sizeConfig.iconSize}
                  color={colors.status.success}
                />
              </View>
            )}

            {/* Right Icon */}
            {rightIcon && !secureTextEntry && !clearable && (
              <View style={[styles.rightIcon, { width: sizeConfig.iconSize }]}>{rightIcon}</View>
            )}
          </Animated.View>

          {/* Helper Text Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Error/Hint Text */}
            {(error || hint) && (
              <AnimatedText
                entering={FadeInDown.duration(200)}
                style={[styles.helperText, { color: helperTextColor, flex: 1 }]}>
                {error ?? hint}
              </AnimatedText>
            )}

            {/* Character Count */}
            {showCharCount && (
              <Text
                style={[
                  styles.characterCount,
                  {
                    color:
                      maxLength && (value?.length ?? 0) >= maxLength
                        ? colors.status.error
                        : colors.text.tertiary,
                  },
                ]}>
                {charCount}
              </Text>
            )}
          </View>
        </Animated.View>
      );
    },
  ),
);

Input.displayName = 'Input';
