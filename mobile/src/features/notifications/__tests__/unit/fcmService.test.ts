// src/features/notifications/__tests__/unit/fcmService.test.ts
// Unit tests for FCM service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { fcmService } from '../../services/fcmService';
import { notificationService } from '../../services/notificationService';

// Mock Firebase messaging
jest.mock('@react-native-firebase/messaging', () => {
  const mockMessaging = {
    requestPermission: jest.fn(),
    getToken: jest.fn(),
    deleteToken: jest.fn(),
    onTokenRefresh: jest.fn(),
    hasPermission: jest.fn(),
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
    getInitialNotification: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
  };

  return () => mockMessaging;
});

// Mock notification service
jest.mock('../../services/notificationService', () => ({
  notificationService: {
    registerFCMToken: jest.fn(),
  },
}));

const mockMessaging = messaging() as jest.Mocked<typeof messaging>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('FCMService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermission', () => {
    it('should request permission and return granted status', async () => {
      (mockMessaging.requestPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      const result = await fcmService.requestPermission();

      expect(mockMessaging.requestPermission).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return denied when permission is denied', async () => {
      (mockMessaging.requestPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.DENIED
      );

      const result = await fcmService.requestPermission();

      expect(result).toBe('denied');
    });

    it('should return granted for provisional authorization', async () => {
      (mockMessaging.requestPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.PROVISIONAL
      );

      const result = await fcmService.requestPermission();

      expect(result).toBe('granted');
    });

    it('should handle permission request error', async () => {
      (mockMessaging.requestPermission as jest.Mock).mockRejectedValueOnce(
        new Error('Permission error')
      );

      const result = await fcmService.requestPermission();

      expect(result).toBe('denied');
    });
  });

  describe('getToken', () => {
    it('should get FCM token', async () => {
      (mockMessaging.getToken as jest.Mock).mockResolvedValueOnce('test-fcm-token');

      const token = await fcmService.getToken();

      expect(mockMessaging.getToken).toHaveBeenCalled();
      expect(token).toBe('test-fcm-token');
    });

    it('should return null when token fetch fails', async () => {
      (mockMessaging.getToken as jest.Mock).mockRejectedValueOnce(
        new Error('Token error')
      );

      const token = await fcmService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('sendTokenToServer', () => {
    it('should send token to server', async () => {
      (mockNotificationService.registerFCMToken as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      await fcmService.sendTokenToServer('test-token');

      expect(mockNotificationService.registerFCMToken).toHaveBeenCalledWith(
        'test-token'
      );
    });

    it('should handle server error gracefully', async () => {
      (mockNotificationService.registerFCMToken as jest.Mock).mockRejectedValueOnce(
        new Error('Server error')
      );

      // Should not throw
      await expect(
        fcmService.sendTokenToServer('test-token')
      ).resolves.not.toThrow();
    });
  });

  describe('setupTokenRefresh', () => {
    it('should setup token refresh listener', () => {
      const mockUnsubscribe = jest.fn();
      (mockMessaging.onTokenRefresh as jest.Mock).mockReturnValueOnce(mockUnsubscribe);

      const unsubscribe = fcmService.setupTokenRefresh(jest.fn());

      expect(mockMessaging.onTokenRefresh).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should call callback with new token', () => {
      const callback = jest.fn();
      let tokenRefreshCallback: ((token: string) => void) | undefined;

      (mockMessaging.onTokenRefresh as jest.Mock).mockImplementationOnce((cb) => {
        tokenRefreshCallback = cb;
        return jest.fn();
      });

      fcmService.setupTokenRefresh(callback);

      // Simulate token refresh
      if (tokenRefreshCallback) {
        tokenRefreshCallback('new-token');
      }

      expect(callback).toHaveBeenCalledWith('new-token');
    });
  });

  describe('deleteToken', () => {
    it('should delete FCM token', async () => {
      (mockMessaging.deleteToken as jest.Mock).mockResolvedValueOnce(undefined);

      await fcmService.deleteToken();

      expect(mockMessaging.deleteToken).toHaveBeenCalled();
    });

    it('should handle delete error gracefully', async () => {
      (mockMessaging.deleteToken as jest.Mock).mockRejectedValueOnce(
        new Error('Delete error')
      );

      // Should not throw
      await expect(fcmService.deleteToken()).resolves.not.toThrow();
    });
  });

  describe('checkPermission', () => {
    it('should check current permission status', async () => {
      (mockMessaging.hasPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      const result = await fcmService.checkPermission();

      expect(mockMessaging.hasPermission).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return not-determined for not determined status', async () => {
      (mockMessaging.hasPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.NOT_DETERMINED
      );

      const result = await fcmService.checkPermission();

      expect(result).toBe('not-determined');
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe to topic', async () => {
      (mockMessaging.subscribeToTopic as jest.Mock).mockResolvedValueOnce(undefined);

      await fcmService.subscribeToTopic('news');

      expect(mockMessaging.subscribeToTopic).toHaveBeenCalledWith('news');
    });
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe from topic', async () => {
      (mockMessaging.unsubscribeFromTopic as jest.Mock).mockResolvedValueOnce(undefined);

      await fcmService.unsubscribeFromTopic('news');

      expect(mockMessaging.unsubscribeFromTopic).toHaveBeenCalledWith('news');
    });
  });
});
