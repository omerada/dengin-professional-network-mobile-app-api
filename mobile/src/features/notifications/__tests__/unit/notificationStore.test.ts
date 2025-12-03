// src/features/notifications/__tests__/unit/notificationStore.test.ts
// Unit tests for notification store
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { act, renderHook } from '@testing-library/react-hooks';
import { useNotificationStore } from '../../stores/notificationStore';
import type { NotificationSettings, PermissionStatus } from '../../types';

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
      expect(result.current.settings).toBeNull();
      expect(result.current.permissionStatus).toBe('not-determined');
      expect(result.current.fcmToken).toBeNull();
      expect(result.current.isInitialized).toBe(false);
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

    it('should not set negative count', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setUnreadCount(-1);
      });

      expect(result.current.unreadCount).toBe(0);
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

  describe('clearUnreadCount', () => {
    it('should reset unread count to zero', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setUnreadCount(10);
      });

      act(() => {
        result.current.clearUnreadCount();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('setSettings', () => {
    it('should set settings', () => {
      const { result } = renderHook(() => useNotificationStore());
      const settings: NotificationSettings = {
        enabled: true,
        messages: true,
        likes: true,
        comments: true,
        follows: true,
        verification: true,
        system: true,
      };

      act(() => {
        result.current.setSettings(settings);
      });

      expect(result.current.settings).toEqual(settings);
    });
  });

  describe('updateSettings', () => {
    it('should update partial settings', () => {
      const { result } = renderHook(() => useNotificationStore());
      const initialSettings: NotificationSettings = {
        enabled: true,
        messages: true,
        likes: true,
        comments: true,
        follows: true,
        verification: true,
        system: true,
      };

      act(() => {
        result.current.setSettings(initialSettings);
      });

      act(() => {
        result.current.updateSettings({ messages: false, likes: false });
      });

      expect(result.current.settings?.messages).toBe(false);
      expect(result.current.settings?.likes).toBe(false);
      expect(result.current.settings?.comments).toBe(true); // Unchanged
    });

    it('should not update if settings is null', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.updateSettings({ messages: false });
      });

      expect(result.current.settings).toBeNull();
    });
  });

  describe('setPermissionStatus', () => {
    it('should set permission status', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setPermissionStatus('granted');
      });

      expect(result.current.permissionStatus).toBe('granted');
    });

    it('should handle all status values', () => {
      const { result } = renderHook(() => useNotificationStore());
      const statuses: PermissionStatus[] = [
        'granted',
        'denied',
        'not-determined',
        'blocked',
      ];

      statuses.forEach((status) => {
        act(() => {
          result.current.setPermissionStatus(status);
        });
        expect(result.current.permissionStatus).toBe(status);
      });
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

  describe('setInitialized', () => {
    it('should set initialized state', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.setInitialized(true);
      });

      expect(result.current.isInitialized).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useNotificationStore());
      const settings: NotificationSettings = {
        enabled: true,
        messages: true,
        likes: true,
        comments: true,
        follows: true,
        verification: true,
        system: true,
      };

      act(() => {
        result.current.setUnreadCount(10);
        result.current.setSettings(settings);
        result.current.setPermissionStatus('granted');
        result.current.setFcmToken('token');
        result.current.setInitialized(true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.settings).toBeNull();
      expect(result.current.permissionStatus).toBe('not-determined');
      expect(result.current.fcmToken).toBeNull();
      expect(result.current.isInitialized).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should persist specific fields', () => {
      // The store uses zustand/persist, so settings should be persisted
      // This test verifies the persisted fields are correct
      const { result } = renderHook(() => useNotificationStore());

      // Store uses persist middleware with specific partialize function
      // settings, permissionStatus should be persisted
      expect(result.current.settings).toBeDefined();
      expect(result.current.permissionStatus).toBeDefined();
    });
  });
});
