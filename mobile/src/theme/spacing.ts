// src/theme/spacing.ts
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

/**
 * Spacing scale following 4px/8px grid system
 */
export const spacing = {
  /** 0px */
  none: 0,
  /** 2px */
  '2xs': 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  '2xl': 24,
  /** 32px */
  '3xl': 32,
  /** 40px */
  '4xl': 40,
  /** 48px */
  '5xl': 48,
  /** 64px */
  '6xl': 64,
  /** 80px */
  '7xl': 80,
  /** 96px */
  '8xl': 96,
} as const;

/**
 * Border radius values
 */
export const borderRadius = {
  /** 0px */
  none: 0,
  /** 4px */
  sm: 4,
  /** 8px */
  md: 8,
  /** 12px */
  lg: 12,
  /** 16px */
  xl: 16,
  /** 24px */
  '2xl': 24,
  /** 9999px - Full rounded */
  full: 9999,
} as const;

/**
 * Border width values
 */
export const borderWidth = {
  /** 0px */
  none: 0,
  /** 1px - Hairline */
  hairline: 0.5,
  /** 1px */
  thin: 1,
  /** 2px */
  medium: 2,
  /** 4px */
  thick: 4,
} as const;

/**
 * Z-index values for layering
 */
export const zIndex = {
  /** Behind content */
  behind: -1,
  /** Default level */
  base: 0,
  /** Slightly elevated */
  dropdown: 10,
  /** Sticky elements */
  sticky: 20,
  /** Fixed elements */
  fixed: 30,
  /** Modal backdrop */
  modalBackdrop: 40,
  /** Modal content */
  modal: 50,
  /** Popover */
  popover: 60,
  /** Tooltip */
  tooltip: 70,
  /** Toast notifications */
  toast: 80,
  /** Maximum elevation */
  max: 100,
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
