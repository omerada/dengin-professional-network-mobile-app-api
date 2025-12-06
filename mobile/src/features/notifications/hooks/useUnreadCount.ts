// src/features/notifications/hooks/useUnreadCount.ts
// Unread notification count hook - Backend NotificationController ile uyumlu
// Backend: GET /api/notifications/unread-count → { unreadCount: number }
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService, notifeeService } from '../services';
import { useNotificationStore } from '../stores';

const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

/**
 * Okunmamış bildirim sayısı hook'u
 * @see NotificationController.getUnreadCount()
 */
export function useUnreadCount() {
  const queryClient = useQueryClient();
  const storeUnreadCount = useNotificationStore(state => state.unreadCount);
  const setUnreadCount = useNotificationStore(state => state.setUnreadCount);
  const resetUnreadCount = useNotificationStore(state => state.resetUnreadCount);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: async () => {
      try {
        const count = await notificationService.getUnreadCount();
        return count ?? 0;
      } catch (error) {
        console.error('[Notifications] Failed to fetch unread count:', error);
        return 0;
      }
    },
    initialData: 0,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });

  // Use server count if available, otherwise use store count
  const unreadCount = data ?? storeUnreadCount;

  // Sync server count with store
  useEffect(() => {
    if (typeof data === 'number') {
      setUnreadCount(data);
    }
  }, [data, setUnreadCount]);

  // Sync badge count with unread count
  useEffect(() => {
    notifeeService.setBadgeCount(unreadCount);
  }, [unreadCount]);

  // Force refresh from server
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Invalidate cache (for when marking as read)
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
  }, [queryClient]);

  // Optimistic increment (for new notification)
  const increment = useCallback(() => {
    queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, old => (old ?? 0) + 1);
  }, [queryClient]);

  // Optimistic decrement (for mark as read)
  const decrement = useCallback(() => {
    queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, old => Math.max(0, (old ?? 0) - 1));
  }, [queryClient]);

  return {
    unreadCount,
    isLoading,
    isRefetching,
    refetch: refresh,
    invalidate,
    increment,
    decrement,
    resetUnreadCount,
  };
}

export default useUnreadCount;
