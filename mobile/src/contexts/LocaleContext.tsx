// src/contexts/LocaleContext.tsx
// Oku: mobile-development-guide/state/16-CONTEXT-API.md

import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { asyncStorage, STORAGE_KEYS } from '@core/storage';
import { LanguageCode } from '@shared/types';

/**
 * Translation strings type
 */
type TranslationStrings = {
  [key: string]: string | TranslationStrings;
};

/**
 * Translations for supported languages
 */
const translations: Record<LanguageCode, TranslationStrings> = {
  tr: {
    common: {
      loading: 'Yükleniyor...',
      error: 'Bir hata oluştu',
      retry: 'Tekrar Dene',
      cancel: 'İptal',
      confirm: 'Onayla',
      save: 'Kaydet',
      delete: 'Sil',
      edit: 'Düzenle',
      close: 'Kapat',
      search: 'Ara',
      noResults: 'Sonuç bulunamadı',
    },
    auth: {
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      logout: 'Çıkış Yap',
      email: 'E-posta',
      password: 'Şifre',
      confirmPassword: 'Şifre Tekrar',
      forgotPassword: 'Şifremi Unuttum',
      resetPassword: 'Şifre Sıfırla',
      firstName: 'Ad',
      lastName: 'Soyad',
      phone: 'Telefon',
      profession: 'Meslek',
      biometric: 'Biyometrik ile Giriş',
      welcomeBack: 'Tekrar Hoş Geldiniz',
      createAccount: 'Hesap Oluşturun',
    },
    feed: {
      title: 'Ana Sayfa',
      createPost: 'Gönderi Oluştur',
      like: 'Beğen',
      comment: 'Yorum Yap',
      share: 'Paylaş',
      noPostsYet: 'Henüz gönderi yok',
    },
    messaging: {
      title: 'Mesajlar',
      newMessage: 'Yeni Mesaj',
      typeMessage: 'Mesaj yazın...',
      noConversations: 'Henüz mesaj yok',
    },
    notifications: {
      title: 'Bildirimler',
      noNotifications: 'Bildirim yok',
      markAllRead: 'Tümünü Okundu İşaretle',
    },
    profile: {
      title: 'Profil',
      editProfile: 'Profili Düzenle',
      settings: 'Ayarlar',
      verified: 'Doğrulanmış',
      unverified: 'Doğrulanmamış',
    },
    verification: {
      title: 'Kimlik Doğrulama',
      start: 'Doğrulamayı Başlat',
      documentFront: 'Kimlik Ön Yüz',
      documentBack: 'Kimlik Arka Yüz',
      selfie: 'Selfie Çekin',
      processing: 'İşleniyor...',
      success: 'Başarılı',
      failed: 'Başarısız',
    },
    errors: {
      network: 'İnternet bağlantısı yok',
      server: 'Sunucu hatası',
      unauthorized: 'Oturum süresi doldu',
      invalidEmail: 'Geçersiz e-posta adresi',
      invalidPassword: 'Şifre en az 8 karakter olmalı',
      passwordMismatch: 'Şifreler eşleşmiyor',
      requiredField: 'Bu alan zorunludur',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      search: 'Search',
      noResults: 'No results found',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      profession: 'Profession',
      biometric: 'Login with Biometrics',
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
    },
    feed: {
      title: 'Home',
      createPost: 'Create Post',
      like: 'Like',
      comment: 'Comment',
      share: 'Share',
      noPostsYet: 'No posts yet',
    },
    messaging: {
      title: 'Messages',
      newMessage: 'New Message',
      typeMessage: 'Type a message...',
      noConversations: 'No messages yet',
    },
    notifications: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      markAllRead: 'Mark All as Read',
    },
    profile: {
      title: 'Profile',
      editProfile: 'Edit Profile',
      settings: 'Settings',
      verified: 'Verified',
      unverified: 'Unverified',
    },
    verification: {
      title: 'Identity Verification',
      start: 'Start Verification',
      documentFront: 'ID Front',
      documentBack: 'ID Back',
      selfie: 'Take Selfie',
      processing: 'Processing...',
      success: 'Success',
      failed: 'Failed',
    },
    errors: {
      network: 'No internet connection',
      server: 'Server error',
      unauthorized: 'Session expired',
      invalidEmail: 'Invalid email address',
      invalidPassword: 'Password must be at least 8 characters',
      passwordMismatch: 'Passwords do not match',
      requiredField: 'This field is required',
    },
  },
};

/**
 * Locale context value type
 */
interface LocaleContextValue {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: (key: string) => string;
}

/**
 * Locale context
 */
const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

/**
 * Locale provider props
 */
interface LocaleProviderProps {
  children: React.ReactNode;
}

/**
 * Get nested translation string
 */
const getNestedTranslation = (obj: TranslationStrings, path: string): string => {
  const keys = path.split('.');
  let result: TranslationStrings | string = obj;

  for (const key of keys) {
    if (typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return key if translation not found
    }
  }

  return typeof result === 'string' ? result : path;
};

/**
 * Locale Provider
 * Manages language state and provides translations
 */
export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<LanguageCode>('tr');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      const savedLocale = await asyncStorage.get<LanguageCode>(STORAGE_KEYS.LANGUAGE);
      if (savedLocale) {
        setLocaleState(savedLocale);
      }
      setIsLoaded(true);
    };

    loadLanguagePreference();
  }, []);

  // Set locale and persist
  const setLocale = useCallback(async (newLocale: LanguageCode) => {
    setLocaleState(newLocale);
    await asyncStorage.set(STORAGE_KEYS.LANGUAGE, newLocale);
  }, []);

  // Translation function
  const t = useCallback(
    (key: string): string => {
      return getNestedTranslation(translations[locale], key);
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  // Don't render until language preference is loaded
  if (!isLoaded) {
    return null;
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

/**
 * Hook to access locale context
 */
export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext);

  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
};
