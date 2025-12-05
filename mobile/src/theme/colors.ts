// src/theme/colors.ts
// Meslektaş Design System - Color Tokens
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

import type { ColorPalette, ThemeColors } from './types';

/**
 * Base Color Palette
 * Tüm renkler bu palettan türetilir
 */
export const palette: ColorPalette = {
  // Brand Blue
  blue: {
    50: '#E6F0FF',
    100: '#CCE0FF',
    200: '#99C2FF',
    300: '#66A3FF',
    400: '#3385FF',
    500: '#0066FF', // Primary
    600: '#0052CC',
    700: '#003D99',
    800: '#002966',
    900: '#001433',
  },

  // Success Green
  green: {
    50: '#E6FFF0',
    100: '#B3FFD1',
    200: '#80FFB3',
    300: '#4DFF94',
    400: '#1AFF75',
    500: '#00C853', // Success
    600: '#00A344',
    700: '#007D35',
    800: '#005826',
    900: '#003317',
  },

  // Warning Orange
  orange: {
    50: '#FFF5E6',
    100: '#FFE6B3',
    200: '#FFD680',
    300: '#FFC74D',
    400: '#FFB81A',
    500: '#FF9500', // Warning
    600: '#CC7700',
    700: '#995900',
    800: '#663C00',
    900: '#331E00',
  },

  // Error Red
  red: {
    50: '#FFEBE6',
    100: '#FFCCC2',
    200: '#FF9980',
    300: '#FF6B4D',
    400: '#FF4D33',
    500: '#FF3B30', // Error
    600: '#CC2F26',
    700: '#99231D',
    800: '#661713',
    900: '#330C0A',
  },

  // Premium Gold
  gold: {
    50: '#FFFDF0',
    100: '#FFF9D1',
    200: '#FFF3A3',
    300: '#FFEC75',
    400: '#FFE547',
    500: '#FFD700', // Premium
    600: '#CCAC00',
    700: '#998100',
    800: '#665600',
    900: '#332B00',
  },

  // Neutral Gray
  gray: {
    0: '#FFFFFF',
    50: '#FAFBFC',
    100: '#F4F5F7',
    200: '#EBECF0',
    300: '#DFE1E6',
    400: '#C1C7D0',
    500: '#A5ADBA',
    600: '#6B778C',
    700: '#505F79',
    800: '#344563',
    900: '#172B4D',
    1000: '#091E42',
  },
} as const;

// Legacy color support (backward compatibility)
export const colors = {
  primary: palette.blue,
  secondary: {
    50: '#FCE4EC',
    100: '#F8BBD9',
    200: '#F48FB1',
    300: '#F06292',
    400: '#EC407A',
    500: '#E91E63',
    600: '#D81B60',
    700: '#C2185B',
    800: '#AD1457',
    900: '#880E4F',
  },
  neutral: palette.gray,
  success: {
    light: palette.green[300],
    main: palette.green[500],
    dark: palette.green[700],
    background: palette.green[50],
  },
  warning: {
    light: palette.orange[300],
    main: palette.orange[500],
    dark: palette.orange[700],
    background: palette.orange[50],
  },
  error: {
    light: palette.red[300],
    main: palette.red[500],
    dark: palette.red[700],
    background: palette.red[50],
  },
  info: {
    light: palette.blue[300],
    main: palette.blue[500],
    dark: palette.blue[700],
    background: palette.blue[50],
  },
  verification: {
    pending: palette.orange[500],
    approved: palette.green[500],
    rejected: palette.red[500],
    expired: palette.gray[500],
  },
} as const;

/**
 * Semantic Colors - Light Theme
 */
export const lightTheme: ThemeColors = {
  // Backgrounds
  background: {
    primary: palette.gray[0], // #FFFFFF - Main background
    secondary: palette.gray[50], // #FAFBFC - Card backgrounds
    tertiary: palette.gray[100], // #F4F5F7 - Subtle backgrounds
    elevated: palette.gray[0], // #FFFFFF - Elevated surfaces
    overlay: 'rgba(9, 30, 66, 0.54)', // Modal overlays
  },

  // Text Colors
  text: {
    primary: palette.gray[900], // #172B4D - Headings, primary
    secondary: palette.gray[600], // #6B778C - Body text
    tertiary: palette.gray[500], // #A5ADBA - Hints, placeholders
    disabled: palette.gray[400], // #C1C7D0 - Disabled text
    inverse: palette.gray[0], // #FFFFFF - On dark backgrounds
    link: palette.blue[500], // #0066FF - Links
    error: palette.red[500], // #FF3B30 - Error text
    success: palette.green[500], // #00C853 - Success text
  },

  // Interactive States
  interactive: {
    default: palette.blue[500],
    hover: palette.blue[600],
    pressed: palette.blue[700],
    disabled: palette.gray[300],
    focus: palette.blue[100],
  },

  // Borders
  border: {
    subtle: palette.gray[200], // #EBECF0 - Dividers
    default: palette.gray[300], // #DFE1E6 - Card borders
    strong: palette.gray[400], // #C1C7D0 - Input borders
    focus: palette.blue[500], // #0066FF - Focus states
    error: palette.red[500], // #FF3B30 - Error borders
  },

  // Status Colors
  status: {
    success: palette.green[500],
    successBg: palette.green[50],
    warning: palette.orange[500],
    warningBg: palette.orange[50],
    error: palette.red[500],
    errorBg: palette.red[50],
    info: palette.blue[500],
    infoBg: palette.blue[50],
  },

  // Special
  special: {
    verified: palette.blue[500],
    premium: palette.gold[500],
    online: palette.green[500],
    offline: palette.gray[400],
  },

  // Gradients
  gradient: {
    primary: ['#0066FF', '#00C853'] as const,
    premium: ['#FFD700', '#FF9500'] as const,
    hero: ['#0066FF', '#3385FF'] as const,
    dark: ['rgba(0,0,0,0.8)', 'transparent'] as const,
    light: ['rgba(255,255,255,0.9)', 'transparent'] as const,
  },
} as const;

/**
 * Semantic Colors - Dark Theme
 */
export const darkTheme: ThemeColors = {
  // Backgrounds
  background: {
    primary: '#0D1117', // GitHub dark bg
    secondary: '#161B22', // Card backgrounds
    tertiary: '#21262D', // Subtle backgrounds
    elevated: '#1C2128', // Elevated surfaces
    overlay: 'rgba(0, 0, 0, 0.7)', // Modal overlays
  },

  // Text Colors
  text: {
    primary: '#F0F6FC',
    secondary: '#8B949E',
    tertiary: '#6E7681',
    disabled: '#484F58',
    inverse: palette.gray[900],
    link: palette.blue[400],
    error: palette.red[400],
    success: palette.green[400],
  },

  // Interactive States
  interactive: {
    default: palette.blue[400],
    hover: palette.blue[300],
    pressed: palette.blue[500],
    disabled: '#30363D',
    focus: 'rgba(0, 102, 255, 0.3)',
  },

  // Borders
  border: {
    subtle: '#21262D',
    default: '#30363D',
    strong: '#484F58',
    focus: palette.blue[400],
    error: palette.red[400],
  },

  // Status Colors
  status: {
    success: palette.green[400],
    successBg: 'rgba(0, 200, 83, 0.1)',
    warning: palette.orange[400],
    warningBg: 'rgba(255, 149, 0, 0.1)',
    error: palette.red[400],
    errorBg: 'rgba(255, 59, 48, 0.1)',
    info: palette.blue[400],
    infoBg: 'rgba(0, 102, 255, 0.1)',
  },

  // Special
  special: {
    verified: palette.blue[400],
    premium: palette.gold[400],
    online: palette.green[400],
    offline: '#484F58',
  },

  // Gradients
  gradient: {
    primary: ['#3385FF', '#4DFF94'] as const,
    premium: ['#FFE547', '#FFB81A'] as const,
    hero: ['#0066FF', '#3385FF'] as const,
    dark: ['rgba(0,0,0,0.9)', 'transparent'] as const,
    light: ['rgba(255,255,255,0.1)', 'transparent'] as const,
  },
} as const;
