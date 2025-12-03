// src/features/notifications/hooks/useNotifications.ts
// Notifications list hook
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services';
import { useNotificationStore } from '../stores';
import type { Notification } from '../types';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

/**
 * Bildirim listesi hook'u
 */
export function useNotifications() {
  const queryClient = useQueryClient();
  const { setNotifications } = useNotificationStore();

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
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      return notificationService.getNotifications(20, pageParam);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Flatten pages into notifications array
  const notifications: Notification[] = data?.pages.flatMap(page => page.content) || [];

  // Sync with store
  useEffect(() => {
    if (notifications.length > 0) {
      setNotifications(notifications);
    }
  }, [notifications, setNotifications]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  }, [queryClient]);

  // Add new notification optimistically
  const addNotification = useCallback((notification: Notification) => {
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (oldData: any) => {
      if (!oldData) return oldData;

      const firstPage = oldData.pages[0];
      return {
        ...oldData,
        pages: [
          {
            ...firstPage,
            content: [notification, ...firstPage.content],
          },
          ...oldData.pages.slice(1),
        ],
      };
    });
  }, [queryClient]);

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
  };
}

export default useNotifications;
