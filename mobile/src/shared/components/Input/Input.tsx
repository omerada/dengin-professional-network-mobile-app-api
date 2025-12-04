// src/shared/components/Input/Input.tsx
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md
// Oku: mobile-development-guide/ui/20-ACCESSIBILITY.md

import React, { useState, useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, borderRadius, borderWidth } from '@theme';

/**
 * Input props
 */
interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
  disabled?: boolean;
  testID?: string;
}

/**
 * Input component
 * Reusable text input with label, error, and icon support
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      required = false,
      disabled = false,
      secureTextEntry,
      testID,
      ...props
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
        setIsFocused(true);
        props.onFocus?.(e);
      },
      [props],
    );

    const handleBlur = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
        setIsFocused(false);
        props.onBlur?.(e);
      },
      [props],
    );

    const togglePasswordVisibility = useCallback(() => {
      setIsPasswordVisible(prev => !prev);
    }, []);

    const containerStyles = useMemo<ViewStyle[]>(() => {
      const baseStyle: ViewStyle = {
        marginBottom: spacing.lg,
      };

      return [baseStyle, containerStyle].filter(Boolean) as ViewStyle[];
    }, [containerStyle]);

    const inputContainerStyles = useMemo<ViewStyle[]>(() => {
      const baseStyle: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: borderWidth.thin,
        borderRadius: borderRadius.md,
        backgroundColor: disabled
          ? theme.colors.background.tertiary
          : theme.colors.background.primary,
        borderColor: error
          ? theme.colors.error.main
          : isFocused
            ? theme.colors.primary[500]
            : theme.colors.border.medium,
        paddingHorizontal: spacing.md,
        minHeight: 48,
      };

      return [baseStyle];
    }, [theme, isFocused, error, disabled]);

    const inputStyles = useMemo<TextStyle[]>(() => {
      const baseStyle: TextStyle = {
        flex: 1,
        fontSize: 16,
        color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
        paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
      };

      return [baseStyle, inputStyle].filter(Boolean) as TextStyle[];
    }, [theme, disabled, inputStyle]);

    const labelStyles = useMemo<TextStyle>(() => {
      return {
        fontSize: 14,
        fontWeight: '500',
        color: error ? theme.colors.error.main : theme.colors.text.primary,
        marginBottom: spacing.xs,
      };
    }, [theme, error]);

    const errorStyles = useMemo<TextStyle>(() => {
      return {
        fontSize: 12,
        color: theme.colors.error.main,
        marginTop: spacing.xs,
      };
    }, [theme]);

    const hintStyles = useMemo<TextStyle>(() => {
      return {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: spacing.xs,
      };
    }, [theme]);

    return (
      <View style={containerStyles}>
        {label && (
          <Text style={labelStyles}>
            {label}
            {required && <Text style={{ color: theme.colors.error.main }}> *</Text>}
          </Text>
        )}

        <View style={inputContainerStyles}>
          {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            testID={testID}
            style={inputStyles}
            placeholderTextColor={theme.colors.text.tertiary}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            accessible={true}
            accessibilityLabel={label || props.placeholder}
            accessibilityHint={hint}
            accessibilityState={{
              disabled,
            }}
            {...props}
          />

          {secureTextEntry && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? 'Şifreyi gizle' : 'Şifreyi göster'}>
              <Text style={{ color: theme.colors.text.secondary }}>
                {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          )}

          {rightIcon && !secureTextEntry && (
            <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>
          )}
        </View>

        {error && <Text style={errorStyles}>{error}</Text>}
        {hint && !error && <Text style={hintStyles}>{hint}</Text>}
      </View>
    );
  },
);

Input.displayName = 'Input';
