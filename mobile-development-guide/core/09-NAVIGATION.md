# Navigation System

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐ (Medium)

---

## 1. Overview

Navigation sistemi React Navigation 6.x kullanarak type-safe routing, deep linking ve navigation state management sağlar.

---

## 2. Navigation Structure

```
src/core/navigation/
├── AppNavigator.tsx              # Root navigator
├── AuthNavigator.tsx             # Auth stack (Login, Register)
├── MainNavigator.tsx             # Main tab navigator
├── linking.ts                    # Deep linking config
├── navigationRef.ts              # Navigation ref for outside components
└── types.ts                      # Navigation types
```

---

## 3. Navigation Types

**src/core/navigation/types.ts:**

```typescript
import type { NavigatorScreenParams } from "@react-navigation/native";

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Verification: undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  BiometricSetup: undefined;
};

// Main Tabs
export type MainTabParamList = {
  FeedTab: NavigatorScreenParams<FeedStackParamList>;
  MessagingTab: NavigatorScreenParams<MessagingStackParamList>;
  NotificationsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Feed Stack
export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
};

// Messaging Stack
export type MessagingStackParamList = {
  ConversationList: undefined;
  Chat: { conversationId: string };
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: { userId?: string };
  EditProfile: undefined;
  Settings: undefined;
};

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

---

## 4. App Navigator

**src/core/navigation/AppNavigator.tsx:**

```typescript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { VerificationFlow } from "@features/verification/screens/VerificationFlow";
import { useAuthStore } from "@features/auth/stores/authStore";
import { linking } from "./linking";
import { navigationRef } from "./navigationRef";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="Verification"
              component={VerificationFlow}
              options={{ presentation: "modal" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

---

## 5. Auth Navigator

**src/core/navigation/AuthNavigator.tsx:**

```typescript
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "@features/auth/screens/LoginScreen";
import { RegisterScreen } from "@features/auth/screens/RegisterScreen";
import { ForgotPasswordScreen } from "@features/auth/screens/ForgotPasswordScreen";
import { BiometricSetupScreen } from "@features/auth/screens/BiometricSetupScreen";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
    </Stack.Navigator>
  );
};
```

---

## 6. Main Navigator

**src/core/navigation/MainNavigator.tsx:**

```typescript
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";

import { FeedScreen } from "@features/feed/screens/FeedScreen";
import { PostDetailScreen } from "@features/feed/screens/PostDetailScreen";
import { CreatePostScreen } from "@features/feed/screens/CreatePostScreen";
import { ConversationListScreen } from "@features/messaging/screens/ConversationListScreen";
import { ChatScreen } from "@features/messaging/screens/ChatScreen";
import { NotificationsScreen } from "@features/notifications/screens/NotificationsScreen";
import { ProfileScreen } from "@features/profile/screens/ProfileScreen";
import { EditProfileScreen } from "@features/profile/screens/EditProfileScreen";
import { SettingsScreen } from "@features/profile/screens/SettingsScreen";

import type {
  MainTabParamList,
  FeedStackParamList,
  MessagingStackParamList,
  ProfileStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();
const MessagingStack = createNativeStackNavigator<MessagingStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Feed Stack Navigator
const FeedNavigator = () => (
  <FeedStack.Navigator>
    <FeedStack.Screen
      name="Feed"
      component={FeedScreen}
      options={{ title: "Ana Sayfa" }}
    />
    <FeedStack.Screen
      name="PostDetail"
      component={PostDetailScreen}
      options={{ title: "Gönderi" }}
    />
    <FeedStack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{
        title: "Yeni Gönderi",
        presentation: "modal",
      }}
    />
  </FeedStack.Navigator>
);

// Messaging Stack Navigator
const MessagingNavigator = () => (
  <MessagingStack.Navigator>
    <MessagingStack.Screen
      name="ConversationList"
      component={ConversationListScreen}
      options={{ title: "Mesajlar" }}
    />
    <MessagingStack.Screen
      name="Chat"
      component={ChatScreen}
      options={{ title: "Sohbet" }}
    />
  </MessagingStack.Navigator>
);

// Profile Stack Navigator
const ProfileNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: "Profil" }}
    />
    <ProfileStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: "Profili Düzenle" }}
    />
    <ProfileStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: "Ayarlar" }}
    />
  </ProfileStack.Navigator>
);

// Main Tab Navigator
export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case "FeedTab":
              iconName = focused ? "home" : "home-outline";
              break;
            case "MessagingTab":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "NotificationsTab":
              iconName = focused ? "notifications" : "notifications-outline";
              break;
            case "ProfileTab":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "home-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedNavigator}
        options={{ title: "Ana Sayfa" }}
      />
      <Tab.Screen
        name="MessagingTab"
        component={MessagingNavigator}
        options={{ title: "Mesajlar" }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ title: "Bildirimler" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ title: "Profil" }}
      />
    </Tab.Navigator>
  );
};
```

---

## 7. Deep Linking

**src/core/navigation/linking.ts:**

```typescript
import type { LinkingOptions } from "@react-navigation/native";
import type { RootStackParamList } from "./types";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["meslektas://", "https://meslektas.com"],

  config: {
    screens: {
      Auth: {
        screens: {
          Login: "login",
          Register: "register",
          ForgotPassword: "forgot-password",
        },
      },
      Main: {
        screens: {
          FeedTab: {
            screens: {
              Feed: "feed",
              PostDetail: "posts/:postId",
              CreatePost: "create-post",
            },
          },
          MessagingTab: {
            screens: {
              ConversationList: "messages",
              Chat: "messages/:conversationId",
            },
          },
          NotificationsTab: "notifications",
          ProfileTab: {
            screens: {
              Profile: "profile/:userId?",
              EditProfile: "profile/edit",
              Settings: "settings",
            },
          },
        },
      },
      Verification: "verification",
    },
  },
};

// Deep link examples:
// meslektas://posts/123
// meslektas://messages/456
// meslektas://profile/789
// https://meslektas.com/posts/123
```

---

## 8. Navigation Ref

**src/core/navigation/navigationRef.ts:**

```typescript
import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "./types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function reset(index: number, routes: any[]) {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index, routes });
  }
}
```

---

## 9. Usage Examples

**Navigate from component:**

```typescript
import { useNavigation } from "@react-navigation/native";

const MyComponent = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("PostDetail", { postId: "123" });
  };

  return <Button onPress={handlePress}>View Post</Button>;
};
```

**Navigate from outside component:**

```typescript
import { navigate } from "@core/navigation/navigationRef";

// In a service or utility
export const handleNotificationClick = (data: any) => {
  navigate("PostDetail", { postId: data.postId });
};
```

---

## 10. Summary

### Features:

- ✅ Type-safe navigation with TypeScript
- ✅ Nested navigators (Stack + Tabs)
- ✅ Deep linking support
- ✅ Navigation outside components
- ✅ Modal presentations
- ✅ Custom tab bar icons

**Result:** Production-ready navigation system with deep linking.
