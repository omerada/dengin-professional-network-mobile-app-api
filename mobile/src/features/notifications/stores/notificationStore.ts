// src/features/notifications/stores/notificationStore.ts
// Notification Zustand store - Backend NotificationController ile uyumlu
// Backend: com.dengin.notification.api.NotificationController
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  NotificationStoreState,
  NotificationResponse,
  NotificationPreferencesResponse,
  NotificationType,
} from '../types';

/**
 * Varsayılan tercihler - backend ile senkronize olacak
 */
const defaultPreferences: NotificationPreferencesResponse = {
  userId: 0,
  notificationsEnabled: true,
  emailEnabled: false,
  pushEnabled: true,
  quietHoursStart: null,
  quietHoursEnd: null,
  inQuietHours: false,
  typeSettings: {},
  availableTypes: {},
  updatedAt: new Date().toISOString(),
};

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, _get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      unreadByType: {} as Record<string, number>,
      preferences: defaultPreferences,
      fcmToken: null,
      // Default true for Expo Go development, will be checked on mount
      isPermissionGranted: true,
      isLoading: false,
      error: null,

      // Actions
      setNotifications: (notifications: NotificationResponse[]) => {
        const unreadCount = notifications.filter(n => !n.read).length;
        set({ notifications, unreadCount });
      },

      appendNotifications: (newNotifications: NotificationResponse[]) => {
        set(state => {
          // Duplicate check
          const existingIds = new Set(state.notifications.map(n => n.notificationId));
          const uniqueNew = newNotifications.filter(n => !existingIds.has(n.notificationId));

          return {
            notifications: [...state.notifications, ...uniqueNew],
          };
        });
      },

      addNotification: (notification: NotificationResponse) => {
        set(state => {
          // Validate notification has ID
          if (!notification?.notificationId) {
            console.warn('[NotificationStore] Cannot add notification without ID', notification);
            return state;
          }

          // Duplicate check
          const exists = state.notifications.some(
            n => n.notificationId === notification.notificationId,
          );
          if (exists) return state;

          const notifications = [notification, ...state.notifications];
          const unreadCount = !notification.read ? state.unreadCount + 1 : state.unreadCount;

          return { notifications, unreadCount };
        });
      },

      prependNotification: (notification: NotificationResponse) => {
        set(state => {
          // Validate notification has ID
          if (!notification?.notificationId) {
            console.warn(
              '[NotificationStore] Cannot prepend notification without ID',
              notification,
            );
            return state;
          }

          const exists = state.notifications.some(
            n => n.notificationId === notification.notificationId,
          );
          if (exists) return state;
          return { notifications: [notification, ...state.notifications] };
        });
      },

      updateNotification: (notificationId: string, updates: Partial<NotificationResponse>) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.notificationId === notificationId ? { ...n, ...updates } : n,
          ),
        }));
      },

      markAsRead: (notificationId: string) => {
        set(state => {
          const notifications = state.notifications.map(n =>
            n.notificationId === notificationId
              ? { ...n, read: true, readAt: new Date().toISOString() }
              : n,
          );

          const notification = state.notifications.find(n => n.notificationId === notificationId);
          const unreadCount =
            notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount;

          return { notifications, unreadCount };
        });
      },

      markMultipleAsRead: (notificationIds: string[]) => {
        set(state => {
          const idsSet = new Set(notificationIds);
          const readAt = new Date().toISOString();

          let decrementCount = 0;
          const notifications = state.notifications.map(n => {
            if (idsSet.has(n.notificationId) && !n.read) {
              decrementCount++;
              return { ...n, read: true, readAt };
            }
            return n;
          });

          return {
            notifications,
            unreadCount: Math.max(0, state.unreadCount - decrementCount),
          };
        });
      },

      markAllAsRead: () => {
        set(state => {
          const readAt = new Date().toISOString();
          const notifications = state.notifications.map(n => ({
            ...n,
            read: true,
            readAt: n.readAt || readAt,
          }));

          return { notifications, unreadCount: 0, unreadByType: {} };
        });
      },

      removeNotification: (notificationId: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.notificationId === notificationId);
          const notifications = state.notifications.filter(
            n => n.notificationId !== notificationId,
          );
          const unreadCount =
            notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount;

          return { notifications, unreadCount };
        });
      },

      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
          unreadByType: {},
        });
      },

      setUnreadCount: (count: number) => {
        set({ unreadCount: count });
      },

      setUnreadByType: (unreadByType: Record<NotificationType, number>) => {
        set({ unreadByType });
      },

      setPreferences: (preferences: NotificationPreferencesResponse) => {
        set({ preferences });
      },

      updatePreferences: (updates: Partial<NotificationPreferencesResponse>) => {
        set(state => ({
          preferences: state.preferences ? { ...state.preferences, ...updates } : null,
        }));
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setFcmToken: (token: string | null) => {
        set({ fcmToken: token });
      },

      setPermissionGranted: (granted: boolean) => {
        set({ isPermissionGranted: granted });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      incrementUnreadCount: () => {
        set(state => ({ unreadCount: state.unreadCount + 1 }));
      },

      decrementUnreadCount: () => {
        set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
      },

      resetUnreadCount: () => {
        set({ unreadCount: 0, unreadByType: {} });
      },

      // Reset store on logout
      reset: () => {
        set({
          notifications: [],
          unreadCount: 0,
          unreadByType: {},
          preferences: defaultPreferences,
          fcmToken: null,
          isPermissionGranted: false,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        preferences: state.preferences,
        fcmToken: state.fcmToken,
        isPermissionGranted: state.isPermissionGranted,
        // Don't persist notifications - fetch from server
      }),
    },
  ),
);

export default useNotificationStore;
