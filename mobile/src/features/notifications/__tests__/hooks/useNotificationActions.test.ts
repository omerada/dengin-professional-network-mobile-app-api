// src/features/notifications/__tests__/hooks/useNotificationActions.test.ts
// Hook tests for notification action hooks
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../../hooks/useNotificationActions';
import { notificationService, notifeeService } from '../../services';
import { useNotificationStore } from '../../stores';

// Mock notification service
jest.mock('../../services', () => ({
  notificationService: {
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
  notifeeService: {
    getBadgeCount: jest.fn().mockResolvedValue(5),
    setBadgeCount: jest.fn().mockResolvedValue(undefined),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock notification store
jest.mock('../../stores', () => ({
  useNotificationStore: jest.fn(),
}));

const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockNotifeeService = notifeeService as jest.Mocked<typeof notifeeService>;
const mockUseNotificationStore = useNotificationStore as jest.MockedFunction<
  typeof useNotificationStore
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useMarkAsRead', () => {
  const mockMarkAsRead = jest.fn();
  const mockDecrementUnreadCount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotificationStore.mockImplementation((selector: any) => {
      const state = {
        markAsRead: mockMarkAsRead,
        decrementUnreadCount: mockDecrementUnreadCount,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should mark notification as read', async () => {
    mockNotificationService.markAsRead.mockResolvedValueOnce({
      notificationId: 'notif-1',
      type: 'NEW_MESSAGE',
      title: 'Test',
      body: 'Test body',
      actionUrl: null,
      metadata: {},
      status: 'READ',
      deliveredChannels: [],
      read: true,
      readAt: new Date().toISOString(),
      relativeTime: 'şimdi',
      createdAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.markAsRead('notif-1');
    });

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
    });
  });

  it('should decrement unread count after marking as read', async () => {
    mockNotificationService.markAsRead.mockResolvedValueOnce({
      notificationId: 'notif-1',
      type: 'NEW_MESSAGE',
      title: 'Test',
      body: 'Test body',
      actionUrl: null,
      metadata: {},
      status: 'READ',
      deliveredChannels: [],
      read: true,
      readAt: new Date().toISOString(),
      relativeTime: 'şimdi',
      createdAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.markAsRead('notif-1');
    });

    await waitFor(() => {
      expect(mockDecrementUnreadCount).toHaveBeenCalled();
    });
  });
});

describe('useMarkAllAsRead', () => {
  const mockMarkAllAsRead = jest.fn();
  const mockResetUnreadCount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotificationStore.mockImplementation((selector: any) => {
      const state = {
        markAllAsRead: mockMarkAllAsRead,
        resetUnreadCount: mockResetUnreadCount,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should mark all notifications as read', async () => {
    mockNotificationService.markAllAsRead.mockResolvedValueOnce(5);

    const { result } = renderHook(() => useMarkAllAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.markAllAsRead();
    });

    await waitFor(() => {
      expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
    });
  });

  it('should reset unread count after marking all as read', async () => {
    mockNotificationService.markAllAsRead.mockResolvedValueOnce(5);

    const { result } = renderHook(() => useMarkAllAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.markAllAsRead();
    });

    await waitFor(() => {
      expect(mockResetUnreadCount).toHaveBeenCalled();
    });
  });
});

describe('useDeleteNotification', () => {
  const mockRemoveNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotificationStore.mockImplementation((selector: any) => {
      const state = {
        removeNotification: mockRemoveNotification,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should delete notification', async () => {
    const { result } = renderHook(() => useDeleteNotification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.deleteNotification('notif-1');
    });

    expect(mockRemoveNotification).toHaveBeenCalledWith('notif-1');
    expect(mockNotifeeService.cancelNotification).toHaveBeenCalledWith('notif-1');
  });
});
