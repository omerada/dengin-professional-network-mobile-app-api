// src/features/notifications/hooks/useNotificationActions.ts
// Notification action hooks - Backend NotificationController ile uyumlu
// Backend: POST /api/notifications/{id}/read, POST /api/notifications/mark-as-read
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, notifeeService } from '../services';
import { useNotificationStore } from '../stores';
import type { MarkAsReadRequest, NotificationResponse } from '../types';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];
const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

/**
 * Bildirimi okundu olarak işaretle
 * @see NotificationController.markAsRead()
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAsRead = useNotificationStore(state => state.markAsRead);
  const decrementUnreadCount = useNotificationStore(state => state.decrementUnreadCount);

  const mutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onMutate: async notificationId => {
      // Optimistic update in store
      storeMarkAsRead(notificationId);
      decrementUnreadCount();

      // Update badge
      const currentBadge = await notifeeService.getBadgeCount();
      await notifeeService.setBadgeCount(Math.max(0, currentBadge - 1));
    },
    onSuccess: () => {
      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
    onError: (_error, _notificationId) => {
      // Revert on error - re-fetch to sync
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  const markAsRead = useCallback(
    (notificationId: string) => {
      mutation.mutate(notificationId);
    },
    [mutation],
  );

  return {
    markAsRead,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Birden fazla bildirimi okundu olarak işaretle
 * @see NotificationController.markMultipleAsRead()
 */
export function useMarkMultipleAsRead() {
  const queryClient = useQueryClient();
  const storeMarkMultipleAsRead = useNotificationStore(state => state.markMultipleAsRead);

  const mutation = useMutation({
    mutationFn: (request: MarkAsReadRequest) => notificationService.markMultipleAsRead(request),
    onMutate: async request => {
      if (request.notificationIds) {
        storeMarkMultipleAsRead(request.notificationIds);

        // Update badge
        const currentBadge = await notifeeService.getBadgeCount();
        await notifeeService.setBadgeCount(
          Math.max(0, currentBadge - request.notificationIds.length),
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const markMultipleAsRead = useCallback(
    (notificationIds: string[]) => {
      mutation.mutate({ markAll: false, notificationIds });
    },
    [mutation],
  );

  return {
    markMultipleAsRead,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Tüm bildirimleri okundu olarak işaretle
 * @see NotificationController.markMultipleAsRead() with markAll=true
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const resetUnreadCount = useNotificationStore(state => state.resetUnreadCount);

  const mutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      // Optimistic update
      storeMarkAllAsRead();
      resetUnreadCount();

      // Clear badge
      await notifeeService.setBadgeCount(0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
    onError: () => {
      // Revert on error - re-fetch to sync
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const markAllAsRead = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return {
    markAllAsRead,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Bildirimi sil (local only - backend silme API'si yoksa)
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const removeNotification = useNotificationStore(state => state.removeNotification);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      // Local store'dan kaldır
      removeNotification(notificationId);

      // Displayed notification'ı iptal et
      await notifeeService.cancelNotification(notificationId);

      // Cache'i güncelle
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
    [removeNotification, queryClient],
  );

  return {
    deleteNotification,
  };
}

/**
 * Tüm bildirimleri temizle (local only)
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  const clearAll = useNotificationStore(state => state.clearAllNotifications);

  const clearAllNotifications = useCallback(async () => {
    // Local store'u temizle
    clearAll();

    // Tüm displayed notifications'ları iptal et
    await notifeeService.cancelAllNotifications();
    await notifeeService.setBadgeCount(0);

    // Cache'i güncelle
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
  }, [clearAll, queryClient]);

  return {
    clearAllNotifications,
  };
}

/**
 * Bildirim tıklama işleyicisi
 */
export function useNotificationHandler() {
  const { markAsRead } = useMarkAsRead();

  const handleNotificationPress = useCallback(
    (notification: NotificationResponse) => {
      // Validate notification
      if (!notification?.notificationId) {
        console.warn('[useNotificationActions] Invalid notification - missing ID', notification);
        return null;
      }

      // Okunmamışsa okundu olarak işaretle
      if (!notification.read) {
        markAsRead(notification.notificationId);
      }

      // actionUrl varsa navigate et (navigation hook'u ile birlikte kullanılmalı)
      return notification.actionUrl;
    },
    [markAsRead],
  );

  return {
    handleNotificationPress,
  };
}
