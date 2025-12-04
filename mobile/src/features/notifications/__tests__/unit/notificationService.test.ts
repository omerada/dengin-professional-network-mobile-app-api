// src/features/notifications/__tests__/unit/notificationService.test.ts
// Unit tests for notification service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import type { NotificationListResponse, NotificationResponse } from '../../types';

// Mock the API client module - mock declaration is hoisted
jest.mock('@core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Import mocked module to get reference to mock functions
import { apiClient } from '@core/api/client';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Import service after mock
import { notificationService } from '../../services/notificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    const mockNotificationsResponse: NotificationListResponse = {
      notifications: [
        {
          notificationId: '1',
          type: 'NEW_MESSAGE',
          title: 'Yeni Mesaj',
          body: 'Ahmet size bir mesaj gönderdi',
          actionUrl: '/messages/conv-1',
          metadata: { actorAvatarUrl: 'https://example.com/avatar.jpg' },
          status: 'DELIVERED',
          deliveredChannels: ['PUSH'],
          read: false,
          readAt: null,
          relativeTime: '5dk önce',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          notificationId: '2',
          type: 'POST_LIKED',
          title: 'Yeni Beğeni',
          body: 'Mehmet gönderinizi beğendi',
          actionUrl: '/posts/post-1',
          metadata: {},
          status: 'READ',
          deliveredChannels: ['PUSH'],
          read: true,
          readAt: '2024-01-15T09:30:00Z',
          relativeTime: '1sa önce',
          createdAt: '2024-01-15T09:00:00Z',
        },
      ],
      unreadCount: 1,
      unreadByType: { NEW_MESSAGE: 1 },
      currentPage: 0,
      pageSize: 20,
      totalPages: 1,
      totalElements: 2,
      hasMore: false,
      first: true,
      last: true,
    };

    it('should fetch notifications successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: mockNotificationsResponse,
      });

      const result = await notificationService.getNotifications();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { page: 0, size: 20, unreadOnly: false },
      });
      expect(result.notifications).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should fetch notifications with pagination', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { ...mockNotificationsResponse, currentPage: 1, hasMore: false },
      });

      const result = await notificationService.getNotifications(1, 10, false);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { page: 1, size: 10, unreadOnly: false },
      });
      expect(result.currentPage).toBe(1);
    });

    it('should fetch only unread notifications', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: mockNotificationsResponse,
      });

      await notificationService.getNotifications(0, 20, true);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { page: 0, size: 20, unreadOnly: true },
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(notificationService.getNotifications()).rejects.toThrow('Network error');
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread count successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { unreadCount: 5 },
      });

      const result = await notificationService.getUnreadCount();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/notifications/unread-count');
      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockResponse: NotificationResponse = {
        notificationId: '1',
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
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await notificationService.markAsRead('notification-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/notifications/notification-1/read');
      expect(result.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { markedAsRead: 5 } });

      const result = await notificationService.markAllAsRead();

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/notifications/mark-as-read', {
        markAll: true,
      });
      expect(result).toBe(5);
    });
  });

  describe('getPreferences', () => {
    const mockPreferences = {
      userId: 1,
      notificationsEnabled: true,
      emailEnabled: false,
      pushEnabled: true,
      quietHoursStart: null,
      quietHoursEnd: null,
      inQuietHours: false,
      typeSettings: {},
      availableTypes: {},
      updatedAt: new Date().toISOString(),
    };

    it('should fetch notification preferences', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPreferences });

      const result = await notificationService.getPreferences();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/notifications/preferences');
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const updates = { pushEnabled: false, emailEnabled: true };
      const mockResponse = {
        userId: 1,
        notificationsEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        inQuietHours: false,
        typeSettings: {},
        availableTypes: {},
        updatedAt: new Date().toISOString(),
      };

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await notificationService.updatePreferences(updates);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/notifications/preferences', updates);
      expect(result.pushEnabled).toBe(false);
      expect(result.emailEnabled).toBe(true);
    });
  });

  describe('togglePushNotifications', () => {
    it('should toggle push notifications', async () => {
      const mockResponse = {
        userId: 1,
        notificationsEnabled: true,
        emailEnabled: false,
        pushEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        inQuietHours: false,
        typeSettings: {},
        availableTypes: {},
        updatedAt: new Date().toISOString(),
      };

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await notificationService.togglePushNotifications(false);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/notifications/preferences', {
        pushEnabled: false,
      });
      expect(result.pushEnabled).toBe(false);
    });
  });

  describe('setQuietHours', () => {
    it('should set quiet hours', async () => {
      const mockResponse = {
        userId: 1,
        notificationsEnabled: true,
        emailEnabled: false,
        pushEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
        inQuietHours: false,
        typeSettings: {},
        availableTypes: {},
        updatedAt: new Date().toISOString(),
      };

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await notificationService.setQuietHours(22, 8);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/notifications/preferences', {
        quietHoursStart: 22,
        quietHoursEnd: 8,
      });
      expect(result.quietHoursStart).toBe(22);
      expect(result.quietHoursEnd).toBe(8);
    });
  });
});
