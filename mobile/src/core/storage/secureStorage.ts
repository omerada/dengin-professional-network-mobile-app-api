// src/core/storage/secureStorage.ts
// Oku: mobile-development-guide/core/11-STORAGE.md
// Oku: mobile-development-guide/best-practices/31-SECURITY.md

import * as SecureStore from 'expo-secure-store';
import { SecureKey } from './keys';

/**
 * Secure storage wrapper for sensitive data (tokens, credentials)
 * Uses Keychain on iOS and Keystore on Android
 */

export const secureStorage = {
  /**
   * Get item from secure storage
   */
  async get(key: SecureKey): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
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
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
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
      await SecureStore.deleteItemAsync(key);
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
      return await SecureStore.isAvailableAsync();
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
      await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error clearing storage:', error);
      return false;
    }
  },
};
