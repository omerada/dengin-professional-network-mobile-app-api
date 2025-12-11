// src/theme/colors.ts
// Meslektaş Design System v2.0 - Color Tokens
// Oku: DESIGN-SYSTEM-DOCUMENTATION.md

import type { ColorPalette, ThemeColors } from './types';

/**
 * Base Color Palette - "Copper Professional"
 * Yeni özgün tasarım sistemi
 */
export const palette: ColorPalette = {
  // PRIMARY - Copper Amber (Ana Marka Rengi)
  copper: {
    50: '#FFF8F0',
    100: '#FFECDB',
    200: '#FFDBB8',
    300: '#FFC794',
    400: '#FFB170',
    500: '#F59E42', // PRIMARY ⭐
    600: '#E08224',
    700: '#C76918',
    800: '#A85510',
    900: '#8A440D',
  },

  // SECONDARY - Deep Indigo
  indigo: {
    50: '#EEF2FF',
    100: '#DDE3FF',
    200: '#BCC7FF',
    300: '#9AABFF',
    400: '#7890FF',
    500: '#5674F0',
    600: '#4560D6',
    700: '#364DBC',
    800: '#293B9E',
    900: '#1E2C7A',
  },

  // SUCCESS - Emerald Green
  emerald: {
    50: '#EDFAF4',
    100: '#D1F4E0',
    200: '#A4E9C1',
    300: '#6DDEA0',
    400: '#3DD37F',
    500: '#10C55F',
    600: '#0BA84F',
    700: '#078A40',
    800: '#056D33',
    900: '#045028',
  },

  // WARNING - Warm Orange
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // ERROR - Ruby Red
  ruby: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // PREMIUM - Sophisticated Gold
  gold: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#D4A03F',
    600: '#B8860B',
    700: '#996F0A',
    800: '#7A5908',
    900: '#614607',
  },

  // NEUTRAL - Warm Gray
  warmGray: {
    0: '#FFFFFF',
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0F0E0D',
  },

  // LEGACY SUPPORT - Backward compatibility
  blue: {
    50: '#E6F0FF',
    100: '#CCE0FF',
    200: '#99C2FF',
    300: '#66A3FF',
    400: '#3385FF',
    500: '#0066FF',
    600: '#0052CC',
    700: '#003D99',
    800: '#002966',
    900: '#001433',
  },

  green: {
    50: '#E6FFF0',
    100: '#B3FFD1',
    200: '#80FFB3',
    300: '#4DFF94',
    400: '#1AFF75',
    500: '#00C853',
    600: '#00A344',
    700: '#007D35',
    800: '#005826',
    900: '#003317',
  },

  red: {
    50: '#FFEBE6',
    100: '#FFCCC2',
    200: '#FF9980',
    300: '#FF6B4D',
    400: '#FF4D33',
    500: '#FF3B30',
    600: '#CC2F26',
    700: '#99231D',
    800: '#661713',
    900: '#330C0A',
  },

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
  primary: palette.copper,
  secondary: palette.indigo,
  neutral: palette.warmGray,
  success: {
    light: palette.emerald[300],
    main: palette.emerald[500],
    dark: palette.emerald[700],
    background: palette.emerald[50],
  },
  warning: {
    light: palette.orange[300],
    main: palette.orange[500],
    dark: palette.orange[700],
    background: palette.orange[50],
  },
  error: {
    light: palette.ruby[300],
    main: palette.ruby[500],
    dark: palette.ruby[700],
    background: palette.ruby[50],
  },
  info: {
    light: palette.indigo[300],
    main: palette.indigo[500],
    dark: palette.indigo[700],
    background: palette.indigo[50],
  },
  verification: {
    pending: palette.orange[500],
    approved: palette.emerald[500],
    rejected: palette.ruby[500],
    expired: palette.warmGray[500],
  },
} as const;

/**
 * Semantic Colors - Light Theme
 */
export const lightTheme: ThemeColors = {
  // Backgrounds (Reduced copper dominance for better balance)
  background: {
    primary: '#FFFFFF',
    secondary: palette.warmGray[50], // Neutral instead of copper
    tertiary: palette.warmGray[100], // Neutral instead of copper
    elevated: '#FFFFFF',
    overlay: 'rgba(28, 25, 23, 0.54)',
    accent: palette.warmGray[50], // Changed from copper[50] to reduce orange
  },

  // Text Colors
  text: {
    primary: palette.warmGray[900],
    secondary: palette.warmGray[600],
    tertiary: palette.warmGray[500],
    disabled: palette.warmGray[400],
    inverse: '#FFFFFF',
    link: palette.copper[500],
    accent: palette.copper[600],
    error: palette.ruby[500],
    success: palette.emerald[500],
  },

  // Interactive States
  interactive: {
    default: palette.copper[500],
    hover: palette.copper[600],
    pressed: palette.copper[700],
    disabled: palette.warmGray[300],
    focus: palette.copper[200],
    subtle: palette.copper[50],
  },

  // Borders
  border: {
    subtle: palette.warmGray[200],
    default: palette.warmGray[300],
    strong: palette.warmGray[400],
    focus: palette.copper[500],
    error: palette.ruby[500],
  },

  // Status Colors
  status: {
    success: palette.emerald[500],
    successBg: palette.emerald[50],
    successBackground: palette.emerald[50],
    successBorder: palette.emerald[200],
    warning: palette.orange[500],
    warningBg: palette.orange[50],
    warningBackground: palette.orange[50],
    warningBorder: palette.orange[200],
    error: palette.ruby[500],
    errorBg: palette.ruby[50],
    errorBackground: palette.ruby[50],
    errorBorder: palette.ruby[200],
    info: palette.indigo[500],
    infoBg: palette.indigo[50],
    infoBackground: palette.indigo[50],
    infoBorder: palette.indigo[200],
  },

  // Special
  special: {
    verified: palette.indigo[500],
    premium: palette.gold[500],
    online: palette.emerald[500],
    offline: palette.warmGray[500],
    badge: palette.ruby[500],
  },

  // Surface levels
  surface: {
    level0: '#FFFFFF',
    level1: palette.warmGray[50],
    level2: palette.warmGray[100],
    level3: palette.copper[50],
  },

  // Gradients
  gradient: {
    primary: [palette.copper[500], palette.copper[400], palette.copper[600]] as const,
    secondary: [palette.indigo[500], palette.indigo[400]] as const,
    premium: [palette.gold[500], palette.gold[400], palette.gold[600]] as const,
    hero: [palette.copper[500], palette.copper[600], palette.copper[700]] as const,
    success: [palette.emerald[500], palette.emerald[400]] as const,
    surface: ['#FFFFFF', palette.warmGray[50]] as const,
    overlay: ['rgba(28,25,23,0)', 'rgba(28,25,23,0.7)'] as const,
    dark: ['rgba(15,14,13,0.9)', 'transparent'] as const,
    light: ['rgba(255,255,255,0.9)', 'transparent'] as const,
  },
} as const;

/**
 * Semantic Colors - Dark Theme (Balanced, less orange)
 */
export const darkTheme: ThemeColors = {
  // Backgrounds (Neutral grays, minimal copper tint)
  background: {
    primary: palette.warmGray[950],
    secondary: palette.warmGray[900],
    tertiary: palette.warmGray[800],
    elevated: palette.warmGray[900],
    overlay: 'rgba(0, 0, 0, 0.75)',
    accent: palette.warmGray[800], // Neutral instead of copper
  },

  // Text Colors
  text: {
    primary: palette.warmGray[50],
    secondary: palette.warmGray[300],
    tertiary: palette.warmGray[400],
    disabled: palette.warmGray[600],
    inverse: palette.warmGray[900],
    link: palette.copper[400],
    accent: palette.copper[300],
    error: palette.ruby[400],
    success: palette.emerald[400],
  },

  // Interactive States
  interactive: {
    default: palette.copper[400],
    hover: palette.copper[300],
    pressed: palette.copper[500],
    disabled: palette.warmGray[700],
    focus: 'rgba(255, 177, 112, 0.3)',
    subtle: palette.warmGray[800],
  },

  // Borders
  border: {
    subtle: palette.warmGray[800],
    default: palette.warmGray[700],
    strong: palette.warmGray[600],
    focus: palette.copper[400],
    error: palette.ruby[400],
  },

  // Status Colors
  status: {
    success: palette.emerald[400],
    successBg: 'rgba(16, 197, 95, 0.15)',
    successBackground: 'rgba(16, 197, 95, 0.15)',
    successBorder: 'rgba(16, 197, 95, 0.3)',
    warning: palette.orange[400],
    warningBg: 'rgba(249, 115, 22, 0.15)',
    warningBackground: 'rgba(249, 115, 22, 0.15)',
    warningBorder: 'rgba(249, 115, 22, 0.3)',
    error: palette.ruby[400],
    errorBg: 'rgba(239, 68, 68, 0.15)',
    errorBackground: 'rgba(239, 68, 68, 0.15)',
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    info: palette.indigo[400],
    infoBg: 'rgba(86, 116, 240, 0.15)',
    infoBackground: 'rgba(86, 116, 240, 0.15)',
    infoBorder: 'rgba(86, 116, 240, 0.3)',
  },

  // Special
  special: {
    verified: palette.indigo[400],
    premium: palette.gold[400],
    online: palette.emerald[400],
    offline: palette.warmGray[500],
    badge: palette.ruby[400],
  },

  // Surface levels
  surface: {
    level0: palette.warmGray[950],
    level1: palette.warmGray[900],
    level2: palette.warmGray[800],
    level3: palette.warmGray[700],
  },

  // Gradients
  gradient: {
    primary: [palette.copper[400], palette.copper[300]] as const,
    secondary: [palette.indigo[400], palette.indigo[300]] as const,
    premium: [palette.gold[400], palette.gold[300]] as const,
    hero: [palette.copper[400], palette.copper[500]] as const,
    success: [palette.emerald[400], palette.emerald[300]] as const,
    surface: [palette.warmGray[900], palette.warmGray[800]] as const,
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'] as const,
    dark: ['rgba(0,0,0,0.9)', 'transparent'] as const,
    light: ['rgba(255,255,255,0.1)', 'transparent'] as const,
  },
} as const;
