# 🎨 Design System Overhaul

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Konum:** `mobile/src/theme/`

---

## 📑 İçindekiler

1. [Design Tokens](#design-tokens)
2. [Renk Sistemi](#renk-sistemi)
3. [Tipografi Sistemi](#tipografi-sistemi)
4. [Spacing Sistemi](#spacing-sistemi)
5. [Shadow Sistemi](#shadow-sistemi)
6. [Border Sistemi](#border-sistemi)
7. [Animation Tokens](#animation-tokens)
8. [Implementasyon Rehberi](#implementasyon-rehberi)

---

## 🎯 Design Tokens

### Token Mimarisi

```
tokens/
├── colors.ts          # Renk token'ları
├── typography.ts      # Tipografi token'ları
├── spacing.ts         # Boşluk token'ları
├── shadows.ts         # Gölge token'ları
├── borders.ts         # Border token'ları
├── animations.ts      # Animasyon token'ları
├── breakpoints.ts     # Responsive breakpoints
└── index.ts           # Unified export
```

---

## 🎨 Renk Sistemi

### Yeni colors.ts

```typescript
// src/theme/colors.ts
// Meslektaş Design System - Color Tokens

/**
 * Base Color Palette
 * Tüm renkler bu palettan türetilir
 */
export const palette = {
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

/**
 * Semantic Colors - Light Theme
 */
export const lightTheme = {
  // Backgrounds
  background: {
    primary: palette.gray[0],      // #FFFFFF - Main background
    secondary: palette.gray[50],   // #FAFBFC - Card backgrounds
    tertiary: palette.gray[100],   // #F4F5F7 - Subtle backgrounds
    elevated: palette.gray[0],     // #FFFFFF - Elevated surfaces
    overlay: 'rgba(9, 30, 66, 0.54)', // Modal overlays
  },

  // Text Colors
  text: {
    primary: palette.gray[900],    // #172B4D - Headings, primary
    secondary: palette.gray[600],  // #6B778C - Body text
    tertiary: palette.gray[500],   // #A5ADBA - Hints, placeholders
    disabled: palette.gray[400],   // #C1C7D0 - Disabled text
    inverse: palette.gray[0],      // #FFFFFF - On dark backgrounds
    link: palette.blue[500],       // #0066FF - Links
    error: palette.red[500],       // #FF3B30 - Error text
    success: palette.green[500],   // #00C853 - Success text
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
    subtle: palette.gray[200],     // #EBECF0 - Dividers
    default: palette.gray[300],    // #DFE1E6 - Card borders
    strong: palette.gray[400],     // #C1C7D0 - Input borders
    focus: palette.blue[500],      // #0066FF - Focus states
    error: palette.red[500],       // #FF3B30 - Error borders
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
    primary: ['#0066FF', '#00C853'],
    premium: ['#FFD700', '#FF9500'],
    hero: ['#0066FF', '#3385FF'],
    dark: ['rgba(0,0,0,0.8)', 'transparent'],
    light: ['rgba(255,255,255,0.9)', 'transparent'],
  },
} as const;

/**
 * Semantic Colors - Dark Theme
 */
export const darkTheme = {
  // Backgrounds
  background: {
    primary: '#0D1117',            // GitHub dark bg
    secondary: '#161B22',          // Card backgrounds
    tertiary: '#21262D',           // Subtle backgrounds
    elevated: '#1C2128',           // Elevated surfaces
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
    primary: ['#3385FF', '#4DFF94'],
    premium: ['#FFE547', '#FFB81A'],
    hero: ['#0066FF', '#3385FF'],
    dark: ['rgba(0,0,0,0.9)', 'transparent'],
    light: ['rgba(255,255,255,0.1)', 'transparent'],
  },
} as const;

export type ThemeColors = typeof lightTheme;
```

---

## 📝 Tipografi Sistemi

### Yeni typography.ts

```typescript
// src/theme/typography.ts
// Meslektaş Design System - Typography Tokens

import { Platform, TextStyle } from 'react-native';

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
 * Typography Presets
 * Ready-to-use text styles
 */
export const typography = {
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

export type TypographyVariant = keyof typeof typography;
```

---

## 📐 Spacing Sistemi

### Yeni spacing.ts

```typescript
// src/theme/spacing.ts
// Meslektaş Design System - Spacing Tokens

/**
 * Base Spacing Scale
 * 4px grid system
 */
export const spacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

/**
 * Semantic Spacing
 * Context-based spacing values
 */
export const semanticSpacing = {
  // Screen padding
  screenHorizontal: spacing[4], // 16px
  screenVertical: spacing[6],   // 24px
  
  // Card spacing
  cardPadding: spacing[4],      // 16px
  cardGap: spacing[3],          // 12px
  
  // Section spacing
  sectionGap: spacing[6],       // 24px
  sectionPadding: spacing[4],   // 16px
  
  // Component spacing
  componentGap: spacing[2],     // 8px
  componentPadding: spacing[3], // 12px
  
  // Input spacing
  inputPaddingX: spacing[3],    // 12px
  inputPaddingY: spacing[2.5],  // 10px
  inputGap: spacing[4],         // 16px
  
  // Button spacing
  buttonPaddingXLarge: spacing[6],  // 24px
  buttonPaddingXMedium: spacing[4], // 16px
  buttonPaddingXSmall: spacing[3],  // 12px
  buttonGap: spacing[2],            // 8px
  
  // List spacing
  listItemGap: spacing[2],      // 8px
  listItemPadding: spacing[3],  // 12px
  
  // Avatar spacing
  avatarGap: spacing[2],        // 8px
  
  // Icon spacing
  iconGap: spacing[2],          // 8px
  iconPadding: spacing[1.5],    // 6px
} as const;

/**
 * Border Radius
 */
export const borderRadius = {
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
export const borderWidth = {
  0: 0,
  hairline: 0.5,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
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
export const zIndex = {
  hide: -1,
  auto: 'auto' as const,
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
```

---

## 🌑 Shadow Sistemi

### Yeni shadows.ts

```typescript
// src/theme/shadows.ts
// Meslektaş Design System - Shadow Tokens

import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

/**
 * Shadow Generator
 * Creates platform-specific shadows
 */
const createShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
  color: string = '#000000'
): ShadowStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation: elevation,
});

/**
 * Base Shadow Scale
 */
export const shadows = {
  none: createShadow(0, 0, 0, 0),
  
  // Extra Small - Subtle lift
  xs: createShadow(1, 2, 0.05, 1),
  
  // Small - Cards, buttons
  sm: createShadow(1, 3, 0.1, 2),
  
  // Medium - Dropdowns, active cards
  md: createShadow(4, 6, 0.1, 4),
  
  // Large - Modals, popovers
  lg: createShadow(10, 15, 0.1, 8),
  
  // Extra Large - Dialogs
  xl: createShadow(20, 25, 0.1, 12),
  
  // 2XL - Maximum elevation
  '2xl': createShadow(25, 50, 0.12, 16),
} as const;

/**
 * Layered Shadows
 * More realistic multi-layer shadows
 */
export const layeredShadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,
  
  cardHover: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
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
      shadowColor: '#0066FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,
  
  modal: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: {
      elevation: 24,
    },
    default: {},
  }) as ViewStyle,
  
  fab: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0066FF',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,
  
  image: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
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

export type ShadowVariant = keyof typeof shadows;
export type LayeredShadowVariant = keyof typeof layeredShadows;
```

---

## 🎬 Animation Tokens

### Yeni animations.ts

```typescript
// src/theme/animations.ts
// Meslektaş Design System - Animation Tokens

import { Easing } from 'react-native-reanimated';

/**
 * Duration Scale (in milliseconds)
 */
export const duration = {
  instant: 0,
  fastest: 50,
  faster: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
  
  // Semantic durations
  microInteraction: 100,
  stateChange: 200,
  elementMove: 300,
  screenTransition: 400,
  celebration: 600,
} as const;

/**
 * Spring Configurations
 * Based on spring physics
 */
export const spring = {
  // Snappy - Quick, responsive
  snappy: {
    damping: 20,
    stiffness: 400,
    mass: 1,
  },
  
  // Gentle - Soft, natural
  gentle: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  // Bouncy - Playful, energetic
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.5,
  },
  
  // Stiff - Quick with minimal overshoot
  stiff: {
    damping: 25,
    stiffness: 300,
    mass: 1,
  },
  
  // Heavy - Slow, deliberate
  heavy: {
    damping: 20,
    stiffness: 100,
    mass: 2,
  },
  
  // Button press
  press: {
    damping: 15,
    stiffness: 500,
    mass: 0.5,
  },
  
  // Modal
  modal: {
    damping: 18,
    stiffness: 250,
    mass: 1,
  },
  
  // Card
  card: {
    damping: 15,
    stiffness: 180,
    mass: 1,
  },
} as const;

/**
 * Easing Functions
 * For timing-based animations
 */
export const easing = {
  // Standard
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  
  // Quad
  quadIn: Easing.in(Easing.quad),
  quadOut: Easing.out(Easing.quad),
  quadInOut: Easing.inOut(Easing.quad),
  
  // Cubic
  cubicIn: Easing.in(Easing.cubic),
  cubicOut: Easing.out(Easing.cubic),
  cubicInOut: Easing.inOut(Easing.cubic),
  
  // Back (overshoot)
  backIn: Easing.in(Easing.back(1.5)),
  backOut: Easing.out(Easing.back(1.5)),
  backInOut: Easing.inOut(Easing.back(1.5)),
  
  // Elastic
  elasticIn: Easing.in(Easing.elastic(1)),
  elasticOut: Easing.out(Easing.elastic(1)),
  elasticInOut: Easing.inOut(Easing.elastic(1)),
  
  // Bounce
  bounceIn: Easing.in(Easing.bounce),
  bounceOut: Easing.out(Easing.bounce),
  bounceInOut: Easing.inOut(Easing.bounce),
} as const;

/**
 * Preset Animations
 * Ready-to-use animation configs
 */
export const animationPresets = {
  // Button press
  buttonPress: {
    scale: 0.97,
    duration: duration.fastest,
    spring: spring.press,
  },
  
  // Card hover
  cardHover: {
    scale: 1.02,
    translateY: -4,
    spring: spring.card,
  },
  
  // Like heart
  likeHeart: {
    scale: [1, 1.3, 1],
    duration: duration.stateChange,
    spring: spring.bouncy,
  },
  
  // Fade in
  fadeIn: {
    opacity: [0, 1],
    duration: duration.normal,
    easing: easing.easeOut,
  },
  
  // Slide up
  slideUp: {
    translateY: [20, 0],
    opacity: [0, 1],
    duration: duration.slow,
    easing: easing.easeOut,
  },
  
  // Slide down
  slideDown: {
    translateY: [-20, 0],
    opacity: [0, 1],
    duration: duration.slow,
    easing: easing.easeOut,
  },
  
  // Scale in
  scaleIn: {
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: duration.normal,
    spring: spring.gentle,
  },
  
  // Shake
  shake: {
    translateX: [0, -10, 10, -10, 10, 0],
    duration: duration.stateChange,
    easing: easing.easeInOut,
  },
  
  // Pulse
  pulse: {
    scale: [1, 1.05, 1],
    duration: duration.slow,
    easing: easing.easeInOut,
  },
} as const;

/**
 * Layout Animation Configs
 */
export const layoutAnimations = {
  // List item
  listItem: {
    entering: 'FadeInRight',
    exiting: 'FadeOutLeft',
    layout: 'spring',
    staggerDelay: 50,
  },
  
  // Card
  card: {
    entering: 'FadeInDown',
    exiting: 'FadeOutUp',
    layout: 'spring',
  },
  
  // Modal
  modal: {
    entering: 'SlideInDown',
    exiting: 'SlideOutDown',
  },
  
  // Dropdown
  dropdown: {
    entering: 'FadeIn',
    exiting: 'FadeOut',
    layout: 'easeInOut',
  },
} as const;

export type SpringConfig = keyof typeof spring;
export type EasingType = keyof typeof easing;
export type AnimationPreset = keyof typeof animationPresets;
```

---

## 🛠️ Implementasyon Rehberi

### 1. Dosya Yapısı Güncellemesi

```bash
mobile/src/theme/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   ├── animations.ts
│   └── index.ts
├── themes/
│   ├── light.ts
│   ├── dark.ts
│   └── index.ts
├── hooks/
│   ├── useTheme.ts
│   ├── useThemedStyles.ts
│   └── index.ts
└── index.ts
```

### 2. Theme Context Güncellemesi

```typescript
// src/theme/hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Usage with typed styles
export const useThemedStyles = <T>(
  styleFactory: (theme: ThemeColors) => T
): T => {
  const { theme } = useTheme();
  return useMemo(() => styleFactory(theme), [theme]);
};
```

### 3. Migration Checklist

- [ ] Yeni token dosyaları oluştur
- [ ] Mevcut `colors.ts` yedeği al
- [ ] Yeni `colors.ts` deploy et
- [ ] Typography güncellemesi
- [ ] Spacing güncellemesi
- [ ] Shadows güncellemesi
- [ ] Animation tokens ekle
- [ ] Theme context güncelle
- [ ] Component'lerde test et

---

## 📋 Sonraki Adım

Design system tokens tanımlandıktan sonra [04-COMPONENT-LIBRARY.md](./04-COMPONENT-LIBRARY.md) dokümanında modern component library detaylandırılacaktır.
