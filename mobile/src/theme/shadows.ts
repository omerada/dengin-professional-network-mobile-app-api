// src/theme/shadows.ts
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import { Platform, ViewStyle } from 'react-native';

/**
 * Shadow styles for elevation
 * Uses platform-specific implementations
 */
export const shadows: Record<string, ViewStyle> = {
  /** No shadow */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  /** Extra small shadow - subtle elevation */
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }) as ViewStyle,

  /** Small shadow - cards, buttons */
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,

  /** Medium shadow - dropdowns, popovers */
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,

  /** Large shadow - modals, dialogs */
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,

  /** Extra large shadow - floating action buttons */
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }) as ViewStyle,

  /** 2XL shadow - maximum elevation */
  '2xl': Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
    },
    android: {
      elevation: 16,
    },
    default: {},
  }) as ViewStyle,
};

export type ShadowKey = keyof typeof shadows;
