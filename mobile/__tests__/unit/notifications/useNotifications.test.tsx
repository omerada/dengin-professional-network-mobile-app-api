// __tests__/unit/notifications/useNotifications.test.ts
// useNotifications hook tests - Backend pagination uyumluluğu
// Sprint 9-10: Push & In-app Notifications

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNotifications } from '../../../src/features/notifications/hooks/useNotifications';
import { notificationService } from '../../../src/features/notifications/services/notificationService';
import type { NotificationListResponse } from '../../../src/features/notifications/types';

// Mock notification service
jest.mock('../../../src/features/notifications/services/notificationService', () => ({
  notificationService: {
    getNotifications: jest.fn(),
  },
}));

// Mock notification store
jest.mock('../../../src/features/notifications/stores/notificationStore', () => ({
  useNotificationStore: jest.fn(() => ({
    setNotifications: jest.fn(),
    appendNotifications: jest.fn(),
    setPagination: jest.fn(),
    setUnreadCount: jest.fn(),
    setUnreadByType: jest.fn(),
  })),
}));

describe('useNotifications', () => {
  let queryClient: QueryClient;

  const mockPage1Response: NotificationListResponse = {
    notifications: [
      {
        notificationId: 'notif-1',
        type: 'NEW_FOLLOWER',
        title: 'Yeni Takipçi',
        body: 'Ahmet sizi takip etti',
        actionUrl: '/profile/user-1',
        metadata: {},
        status: 'DELIVERED',
        deliveredChannels: ['PUSH'],
        read: false,
        readAt: null,
        relativeTime: '5 dk önce',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        notificationId: 'notif-2',
        type: 'POST_LIKED',
        title: 'Gönderi Beğenildi',
        body: 'Mehmet gönderinizi beğendi',
        actionUrl: '/posts/post-1',
        metadata: {},
        status: 'DELIVERED',
        deliveredChannels: ['IN_APP'],
        read: true,
        readAt: '2024-01-15T09:00:00Z',
        relativeTime: '1 saat önce',
        createdAt: '2024-01-15T08:00:00Z',
      },
    ],
    unreadCount: 5,
    unreadByType: { NEW_FOLLOWER: 3, POST_LIKED: 2 },
    currentPage: 0,
    pageSize: 20,
    totalPages: 2,
    totalElements: 25,
    hasMore: true,
    first: true,
    last: false,
  };

  const mockPage2Response: NotificationListResponse = {
    notifications: [
      {
        notificationId: 'notif-3',
        type: 'NEW_MESSAGE',
        title: 'Yeni Mesaj',
        body: 'Yeni bir mesajınız var',
        actionUrl: '/messages/conv-1',
        metadata: {},
        status: 'DELIVERED',
        deliveredChannels: ['PUSH'],
        read: false,
        readAt: null,
        relativeTime: '2 saat önce',
        createdAt: '2024-01-15T07:00:00Z',
      },
    ],
    unreadCount: 5,
    unreadByType: { NEW_FOLLOWER: 3, POST_LIKED: 2 },
    currentPage: 1,
    pageSize: 20,
    totalPages: 2,
    totalElements: 25,
    hasMore: false,
    first: false,
    last: true,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch first page of notifications', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockPage1Response);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(notificationService.getNotifications).toHaveBeenCalledWith(0, 20, false);
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0].notificationId).toBe('notif-1');
  });

  it('should use custom page size', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockPage1Response);

    const { result } = renderHook(() => useNotifications({ pageSize: 10 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(notificationService.getNotifications).toHaveBeenCalledWith(0, 10, false);
  });

  it('should filter unread only when option is set', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockPage1Response);

    renderHook(() => useNotifications({ unreadOnly: true }), { wrapper });

    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalledWith(0, 20, true);
    });
  });

  it('should indicate hasNextPage correctly', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockPage1Response);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(true);
  });

  it('should fetch next page', async () => {
    (notificationService.getNotifications as jest.Mock)
      .mockResolvedValueOnce(mockPage1Response)
      .mockResolvedValueOnce(mockPage2Response);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(3);
    });

    expect(notificationService.getNotifications).toHaveBeenCalledWith(1, 20, false);
  });

  it('should expose unread count from response', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockPage1Response);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(5);
    expect(result.current.unreadByType).toEqual({ NEW_FOLLOWER: 3, POST_LIKED: 2 });
  });

  it('should expose pagination metadata', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockPage1Response);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalElements).toBe(25);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentPage).toBe(0);
  });

  it('should handle API errors', async () => {
    (notificationService.getNotifications as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.notifications).toHaveLength(0);
  });

  it('should refetch on manual refresh', async () => {
    (notificationService.getNotifications as jest.Mock).mockResolvedValue(mockPage1Response);

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
  });
});
