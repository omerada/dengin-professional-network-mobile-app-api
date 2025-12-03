// src/core/storage/keys.ts
// Oku: mobile-development-guide/core/11-STORAGE.md

/**
 * AsyncStorage keys for general data
 */
export const STORAGE_KEYS = {
  // User preferences
  THEME: 'meslektas_theme',
  LANGUAGE: 'meslektas_language',
  ONBOARDING_COMPLETED: 'meslektas_onboarding_completed',
  BIOMETRIC_ENABLED: 'meslektas_biometric_enabled',

  // Cache
  USER_CACHE: 'meslektas_user_cache',
  FEED_CACHE: 'meslektas_feed_cache',

  // Offline data
  OFFLINE_MESSAGES: 'meslektas_offline_messages',
  PENDING_UPLOADS: 'meslektas_pending_uploads',

  // App state
  LAST_SYNC: 'meslektas_last_sync',
  APP_VERSION: 'meslektas_app_version',
} as const;

/**
 * SecureStore keys for sensitive data
 */
export const SECURE_KEYS = {
  ACCESS_TOKEN: 'meslektas_access_token',
  REFRESH_TOKEN: 'meslektas_refresh_token',
  USER_CREDENTIALS: 'meslektas_user_credentials',
  BIOMETRIC_KEY: 'meslektas_biometric_key',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];
