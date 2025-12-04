// __tests__/unit/notifications/fcmService.test.ts
// FCMService unit tests - DeviceToken API uyumluluğu testleri
// Sprint 9-10: Push & In-app Notifications

import { fcmService } from '../../../src/features/notifications/services/fcmService';
import { apiClient } from '@services/apiClient';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('@services/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

jest.mock('@react-native-firebase/messaging', () => {
  const mockMessaging = jest.fn(() => ({
    requestPermission: jest.fn(),
    hasPermission: jest.fn(),
    getToken: jest.fn(),
    deleteToken: jest.fn(),
    onTokenRefresh: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
  }));
  mockMessaging.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    NOT_DETERMINED: 0,
    DENIED: -1,
  };
  return mockMessaging;
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('FCMService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform.OS mock
    Platform.OS = 'android';
  });

  describe('requestPermission', () => {
    it('should return true when permission is granted', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.requestPermission as jest.Mock).mockResolvedValue(1); // AUTHORIZED

      const result = await fcmService.requestPermission();

      expect(mockMessagingInstance.requestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true when provisional permission is granted', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.requestPermission as jest.Mock).mockResolvedValue(2); // PROVISIONAL

      const result = await fcmService.requestPermission();

      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.requestPermission as jest.Mock).mockResolvedValue(-1); // DENIED

      const result = await fcmService.requestPermission();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.requestPermission as jest.Mock).mockRejectedValue(new Error('Permission error'));

      const result = await fcmService.requestPermission();

      expect(result).toBe(false);
    });
  });

  describe('checkPermission', () => {
    it('should return true when authorized', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.hasPermission as jest.Mock).mockResolvedValue(1);

      const result = await fcmService.checkPermission();

      expect(result).toBe(true);
    });

    it('should return false when not authorized', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.hasPermission as jest.Mock).mockResolvedValue(-1);

      const result = await fcmService.checkPermission();

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return stored token if available', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('stored-fcm-token');

      const result = await fcmService.getToken();

      expect(result).toBe('stored-fcm-token');
    });

    it('should request new token if not stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.getToken as jest.Mock).mockResolvedValue('new-fcm-token');

      const result = await fcmService.getToken();

      expect(mockMessagingInstance.getToken).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@meslektas/fcm_token', 'new-fcm-token');
      expect(result).toBe('new-fcm-token');
    });

    it('should return null on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await fcmService.getToken();

      expect(result).toBeNull();
    });
  });

  describe('registerDevice', () => {
    it('should register device with correct request format (Android)', async () => {
      Platform.OS = 'android';
      const mockResponse = {
        id: 'device-123',
        userId: 'user-123',
        token: 'fcm-token',
        platform: 'ANDROID',
        deviceName: 'android 13',
        active: true,
        createdAt: '2024-01-15T10:00:00Z',
      };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await fcmService.registerDevice('fcm-token');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/devices/register', {
        token: 'fcm-token',
        platform: 'ANDROID',
        deviceName: expect.stringContaining('android'),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should register device with correct platform for iOS', async () => {
      Platform.OS = 'ios';
      const mockResponse = {
        id: 'device-456',
        userId: 'user-123',
        token: 'ios-token',
        platform: 'IOS',
        deviceName: 'ios 17',
        active: true,
        createdAt: '2024-01-15T10:00:00Z',
      };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      await fcmService.registerDevice('ios-token');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/devices/register', {
        token: 'ios-token',
        platform: 'IOS',
        deviceName: expect.stringContaining('ios'),
      });
    });
  });

  describe('unregisterDevice', () => {
    it('should unregister device with token', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: undefined });

      await fcmService.unregisterDevice('fcm-token');

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/devices/unregister', {
        token: 'fcm-token',
      });
    });
  });

  describe('unregisterAllDevices', () => {
    it('should call unregister-all endpoint', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: undefined });

      await fcmService.unregisterAllDevices();

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/devices/unregister-all');
    });
  });

  describe('removeTokenFromServer', () => {
    it('should unregister current token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('current-token');
      (apiClient.post as jest.Mock).mockResolvedValue({ data: undefined });

      await fcmService.removeTokenFromServer();

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/devices/unregister', {
        token: 'current-token',
      });
    });

    it('should not call API if no token stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await fcmService.removeTokenFromServer();

      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('clearToken', () => {
    it('should delete FCM token and clear storage', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.deleteToken as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await fcmService.clearToken();

      expect(mockMessagingInstance.deleteToken).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@meslektas/fcm_token');
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe to topic', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.subscribeToTopic as jest.Mock).mockResolvedValue(undefined);

      await fcmService.subscribeToTopic('announcements');

      expect(mockMessagingInstance.subscribeToTopic).toHaveBeenCalledWith('announcements');
    });
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe from topic', async () => {
      const mockMessagingInstance = messaging();
      (mockMessagingInstance.unsubscribeFromTopic as jest.Mock).mockResolvedValue(undefined);

      await fcmService.unsubscribeFromTopic('announcements');

      expect(mockMessagingInstance.unsubscribeFromTopic).toHaveBeenCalledWith('announcements');
    });
  });
});
