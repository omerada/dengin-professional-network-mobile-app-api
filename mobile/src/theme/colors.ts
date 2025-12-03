// src/theme/colors.ts
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

/**
 * Color palette for Meslektaş app
 * Supports light and dark themes
 */
export const colors = {
  // Primary brand colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary colors
  secondary: {
    50: '#FCE4EC',
    100: '#F8BBD9',
    200: '#F48FB1',
    300: '#F06292',
    400: '#EC407A',
    500: '#E91E63', // Main secondary
    600: '#D81B60',
    700: '#C2185B',
    800: '#AD1457',
    900: '#880E4F',
  },

  // Neutral/Gray colors
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Semantic colors
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
    background: '#E8F5E9',
  },

  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
    background: '#FFF3E0',
  },

  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
    background: '#FFEBEE',
  },

  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
    background: '#E3F2FD',
  },

  // Verification status colors
  verification: {
    pending: '#FF9800',
    approved: '#4CAF50',
    rejected: '#F44336',
    expired: '#9E9E9E',
  },
} as const;

/**
 * Light theme colors
 */
export const lightTheme = {
  background: {
    primary: colors.neutral[0],
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
  },
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    disabled: colors.neutral[400],
    inverse: colors.neutral[0],
  },
  border: {
    light: colors.neutral[200],
    medium: colors.neutral[300],
    dark: colors.neutral[400],
  },
  surface: {
    card: colors.neutral[0],
    modal: colors.neutral[0],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  ...colors,
} as const;

/**
 * Dark theme colors
 */
export const darkTheme = {
  background: {
    primary: colors.neutral[900],
    secondary: colors.neutral[800],
    tertiary: colors.neutral[700],
  },
  text: {
    primary: colors.neutral[0],
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
    disabled: colors.neutral[500],
    inverse: colors.neutral[900],
  },
  border: {
    light: colors.neutral[700],
    medium: colors.neutral[600],
    dark: colors.neutral[500],
  },
  surface: {
    card: colors.neutral[800],
    modal: colors.neutral[800],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  ...colors,
} as const;

export type ThemeColors = typeof lightTheme;
