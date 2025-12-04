# Sprint 13-14: Part 7 - Context Providers, Navigation & Final Index

**Continues from:** 29-SPRINT-13-14-PART6.md

---

## 📁 Day 9-10: ToastProvider Context

### Hedef Dosya Yapısı

```
src/contexts/
├── index.ts                  # GÜNCELLE
├── ThemeContext.tsx          # Mevcut
├── AuthContext.tsx           # Mevcut
└── ToastContext.tsx          # YENİ
```

---

### 1. ToastContext (`contexts/ToastContext.tsx`)

```typescript
// src/contexts/ToastContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Toast, ToastConfig, ToastType } from "@shared/components";

interface ToastContextValue {
  show: (config: ToastConfig) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig>({
    type: "info",
    message: "",
  });

  const show = useCallback((newConfig: ToastConfig) => {
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  const showWithType = useCallback(
    (type: ToastType, message: string, title?: string) => {
      show({ type, message, title });
    },
    [show]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      showWithType("success", message, title);
    },
    [showWithType]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showWithType("error", message, title);
    },
    [showWithType]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showWithType("warning", message, title);
    },
    [showWithType]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showWithType("info", message, title);
    },
    [showWithType]
  );

  const contextValue = useMemo(
    () => ({
      show,
      success,
      error,
      warning,
      info,
      hide,
    }),
    [show, success, error, warning, info, hide]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast
        visible={visible}
        type={config.type}
        title={config.title}
        message={config.message}
        duration={config.duration}
        onHide={hide}
        action={config.action}
      />
    </ToastContext.Provider>
  );
};

/**
 * useToast hook
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
```

---

### 2. Contexts Index Güncelleme (`contexts/index.ts`)

```typescript
// src/contexts/index.ts

export { ThemeProvider, useTheme } from "./ThemeContext";
export { AuthProvider, useAuth } from "./AuthContext";
export { ToastProvider, useToast } from "./ToastContext";
```

---

### 3. App.tsx Güncelleme

```typescript
// src/App.tsx - Provider sarmalama

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, AuthProvider, ToastProvider } from "@contexts";
import { RootNavigator } from "@core/navigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <RootNavigator />
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
```

---

## 📁 Day 10: Navigation Updates

### 1. Navigation Types Güncelleme (`navigation/types.ts`)

```typescript
// src/core/navigation/types.ts

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  VerifyPhone: { phoneNumber: string };
  BiometricSetup: undefined; // YENİ
};

// Main Tab Navigator
export type MainTabParamList = {
  FeedTab: NavigatorScreenParams<FeedStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  NotificationsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Feed Stack
export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
  Comments: { postId: string };
  UserProfile: { userId: string };
};

// Messages Stack
export type MessagesStackParamList = {
  ConversationList: undefined;
  Conversation: { conversationId: string; participantName: string };
  NewMessage: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
  FollowersList: { userId: number }; // YENİ
  FollowingList: { userId: number }; // YENİ
  BlockedUsers: undefined; // YENİ
  PrivacySettings: undefined; // YENİ
  NotificationSettings: undefined; // YENİ
  BiometricSettings: undefined; // YENİ
};

// Moderation Stack - YENİ
export type ModerationStackParamList = {
  Report: {
    type: "USER" | "POST" | "COMMENT" | "MESSAGE";
    targetId: string | number;
  };
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Verification: undefined;
  Moderation: NavigatorScreenParams<ModerationStackParamList>;
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type FeedScreenProps<T extends keyof FeedStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<FeedStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type MessagesScreenProps<T extends keyof MessagesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MessagesStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type ModerationScreenProps<T extends keyof ModerationStackParamList> =
  NativeStackScreenProps<ModerationStackParamList, T>;
```

---

### 2. Profile Navigator Güncelleme

```typescript
// src/core/navigation/stacks/ProfileNavigator.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@contexts/ThemeContext";
import type { ProfileStackParamList } from "../types";

// Screens
import {
  ProfileScreen,
  EditProfileScreen,
  SettingsScreen,
} from "@features/profile/screens";
import {
  FollowersListScreen,
  FollowingListScreen,
} from "@features/social/screens";
import { BiometricSetupScreen } from "@features/auth/screens";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Profili Düzenle" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Ayarlar" }}
      />
      <Stack.Screen
        name="FollowersList"
        component={FollowersListScreen}
        options={{ title: "Takipçiler" }}
      />
      <Stack.Screen
        name="FollowingList"
        component={FollowingListScreen}
        options={{ title: "Takip Edilenler" }}
      />
      <Stack.Screen
        name="BiometricSettings"
        component={BiometricSetupScreen}
        options={{ title: "Biyometrik Giriş" }}
      />
    </Stack.Navigator>
  );
};
```

---

## 📁 Final Index Exports

### 1. Profile Feature Index (`features/profile/index.ts`)

```typescript
// src/features/profile/index.ts

// Types
export * from "./types";

// Services
export { profileApi } from "./services";

// Hooks
export {
  profileKeys,
  useProfile,
  useMyProfile,
  useUpdateProfile,
  useUpdateAvatar,
  useProfileStats,
} from "./hooks";

// Store
export { useProfileStore } from "./store";

// Components
export {
  ProfileHeader,
  ProfileStats,
  ProfileActions,
  AvatarPicker,
  SettingsItem,
} from "./components";

// Screens
export { ProfileScreen, EditProfileScreen, SettingsScreen } from "./screens";
```

---

### 2. Social Feature Index (`features/social/index.ts`)

```typescript
// src/features/social/index.ts

// Types
export * from "./types";

// Services
export { socialApi } from "./services";

// Hooks
export {
  useFollow,
  useUnfollow,
  useBlock,
  useUnblock,
  useFollowers,
  useFollowing,
} from "./hooks";

// Components
export { UserListItem, FollowButton } from "./components";

// Screens
export { FollowersListScreen, FollowingListScreen } from "./screens";
```

---

### 3. Moderation Feature Index (`features/moderation/index.ts`)

```typescript
// src/features/moderation/index.ts

// Types
export * from "./types";

// Services
export { moderationApi } from "./services";

// Hooks
export { useCreateReport, useMyReports, useBlockedUsers } from "./hooks";

// Screens
export { ReportScreen } from "./screens";
```

---

### 4. Auth Feature Index Güncelleme (`features/auth/index.ts`)

```typescript
// src/features/auth/index.ts

// Types
export * from "./types";

// Services
export { authApi } from "./services/authApi";
export { oauth2Service, configureGoogleSignIn } from "./services/oauth2Service";
export { biometricService } from "./services/biometricService";

// Hooks
export { useLogin, useRegister, useLogout, useRefreshToken } from "./hooks";
export { useGoogleSignIn } from "./hooks/useGoogleSignIn";
export { useAppleSignIn } from "./hooks/useAppleSignIn";
export { useBiometric } from "./hooks/useBiometric";

// Store
export { useAuthStore } from "./store/authStore";
export { useBiometricStore } from "./store/biometricStore";

// Components
export { SocialLoginButtons } from "./components/SocialLoginButtons";
export { GoogleSignInButton } from "./components/GoogleSignInButton";
export { AppleSignInButton } from "./components/AppleSignInButton";

// Screens
export { LoginScreen } from "./screens/LoginScreen";
export { RegisterScreen } from "./screens/RegisterScreen";
export { BiometricSetupScreen } from "./screens/BiometricSetupScreen";
```

---

### 5. Shared Components Index Güncelleme (`shared/components/index.ts`)

```typescript
// src/shared/components/index.ts

// Basic Components
export { Button } from "./Button";
export { Input } from "./Input";
export { Loading } from "./Loading";

// Display Components
export { Avatar } from "./Avatar";
export { Badge } from "./Badge";
export { Card } from "./Card";

// Feedback Components
export { EmptyState } from "./EmptyState";
export { Skeleton } from "./Skeleton";
export { Toast, type ToastConfig, type ToastType } from "./Toast";

// Overlay Components
export { Modal } from "./Modal";
export { BottomSheet } from "./BottomSheet";
```

---

## 📁 API Endpoints Final (`core/api/endpoints.ts`)

```typescript
// src/core/api/endpoints.ts

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    VERIFY_PHONE: "/api/auth/verify-phone",
    RESEND_OTP: "/api/auth/resend-otp",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    // OAuth2
    OAUTH2_CALLBACK: "/api/auth/oauth2/callback",
    OAUTH2_GOOGLE: "/api/auth/oauth2/google",
    OAUTH2_APPLE: "/api/auth/oauth2/apple",
  },

  // User & Profile
  USER: {
    ME: "/api/users/me",
    PROFILE: (userId: number) => `/api/users/${userId}`,
    UPDATE_PROFILE: "/api/users/me",
    UPDATE_AVATAR: "/api/users/me/avatar",
    STATS: (userId: number) => `/api/users/${userId}/stats`,
    BLOCKED: "/api/users/blocked",
  },

  // Social
  SOCIAL: {
    FOLLOW: (userId: number) => `/api/users/${userId}/follow`,
    UNFOLLOW: (userId: number) => `/api/users/${userId}/follow`,
    FOLLOWERS: (userId: number) => `/api/users/${userId}/followers`,
    FOLLOWING: (userId: number) => `/api/users/${userId}/following`,
    BLOCK: (userId: number) => `/api/users/${userId}/block`,
    UNBLOCK: (userId: number) => `/api/users/${userId}/block`,
  },

  // Feed
  FEED: {
    LIST: "/api/feed",
    CREATE_POST: "/api/posts",
    POST_DETAIL: (postId: string) => `/api/posts/${postId}`,
    LIKE: (postId: string) => `/api/posts/${postId}/like`,
    UNLIKE: (postId: string) => `/api/posts/${postId}/like`,
    COMMENTS: (postId: string) => `/api/posts/${postId}/comments`,
    ADD_COMMENT: (postId: string) => `/api/posts/${postId}/comments`,
    SHARE: (postId: string) => `/api/posts/${postId}/share`,
  },

  // Messaging
  MESSAGES: {
    CONVERSATIONS: "/api/conversations",
    CONVERSATION: (id: string) => `/api/conversations/${id}`,
    MESSAGES: (conversationId: string) =>
      `/api/conversations/${conversationId}/messages`,
    SEND: (conversationId: string) =>
      `/api/conversations/${conversationId}/messages`,
    MARK_READ: (conversationId: string) =>
      `/api/conversations/${conversationId}/read`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/read-all",
    PREFERENCES: "/api/notifications/preferences",
  },

  // Verification
  VERIFICATION: {
    STATUS: "/api/verification/status",
    SUBMIT: "/api/verification/submit",
    UPLOAD_DOCUMENT: "/api/verification/document",
    AI_VERIFY: "/api/verification/ai-verify",
  },

  // Moderation
  MODERATION: {
    REPORTS: "/api/reports",
    CREATE_REPORT: "/api/reports",
  },

  // Professions
  PROFESSIONS: {
    LIST: "/api/professions",
    SEARCH: "/api/professions/search",
    DETAIL: (id: number) => `/api/professions/${id}`,
  },
} as const;
```

---

## ✅ Sprint Completion Checklist

### Profile Module

- [x] Profile Types
- [x] Profile API Service
- [x] Profile Hooks (useProfile, useMyProfile, useUpdateProfile)
- [x] Profile Store
- [x] ProfileHeader Component
- [x] ProfileStats Component
- [x] ProfileActions Component
- [x] AvatarPicker Component
- [x] SettingsItem Component
- [x] ProfileScreen
- [x] EditProfileScreen
- [x] SettingsScreen

### Shared Components

- [x] Avatar
- [x] Badge
- [x] Card
- [x] EmptyState
- [x] Skeleton
- [x] Modal
- [x] BottomSheet
- [x] Toast

### Social Features

- [x] Social Types
- [x] Social API Service
- [x] Follow/Unfollow Hooks
- [x] Followers/Following Hooks
- [x] UserListItem Component
- [x] FollowButton Component
- [x] FollowersListScreen
- [x] FollowingListScreen

### Moderation Features

- [x] Moderation Types
- [x] Moderation API Service
- [x] Moderation Hooks
- [x] ReportScreen

### OAuth2 Authentication

- [x] OAuth2 Service (Google & Apple)
- [x] useGoogleSignIn Hook
- [x] useAppleSignIn Hook
- [x] SocialLoginButtons Component
- [x] GoogleSignInButton Component
- [x] AppleSignInButton Component

### Biometric Authentication

- [x] Biometric Service
- [x] Biometric Store
- [x] useBiometric Hook
- [x] BiometricSetupScreen

### Contexts & Providers

- [x] ToastContext / ToastProvider
- [x] useToast Hook

### Navigation

- [x] Navigation Types güncelleme
- [x] Profile Navigator güncelleme

### Index Exports

- [x] Profile Feature Index
- [x] Social Feature Index
- [x] Moderation Feature Index
- [x] Auth Feature Index
- [x] Shared Components Index
- [x] API Endpoints Final

---

## 📦 Required Dependencies Summary

```json
{
  "dependencies": {
    "@react-native-google-signin/google-signin": "^10.0.1",
    "@invertase/react-native-apple-authentication": "^2.3.0",
    "react-native-biometrics": "^3.0.1",
    "react-native-image-picker": "^7.1.0",
    "react-native-reanimated": "^3.6.1",
    "react-native-gesture-handler": "^2.14.1"
  }
}
```

---

## 🎯 Implementation Order

1. **Shared Components** (Part 4) → Temel bileşenler
2. **Profile Module** (Part 1-3) → Profil yönetimi
3. **Social Features** (Part 5) → Takip/Engelleme
4. **Moderation** (Part 5) → Şikayet sistemi
5. **OAuth2** (Part 6) → Sosyal giriş
6. **Biometric** (Part 6) → Biyometrik giriş
7. **Contexts & Navigation** (Part 7) → Entegrasyon

---

## 🔗 Backend API Uyumluluk Matrisi

| Feature       | Backend Controller     | Mobile Service  | Status |
| ------------- | ---------------------- | --------------- | ------ |
| Auth          | AuthController         | authApi         | ✅     |
| OAuth2        | OAuth2Controller       | oauth2Service   | ✅     |
| Profile       | UserController         | profileApi      | ✅     |
| Follow        | FollowController       | socialApi       | ✅     |
| Block         | BlockController        | socialApi       | ✅     |
| Report        | ReportController       | moderationApi   | ✅     |
| Feed          | PostController         | feedApi         | ✅     |
| Messages      | MessageController      | messageApi      | ✅     |
| Notifications | NotificationController | notificationApi | ✅     |
| Verification  | VerificationController | verificationApi | ✅     |

---

**Sprint 13-14 Dökümanları Tamamlandı!**

- Part 1: Profile Module Foundation (Types, API, Store, Hooks)
- Part 2: Profile Components
- Part 3: Profile Screens
- Part 4: Shared Components
- Part 5: Social Features & Moderation
- Part 6: OAuth2 & Biometric Authentication
- Part 7: Contexts, Navigation & Final Index

**Toplam Dosya Sayısı:** ~45 dosya
**Tahmini Süre:** 2 Sprint (4 hafta)
