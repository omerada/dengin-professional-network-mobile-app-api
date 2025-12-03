// __tests__/unit/core/storage.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorage } from '../../../src/core/storage/asyncStorage';
import { cacheManager } from '../../../src/core/storage/cache';
import { STORAGE_KEYS } from '../../../src/core/storage/keys';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  clear: jest.fn().mockResolvedValue(undefined),
}));

describe('AsyncStorage Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('string değeri kaydetmeli', async () => {
      await asyncStorage.set('test-key', 'test-value');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('test-value'));
    });

    it('object değeri kaydetmeli', async () => {
      const obj = { name: 'test', value: 123 };
      await asyncStorage.set('test-key', obj);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(obj));
    });

    it('array değeri kaydetmeli', async () => {
      const arr = [1, 2, 3];
      await asyncStorage.set('test-key', arr);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(arr));
    });
  });

  describe('get', () => {
    it('mevcut değeri döndürmeli', async () => {
      const mockValue = JSON.stringify({ test: 'value' });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockValue);

      const result = await asyncStorage.get('test-key');

      expect(result).toEqual({ test: 'value' });
    });

    it('değer yoksa null döndürmeli', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await asyncStorage.get('test-key');

      expect(result).toBeNull();
    });

    it('geçersiz JSON için null döndürmeli', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const result = await asyncStorage.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('değeri silmeli', async () => {
      await asyncStorage.remove('test-key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('clear', () => {
    it('tüm storage\'ı temizlemeli', async () => {
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
      await cacheManager.set('cache-key', 'cache-value', ttl);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const storedData = JSON.parse(callArgs[1]);

      expect(storedData.value).toBe('cache-value');
      expect(storedData.expiresAt).toBeDefined();
      expect(storedData.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('get with TTL check', () => {
    it('geçerli cache değerini döndürmeli', async () => {
      const futureExpiry = Date.now() + 60000;
      const cachedData = JSON.stringify({
        value: 'cached-value',
        expiresAt: futureExpiry,
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(cachedData);

      const result = await cacheManager.get('cache-key');

      expect(result).toBe('cached-value');
    });

    it('süresi dolmuş cache için null döndürmeli', async () => {
      const pastExpiry = Date.now() - 60000;
      const cachedData = JSON.stringify({
        value: 'expired-value',
        expiresAt: pastExpiry,
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(cachedData);

      const result = await cacheManager.get('cache-key');

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('cache-key');
    });

    it('cache yoksa null döndürmeli', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await cacheManager.get('cache-key');

      expect(result).toBeNull();
    });
  });

  describe('invalidate', () => {
    it('belirli bir cache\'i geçersiz kılmalı', async () => {
      await cacheManager.invalidate('cache-key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('cache-key');
    });
  });

  describe('invalidateAll', () => {
    it('tüm cache\'leri temizlemeli', async () => {
      const cacheKeys = ['cache:key1', 'cache:key2', 'other:key'];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(cacheKeys);

      await cacheManager.invalidateAll();

      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });
});

describe('STORAGE_KEYS', () => {
  it('gerekli anahtarları içermeli', () => {
    expect(STORAGE_KEYS.ACCESS_TOKEN).toBeDefined();
    expect(STORAGE_KEYS.REFRESH_TOKEN).toBeDefined();
    expect(STORAGE_KEYS.USER_DATA).toBeDefined();
    expect(STORAGE_KEYS.THEME).toBeDefined();
    expect(STORAGE_KEYS.LOCALE).toBeDefined();
    expect(STORAGE_KEYS.ONBOARDING_COMPLETED).toBeDefined();
  });

  it('anahtarlar benzersiz olmalı', () => {
    const values = Object.values(STORAGE_KEYS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});
