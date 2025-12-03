// src/features/notifications/__tests__/hooks/useNotificationActions.test.ts
// Hook tests for useNotificationActions
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { renderHook, waitFor, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNotificationActions } from '../../hooks/useNotificationActions';
import { notificationService } from '../../services/notificationService';
import { useNotificationStore } from '../../stores/notificationStore';

// Mock notification service
jest.mock('../../services/notificationService', () => ({
  notificationService: {
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
}));

// Mock notification store
jest.mock('../../stores/notificationStore', () => ({
  useNotificationStore: jest.fn(),
}));

const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockUseNotificationStore = useNotificationStore as jest.MockedFunction<typeof useNotificationStore>;

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

describe('useNotificationActions', () => {
  const mockDecrementUnreadCount = jest.fn();
  const mockClearUnreadCount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotificationStore.mockReturnValue({
      decrementUnreadCount: mockDecrementUnreadCount,
      clearUnreadCount: mockClearUnreadCount,
    } as any);
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockNotificationService.markAsRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.markAsRead('notif-1');
      });

      await waitFor(() => {
        expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('notif-1');
      });
    });

    it('should decrement unread count after marking as read', async () => {
      mockNotificationService.markAsRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.markAsRead('notif-1');
      });

      await waitFor(() => {
        expect(mockDecrementUnreadCount).toHaveBeenCalled();
      });
    });

    it('should handle mark as read error', async () => {
      mockNotificationService.markAsRead.mockRejectedValueOnce(
        new Error('Failed to mark as read')
      );

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.markAsRead('notif-1');
      });

      // Error should be handled gracefully
      expect(mockNotificationService.markAsRead).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
      });
    });

    it('should clear unread count after marking all as read', async () => {
      mockNotificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(mockClearUnreadCount).toHaveBeenCalled();
      });
    });

    it('should set isMarkingAllAsRead to true while processing', async () => {
      let resolveMarkAll: () => void;
      mockNotificationService.markAllAsRead.mockReturnValue(
        new Promise((resolve) => {
          resolveMarkAll = () => resolve(undefined);
        })
      );

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.isMarkingAllAsRead).toBe(true);

      await act(async () => {
        resolveMarkAll!();
      });

      await waitFor(() => {
        expect(result.current.isMarkingAllAsRead).toBe(false);
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      mockNotificationService.deleteNotification.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.deleteNotification('notif-1');
      });

      await waitFor(() => {
        expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith('notif-1');
      });
    });

    it('should handle delete error', async () => {
      mockNotificationService.deleteNotification.mockRejectedValueOnce(
        new Error('Failed to delete')
      );

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.deleteNotification('notif-1');
      });

      // Error should be handled gracefully
      expect(mockNotificationService.deleteNotification).toHaveBeenCalled();
    });

    it('should set isDeleting to true while processing', async () => {
      let resolveDelete: () => void;
      mockNotificationService.deleteNotification.mockReturnValue(
        new Promise((resolve) => {
          resolveDelete = () => resolve(undefined);
        })
      );

      const { result } = renderHook(() => useNotificationActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.deleteNotification('notif-1');
      });

      expect(result.current.isDeleting).toBe(true);

      await act(async () => {
        resolveDelete!();
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });
});
