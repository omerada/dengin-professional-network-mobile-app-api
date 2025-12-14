// src/shared/components/Button/Button.types.ts
// Dengin Design System - Button Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { ViewStyle, TextStyle, AccessibilityProps } from 'react-native';
import type { HapticType } from '@theme/types';

/**
 * Button Variants
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'gradient'
  | 'premium';

/**
 * Button Sizes
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Size Configuration
 */
export interface ButtonSizeConfig {
  height: number;
  paddingX: number;
  fontSize: number;
  iconSize: number;
  borderRadius: number;
}

/**
 * Button Props
 */
export interface ButtonProps extends AccessibilityProps {
  /** Button content - can be text or React elements */
  children?: React.ReactNode;

  /** Text to display (alternative to children) */
  title?: string;

  /** Visual variant of the button */
  variant?: ButtonVariant;

  /** Size of the button */
  size?: ButtonSize;

  /** Shows loading state */
  loading?: boolean;

  /** Disables the button */
  disabled?: boolean;

  /** Makes button full width */
  fullWidth?: boolean;

  /** Icon on the left side */
  leftIcon?: React.ReactNode;

  /** Icon on the right side */
  rightIcon?: React.ReactNode;

  /** Press handler */
  onPress?: () => void;

  /** Long press handler */
  onLongPress?: () => void;

  /** Haptic feedback type */
  hapticType?: HapticType;

  /** Custom container style */
  style?: ViewStyle;

  /** Custom text style */
  textStyle?: TextStyle;

  /** Test ID for testing */
  testID?: string;

  /** Animated scale when pressed (0-1, default 0.97) */
  pressScale?: number;

  /** Loading indicator color override */
  loadingColor?: string;
}

/**
 * Button Variant Styles
 */
export interface ButtonVariantStyles {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
}

/**
 * Size configurations for all button sizes
 */
export const BUTTON_SIZE_CONFIG: Record<ButtonSize, ButtonSizeConfig> = {
  xs: { height: 28, paddingX: 10, fontSize: 12, iconSize: 14, borderRadius: 10 },
  sm: { height: 36, paddingX: 14, fontSize: 14, iconSize: 16, borderRadius: 12 },
  md: { height: 44, paddingX: 18, fontSize: 16, iconSize: 20, borderRadius: 14 },
  lg: { height: 52, paddingX: 24, fontSize: 18, iconSize: 22, borderRadius: 16 },
  xl: { height: 60, paddingX: 32, fontSize: 20, iconSize: 24, borderRadius: 18 },
} as const;
