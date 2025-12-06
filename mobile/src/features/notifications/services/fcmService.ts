// src/features/notifications/services/fcmService.ts
// Firebase Cloud Messaging service - Stub implementation for Expo
// Firebase'in managed Expo workflow ile uyumlu olmaması nedeniyle stub

import { Platform } from 'react-native';
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
const DEVICE_ID_KEY = '@meslektas/device_id';

/**
 * Remote Message tipi - Expo push notification formatına uygun
 */
export interface RemoteMessage {
  messageId?: string;
  notification?: {
    title?: string;
    body?: string;
    imageUrl?: string;
  };
  data?: Record<string, string>;
  sentTime?: number;
}

/**
 * FCM Servis sınıfı - Stub implementation
 * Expo'da gerçek Firebase yerine expo-notifications kullanılacak
 */
class FCMService {
  private token: string | null = null;

  /**
   * Bildirim izni iste - stub
   */
  async requestPermission(): Promise<boolean> {
    // Development stub - production will use expo-notifications
    return true;
  }

  /**
   * İzin durumunu kontrol et - stub
   */
  async checkPermission(): Promise<boolean> {
    // Development stub - production will use expo-notifications
    return true;
  }

  /**
   * FCM token al - stub
   */
  async getToken(): Promise<string | null> {
    try {
      // Check if already have token
      if (this.token) {
        return this.token;
      }

      // Get stored token
      const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (storedToken) {
        this.token = storedToken;
        return storedToken;
      }

      // Generate a placeholder token for development
      const deviceId = await this.getDeviceId();
      const token = `expo-push-token-${deviceId}`;
      this.token = token;
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);

      return token;
    } catch (error) {
      console.error('[FCM Stub] Error getting token:', error);
      return null;
    }
  }

  /**
   * Platform bilgisini al
   */
  private getPlatform(): DevicePlatform {
    return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
  }

  /**
   * Cihaz adını al
   */
  private getDeviceName(): string {
    return `${Platform.OS} ${Platform.Version}`;
  }

  /**
   * Cihazı sunucuya kaydet
   * POST /api/devices/register
   */
  async registerDevice(token: string): Promise<DeviceTokenResponse> {
    const request: RegisterDeviceRequest = {
      token,
      platform: this.getPlatform(),
      deviceName: this.getDeviceName(),
    };

    const response = await apiClient.post<DeviceTokenResponse>(
      API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE,
      request,
    );

    return response.data;
  }

  /**
   * Cihaz kaydını sil
   * POST /api/devices/unregister
   */
  async unregisterDevice(token: string): Promise<void> {
    const request: UnregisterDeviceRequest = { token };

    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.UNREGISTER_DEVICE, request);
  }

  /**
   * Tüm cihazların kaydını sil (güvenlik için)
   * POST /api/devices/unregister-all
   */
  async unregisterAllDevices(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.UNREGISTER_ALL_DEVICES);
  }

  /**
   * Token'ı sunucuya gönder
   */
  async sendTokenToServer(token: string): Promise<void> {
    try {
      await this.registerDevice(token);
    } catch (error) {
      console.error('[FCM Stub] Error sending token to server:', error);
      throw error;
    }
  }

  /**
   * Token'ı sunucudan kaldır
   */
  async removeTokenFromServer(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        await this.unregisterDevice(token);
      }
    } catch (error) {
      console.error('[FCM Stub] Error removing token from server:', error);
    }
  }

  /**
   * Tüm cihazları sunucudan kaldır (logout için)
   */
  async removeAllTokensFromServer(): Promise<void> {
    try {
      await this.unregisterAllDevices();
    } catch (error) {
      console.error('[FCM Stub] Error removing all tokens from server:', error);
    }
  }

  /**
   * Token yenilenme dinleyicisi kur - stub
   */
  setupTokenRefreshListener(_onRefresh: (token: string) => void): () => void {
    return () => {
      // Stub cleanup
    };
  }

  /**
   * Ön plan bildirimi dinleyicisi - stub
   */
  onForegroundMessage(_handler: (message: RemoteMessage) => void): () => void {
    return () => {
      // Stub cleanup
    };
  }

  /**
   * Arka plan bildirimi tıklama dinleyicisi - stub
   */
  onNotificationOpenedApp(_handler: (message: RemoteMessage) => void): () => void {
    return () => {
      // Stub cleanup
    };
  }

  /**
   * Uygulama kapalıyken açılan bildirim - stub
   */
  async getInitialNotification(): Promise<RemoteMessage | null> {
    return null;
  }

  /**
   * Arka plan mesaj işleyicisi ayarla - stub
   */
  setBackgroundMessageHandler(_handler: (message: RemoteMessage) => Promise<void>): void {
    // Stub - production will use expo-notifications
  }

  /**
   * Belirli bir konuya abone ol - stub
   */
  async subscribeToTopic(topic: string): Promise<void> {
    // Stub - production will use expo-notifications
    void topic;
  }

  /**
   * Belirli bir konudan aboneliği kaldır - stub
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    // Stub - production will use expo-notifications
    void topic;
  }

  /**
   * Token'ı temizle
   */
  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      this.token = null;
    } catch (error) {
      console.error('[FCM Stub] Error clearing token:', error);
    }
  }

  /**
   * Cihaz ID'si al
   */
  private async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }
}

export const fcmService = new FCMService();
export default fcmService;
