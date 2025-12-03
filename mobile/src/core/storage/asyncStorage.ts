// src/core/storage/asyncStorage.ts
// Oku: mobile-development-guide/core/11-STORAGE.md

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKey } from './keys';

/**
 * AsyncStorage wrapper with type safety and error handling
 */
export const asyncStorage = {
  /**
   * Get item from storage
   */
  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[AsyncStorage] Error getting ${key}:`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   */
  async set<T>(key: StorageKey, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`[AsyncStorage] Error setting ${key}:`, error);
      return false;
    }
  },

  /**
   * Remove item from storage
   */
  async remove(key: StorageKey): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[AsyncStorage] Error removing ${key}:`, error);
      return false;
    }
  },

  /**
   * Get multiple items
   */
  async getMultiple<T>(keys: StorageKey[]): Promise<Partial<Record<StorageKey, T>>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Partial<Record<StorageKey, T>> = {};

      for (const [key, value] of pairs) {
        if (value !== null) {
          result[key as StorageKey] = JSON.parse(value) as T;
        }
      }

      return result;
    } catch (error) {
      console.error('[AsyncStorage] Error getting multiple:', error);
      return {};
    }
  },

  /**
   * Set multiple items
   */
  async setMultiple(items: Partial<Record<StorageKey, unknown>>): Promise<boolean> {
    try {
      const pairs = Object.entries(items).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]) as [string, string][];

      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('[AsyncStorage] Error setting multiple:', error);
      return false;
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('[AsyncStorage] Error clearing storage:', error);
      return false;
    }
  },

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('[AsyncStorage] Error getting all keys:', error);
      return [];
    }
  },
};
