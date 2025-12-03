// src/features/notifications/stores/notificationStore.ts
// Notification Zustand store
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  NotificationStoreState,
  Notification,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../types';

/**
 * Varsayılan ayarlar
 */
const defaultSettings: NotificationSettings = {
  messages: true,
  postLikes: true,
  postComments: true,
  commentReplies: true,
  follows: true,
  verificationUpdates: true,
  systemNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursEnabled: false,
};

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      settings: defaultSettings,
      fcmToken: null,
      isPermissionGranted: false,

      // Actions
      setNotifications: (notifications: Notification[]) => {
        const unreadCount = notifications.filter(n => n.status === 'unread').length;
        set({ notifications, unreadCount });
      },

      addNotification: (notification: Notification) => {
        set((state) => {
          // Duplicate check
          const exists = state.notifications.some(n => n.id === notification.id);
          if (exists) return state;

          const notifications = [notification, ...state.notifications];
          const unreadCount = notification.status === 'unread'
            ? state.unreadCount + 1
            : state.unreadCount;

          return { notifications, unreadCount };
        });
      },

      markAsRead: (notificationId: string) => {
        set((state) => {
          const notifications = state.notifications.map(n =>
            n.id === notificationId
              ? { ...n, status: 'read' as const, readAt: new Date().toISOString() }
              : n
          );

          const notification = state.notifications.find(n => n.id === notificationId);
          const unreadCount = notification?.status === 'unread'
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount;

          return { notifications, unreadCount };
        });
      },

      markAllAsRead: () => {
        set((state) => {
          const readAt = new Date().toISOString();
          const notifications = state.notifications.map(n => ({
            ...n,
            status: 'read' as const,
            readAt: n.readAt || readAt,
          }));

          return { notifications, unreadCount: 0 };
        });
      },

      removeNotification: (notificationId: string) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          const notifications = state.notifications.filter(n => n.id !== notificationId);
          const unreadCount = notification?.status === 'unread'
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount;

          return { notifications, unreadCount };
        });
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      setSettings: (settings: Partial<NotificationSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      setFcmToken: (token: string | null) => {
        set({ fcmToken: token });
      },

      setPermissionGranted: (granted: boolean) => {
        set({ isPermissionGranted: granted });
      },

      incrementUnreadCount: () => {
        set((state) => ({ unreadCount: state.unreadCount + 1 }));
      },

      decrementUnreadCount: () => {
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
      },

      resetUnreadCount: () => {
        set({ unreadCount: 0 });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        fcmToken: state.fcmToken,
        isPermissionGranted: state.isPermissionGranted,
        // Don't persist notifications - fetch from server
      }),
    }
  )
);

export default useNotificationStore;
