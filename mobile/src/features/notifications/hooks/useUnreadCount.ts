// src/features/notifications/hooks/useUnreadCount.ts
// Unread notification count hook
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService, notifeeService } from '../services';
import { useNotificationStore } from '../stores';

const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

/**
 * Okunmamış bildirim sayısı hook'u
 */
export function useUnreadCount() {
  const storeUnreadCount = useNotificationStore((state) => state.unreadCount);
  const resetUnreadCount = useNotificationStore((state) => state.resetUnreadCount);

  const {
    data: serverUnreadCount,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  // Use server count if available, otherwise use store count
  const unreadCount = serverUnreadCount ?? storeUnreadCount;

  // Sync badge count with unread count
  useEffect(() => {
    notifeeService.setBadgeCount(unreadCount);
  }, [unreadCount]);

  return {
    unreadCount,
    isLoading,
    refetch,
    resetUnreadCount,
  };
}

export default useUnreadCount;
