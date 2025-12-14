// src/theme/colors.ts
// Dengin Design System v3.0 - Professional Color Tokens
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
  // PRIMARY - Terracotta (Ana Marka Rengi) ⭐
  // Anadolu toprak tonları, özgün, sıcak, profesyonel
  // RGB(220, 88, 42) - #DC582A
  terracotta: {
    50: '#FFF4ED', // Çok açık terracotta
    100: '#FFE8D5', // Açık terracotta
    200: '#FFD0B0', // Yumuşak terracotta
    300: '#FFAB7A', // Orta terracotta
    400: '#FF7A3D', // Parlak terracotta
    500: '#FE5000', // Canlı terracotta
    600: '#DC582A', // PRIMARY ⭐ Terracotta - özgün marka rengi
    700: '#C13B14', // Koyu terracotta
    800: '#972C0D', // Derin terracotta
    900: '#7C2410', // En koyu terracotta
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

  // SUCCESS - Emerald (Verification & Trust)
  // Başarı, doğrulama, güven, onay
  emerald: {
    50: '#ECFDF5', // Çok açık emerald
    100: '#D1FAE5', // Açık emerald
    200: '#A7F3D0', // Yumuşak emerald
    300: '#6EE7B7', // Orta emerald
    400: '#34D399', // Parlak emerald
    500: '#10B981', // Emerald - success
    600: '#059669', // VERIFICATION ⭐ - doğrulama badge
    700: '#047857', // Koyu emerald
    800: '#065F46', // Derin emerald
    900: '#064E3B', // En koyu emerald
  },

  // EDUCATION - Amber (Knowledge & Growth)
  // Eğitim, bilgi, gelişim
  amber: {
    50: '#FFFBEB', // Çok açık amber
    100: '#FEF3C7', // Açık amber
    200: '#FDE68A', // Yumuşak amber
    300: '#FCD34D', // Orta amber
    400: '#FBBF24', // Parlak amber
    500: '#F59E0B', // Amber
    600: '#D97706', // EDUCATION ⭐ - eğitim sektörü
    700: '#B45309', // Koyu amber
    800: '#92400E', // Derin amber
    900: '#78350F', // En koyu amber
  },

  // ERROR - Red
  // Hata, tehlike
  red: {
    50: '#FEF2F2', // Çok açık kırmızı
    100: '#FEE2E2', // Açık kırmızı
    200: '#FECACA', // Yumuşak kırmızı
    300: '#FCA5A5', // Orta kırmızı
    400: '#F87171', // Parlak kırmızı
    500: '#EF4444', // Red - error
    600: '#DC2626', // Koyu kırmızı
    700: '#B91C1C', // Çok koyu kırmızı
    800: '#991B1B', // Derin kırmızı
    900: '#7F1D1D', // En koyu kırmızı
  },

  // PREMIUM - Violet (Premium & Exclusive)
  // Premium, özel, değerli, seçkin
  violet: {
    50: '#F5F3FF', // Çok açık violet
    100: '#EDE9FE', // Açık violet
    200: '#DDD6FE', // Yumuşak violet
    300: '#C4B5FD', // Orta violet
    400: '#A78BFA', // Parlak violet
    500: '#8B5CF6', // Violet - premium
    600: '#7C3AED', // PREMIUM ⭐ - premium özellikler
    700: '#6D28D9', // Koyu violet
    800: '#5B21B6', // Derin violet
    900: '#4C1D95', // En koyu violet
  },

  // ACCENT - Sky Blue (Service & Communication)
  // Hizmet, iletişim, açıklık
  sky: {
    50: '#F0F9FF', // Çok açık sky
    100: '#E0F2FE', // Açık sky
    200: '#BAE6FD', // Yumuşak sky
    300: '#7DD3FC', // Orta sky
    400: '#38BDF8', // Parlak sky
    500: '#0EA5E9', // Sky blue
    600: '#0284C7', // SERVICE ⭐ - hizmet sektörü
    700: '#0369A1', // Koyu sky
    800: '#075985', // Derin sky
    900: '#0C4A6E', // En koyu sky
  },

  // CREATIVE - Rose (Creativity & Design)
  // Yaratıcılık, tasarım, sanat
  rose: {
    50: '#FFF1F2', // Çok açık rose
    100: '#FFE4E6', // Açık rose
    200: '#FECDD3', // Yumuşak rose
    300: '#FDA4AF', // Orta rose
    400: '#FB7185', // Parlak rose
    500: '#F43F5E', // Rose
    600: '#E11D48', // CREATIVE ⭐ - yaratıcı sektör
    700: '#BE123C', // Koyu rose
    800: '#9F1239', // Derin rose
    900: '#881337', // En koyu rose
  },

  // WARNING - Orange (Uyarı için kullanılıyor)
  // Uyarı, dikkat, enerji
  orange: {
    50: '#FFF7ED', // Çok açık orange
    100: '#FFEDD5', // Açık orange
    200: '#FED7AA', // Yumuşak orange
    300: '#FDBA74', // Orta orange
    400: '#FB923C', // Parlak orange
    500: '#F97316', // Orange - warning
    600: '#EA580C', // Koyu orange
    700: '#C2410C', // Çok koyu orange
    800: '#9A3412', // Derin orange
    900: '#7C2D12', // En koyu orange
  },

  // NEUTRAL - Slate (Modern ve dengeli neutral tonlar)
  // Profesyonel, otorite, denge, evrensel
  slate: {
    0: '#FFFFFF', // Pure white
    50: '#F8FAFC', // Çok açık slate
    100: '#F1F5F9', // Açık slate
    200: '#E2E8F0', // Yumuşak slate - border subtle
    300: '#CBD5E1', // Orta açık slate - border default
    400: '#94A3B8', // Orta slate - text tertiary
    500: '#64748B', // Dengeli slate - text secondary
    600: '#475569', // Koyu slate
    700: '#334155', // Çok koyu slate - SECONDARY color
    800: '#1E293B', // Derin slate
    900: '#0F172A', // En koyu slate
    950: '#020617', // Soft black (OLED optimized)
  },

  // LEGACY SUPPORT - Backward compatibility
  // Eski component'lar için - yeni renk paletiyle eşleştirildi
  copper: {
    50: '#FAF7F3',
    100: '#F5EFE7',
    200: '#EBDFD0',
    300: '#E1CFB9',
    400: '#D7BFA2',
    500: '#D9C5AC', // Eski copper rengi (legacy)
    600: '#C4A88A',
    700: '#A88B6D',
    800: '#8B6F51',
    900: '#6F563B',
  },

  // INFO - Teal (Bilgi rengi)
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // Teal - info color
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Legacy blue (maps to terracotta)
  blue: {
    50: '#FFF4ED',
    100: '#FFE8D5',
    200: '#FFD0B0',
    300: '#FFAB7A',
    400: '#FF7A3D',
    500: '#FE5000',
    600: '#DC582A', // Terracotta - new primary
    700: '#C13B14',
    800: '#972C0D',
    900: '#7C2410',
  },

  // Legacy green (maps to emerald)
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Emerald
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Legacy purple (maps to violet)
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Violet
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Legacy gray (maps to slate)
  gray: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // Slate sistemi
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Legacy ruby (maps to red)
  ruby: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Red - error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Legacy gold (maps to violet)
  gold: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Violet - premium
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Legacy warmGray (maps to slate)
  warmGray: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // Slate sistemi
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
} as const;

/**
 * Legacy Color Support (Geriye Dönük Uyumluluk)
 * Eski kod tabanı ile uyumluluk için
 */
export const colors = {
  // Ana marka renkleri - ANATOLIAN PROFESSIONAL SYSTEM
  primary: palette.terracotta, // ⭐ Terracotta #DC582A - Ana marka (özgün)
  secondary: palette.slate, // Slate - İkincil marka (profesyonel)
  neutral: palette.slate, // Slate - Nötr tonlar
  accent: palette.sky, // Sky Blue - Modern vurgu rengi

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
    light: palette.red[300],
    main: palette.red[500],
    dark: palette.red[700],
    background: palette.red[50],
    text: palette.red[700],
  },
  info: {
    light: palette.sky[300], // Sky bilgi rengi - modern
    main: palette.sky[500],
    dark: palette.sky[700],
    background: palette.sky[50],
    text: palette.sky[700],
  },

  // Doğrulama durumları
  verification: {
    pending: palette.orange[500], // Orange - beklemede
    approved: palette.emerald[600], // Emerald - onaylandı (güven)
    rejected: palette.red[500], // Kırmızı - reddedildi
    expired: palette.slate[500], // Slate - süresi doldu
    inReview: palette.terracotta[600], // Terracotta - inceleniyor (marka rengi)
  },

  // Premium ve özel durumlar
  premium: {
    light: palette.violet[300],
    main: palette.violet[500],
    dark: palette.violet[700],
    background: palette.violet[50],
    text: palette.violet[700],
  },
} as const;

/**
 * Semantic Colors - Light Theme
 * Özgün, ferah ve ılık light tema
 * WCAG AAA kontrast oranları ile optimize edildi
 * Pure white background + terracotta accents
 */
export const lightTheme: ThemeColors = {
  // Backgrounds - Pure white, ferah ve temiz
  background: {
    primary: '#FFFFFF', // Pure white - maksimum temizlik
    secondary: palette.slate[50], // Açık slate - ferah
    tertiary: palette.slate[100], // Orta slate - subtle vurgu
    elevated: '#FFFFFF', // Pure white - yükseltilmiş kartlar
    overlay: 'rgba(15, 23, 42, 0.65)', // Slate dark overlay
    accent: palette.terracotta[50], // Çok açık terracotta - brand tint
  },

  // Text Colors - Yüksek kontrast, okunabilir
  text: {
    primary: palette.slate[900], // Near black - 19:1 kontrast (AAA)
    secondary: palette.slate[700], // Koyu slate - 9.2:1 kontrast
    tertiary: palette.slate[500], // Orta slate - 5.8:1 kontrast
    disabled: palette.slate[400], // Açık slate - 3.8:1 kontrast
    inverse: '#FFFFFF', // Pure white - dark backgrounds
    link: palette.terracotta[700], // Koyu terracotta - 8.1:1 kontrast
    accent: palette.sky[600], // Sky accent - modern
    error: palette.red[700], // Koyu red - 5.5:1 kontrast
    success: palette.emerald[700], // Koyu emerald - 6.2:1 kontrast
  },

  // Interactive States - Sıcak ve davetkar
  interactive: {
    default: palette.terracotta[600], // ⭐ Terracotta - ana marka rengi (özgün)
    hover: palette.terracotta[700], // Koyu terracotta - hover
    pressed: palette.terracotta[800], // Çok koyu terracotta - pressed
    disabled: palette.slate[300], // Açık slate - disabled
    focus: palette.terracotta[500], // Parlak terracotta - focus ring
    subtle: palette.terracotta[100], // Çok açık terracotta - subtle interaction
  },

  // Borders - İnce ve zarif
  border: {
    subtle: palette.slate[200], // Çok hafif - minimal borders
    default: palette.slate[300], // Standard - general borders
    strong: palette.terracotta[400], // Terracotta accent - emphasis
    focus: palette.terracotta[600], // Terracotta brand - focus states
    error: palette.red[500], // Red - error borders
  },

  // Status Colors - Net ve güvenilir iletişim
  status: {
    success: palette.emerald[600], // Koyu emerald - AAA kontrast (güven)
    successBg: palette.emerald[50], // Çok açık emerald - subtle
    successBackground: palette.emerald[50],
    successBorder: palette.emerald[300], // Orta emerald - visible
    warning: palette.orange[600], // Koyu orange - AAA kontrast
    warningBg: palette.orange[50], // Çok açık orange
    warningBackground: palette.orange[50],
    warningBorder: palette.orange[300], // Orta orange
    error: palette.red[600], // Koyu red - AAA kontrast
    errorBg: palette.red[50], // Çok açık red
    errorBackground: palette.red[50],
    errorBorder: palette.red[300], // Orta red
    info: palette.sky[600], // Koyu sky - modern
    infoBg: palette.sky[50], // Çok açık sky
    infoBackground: palette.sky[50],
    infoBorder: palette.sky[300], // Orta sky
  },

  // Special - Özel durumlar ve ikonlar
  special: {
    verified: palette.emerald[600], // Emerald - doğrulanmış badge (güven)
    premium: palette.violet[600], // Violet - premium
    online: palette.emerald[500], // Emerald - çevrimiçi
    offline: palette.slate[400], // Slate - çevrimdışı
    badge: palette.red[600], // Red - bildirim badge
  },

  // Surface levels - Katmanlı derinlik (temiz beyaz tonlar)
  surface: {
    level0: '#FFFFFF', // Zemin - pure white
    level1: '#FFFFFF', // 1. katman - pure white
    level2: palette.slate[50], // 2. katman - çok hafif slate
    level3: palette.slate[100], // 3. katman - hafif slate
  },

  // Gradients - Sıcak ve özgün
  gradient: {
    primary: [palette.terracotta[500], palette.terracotta[700]] as const, // Terracotta gradient
    secondary: [palette.slate[600], palette.slate[800]] as const, // Slate gradient
    premium: [palette.violet[400], palette.violet[500], palette.violet[600]] as const, // Violet
    hero: [palette.terracotta[600], palette.violet[600]] as const, // Terracotta-Violet hero
    success: [palette.emerald[500], palette.emerald[600]] as const, // Emerald gradient
    surface: ['#FFFFFF', palette.slate[50]] as const, // White-Slate
    overlay: ['rgba(15,23,42,0)', 'rgba(15,23,42,0.80)'] as const, // Slate overlay
    dark: ['rgba(2,6,23,0.95)', 'transparent'] as const, // Deep slate dark
    light: ['rgba(255,255,255,0.98)', 'transparent'] as const, // Bright light
  },
} as const;

/**
 * Semantic Colors - Dark Theme
 * Özgün, sıcak ve göz dostu dark tema
 * Soft black (#020617) background - OLED enerji tasarrufu + konfor
 * WCAG AAA kontrast oranları ile tasarlandı
 */
export const darkTheme: ThemeColors = {
  // Backgrounds - Slate soft black (OLED optimized)
  background: {
    primary: palette.slate[950], // #020617 - Soft black (OLED enerji tasarrufu)
    secondary: palette.slate[900], // Near black - hafif yükseltilmiş
    tertiary: palette.slate[800], // Dark slate - belirgin katman
    elevated: palette.slate[900], // Elevated cards - slate[900]
    overlay: 'rgba(2, 6, 23, 0.92)', // Deep slate overlay
    accent: palette.terracotta[900], // Derin terracotta - subtle brand tint
  },

  // Text Colors - Sıcak ve okunabilir (yüksek kontrast)
  text: {
    primary: palette.slate[50], // Near white - 20:1 kontrast (AAA)
    secondary: palette.slate[400], // Orta slate - sekonder text
    tertiary: palette.slate[500], // Orta-koyu slate - 5.8:1 kontrast (AA)
    disabled: palette.slate[600], // Koyu slate - disabled state
    inverse: palette.slate[900], // Çok koyu - light backgrounds
    link: palette.terracotta[400], // Parlak terracotta - brand link color
    accent: palette.sky[400], // Parlak sky - modern accent
    error: palette.red[400], // Parlak red - 6.5:1 kontrast (AA+)
    success: palette.emerald[400], // Parlak emerald - 7.8:1 kontrast (AA+)
  },

  // Interactive States - Sıcak ve responsive
  interactive: {
    default: palette.terracotta[500], // ⭐ Terracotta - brand color (özgün)
    hover: palette.terracotta[400], // Parlak terracotta - hover glow
    pressed: palette.terracotta[600], // Koyu terracotta - pressed
    disabled: palette.slate[700], // Koyu slate - disabled
    focus: 'rgba(220, 88, 42, 0.45)', // Terracotta glow - focus ring
    subtle: palette.slate[900], // Çok koyu - subtle interaction
  },

  // Borders - Subtle ve sıcak
  border: {
    subtle: palette.slate[900], // Minimal border - barely visible
    default: palette.slate[800], // Standard border
    strong: palette.terracotta[500], // Terracotta accent - emphasis
    focus: palette.terracotta[500], // Terracotta brand - focus states
    error: palette.red[500], // Red - error borders
  },

  // Status Colors - Parlak ve net (dark modda canlı tonlar)
  status: {
    success: palette.emerald[400], // Parlak emerald - güven
    successBg: 'rgba(52, 211, 153, 0.15)', // Hafif emerald glow
    successBackground: 'rgba(52, 211, 153, 0.15)',
    successBorder: 'rgba(52, 211, 153, 0.35)', // Visible emerald border
    warning: palette.orange[400], // Parlak orange - dikkat çekici
    warningBg: 'rgba(251, 146, 60, 0.15)', // Hafif orange glow
    warningBackground: 'rgba(251, 146, 60, 0.15)',
    warningBorder: 'rgba(251, 146, 60, 0.35)', // Visible orange border
    error: palette.red[400], // Parlak red - net
    errorBg: 'rgba(248, 113, 113, 0.15)', // Hafif red glow
    errorBackground: 'rgba(248, 113, 113, 0.15)',
    errorBorder: 'rgba(248, 113, 113, 0.35)', // Visible red border
    info: palette.sky[400], // Parlak sky - modern
    infoBg: 'rgba(56, 189, 248, 0.15)', // Hafif sky glow
    infoBackground: 'rgba(56, 189, 248, 0.15)',
    infoBorder: 'rgba(56, 189, 248, 0.35)', // Visible sky border
  },

  // Special - Parlak ve özgün
  special: {
    verified: palette.emerald[400], // Parlak emerald - verified badge (güven)
    premium: palette.violet[400], // Violet glow - premium
    online: palette.emerald[400], // Parlak emerald - çevrimiçi
    offline: palette.slate[600], // Orta slate - çevrimdışı
    badge: palette.red[500], // Parlak red - notification badge
  },

  // Surface levels - Katmanlı derinlik (slate soft black)
  surface: {
    level0: palette.slate[950], // #020617 - Soft black (OLED zemin)
    level1: palette.slate[900], // Near black - 1. katman
    level2: palette.slate[800], // Dark slate - 2. katman
    level3: palette.slate[700], // Slate - 3. katman
  },

  // Gradients - Derin, sıcak ve özgün
  gradient: {
    primary: [palette.terracotta[600], palette.terracotta[500]] as const, // Terracotta gradient
    secondary: [palette.slate[700], palette.slate[600]] as const, // Slate gradient
    premium: [palette.violet[600], palette.violet[500], palette.violet[400]] as const, // Violet glow
    hero: [palette.terracotta[700], palette.violet[600]] as const, // Deep Terracotta-Violet
    success: [palette.emerald[600], palette.emerald[500]] as const, // Deep emerald
    surface: [palette.slate[950], palette.slate[900]] as const, // Slate gradient
    overlay: ['rgba(2,6,23,0)', 'rgba(2,6,23,0.97)'] as const, // Deep slate overlay
    dark: ['rgba(2,6,23,0.98)', 'transparent'] as const, // Ultra slate dark
    light: ['rgba(220,88,42,0.12)', 'transparent'] as const, // Terracotta glow
  },
} as const;
