// src/shared/components/Input/Input.styles.ts
// Meslektaş Design System - Input Styles
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@theme/types';
import type { InputVariant, InputVariantStyles } from './Input.types';

/**
 * Get variant-specific styles based on theme colors
 */
export const getVariantStyles = (
  variant: InputVariant,
  colors: ThemeColors,
): InputVariantStyles => {
  switch (variant) {
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.border.default,
        borderWidth: 1,
        focusedBorderColor: colors.interactive.default,
        focusedBorderWidth: 2,
      };

    case 'filled':
      return {
        backgroundColor: colors.background.secondary,
        borderColor: 'transparent',
        borderWidth: 0,
        focusedBorderColor: colors.interactive.default,
        focusedBorderWidth: 2,
      };

    case 'underlined':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.border.default,
        borderWidth: 0,
        focusedBorderColor: colors.interactive.default,
        focusedBorderWidth: 2,
      };

    default:
      return {
        backgroundColor: 'transparent',
        borderColor: colors.border.default,
        borderWidth: 1,
        focusedBorderColor: colors.interactive.default,
        focusedBorderWidth: 2,
      };
  }
};

/**
 * Get state-specific border color
 */
export const getStateBorderColor = (
  state: 'default' | 'focused' | 'error' | 'success',
  colors: ThemeColors,
): string => {
  switch (state) {
    case 'focused':
      return colors.interactive.default;
    case 'error':
      return colors.status.error;
    case 'success':
      return colors.status.success;
    default:
      return colors.border.default;
  }
};

/**
 * Static input styles
 */
export const styles = StyleSheet.create({
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },

  clearButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },

  passwordToggle: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
    marginLeft: 4,
  },

  container: {
    marginBottom: 16,
    paddingTop: 24, // More space for larger label
  },

  content: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  disabled: {
    opacity: 0.5,
  },

  helperText: {
    fontSize: 12,
    marginLeft: 0, // Align with label
    marginTop: 4,
  },

  input: {
    flex: 1,
    padding: 0,
  },

  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },

  label: {
    alignSelf: 'flex-start',
    left: 0,
    position: 'absolute',
    textAlign: 'left',
    zIndex: 1,
  },

  leftIcon: {
    marginRight: 8,
  },

  requiredStar: {
    fontWeight: '500',
  },

  rightIcon: {
    marginLeft: 8,
  },

  // Underlined variant specific styles
  underlinedContainer: {
    borderBottomWidth: 1,
    borderRadius: 0,
  },
});
