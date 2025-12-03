// src/core/storage/cache.ts
// Oku: mobile-development-guide/core/11-STORAGE.md

import { asyncStorage } from './asyncStorage';
import { StorageKey } from './keys';
import { APP_CONFIG } from '@config/app';

/**
 * Cache entry with TTL
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache manager with TTL support
 */
export const cacheManager = {
  /**
   * Get cached item if not expired
   */
  async get<T>(key: StorageKey): Promise<T | null> {
    const entry = await asyncStorage.get<CacheEntry<T>>(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;

    if (isExpired) {
      await asyncStorage.remove(key);
      return null;
    }

    return entry.data;
  },

  /**
   * Set cached item with TTL
   */
  async set<T>(
    key: StorageKey,
    data: T,
    ttl: number = APP_CONFIG.CACHE.DEFAULT_TTL,
  ): Promise<boolean> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    return asyncStorage.set(key, entry);
  },

  /**
   * Remove cached item
   */
  async remove(key: StorageKey): Promise<boolean> {
    return asyncStorage.remove(key);
  },

  /**
   * Check if cached item exists and is valid
   */
  async isValid(key: StorageKey): Promise<boolean> {
    const entry = await asyncStorage.get<CacheEntry<unknown>>(key);

    if (!entry) {
      return false;
    }

    return Date.now() - entry.timestamp <= entry.ttl;
  },

  /**
   * Get cached item age in milliseconds
   */
  async getAge(key: StorageKey): Promise<number | null> {
    const entry = await asyncStorage.get<CacheEntry<unknown>>(key);

    if (!entry) {
      return null;
    }

    return Date.now() - entry.timestamp;
  },

  /**
   * Invalidate all caches
   */
  async invalidateAll(keys: StorageKey[]): Promise<void> {
    await Promise.all(keys.map(key => asyncStorage.remove(key)));
  },
};
