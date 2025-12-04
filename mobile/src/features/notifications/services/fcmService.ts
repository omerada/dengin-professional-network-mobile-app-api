// src/features/notifications/services/fcmService.ts
// Firebase Cloud Messaging service - Backend DeviceTokenController ile uyumlu
// Backend: com.meslektas.notification.api.DeviceTokenController
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
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
 * FCM Servis sınıfı - Backend DeviceTokenController ile uyumlu
 * @see DeviceTokenController.java
 */
class FCMService {
  private readonly DEVICE_API_PATH = '/api/v1/devices';
  private token: string | null = null;

  /**
   * Bildirim izni iste
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('[FCM] Permission granted:', authStatus);
      } else {
        console.log('[FCM] Permission denied');
      }

      return enabled;
    } catch (error) {
      console.error('[FCM] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * İzin durumunu kontrol et
   */
  async checkPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.error('[FCM] Error checking permission:', error);
      return false;
    }
  }

  /**
   * FCM token al
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

      // Request new token
      const token = await messaging().getToken();
      if (token) {
        this.token = token;
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        console.log('[FCM] Token received:', token.substring(0, 20) + '...');
      }

      return token;
    } catch (error) {
      console.error('[FCM] Error getting token:', error);
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

    console.log('[FCM] Device registered successfully');
    return response.data;
  }

  /**
   * Cihaz kaydını sil
   * POST /api/v1/devices/unregister
   */
  async unregisterDevice(token: string): Promise<void> {
    const request: UnregisterDeviceRequest = { token };

    await apiClient.post(`${this.DEVICE_API_PATH}/unregister`, request);
    console.log('[FCM] Device unregistered successfully');
  }

  /**
   * Tüm cihazların kaydını sil (güvenlik için)
   * POST /api/v1/devices/unregister-all
   */
  async unregisterAllDevices(): Promise<void> {
    await apiClient.post(`${this.DEVICE_API_PATH}/unregister-all`);
    console.log('[FCM] All devices unregistered');
  }

  /**
   * Token'ı sunucuya gönder (eski API uyumluluğu için)
   * @deprecated registerDevice kullanın
   */
  async sendTokenToServer(token: string): Promise<void> {
    try {
      await this.registerDevice(token);
    } catch (error) {
      console.error('[FCM] Error sending token to server:', error);
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
      console.error('[FCM] Error removing token from server:', error);
    }
  }

  /**
   * Tüm cihazları sunucudan kaldır (logout için)
   */
  async removeAllTokensFromServer(): Promise<void> {
    try {
      await this.unregisterAllDevices();
    } catch (error) {
      console.error('[FCM] Error removing all tokens from server:', error);
    }
  }

  /**
   * Token yenilenme dinleyicisi kur
   */
  setupTokenRefreshListener(onRefresh: (token: string) => void): () => void {
    const unsubscribe = messaging().onTokenRefresh(async newToken => {
      console.log('[FCM] Token refreshed');
      this.token = newToken;
      await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);

      try {
        await this.sendTokenToServer(newToken);
        onRefresh(newToken);
      } catch (error) {
        console.error('[FCM] Error handling token refresh:', error);
      }
    });

    return unsubscribe;
  }

  /**
   * Ön plan bildirimi dinleyicisi
   */
  onForegroundMessage(
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  ): () => void {
    return messaging().onMessage(handler);
  }

  /**
   * Arka plan bildirimi tıklama dinleyicisi
   */
  onNotificationOpenedApp(
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => void,
  ): () => void {
    return messaging().onNotificationOpenedApp(handler);
  }

  /**
   * Uygulama kapalıyken açılan bildirim
   */
  async getInitialNotification(): Promise<FirebaseMessagingTypes.RemoteMessage | null> {
    return messaging().getInitialNotification();
  }

  /**
   * Arka plan mesaj işleyicisi ayarla
   */
  setBackgroundMessageHandler(
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<void>,
  ): void {
    messaging().setBackgroundMessageHandler(handler);
  }

  /**
   * Belirli bir konuya abone ol
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`[FCM] Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`[FCM] Error subscribing to topic ${topic}:`, error);
    }
  }

  /**
   * Belirli bir konudan aboneliği kaldır
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`[FCM] Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`[FCM] Error unsubscribing from topic ${topic}:`, error);
    }
  }

  /**
   * Token'ı temizle
   */
  async clearToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      this.token = null;
      console.log('[FCM] Token cleared');
    } catch (error) {
      console.error('[FCM] Error clearing token:', error);
    }
  }

  /**
   * Cihaz ID'si al (basit implementasyon)
   */
  private async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem('@meslektas/device_id');
    if (!deviceId) {
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem('@meslektas/device_id', deviceId);
    }
    return deviceId;
  }
}

export const fcmService = new FCMService();
export default fcmService;
