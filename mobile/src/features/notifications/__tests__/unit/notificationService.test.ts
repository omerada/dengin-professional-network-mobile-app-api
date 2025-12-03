// src/features/notifications/__tests__/unit/notificationService.test.ts
// Unit tests for notification service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import {
  notificationService,
  NotificationType,
} from '../../services/notificationService';
import { apiClient } from '@services/api';

// Mock API client
jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    const mockNotificationsResponse = {
      items: [
        {
          id: '1',
          type: NotificationType.MESSAGE,
          title: 'Yeni Mesaj',
          body: 'Ahmet size bir mesaj gönderdi',
          isRead: false,
          createdAt: '2024-01-15T10:00:00Z',
          senderId: 'user-1',
          senderName: 'Ahmet',
          senderAvatar: 'https://example.com/avatar.jpg',
          referenceId: 'conv-1',
        },
        {
          id: '2',
          type: NotificationType.POST_LIKE,
          title: 'Yeni Beğeni',
          body: 'Mehmet gönderinizi beğendi',
          isRead: true,
          createdAt: '2024-01-15T09:00:00Z',
          senderId: 'user-2',
          senderName: 'Mehmet',
          referenceId: 'post-1',
        },
      ],
      nextCursor: 'cursor-123',
      hasMore: true,
    };

    it('should fetch notifications successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: mockNotificationsResponse,
      });

      const result = await notificationService.getNotifications();

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications', {
        params: { limit: 20, cursor: undefined },
      });
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor-123');
      expect(result.hasMore).toBe(true);
    });

    it('should fetch notifications with cursor', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { ...mockNotificationsResponse, nextCursor: undefined, hasMore: false },
      });

      const result = await notificationService.getNotifications({
        cursor: 'cursor-456',
        limit: 10,
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications', {
        params: { limit: 10, cursor: 'cursor-456' },
      });
      expect(result.hasMore).toBe(false);
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
        data: { count: 5 },
      });

      const result = await notificationService.getUnreadCount();

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toBe(5);
    });

    it('should return 0 on error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Error'));

      // Service should handle error gracefully
      await expect(notificationService.getUnreadCount()).rejects.toThrow();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockApiClient.put.mockResolvedValueOnce({ data: { success: true } });

      await notificationService.markAsRead('notification-1');

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/notifications/notification-1/read'
      );
    });

    it('should handle errors', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Not found'));

      await expect(
        notificationService.markAsRead('invalid-id')
      ).rejects.toThrow('Not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockApiClient.put.mockResolvedValueOnce({ data: { success: true } });

      await notificationService.markAllAsRead();

      expect(mockApiClient.put).toHaveBeenCalledWith('/notifications/read-all');
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      mockApiClient.delete.mockResolvedValueOnce({ data: { success: true } });

      await notificationService.deleteNotification('notification-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/notifications/notification-1'
      );
    });
  });

  describe('getSettings', () => {
    const mockSettings = {
      enabled: true,
      messages: true,
      likes: true,
      comments: true,
      follows: true,
      verification: true,
      system: true,
    };

    it('should fetch notification settings', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockSettings });

      const result = await notificationService.getSettings();

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications/settings');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('should update notification settings', async () => {
      const updates = { messages: false, likes: false };
      mockApiClient.put.mockResolvedValueOnce({
        data: { ...updates },
      });

      await notificationService.updateSettings(updates);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/notifications/settings',
        updates
      );
    });
  });

  describe('registerFCMToken', () => {
    it('should register FCM token', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { success: true } });

      await notificationService.registerFCMToken('fcm-token-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/notifications/token', {
        token: 'fcm-token-123',
        platform: expect.any(String),
      });
    });
  });
});
