// src/config/app.ts
// Oku: mobile-development-guide/architecture/02-PROJECT-SETUP.md

/**
 * Application configuration constants
 */
export const APP_CONFIG = {
  // App info
  APP_NAME: 'Meslektaş',
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1',

  // API configuration
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Cache configuration
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    INITIAL_LOAD_SIZE: 10,
  },

  // Media
  MEDIA: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
    IMAGE_QUALITY: 0.8,
    THUMBNAIL_SIZE: { width: 200, height: 200 },
  },

  // WebSocket
  WEBSOCKET: {
    RECONNECT_DELAY: 3000, // 3 seconds
    MAX_RECONNECT_ATTEMPTS: 5,
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
  },

  // Authentication
  AUTH: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
    BIOMETRIC_TIMEOUT: 30000, // 30 seconds
  },

  // Deep linking
  DEEP_LINK: {
    SCHEME: 'meslektas',
    PREFIX: 'meslektas://',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
