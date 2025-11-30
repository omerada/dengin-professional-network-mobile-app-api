# Storage System

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐ (Medium)

---

## 1. Overview

Storage sistemi AsyncStorage (normal data) ve SecureStore (sensitive data) kullanarak local data persistence sağlar.

---

## 2. Module Structure

```
src/core/storage/
├── asyncStorage.ts          # AsyncStorage wrapper
├── secureStorage.ts         # SecureStore wrapper
├── cache.ts                 # Cache manager
└── types.ts                 # Storage types
```

---

## 3. Async Storage

**src/core/storage/asyncStorage.ts:**

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

class AsyncStorageService {
  // Set item
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`AsyncStorage setItem error for key "${key}":`, error);
      throw error;
    }
  }

  // Get item
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`AsyncStorage getItem error for key "${key}":`, error);
      return null;
    }
  }

  // Remove item
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AsyncStorage removeItem error for key "${key}":`, error);
      throw error;
    }
  }

  // Clear all
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("AsyncStorage clear error:", error);
      throw error;
    }
  }

  // Get all keys
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error("AsyncStorage getAllKeys error:", error);
      return [];
    }
  }

  // Multi get
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const result = await AsyncStorage.multiGet(keys);
      const data: Record<string, T | null> = {};

      result.forEach(([key, value]) => {
        data[key] = value ? JSON.parse(value) : null;
      });

      return data;
    } catch (error) {
      console.error("AsyncStorage multiGet error:", error);
      return {};
    }
  }

  // Multi set
  async multiSet<T>(items: Record<string, T>): Promise<void> {
    try {
      const pairs = Object.entries(items).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error("AsyncStorage multiSet error:", error);
      throw error;
    }
  }

  // Multi remove
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error("AsyncStorage multiRemove error:", error);
      throw error;
    }
  }
}

export const asyncStorage = new AsyncStorageService();
```

---

## 4. Secure Storage

**src/core/storage/secureStorage.ts:**

```typescript
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

class SecureStorageService {
  // Set item (encrypted)
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    } catch (error) {
      console.error(`SecureStore setItem error for key "${key}":`, error);
      throw error;
    }
  }

  // Get item (decrypted)
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`SecureStore getItem error for key "${key}":`, error);
      return null;
    }
  }

  // Remove item
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`SecureStore removeItem error for key "${key}":`, error);
      throw error;
    }
  }

  // Set object (JSON stringified and encrypted)
  async setObject<T>(key: string, value: T): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.setItem(key, jsonValue);
  }

  // Get object (decrypted and JSON parsed)
  async getObject<T>(key: string): Promise<T | null> {
    const jsonValue = await this.getItem(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  }

  // Check if SecureStore is available
  isAvailable(): boolean {
    return Platform.OS === "ios" || Platform.OS === "android";
  }
}

export const secureStorage = new SecureStorageService();
```

---

## 5. Cache Manager

**src/core/storage/cache.ts:**

```typescript
import { asyncStorage } from "./asyncStorage";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class CacheManager {
  private prefix = "@cache:";

  // Set cache with TTL
  async set<T>(
    key: string,
    data: T,
    expiresIn: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    await asyncStorage.setItem(`${this.prefix}${key}`, entry);
  }

  // Get cache (returns null if expired)
  async get<T>(key: string): Promise<T | null> {
    const entry = await asyncStorage.getItem<CacheEntry<T>>(
      `${this.prefix}${key}`
    );

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.expiresIn) {
      // Cache expired, remove it
      await this.remove(key);
      return null;
    }

    return entry.data;
  }

  // Remove cache
  async remove(key: string): Promise<void> {
    await asyncStorage.removeItem(`${this.prefix}${key}`);
  }

  // Clear all cache
  async clear(): Promise<void> {
    const allKeys = await asyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) => key.startsWith(this.prefix));
    await asyncStorage.multiRemove(cacheKeys);
  }

  // Get cache age
  async getAge(key: string): Promise<number | null> {
    const entry = await asyncStorage.getItem<CacheEntry<any>>(
      `${this.prefix}${key}`
    );

    if (!entry) {
      return null;
    }

    return Date.now() - entry.timestamp;
  }

  // Check if cache is valid
  async isValid(key: string): Promise<boolean> {
    const age = await this.getAge(key);

    if (age === null) {
      return false;
    }

    const entry = await asyncStorage.getItem<CacheEntry<any>>(
      `${this.prefix}${key}`
    );
    return entry ? age < entry.expiresIn : false;
  }
}

export const cacheManager = new CacheManager();
```

---

## 6. Storage Keys

**src/core/storage/keys.ts:**

```typescript
// AsyncStorage keys
export const STORAGE_KEYS = {
  // Auth
  AUTH_USER: "@auth:user",
  AUTH_BIOMETRIC: "@auth:biometric",

  // Verification
  VERIFICATION_DATA: "@verification:data",
  VERIFICATION_STEP: "@verification:step",

  // Settings
  SETTINGS: "@settings",
  THEME: "@theme",
  LANGUAGE: "@language",

  // Cache
  FEED_CACHE: "@cache:feed",
  PROFILE_CACHE: "@cache:profile",

  // Drafts
  POST_DRAFT: "@draft:post",
  MESSAGE_DRAFT: "@draft:message",
} as const;

// SecureStore keys (sensitive data)
export const SECURE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TOKEN_EXPIRES_AT: "token_expires_at",
  BIOMETRIC_KEY: "biometric_key",
} as const;
```

---

## 7. Storage Utilities

**src/core/storage/utils.ts:**

```typescript
import { asyncStorage } from "./asyncStorage";

// Calculate storage size
export const getStorageSize = async (): Promise<number> => {
  const allKeys = await asyncStorage.getAllKeys();
  let totalSize = 0;

  for (const key of allKeys) {
    const value = await asyncStorage.getItem<any>(key);
    if (value) {
      totalSize += JSON.stringify(value).length;
    }
  }

  return totalSize; // bytes
};

// Format storage size
export const formatStorageSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Clear old data (older than specified days)
export const clearOldData = async (daysOld: number = 30): Promise<number> => {
  const allKeys = await asyncStorage.getAllKeys();
  const now = Date.now();
  const threshold = daysOld * 24 * 60 * 60 * 1000;
  let clearedCount = 0;

  for (const key of allKeys) {
    const value = await asyncStorage.getItem<any>(key);

    if (value && value.timestamp) {
      const age = now - value.timestamp;

      if (age > threshold) {
        await asyncStorage.removeItem(key);
        clearedCount++;
      }
    }
  }

  return clearedCount;
};
```

---

## 8. Usage Examples

**AsyncStorage:**

```typescript
import { asyncStorage } from "@core/storage/asyncStorage";
import { STORAGE_KEYS } from "@core/storage/keys";

// Save user settings
await asyncStorage.setItem(STORAGE_KEYS.SETTINGS, {
  notifications: true,
  darkMode: false,
});

// Load user settings
const settings = await asyncStorage.getItem(STORAGE_KEYS.SETTINGS);

// Remove settings
await asyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
```

**SecureStorage:**

```typescript
import { secureStorage } from "@core/storage/secureStorage";
import { SECURE_KEYS } from "@core/storage/keys";

// Save access token (encrypted)
await secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, "eyJhbGc...");

// Load access token (decrypted)
const token = await secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN);

// Remove token
await secureStorage.removeItem(SECURE_KEYS.ACCESS_TOKEN);
```

**Cache Manager:**

```typescript
import { cacheManager } from "@core/storage/cache";

// Cache data for 10 minutes
await cacheManager.set("user_profile", userProfile, 10 * 60 * 1000);

// Get cached data (returns null if expired)
const cachedProfile = await cacheManager.get("user_profile");

// Check if cache is valid
const isValid = await cacheManager.isValid("user_profile");

// Clear all cache
await cacheManager.clear();
```

---

## 9. Migration Strategy

**src/core/storage/migration.ts:**

```typescript
import { asyncStorage } from "./asyncStorage";

const MIGRATION_VERSION_KEY = "@migration:version";
const CURRENT_VERSION = 2;

export const runMigrations = async () => {
  const currentVersion =
    (await asyncStorage.getItem<number>(MIGRATION_VERSION_KEY)) || 0;

  if (currentVersion < CURRENT_VERSION) {
    console.log(
      `Running migrations from v${currentVersion} to v${CURRENT_VERSION}`
    );

    // Run migrations sequentially
    for (
      let version = currentVersion + 1;
      version <= CURRENT_VERSION;
      version++
    ) {
      await runMigration(version);
    }

    // Update version
    await asyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION);
  }
};

const runMigration = async (version: number) => {
  switch (version) {
    case 1:
      // Migration v1: Rename old keys
      await migrateV1();
      break;

    case 2:
      // Migration v2: Update data structure
      await migrateV2();
      break;
  }
};

const migrateV1 = async () => {
  // Example: Rename old key
  const oldData = await asyncStorage.getItem("old_key");
  if (oldData) {
    await asyncStorage.setItem("new_key", oldData);
    await asyncStorage.removeItem("old_key");
  }
};

const migrateV2 = async () => {
  // Example: Transform data structure
  const settings = await asyncStorage.getItem<any>("settings");
  if (settings) {
    const newSettings = {
      ...settings,
      version: 2,
      newField: "default_value",
    };
    await asyncStorage.setItem("settings", newSettings);
  }
};
```

---

## 10. Summary

### Features:

- ✅ AsyncStorage wrapper for general data
- ✅ SecureStore wrapper for sensitive data (encrypted)
- ✅ Cache manager with TTL
- ✅ Storage utilities (size, cleanup)
- ✅ Migration system
- ✅ Type-safe with TypeScript
- ✅ Error handling

**Result:** Production-ready storage system with encryption for sensitive data.
