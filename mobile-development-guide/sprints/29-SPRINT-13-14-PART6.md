# Sprint 13-14: Part 6 - OAuth2 & Biometric Authentication

**Continues from:** 29-SPRINT-13-14-PART5.md

---

## 📁 Day 7-8: OAuth2 Implementation (Google & Apple Sign-In)

### Hedef Dosya Yapısı

```
src/features/auth/
├── services/
│   ├── oauth2Service.ts        # YENİ
│   └── authApi.ts              # GÜNCELLE
├── components/
│   ├── SocialLoginButtons.tsx  # YENİ
│   ├── GoogleSignInButton.tsx  # YENİ
│   └── AppleSignInButton.tsx   # YENİ
├── hooks/
│   ├── useGoogleSignIn.ts      # YENİ
│   └── useAppleSignIn.ts       # YENİ
└── screens/
    ├── LoginScreen.tsx         # GÜNCELLE (OAuth2 butonları ekle)
    └── RegisterScreen.tsx      # GÜNCELLE (OAuth2 butonları ekle)
```

---

### 1. OAuth2 Service (`services/oauth2Service.ts`)

```typescript
// src/features/auth/services/oauth2Service.ts
// Backend OAuth2Controller ile uyumlu

import { apiClient, API_ENDPOINTS } from "@core/api";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import appleAuth from "@invertase/react-native-apple-authentication";
import { Platform } from "react-native";
import { storage, STORAGE_KEYS } from "@core/storage";
import type { AuthResponse } from "../types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface OAuth2TokenRequest {
  provider: "GOOGLE" | "APPLE";
  idToken: string;
  accessToken?: string;
  authorizationCode?: string;
  fullName?: string;
  email?: string;
}

/**
 * Google Sign-In yapılandırması
 */
export const configureGoogleSignIn = (): void => {
  GoogleSignin.configure({
    webClientId:
      process.env.GOOGLE_WEB_CLIENT_ID || "YOUR_GOOGLE_WEB_CLIENT_ID",
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

/**
 * OAuth2 Service
 * Backend OAuth2Controller ile %100 uyumlu
 */
export const oauth2Service = {
  /**
   * Google ile giriş yap
   */
  signInWithGoogle: async (): Promise<AuthResponse> => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const request: OAuth2TokenRequest = {
        provider: "GOOGLE",
        idToken: userInfo.idToken || "",
        accessToken: tokens.accessToken,
      };

      return await oauth2Service.authenticateWithBackend(request);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Giriş iptal edildi");
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Giriş işlemi devam ediyor");
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Servisleri kullanılamıyor");
      }
      throw error;
    }
  },

  /**
   * Apple ile giriş yap (iOS only)
   */
  signInWithApple: async (): Promise<AuthResponse> => {
    if (Platform.OS !== "ios") {
      throw new Error("Apple Sign-In sadece iOS destekler");
    }

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );

      if (credentialState !== appleAuth.State.AUTHORIZED) {
        throw new Error("Apple Sign-In yetkilendirme başarısız");
      }

      const { identityToken, authorizationCode, fullName, email } =
        appleAuthRequestResponse;

      // Apple ilk girişte fullName ve email verir, sonraki girişlerde vermez
      const displayName = fullName
        ? `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim()
        : undefined;

      const request: OAuth2TokenRequest = {
        provider: "APPLE",
        idToken: identityToken || "",
        authorizationCode: authorizationCode || undefined,
        fullName: displayName,
        email: email || undefined,
      };

      return await oauth2Service.authenticateWithBackend(request);
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        throw new Error("Giriş iptal edildi");
      }
      throw error;
    }
  },

  /**
   * Backend'e OAuth2 token gönder
   * POST /api/auth/oauth2/callback
   */
  authenticateWithBackend: async (
    request: OAuth2TokenRequest
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.OAUTH2_CALLBACK,
      request
    );

    const authData = response.data.data;

    // Token'ları sakla
    await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
    await storage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(authData.user)
    );

    return authData;
  },

  /**
   * Google Sign-Out
   */
  signOutGoogle: async (): Promise<void> => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      // Ignore errors on sign out
    }
  },

  /**
   * Apple Sign-Out
   */
  signOutApple: async (): Promise<void> => {
    // Apple doesn't have a sign-out method
    // Just clear local tokens
  },
};

export default oauth2Service;
```

---

### 2. API Endpoints Güncelleme

```typescript
// src/core/api/endpoints.ts içine ekle

export const API_ENDPOINTS = {
  // ... mevcut endpoints

  AUTH: {
    // Mevcut endpoints
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",

    // OAuth2 endpoints - YENİ
    OAUTH2_CALLBACK: "/api/auth/oauth2/callback",
    OAUTH2_GOOGLE: "/api/auth/oauth2/google",
    OAUTH2_APPLE: "/api/auth/oauth2/apple",
  },

  // ... diğer endpoints
};
```

---

### 3. Google SignIn Hook (`hooks/useGoogleSignIn.ts`)

```typescript
// src/features/auth/hooks/useGoogleSignIn.ts

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store";
import { oauth2Service } from "../services";
import type { AuthResponse } from "../types";

export function useGoogleSignIn() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, Error>({
    mutationFn: oauth2Service.signInWithGoogle,
    onSuccess: (data) => {
      setAuth({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}
```

---

### 4. Apple SignIn Hook (`hooks/useAppleSignIn.ts`)

```typescript
// src/features/auth/hooks/useAppleSignIn.ts

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store";
import { oauth2Service } from "../services";
import type { AuthResponse } from "../types";

export function useAppleSignIn() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, Error>({
    mutationFn: oauth2Service.signInWithApple,
    onSuccess: (data) => {
      setAuth({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}
```

---

### 5. SocialLoginButtons Component (`components/SocialLoginButtons.tsx`)

```typescript
// src/features/auth/components/SocialLoginButtons.tsx

import React, { memo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AppleSignInButton } from "./AppleSignInButton";

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = memo(
  ({ onSuccess, onError }) => {
    const { theme } = useTheme();

    return (
      <View style={styles.container}>
        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.border.light },
            ]}
          />
          <Text
            style={[styles.dividerText, { color: theme.colors.text.tertiary }]}
          >
            veya
          </Text>
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.border.light },
            ]}
          />
        </View>

        {/* Social Buttons */}
        <View style={styles.buttons}>
          <GoogleSignInButton onSuccess={onSuccess} onError={onError} />

          {Platform.OS === "ios" && (
            <AppleSignInButton onSuccess={onSuccess} onError={onError} />
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xl,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  buttons: {
    gap: spacing.md,
  },
});

SocialLoginButtons.displayName = "SocialLoginButtons";
```

---

### 6. GoogleSignInButton Component (`components/GoogleSignInButton.tsx`)

```typescript
// src/features/auth/components/GoogleSignInButton.tsx

import React, { memo, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Image,
} from "react-native";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";
import { useGoogleSignIn } from "../hooks";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = memo(
  ({ onSuccess, onError }) => {
    const { theme } = useTheme();
    const googleSignIn = useGoogleSignIn();

    const handlePress = useCallback(async () => {
      try {
        await googleSignIn.mutateAsync();
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }, [googleSignIn, onSuccess, onError]);

    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.medium,
          },
        ]}
        onPress={handlePress}
        disabled={googleSignIn.isPending}
        activeOpacity={0.7}
      >
        {googleSignIn.isPending ? (
          <ActivityIndicator color={theme.colors.text.primary} size="small" />
        ) : (
          <>
            <Image
              source={require("@assets/icons/google-logo.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={[styles.text, { color: theme.colors.text.primary }]}>
              Google ile devam et
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
  },
});

GoogleSignInButton.displayName = "GoogleSignInButton";
```

---

### 7. AppleSignInButton Component (`components/AppleSignInButton.tsx`)

```typescript
// src/features/auth/components/AppleSignInButton.tsx

import React, { memo, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";
import { useAppleSignIn } from "../hooks";

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = memo(
  ({ onSuccess, onError }) => {
    const { theme, isDarkMode } = useTheme();
    const appleSignIn = useAppleSignIn();

    const handlePress = useCallback(async () => {
      try {
        await appleSignIn.mutateAsync();
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }, [appleSignIn, onSuccess, onError]);

    // Apple design guidelines: dark button on light mode, light button on dark mode
    const buttonBackgroundColor = isDarkMode ? "#FFFFFF" : "#000000";
    const textColor = isDarkMode ? "#000000" : "#FFFFFF";

    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
        onPress={handlePress}
        disabled={appleSignIn.isPending}
        activeOpacity={0.7}
      >
        {appleSignIn.isPending ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            <Icon
              name="logo-apple"
              size={20}
              color={textColor}
              style={styles.icon}
            />
            <Text style={[styles.text, { color: textColor }]}>
              Apple ile devam et
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 12,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
  },
});

AppleSignInButton.displayName = "AppleSignInButton";
```

---

## 📁 Day 8-9: Biometric Authentication

### Hedef Dosya Yapısı

```
src/features/auth/
├── screens/
│   └── BiometricSetupScreen.tsx  # YENİ
├── services/
│   └── biometricService.ts       # YENİ
├── hooks/
│   └── useBiometric.ts           # YENİ
└── store/
    └── biometricStore.ts         # YENİ
```

---

### 1. Biometric Service (`services/biometricService.ts`)

```typescript
// src/features/auth/services/biometricService.ts

import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import { storage, STORAGE_KEYS } from "@core/storage";

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

export type BiometricType = "FaceID" | "TouchID" | "Biometrics" | "None";

interface BiometricStatus {
  available: boolean;
  biometryType: BiometricType;
}

/**
 * Biometric Service
 * Biyometrik doğrulama için servis
 */
export const biometricService = {
  /**
   * Biyometrik doğrulama mevcut mu kontrol et
   */
  checkAvailability: async (): Promise<BiometricStatus> => {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();

      let type: BiometricType = "None";
      if (biometryType === BiometryTypes.FaceID) {
        type = "FaceID";
      } else if (biometryType === BiometryTypes.TouchID) {
        type = "TouchID";
      } else if (biometryType === BiometryTypes.Biometrics) {
        type = "Biometrics";
      }

      return { available, biometryType: type };
    } catch (error) {
      return { available: false, biometryType: "None" };
    }
  },

  /**
   * Biyometrik doğrulama yap
   */
  authenticate: async (
    promptMessage = "Kimliğinizi doğrulayın"
  ): Promise<boolean> => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: "İptal",
      });
      return success;
    } catch (error) {
      return false;
    }
  },

  /**
   * Biyometrik kilit etkin mi
   */
  isEnabled: async (): Promise<boolean> => {
    try {
      const enabled = await storage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === "true";
    } catch {
      return false;
    }
  },

  /**
   * Biyometrik kilidi etkinleştir/devre dışı bırak
   */
  setEnabled: async (enabled: boolean): Promise<void> => {
    await storage.setItem(
      STORAGE_KEYS.BIOMETRIC_ENABLED,
      enabled ? "true" : "false"
    );
  },

  /**
   * Biyometrik anahtar oluştur
   */
  createKeys: async (): Promise<boolean> => {
    try {
      const { publicKey } = await rnBiometrics.createKeys();
      await storage.setItem(STORAGE_KEYS.BIOMETRIC_PUBLIC_KEY, publicKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Biyometrik anahtarları sil
   */
  deleteKeys: async (): Promise<void> => {
    try {
      await rnBiometrics.deleteKeys();
      await storage.removeItem(STORAGE_KEYS.BIOMETRIC_PUBLIC_KEY);
    } catch {
      // Ignore errors
    }
  },

  /**
   * Biyometrik imza oluştur
   */
  createSignature: async (payload: string): Promise<string | null> => {
    try {
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: "İmza oluşturuluyor",
        payload,
      });
      return success ? signature : null;
    } catch {
      return null;
    }
  },
};

export default biometricService;
```

---

### 2. Storage Keys Güncelleme

```typescript
// src/core/storage/keys.ts - Güncelle

export const STORAGE_KEYS = {
  // Mevcut keys
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  THEME_MODE: "theme_mode",

  // Biometric keys - YENİ
  BIOMETRIC_ENABLED: "biometric_enabled",
  BIOMETRIC_PUBLIC_KEY: "biometric_public_key",
} as const;
```

---

### 3. Biometric Store (`store/biometricStore.ts`)

```typescript
// src/features/auth/store/biometricStore.ts

import { create } from "zustand";
import { biometricService, BiometricType } from "../services";

interface BiometricState {
  isAvailable: boolean;
  isEnabled: boolean;
  biometryType: BiometricType;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  enable: () => Promise<boolean>;
  disable: () => Promise<void>;
  authenticate: (prompt?: string) => Promise<boolean>;
}

export const useBiometricStore = create<BiometricState>((set, get) => ({
  isAvailable: false,
  isEnabled: false,
  biometryType: "None",
  isLoading: true,

  initialize: async () => {
    try {
      const [availability, enabled] = await Promise.all([
        biometricService.checkAvailability(),
        biometricService.isEnabled(),
      ]);

      set({
        isAvailable: availability.available,
        biometryType: availability.biometryType,
        isEnabled: enabled && availability.available,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  enable: async () => {
    const { isAvailable } = get();
    if (!isAvailable) return false;

    // Önce doğrulama yap
    const authenticated = await biometricService.authenticate(
      "Biyometrik kilidi etkinleştirmek için doğrulayın"
    );
    if (!authenticated) return false;

    // Anahtarları oluştur
    const keysCreated = await biometricService.createKeys();
    if (!keysCreated) return false;

    // Etkinleştir
    await biometricService.setEnabled(true);
    set({ isEnabled: true });
    return true;
  },

  disable: async () => {
    await biometricService.setEnabled(false);
    await biometricService.deleteKeys();
    set({ isEnabled: false });
  },

  authenticate: async (prompt?: string) => {
    const { isEnabled } = get();
    if (!isEnabled) return true; // Disabled ise doğrulama gerekmez

    return biometricService.authenticate(prompt);
  },
}));
```

---

### 4. useBiometric Hook (`hooks/useBiometric.ts`)

```typescript
// src/features/auth/hooks/useBiometric.ts

import { useEffect, useCallback } from "react";
import { useBiometricStore } from "../store";

/**
 * Biometric authentication hook
 */
export function useBiometric() {
  const {
    isAvailable,
    isEnabled,
    biometryType,
    isLoading,
    initialize,
    enable,
    disable,
    authenticate,
  } = useBiometricStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const getBiometricLabel = useCallback(() => {
    switch (biometryType) {
      case "FaceID":
        return "Face ID";
      case "TouchID":
        return "Touch ID";
      case "Biometrics":
        return "Parmak İzi";
      default:
        return "Biyometrik";
    }
  }, [biometryType]);

  const getBiometricIcon = useCallback(() => {
    switch (biometryType) {
      case "FaceID":
        return "scan-outline";
      case "TouchID":
      case "Biometrics":
        return "finger-print-outline";
      default:
        return "lock-closed-outline";
    }
  }, [biometryType]);

  return {
    isAvailable,
    isEnabled,
    biometryType,
    isLoading,
    enable,
    disable,
    authenticate,
    getBiometricLabel,
    getBiometricIcon,
  };
}
```

---

### 5. BiometricSetupScreen (`screens/BiometricSetupScreen.tsx`)

```typescript
// src/features/auth/screens/BiometricSetupScreen.tsx

import React, { useCallback } from "react";
import { View, Text, StyleSheet, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@contexts/ThemeContext";
import { Loading } from "@shared/components";
import { spacing, typography } from "@theme";
import { useBiometric } from "../hooks";

export const BiometricSetupScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    isAvailable,
    isEnabled,
    isLoading,
    biometryType,
    enable,
    disable,
    getBiometricLabel,
    getBiometricIcon,
  } = useBiometric();

  const handleToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        const success = await enable();
        if (!success) {
          Alert.alert(
            "Hata",
            "Biyometrik kilit etkinleştirilemedi. Lütfen tekrar deneyin."
          );
        }
      } else {
        Alert.alert(
          "Biyometrik Kilidi Kapat",
          `${getBiometricLabel()} ile giriş devre dışı bırakılsın mı?`,
          [
            { text: "İptal", style: "cancel" },
            {
              text: "Kapat",
              style: "destructive",
              onPress: () => disable(),
            },
          ]
        );
      }
    },
    [enable, disable, getBiometricLabel]
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <Loading message="Kontrol ediliyor..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
      edges={["bottom"]}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary[50] },
          ]}
        >
          <Icon
            name={getBiometricIcon()}
            size={64}
            color={theme.colors.primary[500]}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {getBiometricLabel()} ile Giriş
        </Text>

        {/* Description */}
        <Text
          style={[styles.description, { color: theme.colors.text.secondary }]}
        >
          {isAvailable
            ? `Uygulamaya daha hızlı ve güvenli giriş yapmak için ${getBiometricLabel()} kullanabilirsiniz.`
            : "Cihazınız biyometrik doğrulamayı desteklemiyor."}
        </Text>

        {/* Toggle */}
        {isAvailable && (
          <View
            style={[
              styles.toggleContainer,
              { backgroundColor: theme.colors.background.secondary },
            ]}
          >
            <View style={styles.toggleInfo}>
              <Icon
                name={getBiometricIcon()}
                size={24}
                color={theme.colors.text.primary}
              />
              <View style={styles.toggleText}>
                <Text
                  style={[
                    styles.toggleTitle,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {getBiometricLabel()} Kilidi
                </Text>
                <Text
                  style={[
                    styles.toggleSubtitle,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {isEnabled ? "Etkin" : "Devre dışı"}
                </Text>
              </View>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              trackColor={{
                false: theme.colors.border.medium,
                true: theme.colors.primary[500],
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        )}

        {/* Benefits */}
        <View style={styles.benefits}>
          <Text
            style={[styles.benefitsTitle, { color: theme.colors.text.primary }]}
          >
            Avantajları
          </Text>

          {[
            { icon: "flash-outline", text: "Anında giriş yapın" },
            { icon: "shield-checkmark-outline", text: "Güvenli ve şifreli" },
            {
              icon: "finger-print-outline",
              text: "Sadece siz erişebilirsiniz",
            },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Icon
                name={benefit.icon}
                size={20}
                color={theme.colors.primary[500]}
              />
              <Text
                style={[
                  styles.benefitText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {benefit.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    textAlign: "center",
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.xxl,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleText: {
    marginLeft: spacing.md,
  },
  toggleTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
  },
  toggleSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  benefits: {
    width: "100%",
    marginTop: spacing.lg,
  },
  benefitsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  benefitText: {
    fontSize: typography.fontSize.base,
    marginLeft: spacing.md,
  },
});
```

---

### 6. Package Dependencies

OAuth2 ve Biometric için gerekli paketler:

```bash
# Google Sign-In
npm install @react-native-google-signin/google-signin

# Apple Sign-In (iOS only)
npm install @invertase/react-native-apple-authentication

# Biometrics
npm install react-native-biometrics

# iOS için pod install gerekli
cd ios && pod install && cd ..
```

---

**Bu Part içerir:**

- OAuth2 Service (Google & Apple) ✅
- API Endpoints güncelleme ✅
- useGoogleSignIn Hook ✅
- useAppleSignIn Hook ✅
- SocialLoginButtons Component ✅
- GoogleSignInButton Component ✅
- AppleSignInButton Component ✅
- Biometric Service ✅
- Biometric Store ✅
- useBiometric Hook ✅
- BiometricSetupScreen ✅
- Package Dependencies ✅

**Sonraki Part:** ToastProvider Context, Navigation Updates, Index Exports
