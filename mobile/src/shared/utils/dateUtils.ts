// src/shared/utils/dateUtils.ts
// Tarih işleme utility fonksiyonları

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

type Locale = 'tr' | 'en';

/**
 * Get date-fns locale based on app locale
 */
const getLocale = (locale: Locale = 'tr') => {
  return locale === 'tr' ? tr : enUS;
};

/**
 * Format relative time (e.g., "5 dakika önce", "2 saat önce")
 */
export const formatRelativeTime = (date: string | Date, locale: Locale = 'tr'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, {
      addSuffix: true,
      locale: getLocale(locale),
    });
  } catch {
    return '';
  }
};

/**
 * Format date for display (e.g., "23 Kasım 2024")
 */
export const formatDate = (date: string | Date, locale: Locale = 'tr'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'd MMMM yyyy', { locale: getLocale(locale) });
  } catch {
    return '';
  }
};

/**
 * Format date and time (e.g., "23 Kasım 2024, 14:30")
 */
export const formatDateTime = (date: string | Date, locale: Locale = 'tr'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'd MMMM yyyy, HH:mm', { locale: getLocale(locale) });
  } catch {
    return '';
  }
};

/**
 * Format time only (e.g., "14:30")
 */
export const formatTime = (date: string | Date): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'HH:mm');
  } catch {
    return '';
  }
};

/**
 * Format message time for chat
 * Today: "14:30"
 * Yesterday: "Dün, 14:30"
 * This year: "23 Kas, 14:30"
 * Other: "23 Kas 2023, 14:30"
 */
export const formatMessageTime = (date: string | Date, locale: Locale = 'tr'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const localeObj = getLocale(locale);

    if (isToday(parsedDate)) {
      return format(parsedDate, 'HH:mm');
    }

    if (isYesterday(parsedDate)) {
      const yesterday = locale === 'tr' ? 'Dün' : 'Yesterday';
      return `${yesterday}, ${format(parsedDate, 'HH:mm')}`;
    }

    const now = new Date();
    if (parsedDate.getFullYear() === now.getFullYear()) {
      return format(parsedDate, 'd MMM, HH:mm', { locale: localeObj });
    }

    return format(parsedDate, 'd MMM yyyy, HH:mm', { locale: localeObj });
  } catch {
    return '';
  }
};

/**
 * Format conversation last message time
 * Today: "14:30"
 * Yesterday: "Dün"
 * This week: "Pazartesi"
 * Other: "23/11/2024"
 */
export const formatConversationTime = (date: string | Date, locale: Locale = 'tr'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const localeObj = getLocale(locale);

    if (isToday(parsedDate)) {
      return format(parsedDate, 'HH:mm');
    }

    if (isYesterday(parsedDate)) {
      return locale === 'tr' ? 'Dün' : 'Yesterday';
    }

    const now = new Date();
    const diffDays = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return format(parsedDate, 'EEEE', { locale: localeObj });
    }

    return format(parsedDate, 'dd/MM/yyyy');
  } catch {
    return '';
  }
};

/**
 * Format notification time
 * < 1 hour: "5 dk önce"
 * Today: "Bugün, 14:30"
 * Yesterday: "Dün, 14:30"
 * Other: "23 Kas, 14:30"
 */
export const formatNotificationTime = (date: string | Date, locale: Locale = 'tr'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const localeObj = getLocale(locale);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60));

    if (diffMinutes < 60) {
      if (diffMinutes < 1) {
        return locale === 'tr' ? 'Az önce' : 'Just now';
      }
      return locale === 'tr' ? `${diffMinutes} dk önce` : `${diffMinutes}m ago`;
    }

    if (isToday(parsedDate)) {
      const today = locale === 'tr' ? 'Bugün' : 'Today';
      return `${today}, ${format(parsedDate, 'HH:mm')}`;
    }

    if (isYesterday(parsedDate)) {
      const yesterday = locale === 'tr' ? 'Dün' : 'Yesterday';
      return `${yesterday}, ${format(parsedDate, 'HH:mm')}`;
    }

    return format(parsedDate, 'd MMM, HH:mm', { locale: localeObj });
  } catch {
    return '';
  }
};

/**
 * Check if date is within last N minutes
 */
export const isWithinLastMinutes = (date: string | Date, minutes: number): boolean => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMinutes = (now.getTime() - parsedDate.getTime()) / (1000 * 60);
    return diffMinutes <= minutes;
  } catch {
    return false;
  }
};

/**
 * Get age from birth date
 */
export const getAge = (birthDate: string | Date): number => {
  try {
    const parsedDate = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    const now = new Date();
    let age = now.getFullYear() - parsedDate.getFullYear();
    const monthDiff = now.getMonth() - parsedDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < parsedDate.getDate())) {
      age--;
    }

    return age;
  } catch {
    return 0;
  }
};
