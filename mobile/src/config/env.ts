// src/config/env.ts
// Oku: mobile-development-guide/architecture/02-PROJECT-SETUP.md

import Config from 'react-native-config';

/**
 * Environment configuration
 * Provides type-safe access to environment variables
 */
export const ENV = {
  API_BASE_URL: Config.API_BASE_URL || 'http://localhost:8080',
  WS_URL: Config.WS_URL || 'ws://localhost:8080/ws',

  FIREBASE: {
    apiKey: Config.FIREBASE_API_KEY,
    authDomain: Config.FIREBASE_AUTH_DOMAIN,
    projectId: Config.FIREBASE_PROJECT_ID,
    storageBucket: Config.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
    appId: Config.FIREBASE_APP_ID,
  },

  SENTRY_DSN: Config.SENTRY_DSN,
  ENVIRONMENT: Config.ENVIRONMENT || 'development',

  isDevelopment: Config.ENVIRONMENT === 'development',
  isStaging: Config.ENVIRONMENT === 'staging',
  isProduction: Config.ENVIRONMENT === 'production',
} as const;

export type Environment = typeof ENV;
