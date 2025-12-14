// src/shared/components/Input/Input.types.ts
// Dengin Design System - Input Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import type { TextInputProps, TextStyle, ViewStyle } from 'react-native';

/**
 * Input variants
 */
export type InputVariant = 'outlined' | 'filled' | 'underlined';

/**
 * Input sizes
 */
export type InputSize = 'small' | 'medium' | 'large';

/**
 * Input state
 */
export type InputState = 'default' | 'focused' | 'error' | 'success' | 'disabled';

/**
 * Input size configuration
 */
export interface InputSizeConfig {
  /** Minimum height in pixels */
  height: number;
  /** Font size for input text */
  fontSize: number;
  /** Label font size */
  labelFontSize: number;
  /** Horizontal padding */
  paddingX: number;
  /** Vertical padding */
  paddingY: number;
  /** Border radius */
  borderRadius: number;
  /** Icon size */
  iconSize: number;
}

/**
 * Size configurations for Input variants
 */
export const INPUT_SIZE_CONFIG: Record<InputSize, InputSizeConfig> = {
  small: {
    height: 44,
    fontSize: 14,
    labelFontSize: 12,
    paddingX: 12,
    paddingY: 10,
    borderRadius: 10,
    iconSize: 18,
  },
  medium: {
    height: 52,
    fontSize: 16,
    labelFontSize: 14,
    paddingX: 16,
    paddingY: 14,
    borderRadius: 12,
    iconSize: 20,
  },
  large: {
    height: 60,
    fontSize: 18,
    labelFontSize: 16,
    paddingX: 20,
    paddingY: 18,
    borderRadius: 14,
    iconSize: 24,
  },
};

/**
 * Input component props
 */
export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Visual variant of the input */
  variant?: InputVariant;

  /** Size of the input */
  size?: InputSize;

  /** Label text (floating label) */
  label?: string;

  /** Error message */
  error?: string;

  /** Hint text shown below input */
  hint?: string;

  /** Icon to display on the left */
  leftIcon?: React.ReactNode;

  /** Icon to display on the right */
  rightIcon?: React.ReactNode;

  /** Whether the input is required */
  required?: boolean;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Whether to show a success state */
  success?: boolean;

  /** Additional container styles */
  containerStyle?: ViewStyle;

  /** Additional input styles */
  inputStyle?: TextStyle;

  /** Additional label styles */
  labelStyle?: TextStyle;

  /** Test ID for testing */
  testID?: string;

  /** Callback when clear button is pressed (only for clearable inputs) */
  onClear?: () => void;

  /** Whether to show a clear button when there's text */
  clearable?: boolean;

  /** Whether to animate the floating label */
  floatingLabel?: boolean;

  /** Maximum character count (shows counter when set) */
  maxLength?: number;

  /** Whether to show character count */
  showCharCount?: boolean;

  /** Accessibility hint */
  accessibilityHint?: string;

  /** Password visibility state (for shared password visibility) */
  isPasswordVisible?: boolean;

  /** Callback when password visibility toggle is pressed */
  onPasswordVisibilityToggle?: () => void;
}

/**
 * Input variant styles
 */
export interface InputVariantStyles {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  focusedBorderColor: string;
  focusedBorderWidth: number;
}

/**
 * Input ref methods
 */
export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}
