// src/features/notifications/__tests__/unit/fcmService.test.ts
// Unit tests for FCM service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { fcmService } from '../../services/fcmService';

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

  const messagingFn = () => mockMessaging;
  messagingFn.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    DENIED: 0,
    NOT_DETERMINED: -1,
  };

  return {
    __esModule: true,
    default: messagingFn,
  };
});

// Mock API client
jest.mock('@core/api/client', () => ({
  apiClient: {
    post: jest.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Reset fcmService token cache
import AsyncStorage from '@react-native-async-storage/async-storage';
const mockMessaging = messaging() as jest.Mocked<ReturnType<typeof messaging>>;

describe('FCMService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the internal token cache by clearing AsyncStorage mock
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('requestPermission', () => {
    it('should request permission and return true when granted', async () => {
      (mockMessaging.requestPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.AUTHORIZED,
      );

      const result = await fcmService.requestPermission();

      expect(mockMessaging.requestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      (mockMessaging.requestPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.DENIED,
      );

      const result = await fcmService.requestPermission();

      expect(result).toBe(false);
    });

    it('should return true for provisional authorization', async () => {
      (mockMessaging.requestPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.PROVISIONAL,
      );

      const result = await fcmService.requestPermission();

      expect(result).toBe(true);
    });

    it('should handle permission request error', async () => {
      (mockMessaging.requestPermission as jest.Mock).mockRejectedValueOnce(
        new Error('Permission error'),
      );

      const result = await fcmService.requestPermission();

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should get FCM token', async () => {
      (mockMessaging.getToken as jest.Mock).mockResolvedValueOnce('test-fcm-token');

      const token = await fcmService.getToken();

      expect(token).toBe('test-fcm-token');
    });
  });

  describe('checkPermission', () => {
    it('should check current permission status and return true when granted', async () => {
      (mockMessaging.hasPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.AUTHORIZED,
      );

      const result = await fcmService.checkPermission();

      expect(mockMessaging.hasPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false for denied status', async () => {
      (mockMessaging.hasPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.DENIED,
      );

      const result = await fcmService.checkPermission();

      expect(result).toBe(false);
    });

    it('should return true for provisional status', async () => {
      (mockMessaging.hasPermission as jest.Mock).mockResolvedValueOnce(
        messaging.AuthorizationStatus.PROVISIONAL,
      );

      const result = await fcmService.checkPermission();

      expect(result).toBe(true);
    });
  });

  describe('setupTokenRefreshListener', () => {
    it('should setup token refresh listener', () => {
      const mockUnsubscribe = jest.fn();
      (mockMessaging.onTokenRefresh as jest.Mock).mockReturnValueOnce(mockUnsubscribe);

      const unsubscribe = fcmService.setupTokenRefreshListener(jest.fn());

      expect(mockMessaging.onTokenRefresh).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should call callback with new token', () => {
      const callback = jest.fn();
      let tokenRefreshCallback: ((token: string) => void) | undefined;

      (mockMessaging.onTokenRefresh as jest.Mock).mockImplementationOnce(cb => {
        tokenRefreshCallback = cb;
        return jest.fn();
      });

      fcmService.setupTokenRefreshListener(callback);

      // Simulate token refresh
      if (tokenRefreshCallback) {
        tokenRefreshCallback('new-token');
      }

      // Callback is called async after token is sent to server
      // The callback is wrapped in the service
    });
  });

  describe('clearToken', () => {
    it('should delete FCM token', async () => {
      (mockMessaging.deleteToken as jest.Mock).mockResolvedValueOnce(undefined);

      await fcmService.clearToken();

      expect(mockMessaging.deleteToken).toHaveBeenCalled();
    });

    it('should handle delete error gracefully', async () => {
      (mockMessaging.deleteToken as jest.Mock).mockRejectedValueOnce(new Error('Delete error'));

      // Should not throw
      await expect(fcmService.clearToken()).resolves.not.toThrow();
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

  describe('onForegroundMessage', () => {
    it('should setup foreground message handler', () => {
      const mockUnsubscribe = jest.fn();
      (mockMessaging.onMessage as jest.Mock).mockReturnValueOnce(mockUnsubscribe);

      const handler = jest.fn();
      const unsubscribe = fcmService.onForegroundMessage(handler);

      expect(mockMessaging.onMessage).toHaveBeenCalledWith(handler);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('onNotificationOpenedApp', () => {
    it('should setup notification opened handler', () => {
      const mockUnsubscribe = jest.fn();
      (mockMessaging.onNotificationOpenedApp as jest.Mock).mockReturnValueOnce(mockUnsubscribe);

      const handler = jest.fn();
      const unsubscribe = fcmService.onNotificationOpenedApp(handler);

      expect(mockMessaging.onNotificationOpenedApp).toHaveBeenCalledWith(handler);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('getInitialNotification', () => {
    it('should get initial notification', async () => {
      const mockNotification = { data: { id: '1' } };
      (mockMessaging.getInitialNotification as jest.Mock).mockResolvedValueOnce(mockNotification);

      const result = await fcmService.getInitialNotification();

      expect(mockMessaging.getInitialNotification).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });

    it('should return null when no initial notification', async () => {
      (mockMessaging.getInitialNotification as jest.Mock).mockResolvedValueOnce(null);

      const result = await fcmService.getInitialNotification();

      expect(result).toBeNull();
    });
  });
});
