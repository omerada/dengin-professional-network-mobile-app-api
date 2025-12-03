// src/features/notifications/services/fcmService.ts
// Firebase Cloud Messaging service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { apiClient } from '@services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = '@meslektas/fcm_token';

/**
 * FCM Servis sınıfı
 */
class FCMService {
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
   * Token'ı sunucuya gönder
   */
  async sendTokenToServer(token: string): Promise<void> {
    try {
      await apiClient.post('/users/fcm-token', {
        token,
        platform: Platform.OS,
        deviceId: await this.getDeviceId(),
      });
      console.log('[FCM] Token sent to server');
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
        await apiClient.delete('/users/fcm-token', {
          data: { token },
        });
        console.log('[FCM] Token removed from server');
      }
    } catch (error) {
      console.error('[FCM] Error removing token from server:', error);
    }
  }

  /**
   * Token yenilenme dinleyicisi kur
   */
  setupTokenRefreshListener(
    onRefresh: (token: string) => void
  ): () => void {
    const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
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
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => void
  ): () => void {
    return messaging().onMessage(handler);
  }

  /**
   * Arka plan bildirimi tıklama dinleyicisi
   */
  onNotificationOpenedApp(
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => void
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
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<void>
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
