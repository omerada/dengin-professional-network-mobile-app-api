// src/theme/shadows.ts
// Dengin Design System v3.0 - Modern Shadow Tokens
// Profesyonel ve dengeli shadow sistemi

import { Platform, ViewStyle } from 'react-native';
import type { ShadowStyle, ShadowVariant, LayeredShadowVariant } from './types';

/**
 * Modern Shadow Generator
 * Platform-specific shadows - neutral ve profesyonel
 * Yeni tasarım: Copper tint yerine neutral shadow (daha dengeli)
 */
const SHADOW_COLOR = '#1F2937'; // Cool gray 800 - dengeli ve profesyonel

const createShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
  color: string = SHADOW_COLOR,
): ShadowStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation: elevation,
});

/**
 * Base Shadow Scale - Modern & Balanced
 * Tüm platformlarda profesyonel görünüm
 */
export const shadows: Record<ShadowVariant, ShadowStyle> = {
  none: createShadow(0, 0, 0, 0, 'transparent'),

  // Extra Small - Subtle lift (badges, small cards)
  xs: createShadow(1, 3, 0.06, 1),

  // Small - Cards, buttons
  sm: createShadow(2, 4, 0.08, 2),

  // Medium - Dropdowns, active cards
  md: createShadow(4, 8, 0.1, 4),

  // Large - Modals, popovers
  lg: createShadow(8, 16, 0.12, 8),

  // Extra Large - Dialogs, bottom sheets
  xl: createShadow(12, 24, 0.14, 12),

  // 2XL - Maximum elevation
  '2xl': createShadow(16, 32, 0.16, 16),

  // Card - Card elevation
  card: createShadow(2, 4, 0.08, 2),

  // Toast - Elevated notification
  toast: createShadow(6, 12, 0.12, 6),
} as const;

/**
 * Layered Shadows - Modern & Professional
 * Gerçekçi multi-layer shadows - dengeli ve profesyonel
 */
export const layeredShadows: Record<LayeredShadowVariant, ViewStyle> = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,

  cardHover: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
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
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }) as ViewStyle,

  modal: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }) as ViewStyle,

  fab: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,

  image: Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
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
