# Notifications Module

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium)

---

## 1. Overview

Notifications modülü push notifications, in-app notifications, deep linking ve notification preferences yönetimini sağlar. Firebase Cloud Messaging (FCM) ve Notifee kullanır.

---

## 2. Module Structure

```
src/features/notifications/
├── screens/
│   └── NotificationsScreen.tsx          # Bildirim listesi
├── components/
│   ├── NotificationItem.tsx             # Bildirim item
│   └── NotificationPreferences.tsx      # Bildirim ayarları
├── hooks/
│   ├── useNotifications.ts              # Notifications query
│   ├── usePushNotifications.ts          # FCM setup
│   ├── useNotificationClick.ts          # Deep link handler
│   └── useMarkAsRead.ts                 # Mark read mutation
├── stores/
│   └── notificationStore.ts             # Zustand notification state
├── services/
│   ├── notificationApi.ts               # Notification API
│   ├── fcmService.ts                    # Firebase messaging
│   └── notifeeService.ts                # Local notifications
├── types/
│   └── notification.types.ts            # Type definitions
└── index.ts
```

---

## 3. Type Definitions

**src/features/notifications/types/notification.types.ts:**

```typescript
export enum NotificationType {
  POST_LIKE = "POST_LIKE",
  POST_COMMENT = "POST_COMMENT",
  NEW_MESSAGE = "NEW_MESSAGE",
  NEW_FOLLOWER = "NEW_FOLLOWER",
  VERIFICATION_APPROVED = "VERIFICATION_APPROVED",
  VERIFICATION_REJECTED = "VERIFICATION_REJECTED",
  SYSTEM = "SYSTEM",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface PushNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  postLikes: boolean;
  postComments: boolean;
  newMessages: boolean;
  newFollowers: boolean;
  verification: boolean;
  system: boolean;
}
```

---

## 4. Services

**src/features/notifications/services/fcmService.ts:**

```typescript
import messaging from "@react-native-firebase/messaging";
import { notifeeService } from "./notifeeService";
import type { PushNotificationPayload } from "../types/notification.types";

class FCMService {
  async initialize(): Promise<string | null> {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return null;
    }

    // Get FCM token
    const token = await messaging().getToken();

    // Setup message handlers
    this.setupMessageHandlers();

    return token;
  }

  private setupMessageHandlers(): void {
    // Foreground messages
    messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage.notification) {
        await notifeeService.displayNotification({
          title: remoteMessage.notification.title || "",
          message: remoteMessage.notification.body || "",
          type: remoteMessage.data?.type as any,
          data: remoteMessage.data,
        });
      }
    });

    // Background/Quit state messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Background message:", remoteMessage);
    });
  }

  async getToken(): Promise<string> {
    return await messaging().getToken();
  }

  async deleteToken(): Promise<void> {
    await messaging().deleteToken();
  }

  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh(callback);
  }

  onNotificationOpenedApp(callback: (remoteMessage: any) => void): () => void {
    return messaging().onNotificationOpenedApp(callback);
  }

  async getInitialNotification(): Promise<any> {
    return await messaging().getInitialNotification();
  }
}

export const fcmService = new FCMService();
```

**src/features/notifications/services/notifeeService.ts:**

```typescript
import notifee, { AndroidImportance } from "@notifee/react-native";
import type { PushNotificationPayload } from "../types/notification.types";

class NotifeeService {
  async initialize(): Promise<void> {
    // Create notification channels (Android)
    await notifee.createChannel({
      id: "default",
      name: "Default",
      importance: AndroidImportance.HIGH,
    });

    await notifee.createChannel({
      id: "messages",
      name: "Messages",
      importance: AndroidImportance.HIGH,
    });
  }

  async displayNotification(payload: PushNotificationPayload): Promise<void> {
    await notifee.displayNotification({
      title: payload.title,
      body: payload.message,
      data: payload.data,
      android: {
        channelId: payload.type === "NEW_MESSAGE" ? "messages" : "default",
        smallIcon: "ic_notification",
        pressAction: {
          id: "default",
        },
      },
      ios: {
        sound: "default",
      },
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await notifee.cancelNotification(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
  }

  async setBadgeCount(count: number): Promise<void> {
    await notifee.setBadgeCount(count);
  }

  async incrementBadge(): Promise<void> {
    await notifee.incrementBadgeCount();
  }

  async decrementBadge(): Promise<void> {
    await notifee.decrementBadgeCount();
  }

  onForegroundEvent(callback: (event: any) => void): () => void {
    return notifee.onForegroundEvent(callback);
  }

  onBackgroundEvent(callback: (event: any) => void): void {
    notifee.onBackgroundEvent(callback);
  }
}

export const notifeeService = new NotifeeService();
```

**src/features/notifications/services/notificationApi.ts:**

```typescript
import { apiClient } from "@core/api/client";
import type {
  Notification,
  NotificationPreferences,
} from "../types/notification.types";

export const notificationApi = {
  // Get notifications
  getNotifications: async (
    cursor?: string
  ): Promise<{
    notifications: Notification[];
    nextCursor?: string;
    unreadCount: number;
  }> => {
    const response = await apiClient.get("/notifications", {
      params: { cursor, limit: 20 },
    });
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.post(`/notifications/${notificationId}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post("/notifications/read-all");
  },

  // Register FCM token
  registerToken: async (token: string): Promise<void> => {
    await apiClient.post("/notifications/register-token", { token });
  },

  // Get preferences
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get("/notifications/preferences");
    return response.data;
  },

  // Update preferences
  updatePreferences: async (
    preferences: NotificationPreferences
  ): Promise<void> => {
    await apiClient.put("/notifications/preferences", preferences);
  },
};
```

---

## 5. Hooks

**src/features/notifications/hooks/usePushNotifications.ts:**

```typescript
import { useEffect } from "react";
import { fcmService } from "../services/fcmService";
import { notifeeService } from "../services/notifeeService";
import { notificationApi } from "../services/notificationApi";
import { useNotificationClick } from "./useNotificationClick";

export const usePushNotifications = () => {
  const { handleNotificationClick } = useNotificationClick();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    // Initialize Notifee
    await notifeeService.initialize();

    // Initialize FCM
    const token = await fcmService.initialize();

    if (token) {
      // Register token with backend
      await notificationApi.registerToken(token);
    }

    // Handle notification opened from quit state
    const initialNotification = await fcmService.getInitialNotification();
    if (initialNotification) {
      handleNotificationClick(initialNotification.data);
    }

    // Handle notification opened from background
    const unsubscribe = fcmService.onNotificationOpenedApp((remoteMessage) => {
      handleNotificationClick(remoteMessage.data);
    });

    // Handle foreground notification clicks
    const unsubscribeForeground = notifeeService.onForegroundEvent((event) => {
      if (event.type === 1) {
        // PRESS
        handleNotificationClick(event.detail.notification?.data);
      }
    });

    // Handle token refresh
    const unsubscribeTokenRefresh = fcmService.onTokenRefresh(
      async (newToken) => {
        await notificationApi.registerToken(newToken);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  };
};
```

**src/features/notifications/hooks/useNotificationClick.ts:**

```typescript
import { useNavigation } from "@react-navigation/native";
import { NotificationType } from "../types/notification.types";

export const useNotificationClick = () => {
  const navigation = useNavigation();

  const handleNotificationClick = (data: any) => {
    if (!data) return;

    const type = data.type as NotificationType;

    switch (type) {
      case NotificationType.POST_LIKE:
      case NotificationType.POST_COMMENT:
        navigation.navigate("PostDetail", { postId: data.postId });
        break;

      case NotificationType.NEW_MESSAGE:
        navigation.navigate("Chat", { conversationId: data.conversationId });
        break;

      case NotificationType.NEW_FOLLOWER:
        navigation.navigate("Profile", { userId: data.userId });
        break;

      case NotificationType.VERIFICATION_APPROVED:
      case NotificationType.VERIFICATION_REJECTED:
        navigation.navigate("VerificationStatus");
        break;

      default:
        navigation.navigate("Notifications");
    }
  };

  return { handleNotificationClick };
};
```

**src/features/notifications/hooks/useNotifications.ts:**

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationApi } from "../services/notificationApi";

export const useNotifications = () => {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => notificationApi.getNotifications(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
};
```

---

## 6. Components

**src/features/notifications/components/NotificationItem.tsx:**

```typescript
import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text } from "@shared/components/Text";
import { Avatar } from "@shared/components/Avatar";
import type { Notification } from "../types/notification.types";

interface Props {
  notification: Notification;
  onPress: () => void;
}

export const NotificationItem: React.FC<Props> = ({
  notification,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unread]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>
          {new Date(notification.createdAt).toLocaleDateString("tr-TR")}
        </Text>
      </View>

      {!notification.isRead && <View style={styles.badge} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  unread: {
    backgroundColor: "#f0f8ff",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
});
```

---

## 7. Screens

**src/features/notifications/screens/NotificationsScreen.tsx:**

```typescript
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationItem } from "../components/NotificationItem";
import { useNotifications } from "../hooks/useNotifications";
import { useNotificationClick } from "../hooks/useNotificationClick";
import { notificationApi } from "../services/notificationApi";

export const NotificationsScreen = () => {
  const { data, fetchNextPage, hasNextPage } = useNotifications();
  const { handleNotificationClick } = useNotificationClick();

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  const handlePress = async (notification: Notification) => {
    if (!notification.isRead) {
      await notificationApi.markAsRead(notification.id);
    }
    handleNotificationClick(notification.data);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handlePress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        onEndReached={() => hasNextPage && fetchNextPage()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
```

---

## 8. Summary

### Features:

- ✅ Firebase Cloud Messaging (FCM)
- ✅ Local notifications with Notifee
- ✅ Deep linking support
- ✅ Badge count management
- ✅ Notification preferences
- ✅ Background/foreground handling
- ✅ Mark as read functionality

**Result:** Complete push notification system with deep linking.
