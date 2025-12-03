// src/features/notifications/__tests__/hooks/useNotifications.test.ts
// Hook tests for useNotifications
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { renderHook, waitFor, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { notificationService } from '../../services/notificationService';
import { NotificationType } from '../../types';

// Mock notification service
jest.mock('../../services/notificationService', () => ({
  notificationService: {
    getNotifications: jest.fn(),
  },
}));

// Mock socket client
jest.mock('@services/socket', () => ({
  socketClient: {
    on: jest.fn(),
    off: jest.fn(),
  },
}));

const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

const mockNotifications = [
  {
    id: '1',
    type: NotificationType.MESSAGE,
    title: 'Yeni Mesaj',
    body: 'Test message',
    isRead: false,
    createdAt: new Date().toISOString(),
    senderId: 'user-1',
    senderName: 'Test User',
    referenceId: 'conv-1',
  },
];

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
    mockNotificationService.getNotifications.mockResolvedValueOnce({
      items: mockNotifications,
      hasMore: false,
      nextCursor: undefined,
    });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.pages[0].items).toEqual(mockNotifications);
  });

  it('should handle pagination', async () => {
    const page1 = {
      items: mockNotifications,
      hasMore: true,
      nextCursor: 'cursor-1',
    };

    const page2 = {
      items: [
        {
          id: '2',
          type: NotificationType.POST_LIKE,
          title: 'Beğeni',
          body: 'Test like',
          isRead: true,
          createdAt: new Date().toISOString(),
          senderId: 'user-2',
          senderName: 'Test User 2',
          referenceId: 'post-1',
        },
      ],
      hasMore: false,
      nextCursor: undefined,
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
      expect(result.current.data?.pages).toHaveLength(2);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it('should handle errors', async () => {
    mockNotificationService.getNotifications.mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });

  it('should support refetch', async () => {
    mockNotificationService.getNotifications.mockResolvedValue({
      items: mockNotifications,
      hasMore: false,
      nextCursor: undefined,
    });

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
      items: mockNotifications,
      hasMore: true,
      nextCursor: 'cursor',
    });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isFetchingNextPage).toBe(false);
  });
});
