import React, { useState, useCallback } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { fontSize, spacing } from '@theme';
import { UNIFIED_TIMING } from '@constants';

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  validationRules?: ValidationRule[];
  showValidationOnBlur?: boolean;
  showValidationOnChange?: boolean;
  required?: boolean;
}

export const FormField = React.forwardRef<TextInput, FormFieldProps>(
  (
    {
      label,
      error: externalError,
      helper,
      icon,
      rightIcon,
      onRightIconPress,
      validationRules = [],
      showValidationOnBlur = true,
      showValidationOnChange = false,
      required = false,
      onChangeText,
      onBlur,
      onFocus,
      ...textInputProps
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>();
    const [hasBeenBlurred, setHasBeenBlurred] = useState(false);
    const focusScale = useSharedValue(1);

    const error = externalError || internalError;
    const hasError = !!error;
    const showError = hasError && (showValidationOnChange || hasBeenBlurred);

    // Validate input value
    const validate = useCallback(
      (value: string): string | undefined => {
        // Required check
        if (required && !value.trim()) {
          return 'This field is required';
        }

        // Run validation rules
        for (const rule of validationRules) {
          if (!rule.validate(value)) {
            return rule.message;
          }
        }

        return undefined;
      },
      [required, validationRules],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        onChangeText?.(text);

        // Real-time validation if enabled
        if (showValidationOnChange || hasBeenBlurred) {
          const validationError = validate(text);
          setInternalError(validationError);
        }
      },
      [onChangeText, showValidationOnChange, hasBeenBlurred, validate],
    );

    const handleFocus = useCallback(
      (e: Parameters<Required<TextInputProps>['onFocus']>[0]) => {
        setIsFocused(true);
        focusScale.value = withTiming(1.02, { duration: UNIFIED_TIMING.componentEnter });
        onFocus?.(e);
      },
      [onFocus, focusScale],
    );

    const handleBlur = useCallback(
      (e: Parameters<Required<TextInputProps>['onBlur']>[0]) => {
        setIsFocused(false);
        setHasBeenBlurred(true);
        focusScale.value = withTiming(1, { duration: UNIFIED_TIMING.componentEnter });

        // Validate on blur if enabled
        if (showValidationOnBlur) {
          const validationError = validate(textInputProps.value || '');
          setInternalError(validationError);
        }

        onBlur?.(e);
      },
      [onBlur, showValidationOnBlur, textInputProps.value, validate, focusScale],
    );

    const borderColor =
      hasError && showError
        ? colors.status.error
        : isFocused
          ? colors.interactive.focus
          : colors.border.default;

    const iconColor =
      hasError && showError
        ? colors.status.error
        : isFocused
          ? colors.interactive.focus
          : colors.text.secondary;

    const scaleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: focusScale.value }],
    }));

    const styles = StyleSheet.create({
      container: {
        marginBottom: spacing['4'],
      },
      errorIcon: {
        marginTop: 2,
      },
      errorText: {
        color: colors.status.error,
        fontSize: fontSize.sm,
        marginLeft: spacing['1'],
      },
      helperContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: spacing['2'],
      },
      helperText: {
        color: colors.text.secondary,
        fontSize: fontSize.sm,
        marginLeft: spacing['1'],
      },
      input: {
        color: colors.text.primary,
        flex: 1,
        fontSize: fontSize.base,
        paddingVertical: spacing['4'],
      },
      inputContainer: {
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        borderColor,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: 'row',
        minHeight: 56,
        paddingHorizontal: spacing['4'],
      },
      label: {
        color: colors.text.primary,
        fontSize: fontSize.sm,
        fontWeight: '600',
      },
      labelContainer: {
        flexDirection: 'row',
        marginBottom: spacing['2'],
      },
      leftIconContainer: {
        marginRight: spacing['3'],
      },
      required: {
        color: colors.status.error,
        marginLeft: spacing['1'],
      },
      rightIconContainer: {
        marginLeft: spacing['3'],
      },
    });

    return (
      <View style={styles.container}>
        {/* Label */}
        {label && (
          <View style={styles.labelContainer}>
            <Animated.Text style={styles.label}>{label}</Animated.Text>
            {required && <Animated.Text style={styles.required}>*</Animated.Text>}
          </View>
        )}

        {/* Input Container */}
        <Animated.View style={[styles.inputContainer, scaleStyle]}>
          {/* Left Icon */}
          {icon && (
            <View style={styles.leftIconContainer}>
              <Ionicons name={icon} size={20} color={iconColor} />
            </View>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor={colors.text.secondary}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...textInputProps}
          />

          {/* Right Icon */}
          {rightIcon && (
            <Pressable
              style={styles.rightIconContainer}
              onPress={onRightIconPress}
              hitSlop={spacing['2']}>
              <Ionicons name={rightIcon} size={20} color={iconColor} />
            </Pressable>
          )}

          {/* Validation Success Icon */}
          {!hasError && hasBeenBlurred && textInputProps.value && validationRules.length > 0 && (
            <Animated.View
              entering={FadeIn.duration(UNIFIED_TIMING.componentEnter)}
              layout={Layout.duration(UNIFIED_TIMING.componentEnter)}
              style={styles.rightIconContainer}>
              <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
            </Animated.View>
          )}
        </Animated.View>

        {/* Helper / Error Text */}
        {(helper || showError) && (
          <Animated.View
            entering={
              showError ? FadeInDown.duration(200) : FadeIn.duration(UNIFIED_TIMING.componentEnter)
            }
            exiting={FadeOut.duration(UNIFIED_TIMING.componentEnter)}
            layout={Layout.duration(UNIFIED_TIMING.componentEnter)}
            style={styles.helperContainer}>
            {showError ? (
              <>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={colors.status.error}
                  style={styles.errorIcon}
                />
                <Animated.Text style={styles.errorText}>{error}</Animated.Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.text.secondary}
                />
                <Animated.Text style={styles.helperText}>{helper}</Animated.Text>
              </>
            )}
          </Animated.View>
        )}
      </View>
    );
  },
);

FormField.displayName = 'FormField';

// Validation helper functions
export const ValidationHelpers = {
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address',
  },
  minLength: (min: number) => ({
    validate: (value: string) => value.length >= min,
    message: `Must be at least ${min} characters`,
  }),
  maxLength: (max: number) => ({
    validate: (value: string) => value.length <= max,
    message: `Must be at most ${max} characters`,
  }),
  phone: {
    validate: (value: string) =>
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value),
    message: 'Please enter a valid phone number',
  },
  url: {
    validate: (value: string) => /^https?:\/\/.+\..+/.test(value),
    message: 'Please enter a valid URL',
  },
  alphanumeric: {
    validate: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    message: 'Only letters and numbers allowed',
  },
  noSpaces: {
    validate: (value: string) => !/\s/.test(value),
    message: 'Spaces are not allowed',
  },
  matchesField: (otherValue: string, fieldName: string = 'password') => ({
    validate: (value: string) => value === otherValue,
    message: `Must match ${fieldName}`,
  }),
};
