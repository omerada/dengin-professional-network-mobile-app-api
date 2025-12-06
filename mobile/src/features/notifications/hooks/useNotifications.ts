// src/features/notifications/hooks/useNotifications.ts
// Notifications list hook - Backend NotificationController ile uyumlu
// Backend: GET /api/notifications (page, size, unreadOnly)
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services';
import { useNotificationStore } from '../stores';
import type { NotificationResponse, NotificationListResponse, NotificationType } from '../types';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];
const DEFAULT_PAGE_SIZE = 20;

interface UseNotificationsOptions {
  pageSize?: number;
  unreadOnly?: boolean;
}

/**
 * Bildirim listesi hook'u - Backend page-based pagination ile uyumlu
 * @see NotificationController.getNotifications()
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { pageSize = DEFAULT_PAGE_SIZE, unreadOnly = false } = options;

  const queryClient = useQueryClient();
  const { setNotifications, setUnreadCount, setUnreadByType } = useNotificationStore();

  const queryKey = useMemo(() => [...NOTIFICATIONS_QUERY_KEY, { unreadOnly }], [unreadOnly]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      return notificationService.getNotifications(pageParam, pageSize, unreadOnly);
    },
    getNextPageParam: (lastPage: NotificationListResponse) => {
      // Backend hasMore ve currentPage kullanıyor
      if (lastPage.hasMore && lastPage.currentPage < lastPage.totalPages - 1) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Flatten pages into notifications array
  const notifications: NotificationResponse[] = useMemo(() => {
    return data?.pages.flatMap(page => page.notifications) || [];
  }, [data]);

  // Get metadata from first page
  const metadata = useMemo(() => {
    const firstPage = data?.pages[0];
    return {
      unreadCount: firstPage?.unreadCount ?? 0,
      unreadByType: firstPage?.unreadByType ?? ({} as Record<NotificationType, number>),
      totalElements: firstPage?.totalElements ?? 0,
      totalPages: firstPage?.totalPages ?? 0,
      currentPage: data?.pages[data.pages.length - 1]?.currentPage ?? 0,
    };
  }, [data]);

  // Sync with store
  useEffect(() => {
    if (notifications.length > 0) {
      setNotifications(notifications);
    }
  }, [notifications, setNotifications]);

  // Sync metadata with store
  useEffect(() => {
    if (data?.pages.length) {
      setUnreadCount(metadata.unreadCount);
      setUnreadByType(metadata.unreadByType);
    }
  }, [data, metadata, setUnreadCount, setUnreadByType]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  }, [queryClient]);

  // Add new notification optimistically (for real-time updates)
  const addNotification = useCallback(
    (notification: NotificationResponse) => {
      // Validate notification has required fields
      if (!notification?.notificationId) {
        console.warn('[useNotifications] Cannot add notification without ID', notification);
        return;
      }

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        const firstPage = oldData.pages[0];

        // Ensure notification has safe defaults
        const safeNotification: NotificationResponse = {
          ...notification,
          metadata: notification.metadata || {},
          deliveredChannels: notification.deliveredChannels || [],
        };

        return {
          ...oldData,
          pages: [
            {
              ...firstPage,
              notifications: [safeNotification, ...firstPage.notifications],
              totalElements: firstPage.totalElements + 1,
              unreadCount: !notification.read ? firstPage.unreadCount + 1 : firstPage.unreadCount,
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
    [queryClient, queryKey],
  );

  // Update notification in cache (for mark as read)
  const updateNotificationInCache = useCallback(
    (notificationId: string, updates: Partial<NotificationResponse>) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: NotificationListResponse) => ({
            ...page,
            notifications: page.notifications.map((n: NotificationResponse) =>
              n.notificationId === notificationId ? { ...n, ...updates } : n,
            ),
          })),
        };
      });
    },
    [queryClient, queryKey],
  );

  return {
    notifications,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
    refetch,
    isRefreshing: isRefetching,
    invalidate,
    addNotification,
    updateNotificationInCache,
    // Metadata from backend
    unreadCount: metadata.unreadCount,
    unreadByType: metadata.unreadByType,
    totalElements: metadata.totalElements,
    totalPages: metadata.totalPages,
    currentPage: metadata.currentPage,
  };
}

export default useNotifications;
