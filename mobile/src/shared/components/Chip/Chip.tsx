// src/shared/components/Chip/Chip.tsx
// Dengin Design System - Chip/Tag Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { spring } from '@theme/animations';

// ============================================================================
// Types
// ============================================================================

export type ChipVariant = 'filled' | 'outlined' | 'soft';
export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export interface ChipProps {
  /** Chip label */
  label: string;
  /** Visual variant */
  variant?: ChipVariant;
  /** Size */
  size?: ChipSize;
  /** Color theme */
  color?: ChipColor;
  /** Left icon name (Ionicons) */
  leftIcon?: string;
  /** Right icon name (Ionicons) */
  rightIcon?: string;
  /** Show close/delete icon */
  deletable?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Delete handler */
  onDelete?: () => void;
  /** Container style */
  style?: ViewStyle;
  /** Label style */
  labelStyle?: TextStyle;
  /** Test ID */
  testID?: string;
  /** Enable entry animation */
  animated?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SIZE_CONFIG: Record<
  ChipSize,
  {
    height: number;
    paddingHorizontal: number;
    fontSize: number;
    iconSize: number;
    borderRadius: number;
  }
> = {
  sm: { height: 24, paddingHorizontal: 8, fontSize: 12, iconSize: 14, borderRadius: 12 },
  md: { height: 32, paddingHorizontal: 12, fontSize: 14, iconSize: 16, borderRadius: 16 },
  lg: { height: 40, paddingHorizontal: 16, fontSize: 16, iconSize: 20, borderRadius: 20 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// Component
// ============================================================================

/**
 * Chip - Compact element for tags, filters, selections
 *
 * @example
 * // Basic chip
 * <Chip label="React Native" />
 *
 * @example
 * // Selectable chip
 * <Chip
 *   label="Yazılım"
 *   selected={isSelected}
 *   onPress={() => setSelected(!isSelected)}
 * />
 *
 * @example
 * // Deletable tag
 * <Chip
 *   label="Frontend"
 *   deletable
 *   onDelete={handleDelete}
 *   color="primary"
 * />
 */
export const Chip = memo<ChipProps>(function Chip({
  label,
  variant = 'soft',
  size = 'md',
  color = 'primary',
  leftIcon,
  rightIcon,
  deletable = false,
  selected = false,
  disabled = false,
  onPress,
  onDelete,
  style,
  labelStyle,
  testID,
  animated = true,
}) {
  const colors = useColors();
  const { triggerSystem } = useSemanticHaptic();
  const pressed = useSharedValue(0);

  const sizeConfig = SIZE_CONFIG[size];

  // Get color based on color prop
  const getChipColors = useCallback(() => {
    const colorMap: Record<ChipColor, string> = {
      primary: colors.interactive.default,
      secondary: colors.interactive.pressed,
      success: colors.status.success,
      warning: colors.status.warning,
      error: colors.status.error,
      info: colors.status.info,
      neutral: colors.text.secondary,
    };
    return colorMap[color];
  }, [colors, color]);

  const chipColor = getChipColors();

  // Variant styles
  const variantStyles = useMemo(() => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: chipColor,
          borderColor: chipColor,
          textColor: '#FFFFFF',
        };
      case 'outlined':
        return {
          backgroundColor: selected ? chipColor + '15' : 'transparent',
          borderColor: chipColor,
          textColor: chipColor,
        };
      case 'soft':
      default:
        return {
          backgroundColor: selected ? chipColor + '25' : chipColor + '15',
          borderColor: 'transparent',
          textColor: chipColor,
        };
    }
  }, [variant, selected, chipColor]);

  // Press animation
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.05 }],
  }));

  const handlePressIn = useCallback(() => {
    pressed.value = withSpring(1, spring.stiff);
    triggerSystem('confirm');
  }, [triggerSystem, pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, spring.stiff);
  }, [pressed]);

  // Container style
  const containerStyle = useMemo<ViewStyle[]>(
    () =>
      [
        styles.container,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variant === 'outlined' ? 1 : 0,
          borderColor: variantStyles.borderColor,
        },
        disabled ? styles.disabled : null,
        style ?? null,
      ].filter(Boolean) as ViewStyle[],
    [sizeConfig, variantStyles, variant, disabled, style],
  );

  // Text style
  const textStyle = useMemo<TextStyle[]>(
    () =>
      [
        styles.label,
        {
          fontSize: sizeConfig.fontSize,
          color: variantStyles.textColor,
        },
        labelStyle ?? null,
      ].filter(Boolean) as TextStyle[],
    [sizeConfig.fontSize, variantStyles.textColor, labelStyle],
  );

  const iconColor = variantStyles.textColor;

  const content = (
    <>
      {leftIcon && (
        <Icon
          name={leftIcon}
          size={sizeConfig.iconSize}
          color={iconColor}
          style={styles.leftIcon}
        />
      )}
      <Text style={textStyle} numberOfLines={1}>
        {label}
      </Text>
      {rightIcon && !deletable && (
        <Icon
          name={rightIcon}
          size={sizeConfig.iconSize}
          color={iconColor}
          style={styles.rightIcon}
        />
      )}
      {deletable && (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          style={styles.deleteButton}
          accessibilityLabel={`Remove ${label}`}
          accessibilityRole="button">
          <Icon name="close-circle" size={sizeConfig.iconSize} color={iconColor} />
        </Pressable>
      )}
    </>
  );

  const Wrapper = animated ? Animated.View : View;
  const enteringAnimation = animated ? ZoomIn.springify() : undefined;
  const exitingAnimation = animated ? ZoomOut.springify() : undefined;

  if (onPress) {
    return (
      <Wrapper entering={enteringAnimation} exiting={exitingAnimation}>
        <AnimatedPressable
          style={[animatedContainerStyle, containerStyle]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          testID={testID}
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ selected, disabled }}>
          {content}
        </AnimatedPressable>
      </Wrapper>
    );
  }

  return (
    <Wrapper entering={enteringAnimation} exiting={exitingAnimation}>
      <View style={containerStyle} testID={testID}>
        {content}
      </View>
    </Wrapper>
  );
});

/**
 * ChipGroup - Container for multiple chips with wrap support
 */
export interface ChipGroupProps {
  children: React.ReactNode;
  spacing?: number;
  style?: ViewStyle;
}

export const ChipGroup = memo<ChipGroupProps>(function ChipGroup({ children, spacing = 8, style }) {
  return <View style={[styles.group, { gap: spacing }, style]}>{children}</View>;
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButton: {
    marginLeft: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '500',
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
  },
});
