// src/features/notifications/__tests__/unit/notificationStore.test.ts
// Unit tests for notification store
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { act } from '@testing-library/react-native';
import { renderHook } from '@testing-library/react-native';
import { useNotificationStore } from '../../stores/notificationStore';
import type {
  NotificationResponse,
  NotificationPreferencesResponse,
  NotificationType,
} from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('NotificationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useNotificationStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useNotificationStore());

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.isPermissionGranted).toBe(false);
      expect(result.current.fcmToken).toBeNull();
      expect(result.current.hasMore).toBe(true);
    });
  });

  describe('setUnreadCount', () => {
    it('should set unread count', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setUnreadCount(5);
      });

      expect(result.current.unreadCount).toBe(5);
    });
  });

  describe('incrementUnreadCount', () => {
    it('should increment unread count', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setUnreadCount(3);
      });

      act(() => {
        result.current.incrementUnreadCount();
      });

      expect(result.current.unreadCount).toBe(4);
    });
  });

  describe('decrementUnreadCount', () => {
    it('should decrement unread count', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setUnreadCount(5);
      });

      act(() => {
        result.current.decrementUnreadCount();
      });

      expect(result.current.unreadCount).toBe(4);
    });

    it('should not go below zero', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setUnreadCount(0);
      });

      act(() => {
        result.current.decrementUnreadCount();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('resetUnreadCount', () => {
    it('should reset unread count to zero', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setUnreadCount(10);
      });

      act(() => {
        result.current.resetUnreadCount();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('setNotifications', () => {
    it('should set notifications and calculate unread count', () => {
      const { result } = renderHook(() => useNotificationStore());
      const notifications: NotificationResponse[] = [
        {
          notificationId: '1',
          type: 'NEW_MESSAGE',
          title: 'Test',
          body: 'Test body',
          actionUrl: null,
          metadata: {},
          status: 'DELIVERED',
          deliveredChannels: [],
          read: false,
          readAt: null,
          relativeTime: 'şimdi',
          createdAt: new Date().toISOString(),
        },
        {
          notificationId: '2',
          type: 'POST_LIKED',
          title: 'Test 2',
          body: 'Test body 2',
          actionUrl: null,
          metadata: {},
          status: 'READ',
          deliveredChannels: [],
          read: true,
          readAt: new Date().toISOString(),
          relativeTime: '1sa önce',
          createdAt: new Date().toISOString(),
        },
      ];

      act(() => {
        result.current.setNotifications(notifications);
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('addNotification', () => {
    it('should add notification to the beginning', () => {
      const { result } = renderHook(() => useNotificationStore());
      const notification: NotificationResponse = {
        notificationId: '1',
        type: 'NEW_MESSAGE',
        title: 'Test',
        body: 'Test body',
        actionUrl: null,
        metadata: {},
        status: 'DELIVERED',
        deliveredChannels: [],
        read: false,
        readAt: null,
        relativeTime: 'şimdi',
        createdAt: new Date().toISOString(),
      };

      act(() => {
        result.current.addNotification(notification);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].notificationId).toBe('1');
      expect(result.current.unreadCount).toBe(1);
    });

    it('should not add duplicate notification', () => {
      const { result } = renderHook(() => useNotificationStore());
      const notification: NotificationResponse = {
        notificationId: '1',
        type: 'NEW_MESSAGE',
        title: 'Test',
        body: 'Test body',
        actionUrl: null,
        metadata: {},
        status: 'DELIVERED',
        deliveredChannels: [],
        read: false,
        readAt: null,
        relativeTime: 'şimdi',
        createdAt: new Date().toISOString(),
      };

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
      const notification: NotificationResponse = {
        notificationId: '1',
        type: 'NEW_MESSAGE',
        title: 'Test',
        body: 'Test body',
        actionUrl: null,
        metadata: {},
        status: 'DELIVERED',
        deliveredChannels: [],
        read: false,
        readAt: null,
        relativeTime: 'şimdi',
        createdAt: new Date().toISOString(),
      };

      act(() => {
        result.current.addNotification(notification);
      });

      act(() => {
        result.current.markAsRead('1');
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useNotificationStore());
      const notifications: NotificationResponse[] = [
        {
          notificationId: '1',
          type: 'NEW_MESSAGE',
          title: 'Test',
          body: 'Test body',
          actionUrl: null,
          metadata: {},
          status: 'DELIVERED',
          deliveredChannels: [],
          read: false,
          readAt: null,
          relativeTime: 'şimdi',
          createdAt: new Date().toISOString(),
        },
        {
          notificationId: '2',
          type: 'POST_LIKED',
          title: 'Test 2',
          body: 'Test body 2',
          actionUrl: null,
          metadata: {},
          status: 'DELIVERED',
          deliveredChannels: [],
          read: false,
          readAt: null,
          relativeTime: 'şimdi',
          createdAt: new Date().toISOString(),
        },
      ];

      act(() => {
        result.current.setNotifications(notifications);
      });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.notifications.every(n => n.read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('removeNotification', () => {
    it('should remove notification', () => {
      const { result } = renderHook(() => useNotificationStore());
      const notification: NotificationResponse = {
        notificationId: '1',
        type: 'NEW_MESSAGE',
        title: 'Test',
        body: 'Test body',
        actionUrl: null,
        metadata: {},
        status: 'DELIVERED',
        deliveredChannels: [],
        read: false,
        readAt: null,
        relativeTime: 'şimdi',
        createdAt: new Date().toISOString(),
      };

      act(() => {
        result.current.addNotification(notification);
      });

      act(() => {
        result.current.removeNotification('1');
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
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

    it('should allow null token', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setFcmToken('test-fcm-token');
      });

      act(() => {
        result.current.setFcmToken(null);
      });

      expect(result.current.fcmToken).toBeNull();
    });
  });

  describe('setPermissionGranted', () => {
    it('should set permission granted state', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setPermissionGranted(true);
      });

      expect(result.current.isPermissionGranted).toBe(true);
    });
  });

  describe('setPagination', () => {
    it('should set pagination state', () => {
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
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useNotificationStore());
      const notification: NotificationResponse = {
        notificationId: '1',
        type: 'NEW_MESSAGE',
        title: 'Test',
        body: 'Test body',
        actionUrl: null,
        metadata: {},
        status: 'DELIVERED',
        deliveredChannels: [],
        read: false,
        readAt: null,
        relativeTime: 'şimdi',
        createdAt: new Date().toISOString(),
      };

      act(() => {
        result.current.addNotification(notification);
        result.current.setPermissionGranted(true);
        result.current.setFcmToken('token');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.isPermissionGranted).toBe(false);
      expect(result.current.fcmToken).toBeNull();
    });
  });
});
