// src/features/notifications/services/fcmService.ts
// Firebase Cloud Messaging service - Stub implementation for Expo
// Firebase'in managed Expo workflow ile uyumlu olmaması nedeniyle stub

import { Platform } from 'react-native';
import { apiClient } from '@core/api/client';
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
  private readonly DEVICE_API_PATH = '/api/v1/devices';
  private token: string | null = null;
  private listeners: Map<string, (() => void)[]> = new Map();

  /**
   * Bildirim izni iste - stub
   */
  async requestPermission(): Promise<boolean> {
    console.log('[FCM Stub] requestPermission called');
    // Gerçek implementasyonda expo-notifications kullanılacak
    return true;
  }

  /**
   * İzin durumunu kontrol et - stub
   */
  async checkPermission(): Promise<boolean> {
    console.log('[FCM Stub] checkPermission called');
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
      console.log('[FCM Stub] Token generated:', token.substring(0, 20) + '...');

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
   * POST /api/v1/devices/register
   */
  async registerDevice(token: string): Promise<DeviceTokenResponse> {
    const request: RegisterDeviceRequest = {
      token,
      platform: this.getPlatform(),
      deviceName: this.getDeviceName(),
    };

    const response = await apiClient.post<DeviceTokenResponse>(
      `${this.DEVICE_API_PATH}/register`,
      request,
    );

    console.log('[FCM Stub] Device registered successfully');
    return response.data;
  }

  /**
   * Cihaz kaydını sil
   * POST /api/v1/devices/unregister
   */
  async unregisterDevice(token: string): Promise<void> {
    const request: UnregisterDeviceRequest = { token };

    await apiClient.post(`${this.DEVICE_API_PATH}/unregister`, request);
    console.log('[FCM Stub] Device unregistered successfully');
  }

  /**
   * Tüm cihazların kaydını sil (güvenlik için)
   * POST /api/v1/devices/unregister-all
   */
  async unregisterAllDevices(): Promise<void> {
    await apiClient.post(`${this.DEVICE_API_PATH}/unregister-all`);
    console.log('[FCM Stub] All devices unregistered');
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
  setupTokenRefreshListener(onRefresh: (token: string) => void): () => void {
    console.log('[FCM Stub] setupTokenRefreshListener called');
    return () => {
      console.log('[FCM Stub] Token refresh listener removed');
    };
  }

  /**
   * Ön plan bildirimi dinleyicisi - stub
   */
  onForegroundMessage(handler: (message: RemoteMessage) => void): () => void {
    console.log('[FCM Stub] onForegroundMessage listener added');
    return () => {
      console.log('[FCM Stub] Foreground message listener removed');
    };
  }

  /**
   * Arka plan bildirimi tıklama dinleyicisi - stub
   */
  onNotificationOpenedApp(handler: (message: RemoteMessage) => void): () => void {
    console.log('[FCM Stub] onNotificationOpenedApp listener added');
    return () => {
      console.log('[FCM Stub] Notification opened listener removed');
    };
  }

  /**
   * Uygulama kapalıyken açılan bildirim - stub
   */
  async getInitialNotification(): Promise<RemoteMessage | null> {
    console.log('[FCM Stub] getInitialNotification called');
    return null;
  }

  /**
   * Arka plan mesaj işleyicisi ayarla - stub
   */
  setBackgroundMessageHandler(handler: (message: RemoteMessage) => Promise<void>): void {
    console.log('[FCM Stub] setBackgroundMessageHandler called');
  }

  /**
   * Belirli bir konuya abone ol - stub
   */
  async subscribeToTopic(topic: string): Promise<void> {
    console.log(`[FCM Stub] subscribeToTopic: ${topic}`);
  }

  /**
   * Belirli bir konudan aboneliği kaldır - stub
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    console.log(`[FCM Stub] unsubscribeFromTopic: ${topic}`);
  }

  /**
   * Token'ı temizle
   */
  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      this.token = null;
      console.log('[FCM Stub] Token cleared');
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
