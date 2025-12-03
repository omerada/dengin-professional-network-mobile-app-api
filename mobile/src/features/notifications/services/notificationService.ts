// src/features/notifications/services/notificationService.ts
// Notification API service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { apiClient } from '@services/apiClient';
import type {
  Notification,
  NotificationSettings,
  PaginatedNotifications,
} from '../types';

/**
 * Bildirim API servisi
 */
class NotificationService {
  /**
   * Bildirimleri getir
   */
  async getNotifications(
    limit: number = 20,
    cursor?: string
  ): Promise<PaginatedNotifications> {
    const response = await apiClient.get<PaginatedNotifications>(
      '/notifications',
      {
        params: { limit, cursor },
      }
    );
    return response.data;
  }

  /**
   * Okunmamış bildirim sayısını getir
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      '/notifications/unread-count'
    );
    return response.data.count;
  }

  /**
   * Bildirimi okundu olarak işaretle
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`);
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  }

  /**
   * Bildirimi sil
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`);
  }

  /**
   * Tüm bildirimleri temizle
   */
  async clearAllNotifications(): Promise<void> {
    await apiClient.delete('/notifications/clear-all');
  }

  /**
   * Bildirim ayarlarını getir
   */
  async getSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get<NotificationSettings>(
      '/users/notification-settings'
    );
    return response.data;
  }

  /**
   * Bildirim ayarlarını güncelle
   */
  async updateSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const response = await apiClient.patch<NotificationSettings>(
      '/users/notification-settings',
      settings
    );
    return response.data;
  }

  /**
   * FCM token'ı kaydet
   */
  async saveFcmToken(
    token: string,
    platform: string,
    deviceId: string
  ): Promise<void> {
    await apiClient.post('/users/fcm-token', {
      token,
      platform,
      deviceId,
    });
  }

  /**
   * FCM token'ı sil
   */
  async deleteFcmToken(token: string): Promise<void> {
    await apiClient.delete('/users/fcm-token', {
      data: { token },
    });
  }

  /**
   * Test bildirimi gönder (geliştirme için)
   */
  async sendTestNotification(): Promise<void> {
    await apiClient.post('/notifications/test');
  }
}

export const notificationService = new NotificationService();
export default notificationService;
