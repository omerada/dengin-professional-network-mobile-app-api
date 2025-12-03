// src/features/notifications/hooks/useNotificationActions.ts
// Notification action hooks
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, notifeeService } from '../services';
import { useNotificationStore } from '../stores';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];
const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

/**
 * Bildirimi okundu olarak işaretle
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAsRead = useNotificationStore((state) => state.markAsRead);
  const decrementUnreadCount = useNotificationStore((state) => state.decrementUnreadCount);

  const mutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Optimistic update
      storeMarkAsRead(notificationId);
      decrementUnreadCount();

      // Update badge
      const currentBadge = await notifeeService.getBadgeCount();
      await notifeeService.setBadgeCount(Math.max(0, currentBadge - 1));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const markAsRead = useCallback((notificationId: string) => {
    mutation.mutate(notificationId);
  }, [mutation]);

  return {
    markAsRead,
    isPending: mutation.isPending,
  };
}

/**
 * Tüm bildirimleri okundu olarak işaretle
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const storeMarkAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const resetUnreadCount = useNotificationStore((state) => state.resetUnreadCount);

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
  });

  const markAllAsRead = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return {
    markAllAsRead,
    isPending: mutation.isPending,
  };
}

/**
 * Bildirimi sil
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  const mutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onMutate: async (notificationId) => {
      // Optimistic update
      removeNotification(notificationId);

      // Cancel notification if displayed
      await notifeeService.cancelNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const deleteNotification = useCallback((notificationId: string) => {
    mutation.mutate(notificationId);
  }, [mutation]);

  return {
    deleteNotification,
    isPending: mutation.isPending,
  };
}

/**
 * Tüm bildirimleri temizle
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  const clearAll = useNotificationStore((state) => state.clearAllNotifications);

  const mutation = useMutation({
    mutationFn: () => notificationService.clearAllNotifications(),
    onMutate: async () => {
      // Optimistic update
      clearAll();

      // Clear all displayed notifications
      await notifeeService.cancelAllNotifications();
      await notifeeService.setBadgeCount(0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const clearAllNotifications = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return {
    clearAllNotifications,
    isPending: mutation.isPending,
  };
}
