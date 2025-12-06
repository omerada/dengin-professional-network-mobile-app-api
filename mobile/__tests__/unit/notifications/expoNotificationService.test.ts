// __tests__/unit/notifications/expoNotificationService.test.ts
// Tests for Expo notification service

import { expoNotificationService } from '@features/notifications/services/expoNotificationService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@core/api/client';

// Mock modules
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@core/api/client');

describe('ExpoNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize on physical device with permission', async () => {
      // Mock device check
      (Device as any).isDevice = true;

      // Mock permissions
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      // Mock token
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[test-token-123]',
      });

      // Mock AsyncStorage
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Mock API call
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          platform: 'IOS',
          deviceName: 'iPhone 14',
          active: true,
        },
      });

      const token = await expoNotificationService.initialize();

      expect(token).toBe('ExponentPushToken[test-token-123]');
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/register'),
        expect.objectContaining({
          token: 'ExponentPushToken[test-token-123]',
        }),
      );
    });

    it('should return null on simulator', async () => {
      (Device as any).isDevice = false;

      const token = await expoNotificationService.initialize();

      expect(token).toBeNull();
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should return null if permission denied', async () => {
      (Device as any).isDevice = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const token = await expoNotificationService.initialize();

      expect(token).toBeNull();
    });
  });

  describe('requestPermissions', () => {
    it('should request permissions if not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const granted = await expoNotificationService.requestPermissions();

      expect(granted).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should not request if already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const granted = await expoNotificationService.requestPermissions();

      expect(granted).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });
  });

  describe('displayLocalNotification', () => {
    it('should display notification with correct data', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');

      await expoNotificationService.displayLocalNotification('Test Title', 'Test Body', {
        type: 'NEW_MESSAGE',
        conversationId: '123',
        senderId: '456',
      });

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          title: 'Test Title',
          body: 'Test Body',
          data: expect.objectContaining({
            type: 'NEW_MESSAGE',
          }),
        }),
        trigger: null,
      });
    });
  });

  describe('setBadgeCount', () => {
    it('should set badge count', async () => {
      (Notifications.setBadgeCountAsync as jest.Mock).mockResolvedValue(undefined);

      await expoNotificationService.setBadgeCount(5);

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(5);
    });
  });

  describe('clearAllNotifications', () => {
    it('should clear all notifications', async () => {
      (Notifications.dismissAllNotificationsAsync as jest.Mock).mockResolvedValue(undefined);

      await expoNotificationService.clearAllNotifications();

      expect(Notifications.dismissAllNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('registerWithBackend', () => {
    it('should register device with backend', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          id: 1,
          platform: 'ANDROID',
          deviceName: 'Pixel 6',
          active: true,
        },
      });

      await expoNotificationService.registerWithBackend('test-token');

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/register'),
        expect.objectContaining({
          token: 'test-token',
          platform: expect.stringMatching(/IOS|ANDROID/),
        }),
      );
    });

    it('should throw on registration error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(expoNotificationService.registerWithBackend('test-token')).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('getChannelId', () => {
    it('should return correct channel for message type', () => {
      const channelId = expoNotificationService.getChannelId('NEW_MESSAGE');
      expect(channelId).toBe('messages');
    });

    it('should return correct channel for match type', () => {
      const channelId = expoNotificationService.getChannelId('NEW_MATCH');
      expect(channelId).toBe('matches');
    });

    it('should return default channel for unknown type', () => {
      const channelId = expoNotificationService.getChannelId('UNKNOWN' as any);
      expect(channelId).toBe('default');
    });
  });
});
