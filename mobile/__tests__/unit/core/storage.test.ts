// __tests__/unit/core/storage.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorage } from '../../../src/core/storage/asyncStorage';
import { cacheManager } from '../../../src/core/storage/cache';
import { STORAGE_KEYS, SECURE_KEYS } from '../../../src/core/storage/keys';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  clear: jest.fn().mockResolvedValue(undefined),
}));

describe('AsyncStorage Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('string değeri kaydetmeli', async () => {
      await asyncStorage.set(STORAGE_KEYS.THEME, 'dark');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME, JSON.stringify('dark'));
    });

    it('object değeri kaydetmeli', async () => {
      const obj = { name: 'test', value: 123 };
      await asyncStorage.set(STORAGE_KEYS.USER_CACHE, obj);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_CACHE,
        JSON.stringify(obj),
      );
    });

    it('array değeri kaydetmeli', async () => {
      const arr = [1, 2, 3];
      await asyncStorage.set(STORAGE_KEYS.OFFLINE_MESSAGES, arr);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.OFFLINE_MESSAGES,
        JSON.stringify(arr),
      );
    });
  });

  describe('get', () => {
    it('mevcut değeri döndürmeli', async () => {
      const mockValue = JSON.stringify({ test: 'value' });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockValue);

      const result = await asyncStorage.get(STORAGE_KEYS.USER_CACHE);

      expect(result).toEqual({ test: 'value' });
    });

    it('değer yoksa null döndürmeli', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await asyncStorage.get(STORAGE_KEYS.THEME);

      expect(result).toBeNull();
    });

    it('geçersiz JSON için null döndürmeli', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const result = await asyncStorage.get(STORAGE_KEYS.THEME);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('değeri silmeli', async () => {
      await asyncStorage.remove(STORAGE_KEYS.THEME);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME);
    });
  });

  describe('clear', () => {
    it("tüm storage'ı temizlemeli", async () => {
      await asyncStorage.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });
  });
});

describe('CacheManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset cache state
  });

  describe('set with TTL', () => {
    it('TTL ile değer kaydetmeli', async () => {
      const ttl = 60000; // 1 minute
      await cacheManager.set(STORAGE_KEYS.USER_CACHE, 'cache-value', ttl);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const storedData = JSON.parse(callArgs[1]);

      expect(storedData.data).toBe('cache-value');
      expect(storedData.timestamp).toBeDefined();
      expect(storedData.ttl).toBe(ttl);
    });
  });

  describe('get with TTL check', () => {
    it('geçerli cache değerini döndürmeli', async () => {
      const cachedData = JSON.stringify({
        data: 'cached-value',
        timestamp: Date.now(),
        ttl: 60000,
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(cachedData);

      const result = await cacheManager.get(STORAGE_KEYS.USER_CACHE);

      expect(result).toBe('cached-value');
    });

    it('süresi dolmuş cache için null döndürmeli', async () => {
      const cachedData = JSON.stringify({
        data: 'expired-value',
        timestamp: Date.now() - 120000, // 2 minutes ago
        ttl: 60000, // 1 minute TTL
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(cachedData);

      const result = await cacheManager.get(STORAGE_KEYS.USER_CACHE);

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_CACHE);
    });

    it('cache yoksa null döndürmeli', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await cacheManager.get(STORAGE_KEYS.USER_CACHE);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it("belirli bir cache'i silmeli", async () => {
      await cacheManager.remove(STORAGE_KEYS.USER_CACHE);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_CACHE);
    });
  });

  describe('invalidateAll', () => {
    it("birden fazla cache'i temizlemeli", async () => {
      const cacheKeys = [STORAGE_KEYS.USER_CACHE, STORAGE_KEYS.FEED_CACHE];

      await cacheManager.invalidateAll(cacheKeys);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_CACHE);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.FEED_CACHE);
    });
  });
});

describe('STORAGE_KEYS', () => {
  it('gerekli anahtarları içermeli', () => {
    expect(STORAGE_KEYS.THEME).toBeDefined();
    expect(STORAGE_KEYS.LANGUAGE).toBeDefined();
    expect(STORAGE_KEYS.ONBOARDING_COMPLETED).toBeDefined();
    expect(STORAGE_KEYS.BIOMETRIC_ENABLED).toBeDefined();
    expect(STORAGE_KEYS.USER_CACHE).toBeDefined();
    expect(STORAGE_KEYS.FEED_CACHE).toBeDefined();
  });

  it('anahtarlar benzersiz olmalı', () => {
    const values = Object.values(STORAGE_KEYS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});

describe('SECURE_KEYS', () => {
  it('gerekli güvenli anahtarları içermeli', () => {
    expect(SECURE_KEYS.ACCESS_TOKEN).toBeDefined();
    expect(SECURE_KEYS.REFRESH_TOKEN).toBeDefined();
    expect(SECURE_KEYS.USER_CREDENTIALS).toBeDefined();
    expect(SECURE_KEYS.BIOMETRIC_KEY).toBeDefined();
  });

  it('anahtarlar benzersiz olmalı', () => {
    const values = Object.values(SECURE_KEYS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});
