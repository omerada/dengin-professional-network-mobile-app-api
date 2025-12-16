// src/theme/index.ts
// Dengin Design System - Unified Exports
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

// Types
export type {
  Theme,
  ThemeColors,
  ThemeContextValue,
  ThemeMode,
  TypographyVariant,
  TypographyStyles,
  SpacingKey,
  BorderRadiusKey,
  BorderWidthKey,
  ZIndexKey,
  ShadowVariant,
  ShadowStyle,
  LayeredShadowVariant,
  SpringConfig,
  SpringPreset,
  DurationKey,
  HapticType,
  HapticFeedback,
  TouchTargetSizes,
  ColorPalette,
  BackgroundColors,
  TextColors,
  InteractiveColors,
  BorderColors,
  StatusColors,
  SpecialColors,
  GradientColors,
} from './types';

// Colors
export { palette, colors, lightTheme, darkTheme } from './colors';

// Typography
export {
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
  typography,
} from './typography';

// Spacing
export {
  spacing,
  semanticSpacing,
  borderRadius,
  borderWidth,
  touchTarget,
  zIndex,
} from './spacing';

// Shadows
export { shadows, layeredShadows, innerShadows } from './shadows';

// Animations
export {
  duration,
  spring,
  easing,
  animationPresets,
  layoutAnimations,
  gestureAnimations,
} from './animations';

import { lightTheme, darkTheme } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, borderWidth, zIndex, touchTarget } from './spacing';
import { shadows, layeredShadows } from './shadows';
import type { Theme } from './types';

/**
 * Light Theme Object
 */
export const light: Theme = {
  colors: lightTheme,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  shadows,
  layeredShadows,
  touchTarget,
  isDark: false,
};

/**
 * Dark Theme Object
 */
export const dark: Theme = {
  colors: darkTheme,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  shadows,
  layeredShadows,
  touchTarget,
  isDark: true,
};

import { duration, spring, easing } from './animations';

/**
 * Default export for convenience
 */
export default {
  light,
  dark,
  typography,
  spacing,
  shadows,
  animations: {
    duration,
    spring,
    easing,
  },
};
