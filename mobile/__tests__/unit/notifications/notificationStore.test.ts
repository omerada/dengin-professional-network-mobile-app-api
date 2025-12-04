// __tests__/unit/notifications/notificationStore.test.ts
// Notification Store unit tests
// Sprint 9-10: Push & In-app Notifications

import { renderHook, act } from '@testing-library/react-native';
import { useNotificationStore } from '../../../src/features/notifications/stores/notificationStore';
import type { NotificationResponse, NotificationType } from '../../../src/features/notifications/types';

describe('NotificationStore', () => {
  // Reset store before each test
  beforeEach(() => {
    const { result } = renderHook(() => useNotificationStore());
    act(() => {
      result.current.reset();
    });
  });

  const createMockNotification = (
    id: string, 
    type: NotificationType = 'NEW_FOLLOWER',
    read: boolean = false
  ): NotificationResponse => ({
    notificationId: id,
    type,
    title: 'Test Notification',
    body: 'Test body',
    actionUrl: '/test',
    metadata: {},
    status: 'DELIVERED',
    deliveredChannels: ['PUSH'],
    read,
    readAt: read ? '2024-01-15T10:00:00Z' : null,
    relativeTime: '5 dk önce',
    createdAt: '2024-01-15T10:00:00Z',
  });

  describe('setNotifications', () => {
    it('should set notifications and calculate unread count', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      const notifications = [
        createMockNotification('1', 'NEW_FOLLOWER', false),
        createMockNotification('2', 'POST_LIKED', true),
        createMockNotification('3', 'NEW_MESSAGE', false),
      ];

      act(() => {
        result.current.setNotifications(notifications);
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.unreadCount).toBe(2);
    });
  });

  describe('addNotification', () => {
    it('should add notification to beginning of list', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      const existingNotification = createMockNotification('1');
      const newNotification = createMockNotification('2');

      act(() => {
        result.current.setNotifications([existingNotification]);
        result.current.addNotification(newNotification);
      });

      expect(result.current.notifications[0].notificationId).toBe('2');
      expect(result.current.notifications).toHaveLength(2);
    });

    it('should increment unread count for unread notification', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.addNotification(createMockNotification('1', 'NEW_FOLLOWER', false));
      });

      expect(result.current.unreadCount).toBe(1);
    });

    it('should not add duplicate notification', () => {
      const { result } = renderHook(() => useNotificationStore());
      const notification = createMockNotification('1');

      act(() => {
        result.current.addNotification(notification);
        result.current.addNotification(notification);
      });

      expect(result.current.notifications).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const { result } = renderHook(() => useNotificationStore());
      const notification = createMockNotification('1', 'NEW_FOLLOWER', false);

      act(() => {
        result.current.setNotifications([notification]);
        result.current.markAsRead('1');
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.notifications[0].readAt).toBeDefined();
    });

    it('should decrement unread count', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setNotifications([
          createMockNotification('1', 'NEW_FOLLOWER', false),
          createMockNotification('2', 'POST_LIKED', false),
        ]);
      });

      expect(result.current.unreadCount).toBe(2);

      act(() => {
        result.current.markAsRead('1');
      });

      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setNotifications([
          createMockNotification('1', 'NEW_FOLLOWER', false),
          createMockNotification('2', 'POST_LIKED', false),
          createMockNotification('3', 'NEW_MESSAGE', false),
        ]);
      });

      expect(result.current.unreadCount).toBe(3);

      act(() => {
        result.current.markMultipleAsRead(['1', '2']);
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.notifications[1].read).toBe(true);
      expect(result.current.notifications[2].read).toBe(false);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setNotifications([
          createMockNotification('1', 'NEW_FOLLOWER', false),
          createMockNotification('2', 'POST_LIKED', false),
        ]);
        result.current.markAllAsRead();
      });

      expect(result.current.notifications.every(n => n.read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('removeNotification', () => {
    it('should remove notification from list', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setNotifications([
          createMockNotification('1'),
          createMockNotification('2'),
        ]);
        result.current.removeNotification('1');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].notificationId).toBe('2');
    });

    it('should decrement unread count if removed notification was unread', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setNotifications([
          createMockNotification('1', 'NEW_FOLLOWER', false),
        ]);
      });

      expect(result.current.unreadCount).toBe(1);

      act(() => {
        result.current.removeNotification('1');
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('clearAllNotifications', () => {
    it('should clear all notifications and reset counts', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setNotifications([
          createMockNotification('1'),
          createMockNotification('2'),
        ]);
        result.current.clearAllNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.hasMore).toBe(true);
    });
  });

  describe('setPreferences', () => {
    it('should update preferences', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setPreferences({
          notificationsEnabled: false,
          pushEnabled: false,
        });
      });

      expect(result.current.preferences.notificationsEnabled).toBe(false);
      expect(result.current.preferences.pushEnabled).toBe(false);
    });
  });

  describe('setFcmToken', () => {
    it('should set FCM token', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setFcmToken('test-fcm-token');
      });

      expect(result.current.fcmToken).toBe('test-fcm-token');
    });
  });

  describe('setPermissionGranted', () => {
    it('should set permission status', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setPermissionGranted(true);
      });

      expect(result.current.isPermissionGranted).toBe(true);
    });
  });

  describe('setPagination', () => {
    it('should set pagination info', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setPagination(1, 5, true);
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(5);
      expect(result.current.hasMore).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.setNotifications([createMockNotification('1')]);
        result.current.setFcmToken('test-token');
        result.current.setPermissionGranted(true);
        result.current.reset();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.fcmToken).toBeNull();
      expect(result.current.isPermissionGranted).toBe(false);
    });
  });
});
