// src/theme/index.ts
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

export { colors, lightTheme, darkTheme, type ThemeColors } from './colors';
export {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  typography,
  type TypographyVariant,
} from './typography';
export {
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  type SpacingKey,
  type BorderRadiusKey,
} from './spacing';
export { shadows, type ShadowKey } from './shadows';

import { lightTheme, darkTheme, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, borderWidth, zIndex } from './spacing';
import { shadows } from './shadows';

/**
 * Complete theme object
 */
export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  borderWidth: typeof borderWidth;
  zIndex: typeof zIndex;
  shadows: typeof shadows;
  isDark: boolean;
}

/**
 * Light theme
 */
export const light: Theme = {
  colors: lightTheme,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  shadows,
  isDark: false,
};

/**
 * Dark theme
 */
export const dark: Theme = {
  colors: darkTheme,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  zIndex,
  shadows,
  isDark: true,
};
