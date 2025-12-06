// src/theme/shadows.ts
// Meslektaş Design System - Shadow Tokens
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

import { Platform, ViewStyle } from 'react-native';
import type { ShadowStyle, ShadowVariant, LayeredShadowVariant } from './types';

/**
 * Shadow Generator
 * Creates platform-specific shadows
 */
const createShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
  color: string = '#000000',
): ShadowStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation: elevation,
});

/**
 * Base Shadow Scale
 */
export const shadows: Record<ShadowVariant, ShadowStyle> = {
  none: createShadow(0, 0, 0, 0),

  // Extra Small - Subtle lift
  xs: createShadow(1, 2, 0.05, 1),

  // Small - Cards, buttons
  sm: createShadow(1, 3, 0.1, 2),

  // Medium - Dropdowns, active cards
  md: createShadow(4, 6, 0.1, 4),

  // Large - Modals, popovers
  lg: createShadow(10, 15, 0.1, 8),

  // Extra Large - Dialogs
  xl: createShadow(20, 25, 0.1, 12),

  // 2XL - Maximum elevation
  '2xl': createShadow(25, 50, 0.12, 16),

  // Card - Alias for sm
  card: createShadow(1, 3, 0.1, 2),

  // Toast - Elevated notification
  toast: createShadow(6, 10, 0.15, 6),
} as const;

/**
 * Layered Shadows
 * More realistic multi-layer shadows
 */
export const layeredShadows: Record<LayeredShadowVariant, ViewStyle> = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,

  cardHover: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }) as ViewStyle,

  button: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0066FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,

  modal: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: {
      elevation: 24,
    },
    default: {},
  }) as ViewStyle,

  fab: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0066FF',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,

  image: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }) as ViewStyle,
} as const;

/**
 * Inner Shadows (for inputs, wells)
 * Simulated with border + background
 */
export const innerShadows = {
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },

  well: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
} as const;

export type ShadowKey = ShadowVariant;
export type { ShadowVariant, LayeredShadowVariant };
