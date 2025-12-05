// src/theme/typography.ts
// Meslektaş Design System - Typography Tokens
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

import { TextStyle, Platform } from 'react-native';
import type { TypographyVariant, TypographyStyles } from './types';

/**
 * Font Families
 * iOS: SF Pro, Android: Roboto
 */
export const fontFamily = {
  // Display & Headings
  display: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }),

  // Body Text
  body: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'System',
  }),

  // Monospace
  mono: Platform.select({
    ios: 'SF Mono',
    android: 'Roboto Mono',
    default: 'Courier',
  }),

  // Legacy support
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  light: Platform.select({
    ios: 'System',
    android: 'Roboto-Light',
    default: 'System',
  }),
} as const;

/**
 * Font Sizes
 * Based on 4px scale
 */
export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

/**
 * Line Heights
 * Calculated for optimal readability
 */
export const lineHeight = {
  none: 1,
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

/**
 * Letter Spacing
 */
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
} as const;

/**
 * Font Weights
 * Platform-specific weight mapping
 */
export const fontWeight = {
  thin: '100' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

/**
 * Typography Presets
 * Ready-to-use text styles
 */
export const typography: TypographyStyles = {
  // Display - Large headers, hero text
  displayLarge: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,

  displayMedium: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  displaySmall: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  // Headings
  h1: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['2xl'] * lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h2: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h3: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h4: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.md * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Body Text
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.relaxed,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Labels
  labelLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.base * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  labelSmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.wider,
  } as TextStyle,

  // Caption
  caption: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Buttons
  buttonLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * lineHeight.none,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  button: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.base * lineHeight.none,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.sm * lineHeight.none,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Numeric
  numeric: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.base * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  } as TextStyle,

  numericLarge: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  } as TextStyle,
} as const;

export type { TypographyVariant };
