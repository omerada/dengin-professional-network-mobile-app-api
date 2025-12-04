// src/features/notifications/__tests__/unit/notifeeService.test.ts
// Unit tests for Notifee service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import notifee, {
  AndroidChannel,
  AndroidImportance,
  EventType,
  Notification,
} from '@notifee/react-native';
import { notifeeService } from '../../services/notifeeService';
import type { NotificationType } from '../../types';

// Mock Notifee
jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(),
  displayNotification: jest.fn(),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  getDisplayedNotifications: jest.fn(),
  getInitialNotification: jest.fn(),
  setBadgeCount: jest.fn(),
  getBadgeCount: jest.fn(),
  requestPermission: jest.fn(),
  onForegroundEvent: jest.fn(),
  onBackgroundEvent: jest.fn(),
  EventType: {
    DISMISSED: 0,
    PRESS: 1,
    ACTION_PRESS: 2,
    DELIVERED: 3,
  },
  AndroidImportance: {
    NONE: 0,
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
  },
  AndroidCategory: {
    MESSAGE: 'msg',
    SOCIAL: 'social',
    STATUS: 'status',
  },
  AndroidStyle: {
    BIGPICTURE: 0,
  },
}));

const mockNotifee = notifee as jest.Mocked<typeof notifee>;

describe('NotifeeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('displayNotification', () => {
    const mockNotificationOptions = {
      id: 'notif-1',
      title: 'Yeni Mesaj',
      body: 'Ahmet: Merhaba!',
      type: 'message' as any, // Service uses lowercase type strings internally
      data: {
        conversationId: 'conv-1',
      },
    };

    it('should display notification with correct parameters', async () => {
      (mockNotifee.displayNotification as jest.Mock).mockResolvedValue('notif-id');

      await notifeeService.displayNotification(mockNotificationOptions);

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'notif-1',
          title: 'Yeni Mesaj',
          body: 'Ahmet: Merhaba!',
        }),
      );
    });

    it('should use correct channel for message notifications', async () => {
      (mockNotifee.displayNotification as jest.Mock).mockResolvedValue('notif-id');

      await notifeeService.displayNotification({
        ...mockNotificationOptions,
        type: 'message' as any,
      });

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            channelId: 'messages',
          }),
        }),
      );
    });

    it('should use posts channel for like notifications', async () => {
      (mockNotifee.displayNotification as jest.Mock).mockResolvedValue('notif-id');

      await notifeeService.displayNotification({
        ...mockNotificationOptions,
        type: 'post_like' as any,
      });

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            channelId: 'posts',
          }),
        }),
      );
    });

    it('should use verification channel for verification notifications', async () => {
      (mockNotifee.displayNotification as jest.Mock).mockResolvedValue('notif-id');

      await notifeeService.displayNotification({
        ...mockNotificationOptions,
        type: 'verification_update' as any,
      });

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            channelId: 'verification',
          }),
        }),
      );
    });

    it('should use system channel for system notifications', async () => {
      (mockNotifee.displayNotification as jest.Mock).mockResolvedValue('notif-id');

      await notifeeService.displayNotification({
        ...mockNotificationOptions,
        type: 'system' as any,
      });

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            channelId: 'system',
          }),
        }),
      );
    });
  });

  describe('Badge Count', () => {
    it('should set badge count', async () => {
      (mockNotifee.setBadgeCount as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.setBadgeCount(5);

      expect(mockNotifee.setBadgeCount).toHaveBeenCalledWith(5);
    });

    it('should get badge count', async () => {
      (mockNotifee.getBadgeCount as jest.Mock).mockResolvedValue(3);

      const count = await notifeeService.getBadgeCount();

      expect(count).toBe(3);
    });

    it('should increment badge count', async () => {
      (mockNotifee.getBadgeCount as jest.Mock).mockResolvedValue(3);
      (mockNotifee.setBadgeCount as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.incrementBadgeCount();

      expect(mockNotifee.getBadgeCount).toHaveBeenCalled();
      expect(mockNotifee.setBadgeCount).toHaveBeenCalledWith(4);
    });

    it('should decrement badge count', async () => {
      (mockNotifee.getBadgeCount as jest.Mock).mockResolvedValue(3);
      (mockNotifee.setBadgeCount as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.decrementBadgeCount();

      expect(mockNotifee.getBadgeCount).toHaveBeenCalled();
      expect(mockNotifee.setBadgeCount).toHaveBeenCalledWith(2);
    });

    it('should not decrement badge count below zero', async () => {
      (mockNotifee.getBadgeCount as jest.Mock).mockResolvedValue(0);
      (mockNotifee.setBadgeCount as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.decrementBadgeCount();

      expect(mockNotifee.setBadgeCount).toHaveBeenCalledWith(0);
    });
  });

  describe('Notification Management', () => {
    it('should cancel specific notification', async () => {
      (mockNotifee.cancelNotification as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.cancelNotification('notif-1');

      expect(mockNotifee.cancelNotification).toHaveBeenCalledWith('notif-1');
    });

    it('should cancel all notifications', async () => {
      (mockNotifee.cancelAllNotifications as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.cancelAllNotifications();

      expect(mockNotifee.cancelAllNotifications).toHaveBeenCalled();
    });

    it('should get displayed notifications', async () => {
      const displayedNotifications = [
        { id: '1', notification: { title: 'Test 1' } },
        { id: '2', notification: { title: 'Test 2' } },
      ];
      (mockNotifee.getDisplayedNotifications as jest.Mock).mockResolvedValue(
        displayedNotifications,
      );

      const notifications = await notifeeService.getDisplayedNotifications();

      expect(notifications).toEqual(displayedNotifications);
    });
  });

  describe('Event Handlers', () => {
    it('should setup foreground event handler', () => {
      const mockUnsubscribe = jest.fn();
      (mockNotifee.onForegroundEvent as jest.Mock).mockReturnValue(mockUnsubscribe);

      const handler = jest.fn();
      const unsubscribe = notifeeService.onForegroundEvent(handler);

      expect(mockNotifee.onForegroundEvent).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should setup background event handler', () => {
      notifeeService.onBackgroundEvent(jest.fn());

      expect(mockNotifee.onBackgroundEvent).toHaveBeenCalled();
    });
  });

  describe('getInitialNotification', () => {
    it('should get initial notification', async () => {
      const mockNotification = { notification: { id: '1', title: 'Test' } };
      (mockNotifee.getInitialNotification as jest.Mock).mockResolvedValue(mockNotification);

      const result = await notifeeService.getInitialNotification();

      expect(mockNotifee.getInitialNotification).toHaveBeenCalled();
      expect(result).toEqual(mockNotification.notification);
    });

    it('should return null when no initial notification', async () => {
      (mockNotifee.getInitialNotification as jest.Mock).mockResolvedValue(null);

      const result = await notifeeService.getInitialNotification();

      expect(result).toBeNull();
    });
  });
});
