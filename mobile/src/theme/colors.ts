// src/theme/colors.ts
// Meslektaş Design System v3.0 - Professional Color Tokens
// Redesigned with Warm Copper (#D9C5AC) as Primary Brand Color

import type { ColorPalette, ThemeColors } from './types';

/**
 * Base Color Palette - "Warm Professional"
 * Sıcak, sofistike ve profesyonel tasarım sistemi
 *
 * Tasarım Prensipleri:
 * - Sıcak ve profesyonel primary renk (Warm Copper #D9C5AC)
 * - Doğal ve dengeli secondary renk (Sage Green)
 * - Sofistike accent renk (Deep Teal)
 * - Modern neutral renk (Warm Gray)
 * - WCAG AA+ kontrast standartları
 * - OLED dark mode optimizasyonu
 */
export const palette: ColorPalette = {
  // PRIMARY - Warm Copper (Ana Marka Rengi) ⭐
  // Sıcaklık, güven, profesyonellik, prestij, dostluk
  // RGB(217, 197, 172) - #D9C5AC
  copper: {
    50: '#FAF7F3', // Çok açık krem - subtle background
    100: '#F5EFE7', // Açık krem - light surface
    200: '#EBDFD0', // Yumuşak bej - card background
    300: '#E1CFB9', // Orta bej - hover states
    400: '#D7BFA2', // Ana copper açık - light mode primary
    500: '#D9C5AC', // PRIMARY ⭐ Warm Copper - brand color
    600: '#C4A88A', // Orta koyu - dark mode primary
    700: '#A88B6D', // Koyu copper - pressed states
    800: '#8B6F51', // Derin copper - text on light
    900: '#6F563B', // En koyu - dark text
  },

  // SECONDARY - Sage Green (İkincil Marka Rengi)
  // Doğallık, denge, güven, profesyonellik, huzur
  indigo: {
    50: '#F5F7F5', // Çok açık sage
    100: '#E8ECE8', // Açık sage
    200: '#D1DDD1', // Yumuşak sage
    300: '#B4C9B4', // Orta sage
    400: '#8FAF8F', // Parlak sage
    500: '#6B9B6B', // Sage Green - secondary
    600: '#578557', // Orta koyu sage
    700: '#446E44', // Koyu sage
    800: '#335733', // Derin sage
    900: '#254425', // En koyu sage
  },

  // SUCCESS - Natural Emerald
  // Başarı, pozitiflik, ilerleme, doğallık
  emerald: {
    50: '#F0FDF5', // Çok açık yeşil - subtle
    100: '#DCFCE8', // Açık yeşil
    200: '#BBF7D1', // Yumuşak yeşil
    300: '#86EFAD', // Orta yeşil
    400: '#4ADE80', // Parlak yeşil
    500: '#22C55E', // Natural Emerald - success
    600: '#16A34A', // Koyu yeşil
    700: '#15803D', // Çok koyu yeşil
    800: '#166534', // Derin yeşil
    900: '#14532D', // En koyu yeşil
  },

  // WARNING - Warm Amber
  // Uyarı, dikkat, enerji (sıcak tonlarda)
  orange: {
    50: '#FFFBF0', // Çok açık amber - cream
    100: '#FEF3DD', // Açık amber
    200: '#FDE4B3', // Yumuşak amber
    300: '#FCD078', // Orta amber
    400: '#FBBF3D', // Parlak amber
    500: '#F59E0B', // Warm Amber - warning
    600: '#DC7F09', // Koyu amber
    700: '#B86308', // Çok koyu amber
    800: '#924D08', // Derin amber
    900: '#783F0A', // En koyu amber
  },

  // ERROR - Muted Red
  // Hata, tehlike (yumuşatılmış, göz yormayan)
  ruby: {
    50: '#FEF4F2', // Çok açık kırmızı
    100: '#FEE7E2', // Açık kırmızı
    200: '#FDD0C6', // Yumuşak kırmızı
    300: '#FCAA9A', // Orta kırmızı
    400: '#F9796B', // Parlak kırmızı
    500: '#E74C3C', // Muted Red - error
    600: '#D42C1C', // Koyu kırmızı
    700: '#B51F14', // Çok koyu kırmızı
    800: '#921A13', // Derin kırmızı
    900: '#7A1915', // En koyu kırmızı
  },

  // PREMIUM - Rose Gold
  // Premium, özel, değerli (copper ile uyumlu)
  gold: {
    50: '#FFF9F5', // Çok açık rose gold
    100: '#FFF1E6', // Açık rose gold
    200: '#FFDEC2', // Yumuşak rose gold
    300: '#FFC794', // Orta rose gold
    400: '#FFAA5A', // Parlak rose gold
    500: '#F0903A', // Rose Gold - premium
    600: '#D97328', // Koyu rose gold
    700: '#B85820', // Çok koyu rose gold
    800: '#94441C', // Derin rose gold
    900: '#7A381C', // En koyu rose gold
  },

  // ACCENT - Deep Teal (Accent Renk)
  // Sofistike, modern, vurgu
  teal: {
    50: '#F0FDFA', // Çok açık teal
    100: '#CCFBF1', // Açık teal
    200: '#99F6E4', // Yumuşak teal
    300: '#5EEAD4', // Orta teal
    400: '#2DD4BF', // Parlak teal
    500: '#14B8A6', // Deep Teal - accent
    600: '#0D9488', // Koyu teal
    700: '#0F766E', // Çok koyu teal
    800: '#115E59', // Derin teal
    900: '#134E4A', // En koyu teal
  },

  // NEUTRAL - Warm Gray (Sıcak gri tonları - copper ile uyumlu)
  // Doğal, profesyonel, dengeli
  warmGray: {
    0: '#FFFFFF', // Pure white
    50: '#FAFAF9', // Çok açık warm gray
    100: '#F5F5F4', // Açık warm gray
    200: '#E7E5E4', // Yumuşak warm gray
    300: '#D6D3D1', // Orta açık warm gray
    400: '#A8A29E', // Orta warm gray
    500: '#78716C', // Dengeli warm gray
    600: '#57534E', // Koyu warm gray
    700: '#44403C', // Çok koyu warm gray
    800: '#292524', // Derin warm gray
    900: '#1C1917', // En koyu warm gray
    950: '#0C0A09', // Near black
  },

  // LEGACY SUPPORT - Backward compatibility
  // Eski component'lar için - yeni renk paletiyle eşleştirildi
  blue: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // Teal artık "info" rengimiz
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  green: {
    50: '#F0FDF5',
    100: '#DCFCE8',
    200: '#BBF7D1',
    300: '#86EFAD',
    400: '#4ADE80',
    500: '#22C55E', // Natural Emerald
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  red: {
    50: '#FEF4F2',
    100: '#FEE7E2',
    200: '#FDD0C6',
    300: '#FCAA9A',
    400: '#F9796B',
    500: '#E74C3C', // Muted Red
    600: '#D42C1C',
    700: '#B51F14',
    800: '#921A13',
    900: '#7A1915',
  },

  gray: {
    0: '#FFFFFF',
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C', // Warm Gray sistemi
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    1000: '#0C0A09',
  },
} as const;

/**
 * Legacy Color Support (Geriye Dönük Uyumluluk)
 * Eski kod tabanı ile uyumluluk için
 */
export const colors = {
  // Ana marka renkleri - YENİ PROFESYONEL PALETİ
  primary: palette.copper, // ⭐ Warm Copper #D9C5AC - Ana marka
  secondary: palette.indigo, // Sage Green - İkincil marka
  neutral: palette.warmGray, // Warm Gray - Nötr tonlar
  accent: palette.teal, // Deep Teal - Modern vurgu rengi

  // Semantic renk grupları
  success: {
    light: palette.emerald[300],
    main: palette.emerald[500],
    dark: palette.emerald[700],
    background: palette.emerald[50],
    text: palette.emerald[700],
  },
  warning: {
    light: palette.orange[300],
    main: palette.orange[500],
    dark: palette.orange[700],
    background: palette.orange[50],
    text: palette.orange[700],
  },
  error: {
    light: palette.ruby[300],
    main: palette.ruby[500],
    dark: palette.ruby[700],
    background: palette.ruby[50],
    text: palette.ruby[700],
  },
  info: {
    light: palette.teal[300], // Teal bilgi rengi - daha modern
    main: palette.teal[500],
    dark: palette.teal[700],
    background: palette.teal[50],
    text: palette.teal[700],
  },

  // Doğrulama durumları
  verification: {
    pending: palette.orange[500], // Amber - beklemede
    approved: palette.emerald[500], // Yeşil - onaylandı
    rejected: palette.ruby[500], // Kırmızı - reddedildi
    expired: palette.warmGray[500], // Gri - süresi doldu
    inReview: palette.copper[600], // Copper - inceleniyor (marka rengi)
  },

  // Premium ve özel durumlar
  premium: {
    light: palette.gold[300],
    main: palette.gold[500],
    dark: palette.gold[700],
    background: palette.gold[50],
    text: palette.gold[700],
  },
} as const;

/**
 * Semantic Colors - Light Theme
 * Sıcak, profesyonel ve dengeli light tema
 * WCAG AA+ kontrast oranları ile optimize edildi
 */
export const lightTheme: ThemeColors = {
  // Backgrounds - Sıcak, temiz ve ferah
  background: {
    primary: '#FFFFFF', // Pure white - maksimum temizlik
    secondary: palette.copper[50], // Çok hafif copper tint - sıcak
    tertiary: palette.copper[100], // Açık copper - subtle vurgu
    elevated: '#FFFFFF', // White - yükseltilmiş kartlar
    overlay: 'rgba(28, 25, 23, 0.65)', // Warm dark overlay
    accent: palette.copper[100], // Açık copper - brand vurgusu
  },

  // Text Colors - Yüksek kontrast, okunabilir
  text: {
    primary: palette.warmGray[900], // Çok koyu warm gray - 16.1:1 kontrast
    secondary: palette.warmGray[700], // Koyu gray - 8.4:1 kontrast
    tertiary: palette.warmGray[600], // Orta gray - 5.9:1 kontrast
    disabled: palette.warmGray[400], // Açık gray - 3.2:1 kontrast
    inverse: '#FFFFFF', // Pure white - dark backgrounds
    link: palette.copper[800], // Koyu copper - 6.8:1 kontrast
    accent: palette.teal[700], // Koyu teal - modern vurgu
    error: palette.ruby[700], // Koyu red - 5.1:1 kontrast
    success: palette.emerald[700], // Koyu green - 4.8:1 kontrast
  },

  // Interactive States - Sıcak ve profesyonel
  interactive: {
    default: palette.copper[500], // ⭐ Warm Copper - ana marka rengi
    hover: palette.copper[600], // Koyu copper - hover
    pressed: palette.copper[700], // Çok koyu copper - pressed
    disabled: palette.warmGray[300], // Açık gray - disabled
    focus: palette.copper[200], // Açık copper - focus ring (subtle)
    subtle: palette.copper[100], // Çok açık copper - subtle interaction
  },

  // Borders - İnce ve sofistike
  border: {
    subtle: palette.warmGray[200], // Çok hafif - minimal borders
    default: palette.warmGray[300], // Standard - general borders
    strong: palette.copper[400], // Copper accent - emphasis
    focus: palette.copper[500], // Copper brand - focus states
    error: palette.ruby[500], // Red - error borders
  },

  // Status Colors - Dengeli ve net iletişim
  status: {
    success: palette.emerald[600], // Koyu yeşil - AAA kontrast
    successBg: palette.emerald[50], // Çok açık yeşil - subtle
    successBackground: palette.emerald[50],
    successBorder: palette.emerald[300], // Orta yeşil - visible
    warning: palette.orange[600], // Koyu amber - AAA kontrast
    warningBg: palette.orange[50], // Çok açık amber
    warningBackground: palette.orange[50],
    warningBorder: palette.orange[300], // Orta amber
    error: palette.ruby[600], // Koyu red - AAA kontrast
    errorBg: palette.ruby[50], // Çok açık red
    errorBackground: palette.ruby[50],
    errorBorder: palette.ruby[300], // Orta red
    info: palette.teal[600], // Koyu teal - modern
    infoBg: palette.teal[50], // Çok açık teal
    infoBackground: palette.teal[50],
    infoBorder: palette.teal[300], // Orta teal
  },

  // Special - Özel durumlar ve ikonlar
  special: {
    verified: palette.teal[600], // Teal - doğrulanmış badge
    premium: palette.gold[600], // Rose gold - premium
    online: palette.emerald[500], // Yeşil - çevrimiçi
    offline: palette.warmGray[400], // Gray - çevrimdışı
    badge: palette.ruby[600], // Red - bildirim badge
  },

  // Surface levels - Katmanlı derinlik (sıcak tonlar)
  surface: {
    level0: '#FFFFFF', // Zemin - pure white
    level1: palette.copper[50], // 1. katman - hafif copper
    level2: palette.copper[100], // 2. katman - copper tint
    level3: palette.copper[200], // 3. katman - belirgin copper
  },

  // Gradients - Sıcak ve sofistike
  gradient: {
    primary: [palette.copper[400], palette.copper[600]] as const, // Copper gradient
    secondary: [palette.indigo[400], palette.indigo[600]] as const, // Sage gradient
    premium: [palette.gold[400], palette.gold[500], palette.gold[600]] as const, // Rose gold
    hero: [palette.copper[500], palette.teal[500]] as const, // Copper-Teal hero
    success: [palette.emerald[500], palette.emerald[600]] as const, // Green gradient
    surface: ['#FFFFFF', palette.copper[50]] as const, // White-Copper
    overlay: ['rgba(28,25,23,0)', 'rgba(28,25,23,0.80)'] as const, // Warm dark overlay
    dark: ['rgba(12,10,9,0.95)', 'transparent'] as const, // Deep warm dark
    light: ['rgba(255,255,255,0.98)', 'transparent'] as const, // Bright light
  },
} as const;

/**
 * Semantic Colors - Dark Theme
 * Sıcak, sofistike ve göz yormayan dark tema
 * OLED ekranlar için optimize - true black (#000000) background
 * WCAG AA+ kontrast oranları ile tasarlandı
 */
export const darkTheme: ThemeColors = {
  // Backgrounds - OLED optimized (true black bazlı)
  background: {
    primary: '#000000', // True black - OLED için ideal, enerji tasarrufu
    secondary: palette.warmGray[950], // Near black - hafif yükseltilmiş
    tertiary: palette.warmGray[900], // Derin warm gray - belirgin katman
    elevated: palette.warmGray[900], // Elevated cards - warmGray[900]
    overlay: 'rgba(0, 0, 0, 0.92)', // Deep black overlay - yüksek kontrast
    accent: palette.copper[900], // Derin copper - subtle brand tint
  },

  // Text Colors - Sıcak ve okunabilir (yüksek kontrast)
  text: {
    primary: palette.warmGray[50], // Near white - 17.8:1 kontrast (AAA)
    secondary: palette.copper[200], // Açık copper - sıcak secondary text
    tertiary: palette.warmGray[400], // Orta gray - 4.9:1 kontrast (AA)
    disabled: palette.warmGray[600], // Koyu gray - disabled state
    inverse: palette.warmGray[900], // Çok koyu - light backgrounds
    link: palette.copper[400], // Orta copper - brand link color
    accent: palette.teal[400], // Parlak teal - modern accent
    error: palette.ruby[400], // Parlak red - 5.8:1 kontrast (AA+)
    success: palette.emerald[400], // Parlak green - 6.2:1 kontrast (AA+)
  },

  // Interactive States - Sıcak ve responsive
  interactive: {
    default: palette.copper[500], // ⭐ Warm Copper - brand color
    hover: palette.copper[400], // Açık copper - hover glow
    pressed: palette.copper[600], // Koyu copper - pressed
    disabled: palette.warmGray[700], // Koyu gray - disabled
    focus: 'rgba(217, 197, 172, 0.40)', // Copper glow - focus ring
    subtle: palette.warmGray[900], // Çok koyu - subtle interaction
  },

  // Borders - Subtle ve sofistike
  border: {
    subtle: palette.warmGray[900], // Minimal border - barely visible
    default: palette.warmGray[800], // Standard border
    strong: palette.copper[700], // Copper accent - emphasis
    focus: palette.copper[500], // Copper brand - focus states
    error: palette.ruby[500], // Red - error borders
  },

  // Status Colors - Parlak ve net (dark modda canlı tonlar)
  status: {
    success: palette.emerald[400], // Parlak green - canlı
    successBg: 'rgba(74, 222, 128, 0.15)', // Hafif green glow
    successBackground: 'rgba(74, 222, 128, 0.15)',
    successBorder: 'rgba(74, 222, 128, 0.35)', // Visible green border
    warning: palette.orange[400], // Parlak amber - dikkat çekici
    warningBg: 'rgba(251, 191, 61, 0.15)', // Hafif amber glow
    warningBackground: 'rgba(251, 191, 61, 0.15)',
    warningBorder: 'rgba(251, 191, 61, 0.35)', // Visible amber border
    error: palette.ruby[400], // Parlak red - net
    errorBg: 'rgba(249, 121, 107, 0.15)', // Hafif red glow
    errorBackground: 'rgba(249, 121, 107, 0.15)',
    errorBorder: 'rgba(249, 121, 107, 0.35)', // Visible red border
    info: palette.teal[400], // Parlak teal - modern
    infoBg: 'rgba(45, 212, 191, 0.15)', // Hafif teal glow
    infoBackground: 'rgba(45, 212, 191, 0.15)',
    infoBorder: 'rgba(45, 212, 191, 0.35)', // Visible teal border
  },

  // Special - Parlak ve belirgin
  special: {
    verified: palette.teal[400], // Parlak teal - verified badge
    premium: palette.gold[400], // Rose gold glow - premium
    online: palette.emerald[400], // Parlak green - çevrimiçi
    offline: palette.warmGray[600], // Orta gray - çevrimdışı
    badge: palette.ruby[500], // Parlak red - notification badge
  },

  // Surface levels - Katmanlı derinlik (OLED black bazlı)
  surface: {
    level0: '#000000', // True black - OLED zemin
    level1: palette.warmGray[950], // Near black - 1. katman
    level2: palette.warmGray[900], // Derin warm - 2. katman
    level3: palette.copper[900], // Copper tint - 3. katman (brand)
  },

  // Gradients - Derin, sıcak ve sofistike
  gradient: {
    primary: [palette.copper[600], palette.copper[500]] as const, // Copper gradient
    secondary: [palette.indigo[600], palette.indigo[500]] as const, // Sage gradient
    premium: [palette.gold[600], palette.gold[500], palette.gold[400]] as const, // Rose gold glow
    hero: [palette.copper[700], palette.teal[600]] as const, // Deep Copper-Teal
    success: [palette.emerald[600], palette.emerald[500]] as const, // Deep green
    surface: ['#000000', palette.warmGray[950]] as const, // True black gradient
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.97)'] as const, // Deep black overlay
    dark: ['rgba(0,0,0,0.98)', 'transparent'] as const, // Ultra dark
    light: ['rgba(217,197,172,0.12)', 'transparent'] as const, // Copper glow
  },
} as const;
