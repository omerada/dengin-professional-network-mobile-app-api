// __tests__/unit/notifications/notificationService.test.ts
// NotificationService unit tests - Backend API uyumluluğu testleri
// Sprint 9-10: Push & In-app Notifications

import { notificationService } from '../../../src/features/notifications/services/notificationService';
import { apiClient } from '@core/api/client';
import type {
  NotificationListResponse,
  NotificationResponse,
  NotificationPreferencesResponse,
  MarkAsReadRequest,
} from '../../../src/features/notifications/types';

// Mock apiClient
jest.mock('@core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    const mockNotificationListResponse: NotificationListResponse = {
      notifications: [
        {
          notificationId: 'notif-1',
          type: 'NEW_FOLLOWER',
          title: 'Yeni Takipçi',
          body: 'Ahmet sizi takip etti',
          actionUrl: '/profile/user-123',
          metadata: { actorId: 'user-123' },
          status: 'DELIVERED',
          deliveredChannels: ['PUSH', 'IN_APP'],
          read: false,
          readAt: null,
          relativeTime: '5 dk önce',
          createdAt: '2024-01-15T10:00:00Z',
        },
      ],
      unreadCount: 5,
      unreadByType: { NEW_FOLLOWER: 2, POST_LIKED: 3 },
      currentPage: 0,
      pageSize: 20,
      totalPages: 1,
      totalElements: 1,
      hasMore: false,
      first: true,
      last: true,
    };

    it('should fetch notifications with page-based pagination', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockNotificationListResponse });

      const result = await notificationService.getNotifications(0, 20, false);

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { page: 0, size: 20, unreadOnly: false },
      });
      expect(result).toEqual(mockNotificationListResponse);
    });

    it('should fetch only unread notifications when unreadOnly is true', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockNotificationListResponse });

      await notificationService.getNotifications(0, 20, true);

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { page: 0, size: 20, unreadOnly: true },
      });
    });

    it('should use default page size when not specified', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockNotificationListResponse });

      await notificationService.getNotifications();

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { page: 0, size: 20, unreadOnly: false },
      });
    });
  });

  describe('getNotification', () => {
    const mockNotification: NotificationResponse = {
      notificationId: 'notif-1',
      type: 'POST_LIKED',
      title: 'Gönderi Beğenildi',
      body: 'Mehmet gönderinizi beğendi',
      actionUrl: '/posts/post-123',
      metadata: { postId: 'post-123' },
      status: 'DELIVERED',
      deliveredChannels: ['IN_APP'],
      read: false,
      readAt: null,
      relativeTime: '2 saat önce',
      createdAt: '2024-01-15T08:00:00Z',
    };

    it('should fetch single notification by ID', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockNotification });

      const result = await notificationService.getNotification('notif-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications/notif-1');
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread count', async () => {
      const mockResponse = { unreadCount: 7 };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await notificationService.getUnreadCount();

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications/unread-count');
      expect(result).toEqual(7); // Service returns just the number, not the object
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      const mockResponse: NotificationResponse = {
        notificationId: 'notif-1',
        type: 'NEW_MESSAGE',
        title: 'Yeni Mesaj',
        body: 'Test mesajı',
        actionUrl: '/messages/conv-123',
        metadata: {},
        status: 'READ',
        deliveredChannels: ['PUSH'],
        read: true,
        readAt: '2024-01-15T12:00:00Z',
        relativeTime: 'az önce',
        createdAt: '2024-01-15T10:00:00Z',
      };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await notificationService.markAsRead('notif-1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/notifications/notif-1/read');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read', async () => {
      const request: MarkAsReadRequest = {
        markAll: false,
        notificationIds: ['notif-1', 'notif-2', 'notif-3'],
      };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: undefined });

      await notificationService.markMultipleAsRead(request);

      expect(apiClient.post).toHaveBeenCalledWith('/api/notifications/mark-as-read', request);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: { markedAsRead: 5 } });

      const result = await notificationService.markAllAsRead();

      expect(apiClient.post).toHaveBeenCalledWith('/api/notifications/mark-as-read', {
        markAll: true,
      });
      expect(result).toBe(5);
    });
  });

  describe('getPreferences', () => {
    const mockPreferences: NotificationPreferencesResponse = {
      userId: 'user-123',
      notificationsEnabled: true,
      emailEnabled: false,
      pushEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      inQuietHours: false,
      typeSettings: {
        NEW_FOLLOWER: { enabled: true, push: true, email: false },
        POST_LIKED: { enabled: true, push: true, email: false },
      },
      availableTypes: ['NEW_FOLLOWER', 'POST_LIKED', 'POST_COMMENTED', 'NEW_MESSAGE'],
      updatedAt: '2024-01-15T10:00:00Z',
    };

    it('should fetch notification preferences', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockPreferences });

      const result = await notificationService.getPreferences();

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications/preferences');
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const updateRequest = {
        notificationsEnabled: true,
        pushEnabled: false,
      };
      const mockResponse: NotificationPreferencesResponse = {
        userId: 'user-123',
        notificationsEnabled: true,
        emailEnabled: false,
        pushEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        inQuietHours: false,
        typeSettings: {},
        availableTypes: [],
        updatedAt: '2024-01-15T12:00:00Z',
      };
      (apiClient.put as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await notificationService.updatePreferences(updateRequest);

      expect(apiClient.put).toHaveBeenCalledWith('/api/notifications/preferences', updateRequest);
      expect(result).toEqual(mockResponse);
    });
  });
});
