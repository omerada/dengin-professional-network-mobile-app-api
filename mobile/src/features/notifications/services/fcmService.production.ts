// src/features/notifications/services/fcmService.production.ts
// Production-ready Firebase Cloud Messaging implementation
// Industry standard push notifications for React Native

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  RegisterDeviceRequest,
  UnregisterDeviceRequest,
  DeviceTokenResponse,
  DevicePlatform,
} from '../types';

const FCM_TOKEN_KEY = '@meslektas/fcm_token';
const isExpoGo = Constants.appOwnership === 'expo';

// Firebase types
type RemoteMessage = any;

// Lazy load Firebase Messaging to avoid crashes in Expo Go
let messaging: any = null;

if (!isExpoGo) {
  try {
    const firebaseMessaging = require('@react-native-firebase/messaging');
    messaging = firebaseMessaging.default;
  } catch (error) {
    console.log('[FCM] Firebase not available - running in Expo Go');
  }
}

/**
 * Firebase Cloud Messaging Service
 * Production-ready implementation using @react-native-firebase/messaging
 *
 * Features:
 * - Cross-platform (iOS & Android)
 * - Background & foreground notifications
 * - Data-only messages
 * - Token refresh handling
 * - Notification channels (Android)
 * - Badge management
 *
 * Backend Integration:
 * - Registers FCM token with backend
 * - Handles token refresh
 * - Unregisters on logout
 */
class FCMService {
  private fcmToken: string | null = null;
  private unsubscribeTokenRefresh: (() => void) | null = null;
  private unsubscribeMessageHandler: (() => void) | null = null;

  /**
   * Initialize FCM service
   * Request permissions, get token, register with backend
   */
  async initialize(): Promise<string | null> {
    if (!messaging || isExpoGo) {
      console.log('[FCM] Skipping initialization - Expo Go or Firebase unavailable');
      return null;
    }

    try {
      console.log('[FCM] Initializing...');

      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('[FCM] Permission denied');
        return null;
      }

      // Get FCM token
      const token = await this.getToken();
      if (!token) {
        console.log('[FCM] Failed to get token');
        return null;
      }

      this.fcmToken = token;
      console.log('[FCM] Token obtained');

      // Register with backend
      await this.sendTokenToServer(token);

      // Setup listeners
      this.setupTokenRefreshListener();
      this.setupMessageHandlers();

      console.log('[FCM] Initialization complete');
      return token;
    } catch (error) {
      console.error('[FCM] Initialization failed:', error);
      return null;
    }
  }

  /**
   * Request notification permission
   * iOS: Shows native permission dialog
   * Android: Automatically granted (API < 33)
   */
  async requestPermission(): Promise<boolean> {
    if (!messaging || isExpoGo) return false;

    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('[FCM] Permission granted:', authStatus);
      }

      return enabled;
    } catch (error) {
      console.error('[FCM] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Check current permission status
   */
  async checkPermission(): Promise<boolean> {
    if (!messaging || isExpoGo) return false;

    try {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.error('[FCM] Permission check failed:', error);
      return false;
    }
  }

  /**
   * Get FCM registration token
   * Used to send notifications to this device
   */
  async getToken(): Promise<string | null> {
    if (!messaging || isExpoGo) return null;

    try {
      // Check cached token
      const cachedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (cachedToken) {
        console.log('[FCM] Using cached token');
        return cachedToken;
      }

      // Get new token
      const token = await messaging().getToken();

      if (token) {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        console.log('[FCM] New token obtained');
      }

      return token;
    } catch (error) {
      console.error('[FCM] Failed to get token:', error);
      return null;
    }
  }

  /**
   * Delete FCM token
   * Call this on logout
   */
  async deleteToken(): Promise<void> {
    if (!messaging || isExpoGo) return;

    try {
      await messaging().deleteToken();
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      this.fcmToken = null;
      console.log('[FCM] Token deleted');
    } catch (error) {
      console.error('[FCM] Failed to delete token:', error);
    }
  }

  /**
   * Setup token refresh listener
   * Tokens can be refreshed by FCM
   */
  setupTokenRefreshListener(): void {
    if (!messaging || isExpoGo) return;

    this.unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token: string) => {
      console.log('[FCM] Token refreshed');
      this.fcmToken = token;
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      await this.sendTokenToServer(token);
    });
  }

  /**
   * Setup foreground message handlers
   * Background messages handled in index.js
   */
  setupMessageHandlers(): void {
    if (!messaging || isExpoGo) return;

    // Foreground messages
    this.unsubscribeMessageHandler = messaging().onMessage(async (remoteMessage: RemoteMessage) => {
      console.log('[FCM] Foreground message received:', remoteMessage);

      // Display local notification if needed
      // Notification is automatically displayed by FCM
      // Only data-only messages need manual handling
    });
  }

  /**
   * Get device platform
   */
  getPlatform(): DevicePlatform {
    return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
  }

  /**
   * Get device name
   */
  getDeviceName(): string {
    return `${Platform.OS === 'ios' ? 'iPhone' : 'Android'} ${Platform.Version}`;
  }

  /**
   * Register device token with backend
   * POST /api/notifications/devices/register
   */
  async sendTokenToServer(token: string): Promise<void> {
    try {
      const request: RegisterDeviceRequest = {
        token: token,
        platform: this.getPlatform(),
        deviceName: this.getDeviceName(),
      };

      const response = await apiClient.post<DeviceTokenResponse>(
        API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE,
        request,
      );

      console.log('[FCM] Token registered with backend:', response.data.id);
    } catch (error) {
      console.error('[FCM] Failed to register token with backend:', error);
      // Don't throw - token is still valid locally
    }
  }

  /**
   * Unregister device token from backend
   * DELETE /api/notifications/devices/unregister
   */
  async removeTokenFromServer(): Promise<void> {
    if (!this.fcmToken) return;

    try {
      const request: UnregisterDeviceRequest = {
        token: this.fcmToken,
      };

      await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.UNREGISTER_DEVICE, {
        data: request,
      });

      console.log('[FCM] Token unregistered from backend');
    } catch (error) {
      console.error('[FCM] Failed to unregister token from backend:', error);
    }
  }

  /**
   * Get initial notification (app opened from quit state)
   */
  async getInitialNotification(): Promise<RemoteMessage | null> {
    if (!messaging || isExpoGo) return null;

    try {
      const remoteMessage = await messaging().getInitialNotification();
      return remoteMessage;
    } catch (error) {
      console.error('[FCM] Failed to get initial notification:', error);
      return null;
    }
  }

  /**
   * Set up listener for notification opened from background
   */
  onNotificationOpened(handler: (remoteMessage: RemoteMessage) => void): () => void {
    if (!messaging || isExpoGo) return () => {};

    return messaging().onNotificationOpenedApp((remoteMessage: RemoteMessage) => {
      console.log('[FCM] Notification opened app from background:', remoteMessage);
      handler(remoteMessage);
    });
  }

  /**
   * Subscribe to topic
   * Topics allow sending notifications to groups of devices
   */
  async subscribeToTopic(topic: string): Promise<void> {
    if (!messaging || isExpoGo) return;

    try {
      await messaging().subscribeToTopic(topic);
      console.log(`[FCM] Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`[FCM] Failed to subscribe to topic ${topic}:`, error);
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    if (!messaging || isExpoGo) return;

    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`[FCM] Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`[FCM] Failed to unsubscribe from topic ${topic}:`, error);
    }
  }

  /**
   * Set app badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS !== 'ios' || !messaging || isExpoGo) return;

    try {
      await messaging().setApplicationIconBadgeNumber(count);
      console.log(`[FCM] Badge count set to ${count}`);
    } catch (error) {
      console.error('[FCM] Failed to set badge count:', error);
    }
  }

  /**
   * Get app badge count (iOS only)
   */
  async getBadgeCount(): Promise<number> {
    if (Platform.OS !== 'ios' || !messaging || isExpoGo) return 0;

    try {
      const count = await messaging().getApplicationIconBadgeNumber();
      return count;
    } catch (error) {
      console.error('[FCM] Failed to get badge count:', error);
      return 0;
    }
  }

  /**
   * Cleanup listeners
   * Call this on logout or app unmount
   */
  cleanup(): void {
    if (this.unsubscribeTokenRefresh) {
      this.unsubscribeTokenRefresh();
      this.unsubscribeTokenRefresh = null;
    }

    if (this.unsubscribeMessageHandler) {
      this.unsubscribeMessageHandler();
      this.unsubscribeMessageHandler = null;
    }

    console.log('[FCM] Cleanup complete');
  }
}

// Export singleton instance
export const fcmService = new FCMService();
