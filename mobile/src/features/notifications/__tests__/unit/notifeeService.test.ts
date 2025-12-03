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
import { NotificationType } from '../../types';

// Mock Notifee
jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(),
  displayNotification: jest.fn(),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  getDisplayedNotifications: jest.fn(),
  setBadgeCount: jest.fn(),
  getBadgeCount: jest.fn(),
  incrementBadgeCount: jest.fn(),
  decrementBadgeCount: jest.fn(),
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
    HIGH: 4,
    DEFAULT: 3,
  },
}));

const mockNotifee = notifee as jest.Mocked<typeof notifee>;

describe('NotifeeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChannels', () => {
    it('should create all notification channels', async () => {
      (mockNotifee.createChannel as jest.Mock).mockResolvedValue('channel-id');

      await notifeeService.createChannels();

      // Should create 4 channels: messages, posts, verification, system
      expect(mockNotifee.createChannel).toHaveBeenCalledTimes(4);

      // Verify channel names
      const calls = (mockNotifee.createChannel as jest.Mock).mock.calls;
      const channelIds = calls.map((call: any) => call[0].id);

      expect(channelIds).toContain('messages');
      expect(channelIds).toContain('posts');
      expect(channelIds).toContain('verification');
      expect(channelIds).toContain('system');
    });

    it('should set high importance for messages channel', async () => {
      (mockNotifee.createChannel as jest.Mock).mockResolvedValue('channel-id');

      await notifeeService.createChannels();

      const messagesCall = (mockNotifee.createChannel as jest.Mock).mock.calls.find(
        (call: any) => call[0].id === 'messages'
      );

      expect(messagesCall[0].importance).toBe(AndroidImportance.HIGH);
    });
  });

  describe('displayNotification', () => {
    const mockNotificationData = {
      id: 'notif-1',
      type: NotificationType.MESSAGE,
      title: 'Yeni Mesaj',
      body: 'Ahmet: Merhaba!',
      data: {
        conversationId: 'conv-1',
      },
    };

    it('should display notification with correct channel', async () => {
      (mockNotifee.displayNotification as jest.Mock).mockResolvedValue('notif-id');

      await notifeeService.displayNotification(mockNotificationData);

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'notif-1',
          title: 'Yeni Mesaj',
          body: 'Ahmet: Merhaba!',
          android: expect.objectContaining({
            channelId: 'messages',
          }),
        })
      );
    });

    it('should use posts channel for like notifications', async () => {
      const likeNotification = {
        ...mockNotificationData,
        type: NotificationType.POST_LIKE,
      };

      await notifeeService.displayNotification(likeNotification);

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            channelId: 'posts',
          }),
        })
      );
    });

    it('should use verification channel for verification notifications', async () => {
      const verificationNotification = {
        ...mockNotificationData,
        type: NotificationType.VERIFICATION_UPDATE,
      };

      await notifeeService.displayNotification(verificationNotification);

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            channelId: 'verification',
          }),
        })
      );
    });

    it('should use system channel for system notifications', async () => {
      const systemNotification = {
        ...mockNotificationData,
        type: NotificationType.SYSTEM,
      };

      await notifeeService.displayNotification(systemNotification);

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({
            channelId: 'system',
          }),
        })
      );
    });
  });

  describe('displayMessageNotification', () => {
    it('should display message notification with sender info', async () => {
      (mockNotifee.displayNotification as jest.Mock).mockResolvedValue('notif-id');

      await notifeeService.displayMessageNotification({
        id: 'msg-1',
        senderName: 'Ahmet',
        message: 'Merhaba!',
        senderAvatar: 'https://example.com/avatar.jpg',
        conversationId: 'conv-1',
      });

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'msg-1',
          title: 'Ahmet',
          body: 'Merhaba!',
          data: expect.objectContaining({
            conversationId: 'conv-1',
          }),
        })
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
      (mockNotifee.incrementBadgeCount as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.incrementBadgeCount();

      expect(mockNotifee.incrementBadgeCount).toHaveBeenCalledWith(1);
    });

    it('should decrement badge count', async () => {
      (mockNotifee.decrementBadgeCount as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.decrementBadgeCount();

      expect(mockNotifee.decrementBadgeCount).toHaveBeenCalledWith(1);
    });

    it('should clear badge count', async () => {
      (mockNotifee.setBadgeCount as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.clearBadgeCount();

      expect(mockNotifee.setBadgeCount).toHaveBeenCalledWith(0);
    });
  });

  describe('Notification Management', () => {
    it('should clear specific notification', async () => {
      (mockNotifee.cancelNotification as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.clearNotification('notif-1');

      expect(mockNotifee.cancelNotification).toHaveBeenCalledWith('notif-1');
    });

    it('should clear all notifications', async () => {
      (mockNotifee.cancelAllNotifications as jest.Mock).mockResolvedValue(undefined);

      await notifeeService.clearAllNotifications();

      expect(mockNotifee.cancelAllNotifications).toHaveBeenCalled();
    });

    it('should get displayed notifications', async () => {
      const displayedNotifications = [
        { id: '1', notification: { title: 'Test 1' } },
        { id: '2', notification: { title: 'Test 2' } },
      ];
      (mockNotifee.getDisplayedNotifications as jest.Mock).mockResolvedValue(
        displayedNotifications
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
});
