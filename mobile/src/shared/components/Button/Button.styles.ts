// src/shared/components/Button/Button.styles.ts
// Meslektaş Design System - Button Styles
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@theme/types';
import type { ButtonVariant, ButtonVariantStyles } from './Button.types';

/**
 * Get variant-specific styles based on theme colors
 */
export const getVariantStyles = (
  variant: ButtonVariant,
  colors: ThemeColors,
): ButtonVariantStyles => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.interactive.default,
        textColor: colors.text.inverse,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    case 'secondary':
      return {
        backgroundColor: colors.background.secondary,
        textColor: colors.text.primary,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    case 'outline':
      return {
        backgroundColor: 'transparent',
        textColor: colors.interactive.default,
        borderColor: colors.interactive.default,
        borderWidth: 2,
      };

    case 'ghost':
      return {
        backgroundColor: 'transparent',
        textColor: colors.interactive.default,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    case 'danger':
      return {
        backgroundColor: colors.status.error,
        textColor: colors.text.inverse,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    case 'success':
      return {
        backgroundColor: colors.status.success,
        textColor: colors.text.inverse,
        borderColor: 'transparent',
        borderWidth: 0,
      };

    case 'gradient':
    case 'premium':
      // Gradient buttons use LinearGradient, so bg is transparent
      return {
        backgroundColor: 'transparent',
        textColor: '#FFFFFF',
        borderColor: 'transparent',
        borderWidth: 0,
      };

    default:
      return {
        backgroundColor: colors.interactive.default,
        textColor: colors.text.inverse,
        borderColor: 'transparent',
        borderWidth: 0,
      };
  }
};

/**
 * Static button styles
 */
export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  fullWidth: {
    width: '100%',
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  leftIcon: {
    marginRight: 8,
  },

  rightIcon: {
    marginLeft: 8,
  },

  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
