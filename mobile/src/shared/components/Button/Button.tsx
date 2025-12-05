// src/shared/components/Button/Button.tsx
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import React, { useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, borderRadius } from '@theme';
import { hapticLight } from '@shared/utils/haptics';

/**
 * Button variants
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Button sizes
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button props
 */
interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * Button component
 * Reusable button with multiple variants and sizes
 */
export const Button = React.memo<ButtonProps>(
  ({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    style,
    textStyle,
    testID,
    onPress,
    ...props
  }) => {
    const { theme } = useTheme();

    // Memoized styles based on variant and size
    const buttonStyles = useMemo(() => {
      const baseStyle: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
      };

      // Size styles
      const sizeStyles: Record<ButtonSize, ViewStyle> = {
        sm: {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          minHeight: 36,
        },
        md: {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: 44,
        },
        lg: {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          minHeight: 52,
        },
      };

      // Variant styles
      const variantStyles: Record<ButtonVariant, ViewStyle> = {
        primary: {
          backgroundColor: theme.colors.primary[500],
        },
        secondary: {
          backgroundColor: theme.colors.secondary[500],
        },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary[500],
        },
        ghost: {
          backgroundColor: 'transparent',
        },
        danger: {
          backgroundColor: theme.colors.error.main,
        },
      };

      // Disabled styles
      const disabledStyle: ViewStyle = disabled
        ? {
            opacity: 0.5,
          }
        : {};

      return [
        baseStyle,
        sizeStyles[size],
        variantStyles[variant],
        disabledStyle,
        fullWidth && { width: '100%' },
        style,
      ];
    }, [theme, variant, size, disabled, fullWidth, style]);

    const textStyles = useMemo(() => {
      const baseTextStyle: TextStyle = {
        fontWeight: '600',
        textAlign: 'center',
      };

      // Size text styles
      const sizeTextStyles: Record<ButtonSize, TextStyle> = {
        sm: { fontSize: 14 },
        md: { fontSize: 16 },
        lg: { fontSize: 18 },
      };

      // Variant text styles
      const variantTextStyles: Record<ButtonVariant, TextStyle> = {
        primary: { color: theme.colors.neutral[0] },
        secondary: { color: theme.colors.neutral[0] },
        outline: { color: theme.colors.primary[500] },
        ghost: { color: theme.colors.primary[500] },
        danger: { color: theme.colors.neutral[0] },
      };

      return [baseTextStyle, sizeTextStyles[size], variantTextStyles[variant], textStyle];
    }, [theme, variant, size, textStyle]);

    const handlePress = useCallback(
      (event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
        if (!disabled && !loading && onPress) {
          hapticLight();
          onPress(event);
        }
      },
      [disabled, loading, onPress],
    );

    const loadingColor =
      variant === 'outline' || variant === 'ghost'
        ? theme.colors.primary[500]
        : theme.colors.neutral[0];

    return (
      <TouchableOpacity
        testID={testID}
        style={buttonStyles}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: disabled || loading }}
        {...props}>
        {loading ? (
          <ActivityIndicator size="small" color={loadingColor} />
        ) : (
          <>
            {leftIcon}
            <Text style={textStyles}>{title}</Text>
            {rightIcon}
          </>
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';
