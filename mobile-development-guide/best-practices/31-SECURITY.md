# Security Best Practices

**Purpose:** Secure data, protect users, prevent attacks
**Complexity:** ⭐⭐⭐⭐ (High)

---

## Overview

Bu doküman, React Native uygulamasında güvenlik için kritik uygulamaları açıklar.

---

## Secure Storage

### Token Storage

```typescript
// ✅ DO: Store tokens in SecureStore
import * as SecureStore from "expo-secure-store";

const saveTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync("access_token", accessToken, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED, // iOS Keychain
  });

  await SecureStore.setItemAsync("refresh_token", refreshToken, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
};

// ❌ DON'T: Store tokens in AsyncStorage
await AsyncStorage.setItem("access_token", accessToken); // ❌ Not encrypted
```

### Sensitive Data

```typescript
// ✅ DO: Encrypt sensitive data
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = "your-secret-key"; // Store in env

const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// ❌ DON'T: Store sensitive data unencrypted
await AsyncStorage.setItem("credit_card", cardNumber); // ❌
```

---

## API Security

### HTTPS Only

```typescript
// ✅ DO: Use HTTPS
const apiClient = axios.create({
  baseURL: "https://api.meslektas.com", // ✅ HTTPS
});

// ❌ DON'T: Use HTTP
const apiClient = axios.create({
  baseURL: "http://api.meslektas.com", // ❌ Insecure
});
```

### SSL Pinning

```bash
# Install SSL pinning
npm install react-native-ssl-pinning
```

```typescript
// ✅ DO: Implement SSL pinning
import { fetch as sslFetch } from "react-native-ssl-pinning";

const response = await sslFetch("https://api.meslektas.com/users", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  sslPinning: {
    certs: ["cert1", "cert2"], // Your SSL certificates
  },
});
```

### Request Validation

```typescript
// ✅ DO: Validate all inputs
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const login = async (data: unknown) => {
  // Validate before sending
  const validated = loginSchema.parse(data);

  const response = await apiClient.post("/auth/login", validated);
  return response.data;
};

// ❌ DON'T: Send unvalidated data
const login = async (email: any, password: any) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
};
```

---

## Authentication Security

### Token Management

```typescript
// ✅ DO: Auto-refresh tokens
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue request
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        const { data } = await axios.post("/auth/refresh", { refreshToken });

        await SecureStore.setItemAsync("access_token", data.accessToken);

        // Retry queued requests
        refreshSubscribers.forEach((cb) => cb(data.accessToken));
        refreshSubscribers = [];

        return apiClient(originalRequest);
      } catch (error) {
        // Logout user
        await clearTokens();
        navigationRef.navigate("Login");
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

### Biometric Authentication

```typescript
// ✅ DO: Use biometric for sensitive actions
import * as LocalAuthentication from "expo-local-authentication";

const authenticateBiometric = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Kimliğinizi doğrulayın",
    fallbackLabel: "Şifre kullan",
    cancelLabel: "İptal",
  });

  return result.success;
};

// Use before sensitive actions
const deleteAccount = async () => {
  const authenticated = await authenticateBiometric();

  if (!authenticated) {
    Alert.alert("Hata", "Kimlik doğrulama başarısız");
    return;
  }

  await userService.deleteAccount();
};
```

---

## Code Security

### Environment Variables

```typescript
// ✅ DO: Use environment variables
// .env
API_URL=https://api.meslektas.com
WS_URL=wss://ws.meslektas.com
ENCRYPTION_KEY=your-secret-key

// .env.production
API_URL=https://api.meslektas.com
WS_URL=wss://ws.meslektas.com

// config.ts
import Config from 'react-native-config';

export const ENV = {
  API_URL: Config.API_URL,
  WS_URL: Config.WS_URL,
  ENCRYPTION_KEY: Config.ENCRYPTION_KEY
};

// ❌ DON'T: Hardcode secrets
const API_KEY = 'sk_live_1234567890';  // ❌ Exposed in code
```

### Code Obfuscation

```bash
# Install obfuscation
npm install --save-dev metro-react-native-babel-preset

# Enable ProGuard (Android)
# android/app/build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Prevent Root/Jailbreak

```bash
npm install jail-monkey
```

```typescript
// ✅ DO: Detect rooted/jailbroken devices
import JailMonkey from "jail-monkey";

const checkDeviceSecurity = () => {
  if (JailMonkey.isJailBroken()) {
    Alert.alert(
      "Güvenlik Uyarısı",
      "Bu uygulama jailbreak/root cihazlarda çalışmaz",
      [{ text: "Tamam", onPress: () => BackHandler.exitApp() }]
    );
  }
};

useEffect(() => {
  checkDeviceSecurity();
}, []);
```

---

## Data Security

### Input Sanitization

```typescript
// ✅ DO: Sanitize user input
import DOMPurify from "isomorphic-dompurify";

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

const createPost = async (content: string) => {
  const sanitized = sanitizeInput(content);
  await postService.create({ content: sanitized });
};

// ❌ DON'T: Trust user input
const createPost = async (content: string) => {
  await postService.create({ content }); // ❌ Potential XSS
};
```

### SQL Injection Prevention

```typescript
// ✅ DO: Use parameterized queries (backend)
// Backend example
const getUser = async (userId: string) => {
  // ✅ Parameterized query
  const user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
  return user;
};

// ❌ DON'T: String concatenation
const getUser = async (userId: string) => {
  // ❌ Vulnerable to SQL injection
  const user = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);
  return user;
};
```

---

## Network Security

### Certificate Validation

```typescript
// ✅ DO: Validate SSL certificates
import { fetch as sslFetch } from "react-native-ssl-pinning";

const fetchData = async () => {
  try {
    const response = await sslFetch("https://api.meslektas.com/data", {
      method: "GET",
      sslPinning: {
        certs: ["cert1"],
      },
    });
    return response.json();
  } catch (error) {
    if (error.message.includes("SSL")) {
      Alert.alert("Güvenlik Hatası", "Güvenli bağlantı kurulamadı");
    }
  }
};
```

### Request Timeout

```typescript
// ✅ DO: Set timeouts to prevent hanging
const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000, // 10 seconds
});

// ✅ DO: Handle timeout errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      Alert.alert("Hata", "İstek zaman aşımına uğradı");
    }
    return Promise.reject(error);
  }
);
```

---

## Privacy & KVKK

### Data Minimization

```typescript
// ✅ DO: Request only necessary permissions
const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === "granted";
};

// ❌ DON'T: Request all permissions upfront
const requestAllPermissions = async () => {
  await Camera.requestCameraPermissionsAsync();
  await MediaLibrary.requestPermissionsAsync();
  await Location.requestForegroundPermissionsAsync();
  await Contacts.requestPermissionsAsync(); // ❌ Unnecessary
};
```

### Data Deletion

```typescript
// ✅ DO: Provide data deletion
const deleteUserData = async () => {
  // Delete from backend
  await userService.deleteAccount();

  // Clear local data
  await AsyncStorage.clear();
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");

  // Clear cache
  await queryClient.clear();

  // Logout
  navigationRef.navigate("Login");
};
```

### Consent Management

```typescript
// ✅ DO: Get user consent for data collection
const requestAnalyticsConsent = async () => {
  Alert.alert(
    "Analiz İzni",
    "Uygulama deneyimini iyileştirmek için anonim kullanım verileri toplayabilir miyiz?",
    [
      {
        text: "Hayır",
        onPress: () => setAnalyticsEnabled(false),
      },
      {
        text: "Evet",
        onPress: () => setAnalyticsEnabled(true),
      },
    ]
  );
};
```

---

## Security Checklist

**Storage:**

- [ ] Tokens in SecureStore (not AsyncStorage)
- [ ] Sensitive data encrypted
- [ ] No hardcoded secrets

**API:**

- [ ] HTTPS only
- [ ] SSL pinning implemented
- [ ] Input validation (Zod)
- [ ] Request timeouts

**Authentication:**

- [ ] Token auto-refresh
- [ ] Biometric for sensitive actions
- [ ] Secure logout (clear all data)

**Code:**

- [ ] Environment variables
- [ ] Code obfuscation (production)
- [ ] Root/jailbreak detection

**Privacy:**

- [ ] Minimal permissions
- [ ] Data deletion available
- [ ] User consent for tracking

---

## Security Testing

### Penetration Testing

```bash
# Use tools like:
- OWASP ZAP (API testing)
- Burp Suite (Proxy testing)
- MobSF (Mobile Security Framework)
```

### Code Review

```typescript
// ✅ DO: Regular security audits
- Review authentication flow
- Check API security
- Verify data encryption
- Test permission handling
```

---

## Common Vulnerabilities

### XSS Prevention

```typescript
// ✅ DO: Sanitize HTML content
import DOMPurify from 'isomorphic-dompurify';

<WebView
  source={{ html: DOMPurify.sanitize(htmlContent) }}
/>

// ❌ DON'T: Render unsanitized HTML
<WebView
  source={{ html: userGeneratedHTML }}  // ❌ XSS risk
/>
```

### CSRF Prevention

```typescript
// ✅ DO: Use CSRF tokens (backend)
// Backend sends CSRF token in response header
// Frontend includes token in request

apiClient.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});
```

---

## Summary

✅ **Security Measures:**

- Secure storage (SecureStore, encryption)
- API security (HTTPS, SSL pinning, validation)
- Authentication security (token refresh, biometric)
- Code security (env vars, obfuscation, root detection)
- Data security (sanitization, SQL injection prevention)
- Network security (certificate validation, timeouts)
- Privacy compliance (minimal permissions, data deletion, consent)

**Result:** Secure app protecting user data and privacy
