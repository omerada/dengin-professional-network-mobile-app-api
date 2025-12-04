// src/features/notifications/__tests__/hooks/useNotifications.test.ts
// Hook tests for useNotifications
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { notificationService } from '../../services/notificationService';
import type { NotificationListResponse, NotificationResponse } from '../../types';

// Mock notification service
jest.mock('../../services/notificationService', () => ({
  notificationService: {
    getNotifications: jest.fn(),
  },
}));

// Mock notification store
jest.mock('../../stores', () => ({
  useNotificationStore: () => ({
    setNotifications: jest.fn(),
    appendNotifications: jest.fn(),
    setPagination: jest.fn(),
    setUnreadCount: jest.fn(),
    setUnreadByType: jest.fn(),
  }),
}));

const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

const mockNotification: NotificationResponse = {
  notificationId: '1',
  type: 'NEW_MESSAGE',
  title: 'Yeni Mesaj',
  body: 'Test message',
  actionUrl: '/messages/conv-1',
  metadata: {},
  status: 'DELIVERED',
  deliveredChannels: ['PUSH'],
  read: false,
  readAt: null,
  relativeTime: 'şimdi',
  createdAt: new Date().toISOString(),
};

const mockListResponse: NotificationListResponse = {
  notifications: [mockNotification],
  unreadCount: 1,
  unreadByType: { NEW_MESSAGE: 1 },
  currentPage: 0,
  pageSize: 20,
  totalPages: 1,
  totalElements: 1,
  hasMore: false,
  first: true,
  last: true,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch notifications on mount', async () => {
    mockNotificationService.getNotifications.mockResolvedValueOnce(mockListResponse);

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notifications).toEqual([mockNotification]);
  });

  it('should handle pagination', async () => {
    const page1: NotificationListResponse = {
      ...mockListResponse,
      hasMore: true,
      currentPage: 0,
      totalPages: 2,
    };

    const page2Notification: NotificationResponse = {
      notificationId: '2',
      type: 'POST_LIKED',
      title: 'Beğeni',
      body: 'Test like',
      actionUrl: '/posts/post-1',
      metadata: {},
      status: 'READ',
      deliveredChannels: ['PUSH'],
      read: true,
      readAt: new Date().toISOString(),
      relativeTime: '1sa önce',
      createdAt: new Date().toISOString(),
    };

    const page2: NotificationListResponse = {
      notifications: [page2Notification],
      unreadCount: 1,
      unreadByType: { NEW_MESSAGE: 1 },
      currentPage: 1,
      pageSize: 20,
      totalPages: 2,
      totalElements: 2,
      hasMore: false,
      first: false,
      last: true,
    };

    mockNotificationService.getNotifications
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(true);

    // Fetch next page
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(2);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it('should handle errors', async () => {
    mockNotificationService.getNotifications.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });

  it('should support refetch', async () => {
    mockNotificationService.getNotifications.mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockNotificationService.getNotifications).toHaveBeenCalledTimes(2);
  });

  it('should not be fetching next page initially', async () => {
    mockNotificationService.getNotifications.mockResolvedValueOnce({
      ...mockListResponse,
      hasMore: true,
    });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isFetchingNextPage).toBe(false);
  });

  it('should expose metadata from backend response', async () => {
    mockNotificationService.getNotifications.mockResolvedValueOnce(mockListResponse);

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(1);
    expect(result.current.totalElements).toBe(1);
  });
});
