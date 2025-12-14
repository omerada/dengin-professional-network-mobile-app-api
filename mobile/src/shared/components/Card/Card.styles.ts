// src/shared/components/Card/Card.styles.ts
// Dengin Design System - Card Styles
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@theme/types';
import type { CardVariant, CardVariantStyles } from './Card.types';

/**
 * Get variant-specific styles based on theme colors
 */
export const getVariantStyles = (variant: CardVariant, colors: ThemeColors): CardVariantStyles => {
  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: colors.background.primary,
        borderColor: 'transparent',
        borderWidth: 0,
        shadowEnabled: true,
      };

    case 'outlined':
      return {
        backgroundColor: colors.background.primary,
        borderColor: colors.border.default,
        borderWidth: 1,
        shadowEnabled: false,
      };

    case 'filled':
      return {
        backgroundColor: colors.background.secondary,
        borderColor: 'transparent',
        borderWidth: 0,
        shadowEnabled: false,
      };

    case 'glass':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.border.default,
        borderWidth: 1,
        shadowEnabled: false,
      };

    case 'gradient':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        shadowEnabled: true,
      };

    default:
      return {
        backgroundColor: colors.background.primary,
        borderColor: 'transparent',
        borderWidth: 0,
        shadowEnabled: true,
      };
  }
};

/**
 * Static card styles
 */
export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  content: {
    flex: 1,
  },

  disabled: {
    opacity: 0.5,
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 12,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    paddingBottom: 12,
  },

  selectedBorder: {
    borderWidth: 2,
  },
});
