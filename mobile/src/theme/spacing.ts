// src/theme/spacing.ts
// Meslektaş Design System - Spacing Tokens
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

import type { SpacingKey, BorderRadiusKey, BorderWidthKey, ZIndexKey } from './types';

/**
 * Base Spacing Scale
 * 4px grid system
 */
export const spacing: Record<SpacingKey, number> = {
  '0': 0,
  px: 1,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
} as const;

/**
 * Semantic Spacing
 * Context-based spacing values
 */
export const semanticSpacing = {
  // Screen padding
  screenHorizontal: spacing['4'], // 16px
  screenVertical: spacing['6'], // 24px

  // Card spacing
  cardPadding: spacing['4'], // 16px
  cardGap: spacing['3'], // 12px

  // Section spacing
  sectionGap: spacing['6'], // 24px
  sectionPadding: spacing['4'], // 16px

  // Component spacing
  componentGap: spacing['2'], // 8px
  componentPadding: spacing['3'], // 12px

  // Input spacing
  inputPaddingX: spacing['3'], // 12px
  inputPaddingY: spacing['2.5'], // 10px
  inputGap: spacing['4'], // 16px

  // Button spacing
  buttonPaddingXLarge: spacing['6'], // 24px
  buttonPaddingXMedium: spacing['4'], // 16px
  buttonPaddingXSmall: spacing['3'], // 12px
  buttonGap: spacing['2'], // 8px

  // List spacing
  listItemGap: spacing['2'], // 8px
  listItemPadding: spacing['3'], // 12px

  // Avatar spacing
  avatarGap: spacing['2'], // 8px

  // Icon spacing
  iconGap: spacing['2'], // 8px
  iconPadding: spacing['1.5'], // 6px
} as const;

/**
 * Border Radius
 */
export const borderRadius: Record<BorderRadiusKey, number> = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

/**
 * Border Width
 */
export const borderWidth: Record<BorderWidthKey, number> = {
  '0': 0,
  hairline: 0.5,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
} as const;

/**
 * Touch Target Sizes
 * Minimum: 44x44 points (Apple HIG)
 */
export const touchTarget = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

/**
 * Z-Index Scale
 */
export const zIndex: Record<ZIndexKey, number | 'auto'> = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

export type { SpacingKey, BorderRadiusKey, BorderWidthKey, ZIndexKey };
