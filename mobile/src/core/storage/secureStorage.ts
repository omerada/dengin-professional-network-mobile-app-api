// src/core/storage/secureStorage.ts
// Oku: mobile-development-guide/core/11-STORAGE.md
// Oku: mobile-development-guide/best-practices/31-SECURITY.md

import { Platform } from 'react-native';
import { SecureKey } from './keys';

// SecureStore'u dinamik olarak yükle
let SecureStore: any = null;

if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    console.log('[SecureStorage] expo-secure-store not available');
  }
}

// Web için localStorage fallback (dikkat: güvenli değil, sadece dev için)
const webStorage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  isAvailableAsync: async (): Promise<boolean> => {
    return typeof localStorage !== 'undefined';
  },
  WHEN_UNLOCKED: 0,
};

/**
 * Secure storage wrapper for sensitive data (tokens, credentials)
 * Uses Keychain on iOS and Keystore on Android
 * Falls back to localStorage on web (not secure, dev only)
 */
const store = SecureStore || webStorage;

export const secureStorage = {
  /**
   * Get item from secure storage
   */
  async get(key: SecureKey): Promise<string | null> {
    try {
      return await store.getItemAsync(key);
    } catch (error) {
      console.error(`[SecureStorage] Error getting ${key}:`, error);
      return null;
    }
  },

  /**
   * Set item in secure storage
   */
  async set(key: SecureKey, value: string): Promise<boolean> {
    try {
      if (SecureStore) {
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
      } else {
        await store.setItemAsync(key, value);
      }
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error setting ${key}:`, error);
      return false;
    }
  },

  /**
   * Remove item from secure storage
   */
  async remove(key: SecureKey): Promise<boolean> {
    try {
      await store.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error removing ${key}:`, error);
      return false;
    }
  },

  /**
   * Check if secure storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await store.isAvailableAsync();
    } catch (error) {
      console.error('[SecureStorage] Error checking availability:', error);
      return false;
    }
  },

  /**
   * Clear all secure storage items
   * Note: Must delete items individually as SecureStore doesn't have a clear method
   */
  async clear(keys: SecureKey[]): Promise<boolean> {
    try {
      await Promise.all(keys.map(key => store.deleteItemAsync(key)));
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error clearing storage:', error);
      return false;
    }
  },
};
