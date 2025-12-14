// src/shared/utils/numberUtils.ts
// Dengin Design System - Number Formatting Utilities
// Oku: mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md

/**
 * Number formatting options
 */
export interface FormatNumberOptions {
  decimals?: number;
  locale?: 'tr' | 'en';
  useGrouping?: boolean;
}

/**
 * Format large numbers with abbreviations
 * 1000 -> 1K, 1000000 -> 1M, 1000000000 -> 1B
 *
 * @example
 * formatCompactNumber(1234) // "1.2K"
 * formatCompactNumber(1234567) // "1.2M"
 */
export function formatCompactNumber(num: number, locale: 'tr' | 'en' = 'tr'): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  // Milyon kısaltmaları
  const abbreviations = {
    tr: { B: 'Mr', M: 'Mn', K: 'B' },
    en: { B: 'B', M: 'M', K: 'K' },
  };

  const abbr = abbreviations[locale];

  if (absNum >= 1e9) {
    const formatted = (absNum / 1e9).toFixed(1);
    return `${sign}${removeTrailingZero(formatted)}${abbr.B}`;
  }

  if (absNum >= 1e6) {
    const formatted = (absNum / 1e6).toFixed(1);
    return `${sign}${removeTrailingZero(formatted)}${abbr.M}`;
  }

  if (absNum >= 1e4) {
    const formatted = (absNum / 1e3).toFixed(1);
    return `${sign}${removeTrailingZero(formatted)}${abbr.K}`;
  }

  if (absNum >= 1e3) {
    const formatted = (absNum / 1e3).toFixed(1);
    return `${sign}${removeTrailingZero(formatted)}${abbr.K}`;
  }

  return `${sign}${absNum}`;
}

/**
 * Format followers/following count for profile display
 * Similar to Instagram style
 *
 * @example
 * formatFollowerCount(1234) // "1.2K"
 * formatFollowerCount(12345678) // "12.3M"
 */
export function formatFollowerCount(count: number): string {
  return formatCompactNumber(count, 'en');
}

/**
 * Format post like/comment count
 *
 * @example
 * formatEngagementCount(0) // "0"
 * formatEngagementCount(999) // "999"
 * formatEngagementCount(1234) // "1.2K"
 */
export function formatEngagementCount(count: number): string {
  if (count === 0) return '0';
  return formatCompactNumber(count, 'en');
}

/**
 * Format number with thousand separators
 *
 * @example
 * formatWithSeparators(1234567) // "1.234.567" (TR)
 * formatWithSeparators(1234567, 'en') // "1,234,567" (EN)
 */
export function formatWithSeparators(num: number, locale: 'tr' | 'en' = 'tr'): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const separator = locale === 'tr' ? '.' : ',';

  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Format currency amount
 *
 * @example
 * formatCurrency(1234.56) // "₺1.234,56"
 * formatCurrency(1234.56, 'USD') // "$1,234.56"
 */
export function formatCurrency(amount: number, currency: 'TRY' | 'USD' | 'EUR' = 'TRY'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '';
  }

  const currencyConfig = {
    TRY: { symbol: '₺', locale: 'tr-TR' },
    USD: { symbol: '$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'de-DE' },
  };

  const config = currencyConfig[currency];

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for environments without Intl
    return `${config.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format percentage
 *
 * @example
 * formatPercentage(0.75) // "75%"
 * formatPercentage(0.756, 1) // "75.6%"
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format file size
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = bytes / Math.pow(k, i);
  const formatted = size < 10 ? size.toFixed(1) : Math.round(size).toString();

  return `${removeTrailingZero(formatted)} ${units[i]}`;
}

/**
 * Format duration in seconds to human readable format
 *
 * @example
 * formatDuration(90) // "1:30"
 * formatDuration(3661) // "1:01:01"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(secs)}`;
  }

  return `${minutes}:${padZero(secs)}`;
}

/**
 * Format phone number for display
 *
 * @example
 * formatPhoneNumber("5551234567") // "555 123 45 67"
 * formatPhoneNumber("905551234567") // "+90 555 123 45 67"
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle Turkish phone numbers
  if (digits.length === 10) {
    // 5551234567 -> 555 123 45 67
    return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    // 05551234567 -> 0555 123 45 67
    return digits.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }

  if (digits.length === 12 && digits.startsWith('90')) {
    // 905551234567 -> +90 555 123 45 67
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5');
  }

  // Return as-is for other formats
  return phone;
}

/**
 * Format ordinal number
 *
 * @example
 * formatOrdinal(1) // "1."
 * formatOrdinal(1, 'en') // "1st"
 */
export function formatOrdinal(num: number, locale: 'tr' | 'en' = 'tr'): string {
  if (locale === 'tr') {
    return `${num}.`;
  }

  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;

  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Round to specified decimal places
 */
export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

// Helper functions
function removeTrailingZero(str: string): string {
  return str.replace(/\.0$/, '');
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}
