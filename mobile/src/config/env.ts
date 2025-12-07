// src/config/env.ts
// Oku: mobile-development-guide/architecture/02-PROJECT-SETUP.md

import Constants from 'expo-constants';

// Get extra config from app.json/app.config.js
const expoConfig = Constants.expoConfig?.extra || {};

/**
 * Environment configuration
 * Provides type-safe access to environment variables
 * Uses Expo Constants for managed workflow compatibility
 */
export const ENV = {
  // IMPORTANT: For Expo Go, .env doesn't work reliably
  // Using direct IP address for local development
  API_BASE_URL:
    expoConfig.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.101:8080', // Your host machine IP
  WS_URL: expoConfig.WS_URL || process.env.EXPO_PUBLIC_WS_URL || 'ws://192.168.1.101:8080/ws',

  FIREBASE: {
    apiKey: expoConfig.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain:
      expoConfig.FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: expoConfig.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket:
      expoConfig.FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId:
      expoConfig.FIREBASE_MESSAGING_SENDER_ID ||
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      '',
    appId: expoConfig.FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  },

  SENTRY_DSN: expoConfig.SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  ENVIRONMENT: expoConfig.ENVIRONMENT || process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',

  isDevelopment:
    (expoConfig.ENVIRONMENT || process.env.EXPO_PUBLIC_ENVIRONMENT || 'development') ===
    'development',
  isStaging: (expoConfig.ENVIRONMENT || process.env.EXPO_PUBLIC_ENVIRONMENT) === 'staging',
  isProduction: (expoConfig.ENVIRONMENT || process.env.EXPO_PUBLIC_ENVIRONMENT) === 'production',
} as const;

export type Environment = typeof ENV;
