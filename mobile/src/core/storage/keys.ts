// src/core/storage/keys.ts
// Oku: mobile-development-guide/core/11-STORAGE.md

/**
 * AsyncStorage keys for general data
 */
export const STORAGE_KEYS = {
  // User preferences
  THEME: 'dengin_theme',
  LANGUAGE: 'dengin_language',
  ONBOARDING_COMPLETED: 'dengin_onboarding_completed',
  BIOMETRIC_ENABLED: 'dengin_biometric_enabled',

  // Cache
  USER_CACHE: 'dengin_user_cache',
  FEED_CACHE: 'dengin_feed_cache',

  // P2 Addition: Feed engagement tracking
  VERIFICATION_PROMPT_SHOWN: 'dengin_verification_prompt_shown',
  VERIFICATION_PROMPT_DISMISSED_AT: 'dengin_verification_prompt_dismissed_at',

  // Offline data
  OFFLINE_MESSAGES: 'dengin_offline_messages',
  PENDING_UPLOADS: 'dengin_pending_uploads',

  // App state
  LAST_SYNC: 'dengin_last_sync',
  APP_VERSION: 'dengin_app_version',
} as const;

/**
 * SecureStore keys for sensitive data
 */
export const SECURE_KEYS = {
  ACCESS_TOKEN: 'dengin_access_token',
  REFRESH_TOKEN: 'dengin_refresh_token',
  USER_CREDENTIALS: 'dengin_user_credentials',
  BIOMETRIC_KEY: 'dengin_biometric_key',
  TOKEN_EXPIRES_AT: 'token_expires_at',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];
