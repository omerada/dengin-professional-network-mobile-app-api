// src/theme/colors.ts
// Meslektaş Design System v2.0 - Color Tokens
// Oku: DESIGN-SYSTEM-DOCUMENTATION.md

import type { ColorPalette, ThemeColors } from './types';

/**
 * Base Color Palette - "Professional Harmony"
 * Dengeli, modern ve kurumsal tasarım sistemi
 *
 * Tasarım Prensipleri:
 * - Profesyonel ve güven verici primary renk (Mavi)
 * - Modern ve enerjik secondary renk (Mor)
 * - Fresh accent renk (Teal)
 * - Temiz neutral renk (Cool Gray)
 */
export const palette: ColorPalette = {
  // PRIMARY - Professional Blue (Ana Marka Rengi)
  // Güven, profesyonellik, sakinlik, istikrar
  copper: {
    50: '#EFF6FF', // Çok açık mavi
    100: '#DBEAFE', // Açık mavi
    200: '#BFDBFE', // Yumuşak mavi
    300: '#93C5FD', // Orta açık mavi
    400: '#60A5FA', // Parlak mavi
    500: '#3B82F6', // PRIMARY ⭐ Professional Blue
    600: '#2563EB', // Koyu mavi
    700: '#1D4ED8', // Çok koyu mavi
    800: '#1E40AF', // Derin mavi
    900: '#1E3A8A', // En koyu mavi
  },

  // SECONDARY - Vibrant Purple (İkincil Marka Rengi)
  // Modernlik, yaratıcılık, inovasyon
  indigo: {
    50: '#FAF5FF', // Çok açık mor
    100: '#F3E8FF', // Açık mor
    200: '#E9D5FF', // Yumuşak mor
    300: '#D8B4FE', // Orta açık mor
    400: '#C084FC', // Parlak mor
    500: '#A855F7', // Vibrant Purple
    600: '#9333EA', // Koyu mor
    700: '#7E22CE', // Çok koyu mor
    800: '#6B21A8', // Derin mor
    900: '#581C87', // En koyu mor
  },

  // SUCCESS - Fresh Emerald
  // Başarı, pozitiflik, ilerleme
  emerald: {
    50: '#ECFDF5', // Çok açık yeşil
    100: '#D1FAE5', // Açık yeşil
    200: '#A7F3D0', // Yumuşak yeşil
    300: '#6EE7B7', // Orta açık yeşil
    400: '#34D399', // Parlak yeşil
    500: '#10B981', // Fresh Emerald
    600: '#059669', // Koyu yeşil
    700: '#047857', // Çok koyu yeşil
    800: '#065F46', // Derin yeşil
    900: '#064E3B', // En koyu yeşil
  },

  // WARNING - Balanced Amber
  // Uyarı, dikkat, ölçülü enerji
  orange: {
    50: '#FFFBEB', // Çok açık amber
    100: '#FEF3C7', // Açık amber
    200: '#FDE68A', // Yumuşak amber
    300: '#FCD34D', // Orta amber
    400: '#FBBF24', // Parlak amber
    500: '#F59E0B', // Balanced Amber
    600: '#D97706', // Koyu amber
    700: '#B45309', // Çok koyu amber
    800: '#92400E', // Derin amber
    900: '#78350F', // En koyu amber
  },

  // ERROR - Soft Red
  // Hata, tehlike, dikkat (yumuşatılmış)
  ruby: {
    50: '#FEF2F2', // Çok açık kırmızı
    100: '#FEE2E2', // Açık kırmızı
    200: '#FECACA', // Yumuşak kırmızı
    300: '#FCA5A5', // Orta kırmızı
    400: '#F87171', // Parlak kırmızı
    500: '#EF4444', // Soft Red
    600: '#DC2626', // Koyu kırmızı
    700: '#B91C1C', // Çok koyu kırmızı
    800: '#991B1B', // Derin kırmızı
    900: '#7F1D1D', // En koyu kırmızı
  },

  // PREMIUM - Elegant Gold
  // Premium, özel, değerli
  gold: {
    50: '#FEFCE8', // Çok açık altın
    100: '#FEF9C3', // Açık altın
    200: '#FEF08A', // Yumuşak altın
    300: '#FDE047', // Orta altın
    400: '#FACC15', // Parlak altın
    500: '#EAB308', // Elegant Gold
    600: '#CA8A04', // Koyu altın
    700: '#A16207', // Çok koyu altın
    800: '#854D0E', // Derin altın
    900: '#713F12', // En koyu altın
  },

  // NEUTRAL - Cool Gray (Modern gri tonları)
  // Temiz, profesyonel, dengeli
  warmGray: {
    0: '#FFFFFF', // Beyaz
    50: '#F9FAFB', // Çok açık gri
    100: '#F3F4F6', // Açık gri
    200: '#E5E7EB', // Yumuşak gri
    300: '#D1D5DB', // Orta açık gri
    400: '#9CA3AF', // Orta gri
    500: '#6B7280', // Dengeli gri
    600: '#4B5563', // Koyu gri
    700: '#374151', // Çok koyu gri
    800: '#1F2937', // Derin gri
    900: '#111827', // En koyu gri
    950: '#030712', // Siyaha yakın
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

/**
 * Legacy Color Support (Geriye Dönük Uyumluluk)
 * Eski kod tabanı ile uyumluluk için
 */
export const colors = {
  // Ana marka renkleri
  primary: palette.copper, // Professional Blue
  secondary: palette.indigo, // Vibrant Purple
  neutral: palette.warmGray, // Cool Gray
  accent: palette.emerald, // Fresh Emerald (yeni accent rengi)

  // Semantic renk grupları
  success: {
    light: palette.emerald[300],
    main: palette.emerald[500],
    dark: palette.emerald[700],
    background: palette.emerald[50],
    text: palette.emerald[600],
  },
  warning: {
    light: palette.orange[300],
    main: palette.orange[500],
    dark: palette.orange[700],
    background: palette.orange[50],
    text: palette.orange[600],
  },
  error: {
    light: palette.ruby[300],
    main: palette.ruby[500],
    dark: palette.ruby[700],
    background: palette.ruby[50],
    text: palette.ruby[600],
  },
  info: {
    light: palette.copper[300], // Mavi bilgi rengi
    main: palette.copper[500],
    dark: palette.copper[700],
    background: palette.copper[50],
    text: palette.copper[600],
  },

  // Doğrulama durumları
  verification: {
    pending: palette.orange[500], // Amber - beklemede
    approved: palette.emerald[500], // Yeşil - onaylandı
    rejected: palette.ruby[500], // Kırmızı - reddedildi
    expired: palette.warmGray[500], // Gri - süresi doldu
    inReview: palette.indigo[500], // Mor - inceleniyor
  },

  // Premium ve özel durumlar
  premium: {
    light: palette.gold[300],
    main: palette.gold[500],
    dark: palette.gold[700],
    background: palette.gold[50],
    text: palette.gold[600],
  },
} as const;

/**
 * Semantic Colors - Light Theme
 * Modern, temiz ve profesyonel light tema
 */
export const lightTheme: ThemeColors = {
  // Backgrounds - Temiz, havadar ve ferah
  background: {
    primary: '#FFFFFF', // Beyaz - temiz ve ferah
    secondary: palette.warmGray[50], // Çok açık gri - hafif kontrast
    tertiary: palette.warmGray[100], // Açık gri - belirgin kontrast
    elevated: '#FFFFFF', // Beyaz - yükseltilmiş kartlar
    overlay: 'rgba(17, 24, 39, 0.50)', // Koyu overlay - okunabilir
    accent: palette.copper[50], // Hafif mavi accent - subtle vurgu
  },

  // Text Colors - Net, okunabilir ve dengeli
  text: {
    primary: palette.warmGray[900], // Koyu gri - maksimum okunabilirlik
    secondary: palette.warmGray[600], // Orta gri - ikincil metinler
    tertiary: palette.warmGray[500], // Açık gri - yardımcı metinler
    disabled: palette.warmGray[400], // Çok açık gri - disabled durum
    inverse: '#FFFFFF', // Beyaz - koyu arka planda
    link: palette.copper[600], // Mavi link - güven verici
    accent: palette.indigo[600], // Mor accent - modern vurgu
    error: palette.ruby[600], // Kırmızı - hata durumu
    success: palette.emerald[600], // Yeşil - başarı durumu
  },

  // Interactive States - Dengeli ve profesyonel
  interactive: {
    default: palette.copper[500], // Mavi - ana interaksiyon
    hover: palette.copper[600], // Koyu mavi - hover durumu
    pressed: palette.copper[700], // Daha koyu - basılı durum
    disabled: palette.warmGray[300], // Açık gri - disabled
    focus: palette.copper[100], // Çok açık mavi - focus ring
    subtle: palette.warmGray[100], // Nötr - subtle interaksiyon
  },

  // Borders - İnce ve zarif
  border: {
    subtle: palette.warmGray[200], // Çok hafif kenarlık
    default: palette.warmGray[300], // Standart kenarlık
    strong: palette.warmGray[400], // Belirgin kenarlık
    focus: palette.copper[400], // Mavi focus kenarlık
    error: palette.ruby[500], // Kırmızı hata kenarlık
  },

  // Status Colors - Net ve anlamlı
  status: {
    success: palette.emerald[500], // Yeşil başarı
    successBg: palette.emerald[50], // Açık yeşil arka plan
    successBackground: palette.emerald[50],
    successBorder: palette.emerald[200], // Yeşil kenarlık
    warning: palette.orange[500], // Amber uyarı
    warningBg: palette.orange[50], // Açık amber arka plan
    warningBackground: palette.orange[50],
    warningBorder: palette.orange[200], // Amber kenarlık
    error: palette.ruby[500], // Kırmızı hata
    errorBg: palette.ruby[50], // Açık kırmızı arka plan
    errorBackground: palette.ruby[50],
    errorBorder: palette.ruby[200], // Kırmızı kenarlık
    info: palette.copper[500], // Mavi bilgi
    infoBg: palette.copper[50], // Açık mavi arka plan
    infoBackground: palette.copper[50],
    infoBorder: palette.copper[200], // Mavi kenarlık
  },

  // Special - Özel durumlar ve ikonlar
  special: {
    verified: palette.copper[500], // Mavi - doğrulanmış
    premium: palette.gold[500], // Altın - premium
    online: palette.emerald[500], // Yeşil - çevrimiçi
    offline: palette.warmGray[400], // Gri - çevrimdışı
    badge: palette.ruby[500], // Kırmızı - bildirim
  },

  // Surface levels - Katmanlı derinlik
  surface: {
    level0: '#FFFFFF', // Zemin
    level1: palette.warmGray[50], // 1. katman
    level2: palette.warmGray[100], // 2. katman
    level3: palette.copper[50], // 3. katman (hafif mavi tint)
  },

  // Gradients - Modern ve dengeli
  gradient: {
    primary: [palette.copper[500], palette.copper[600]] as const, // Mavi gradient
    secondary: [palette.indigo[500], palette.indigo[600]] as const, // Mor gradient
    premium: [palette.gold[400], palette.gold[500], palette.gold[600]] as const, // Altın gradient
    hero: [palette.copper[500], palette.indigo[500]] as const, // Mavi-Mor hero
    success: [palette.emerald[500], palette.emerald[600]] as const, // Yeşil gradient
    surface: ['#FFFFFF', palette.warmGray[50]] as const, // Beyaz gradient
    overlay: ['rgba(17,24,39,0)', 'rgba(17,24,39,0.75)'] as const, // Koyu overlay
    dark: ['rgba(3,7,18,0.9)', 'transparent'] as const, // Koyu gradient
    light: ['rgba(255,255,255,0.95)', 'transparent'] as const, // Açık gradient
  },
} as const;

/**
 * Semantic Colors - Dark Theme
 * Modern, göz yormayan ve dengeli dark tema
 * OLED ekranlar için optimize edilmiş
 */
export const darkTheme: ThemeColors = {
  // Backgrounds - Derin ama boğucu olmayan tonlar
  background: {
    primary: palette.warmGray[900], // Ana arka plan - derin gri
    secondary: palette.warmGray[800], // İkincil - orta koyu
    tertiary: palette.warmGray[700], // Üçüncül - koyu
    elevated: palette.warmGray[800], // Yükseltilmiş - orta koyu
    overlay: 'rgba(0, 0, 0, 0.80)', // Overlay - güçlü kontrast
    accent: palette.warmGray[800], // Accent - hafif aydınlatılmış
  },

  // Text Colors - Yüksek kontrast, göz yormayan
  text: {
    primary: palette.warmGray[50], // Beyaza yakın - maksimum okunabilirlik
    secondary: palette.warmGray[300], // Orta açık gri - ikincil metinler
    tertiary: palette.warmGray[400], // Orta gri - yardımcı metinler
    disabled: palette.warmGray[600], // Koyu gri - disabled
    inverse: palette.warmGray[900], // Koyu gri - açık arka planda
    link: palette.copper[400], // Açık mavi - link
    accent: palette.indigo[400], // Açık mor - accent
    error: palette.ruby[400], // Açık kırmızı - hata
    success: palette.emerald[400], // Açık yeşil - başarı
  },

  // Interactive States - Parlak ve net
  interactive: {
    default: palette.copper[400], // Açık mavi - ana interaksiyon
    hover: palette.copper[300], // Daha açık mavi - hover
    pressed: palette.copper[500], // Daha koyu - basılı durum
    disabled: palette.warmGray[700], // Koyu gri - disabled
    focus: 'rgba(96, 165, 250, 0.35)', // Mavi focus ring - yarı saydam
    subtle: palette.warmGray[800], // Koyu gri - subtle
  },

  // Borders - İnce ve zarif
  border: {
    subtle: palette.warmGray[800], // Çok hafif kenarlık
    default: palette.warmGray[700], // Standart kenarlık
    strong: palette.warmGray[600], // Belirgin kenarlık
    focus: palette.copper[400], // Mavi focus kenarlık
    error: palette.ruby[400], // Kırmızı hata kenarlık
  },

  // Status Colors - Parlak ve net (dark modda daha canlı)
  status: {
    success: palette.emerald[400], // Parlak yeşil
    successBg: 'rgba(52, 211, 153, 0.15)', // Hafif yeşil arka plan
    successBackground: 'rgba(52, 211, 153, 0.15)',
    successBorder: 'rgba(52, 211, 153, 0.3)', // Yeşil kenarlık
    warning: palette.orange[400], // Parlak amber
    warningBg: 'rgba(251, 191, 36, 0.15)', // Hafif amber arka plan
    warningBackground: 'rgba(251, 191, 36, 0.15)',
    warningBorder: 'rgba(251, 191, 36, 0.3)', // Amber kenarlık
    error: palette.ruby[400], // Parlak kırmızı
    errorBg: 'rgba(248, 113, 113, 0.15)', // Hafif kırmızı arka plan
    errorBackground: 'rgba(248, 113, 113, 0.15)',
    errorBorder: 'rgba(248, 113, 113, 0.3)', // Kırmızı kenarlık
    info: palette.copper[400], // Parlak mavi
    infoBg: 'rgba(96, 165, 250, 0.15)', // Hafif mavi arka plan
    infoBackground: 'rgba(96, 165, 250, 0.15)',
    infoBorder: 'rgba(96, 165, 250, 0.3)', // Mavi kenarlık
  },

  // Special - Canlı ve belirgin
  special: {
    verified: palette.copper[400], // Açık mavi - doğrulanmış
    premium: palette.gold[400], // Parlak altın - premium
    online: palette.emerald[400], // Parlak yeşil - çevrimiçi
    offline: palette.warmGray[500], // Gri - çevrimdışı
    badge: palette.ruby[400], // Parlak kırmızı - bildirim
  },

  // Surface levels - Katmanlı derinlik (OLED için optimize)
  surface: {
    level0: palette.warmGray[900], // En derin katman (zemin)
    level1: palette.warmGray[800], // 1. yükseltilmiş katman
    level2: palette.warmGray[700], // 2. yükseltilmiş katman
    level3: palette.warmGray[600], // 3. yükseltilmiş katman (en üst)
  },

  // Gradients - Derin ve modern
  gradient: {
    primary: [palette.copper[400], palette.copper[500]] as const, // Mavi gradient
    secondary: [palette.indigo[400], palette.indigo[500]] as const, // Mor gradient
    premium: [palette.gold[400], palette.gold[500], palette.gold[600]] as const, // Altın gradient
    hero: [palette.copper[400], palette.indigo[400]] as const, // Mavi-Mor hero
    success: [palette.emerald[400], palette.emerald[500]] as const, // Yeşil gradient
    surface: [palette.warmGray[900], palette.warmGray[800]] as const, // Koyu gradient
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)'] as const, // Çok koyu overlay
    dark: ['rgba(0,0,0,0.95)', 'transparent'] as const, // Koyu gradient
    light: ['rgba(255,255,255,0.08)', 'transparent'] as const, // Hafif açık gradient
  },
} as const;
