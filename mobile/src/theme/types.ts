// src/theme/types.ts
// Meslektaş Design System - TypeScript Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

import { TextStyle, ViewStyle } from 'react-native';

/**
 * Color Palette Type
 * Base renk skalası (50-900)
 */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

/**
 * Gray Color Scale (0-1000 dahil)
 */
export interface GrayColorScale extends ColorScale {
  0: string;
  1000: string;
}

/**
 * Base Color Palette
 */
export interface ColorPalette {
  blue: ColorScale;
  green: ColorScale;
  orange: ColorScale;
  red: ColorScale;
  gold: ColorScale;
  gray: GrayColorScale;
}

/**
 * Background Colors
 */
export interface BackgroundColors {
  primary: string;
  secondary: string;
  tertiary: string;
  elevated: string;
  overlay: string;
}

/**
 * Text Colors
 */
export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  link: string;
  error: string;
  success: string;
}

/**
 * Interactive State Colors
 */
export interface InteractiveColors {
  default: string;
  hover: string;
  pressed: string;
  disabled: string;
  focus: string;
}

/**
 * Border Colors
 */
export interface BorderColors {
  subtle: string;
  default: string;
  strong: string;
  focus: string;
  error: string;
}

/**
 * Status Colors
 */
export interface StatusColors {
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
}

/**
 * Special Colors
 */
export interface SpecialColors {
  verified: string;
  premium: string;
  online: string;
  offline: string;
}

/**
 * Gradient Definitions
 */
export interface GradientColors {
  primary: readonly [string, string];
  premium: readonly [string, string];
  hero: readonly [string, string];
  dark: readonly [string, string];
  light: readonly [string, string];
}

/**
 * Complete Theme Colors
 */
export interface ThemeColors {
  background: BackgroundColors;
  text: TextColors;
  interactive: InteractiveColors;
  border: BorderColors;
  status: StatusColors;
  special: SpecialColors;
  gradient: GradientColors;
}

/**
 * Typography Variant Keys
 */
export type TypographyVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'labelLarge'
  | 'label'
  | 'labelSmall'
  | 'caption'
  | 'buttonLarge'
  | 'button'
  | 'buttonSmall'
  | 'numeric'
  | 'numericLarge';

/**
 * Typography Styles
 */
export type TypographyStyles = Record<TypographyVariant, TextStyle>;

/**
 * Spacing Keys
 */
export type SpacingKey =
  | '0'
  | 'px'
  | '0.5'
  | '1'
  | '1.5'
  | '2'
  | '2.5'
  | '3'
  | '3.5'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '14'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32';

/**
 * Border Radius Keys
 */
export type BorderRadiusKey =
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | 'full';

/**
 * Border Width Keys
 */
export type BorderWidthKey = '0' | 'hairline' | '1' | '2' | '3' | '4';

/**
 * Shadow Variant Keys
 */
export type ShadowVariant = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Layered Shadow Variant Keys
 */
export type LayeredShadowVariant = 'card' | 'cardHover' | 'button' | 'modal' | 'fab' | 'image';

/**
 * Shadow Style Type
 */
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * Spring Configuration
 */
export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
}

/**
 * Spring Preset Keys
 */
export type SpringPreset =
  | 'snappy'
  | 'gentle'
  | 'bouncy'
  | 'stiff'
  | 'heavy'
  | 'press'
  | 'modal'
  | 'card';

/**
 * Duration Keys
 */
export type DurationKey =
  | 'instant'
  | 'fastest'
  | 'faster'
  | 'fast'
  | 'normal'
  | 'slow'
  | 'slower'
  | 'slowest'
  | 'microInteraction'
  | 'stateChange'
  | 'elementMove'
  | 'screenTransition'
  | 'celebration';

/**
 * Z-Index Keys
 */
export type ZIndexKey =
  | 'hide'
  | 'auto'
  | 'base'
  | 'docked'
  | 'dropdown'
  | 'sticky'
  | 'banner'
  | 'overlay'
  | 'modal'
  | 'popover'
  | 'skipLink'
  | 'toast'
  | 'tooltip';

/**
 * Touch Target Sizes
 */
export interface TouchTargetSizes {
  minimum: number;
  comfortable: number;
  large: number;
}

/**
 * Theme Mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Complete Theme Object
 */
export interface Theme {
  colors: ThemeColors;
  typography: TypographyStyles;
  spacing: Record<SpacingKey, number>;
  borderRadius: Record<BorderRadiusKey, number>;
  borderWidth: Record<BorderWidthKey, number>;
  zIndex: Record<ZIndexKey, number | 'auto'>;
  shadows: Record<ShadowVariant, ShadowStyle>;
  layeredShadows: Record<LayeredShadowVariant, ViewStyle>;
  touchTarget: TouchTargetSizes;
  isDark: boolean;
}

/**
 * Theme Context Value
 */
export interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  typography: TypographyStyles;
  spacing: Record<SpacingKey, number>;
  shadows: Record<ShadowVariant, ShadowStyle>;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

/**
 * Haptic Feedback Types
 */
export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * Haptic Feedback Interface
 */
export interface HapticFeedback {
  trigger: (type: HapticType) => void;
  light: () => void;
  medium: () => void;
  heavy: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
  selection: () => void;
  buttonPress: () => void;
  like: () => void;
}
