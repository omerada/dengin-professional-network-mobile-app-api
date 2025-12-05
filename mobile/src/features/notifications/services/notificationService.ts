// src/features/notifications/services/notificationService.ts
// Notification API service - Backend API'sine %100 uyumlu
// Backend: com.meslektas.notification.api.NotificationController
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  NotificationResponse,
  NotificationListResponse,
  NotificationPreferencesResponse,
  NotificationPreferencesRequest,
  MarkAsReadRequest,
} from '../types';

/**
 * Bildirim API servisi - Backend NotificationController ile uyumlu
 * @see NotificationController.java
 */
class NotificationService {
  /**
   * Bildirimleri getir (sayfalama destekli)
   * GET /api/notifications
   *
   * @param page Sayfa numarası (0-indexed)
   * @param size Sayfa boyutu
   * @param unreadOnly Sadece okunmamışları getir
   */
  async getNotifications(
    page: number = 0,
    size: number = 20,
    unreadOnly: boolean = false,
  ): Promise<NotificationListResponse> {
    const response = await apiClient.get<NotificationListResponse>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
      {
        params: { page, size, unreadOnly },
      },
    );
    return response.data;
  }

  /**
   * Tek bildirim getir
   * GET /api/notifications/{notificationId}
   */
  async getNotification(notificationId: string): Promise<NotificationResponse> {
    const response = await apiClient.get<NotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId),
    );
    return response.data;
  }

  /**
   * Okunmamış bildirim sayısını getir
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ unreadCount: number }>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
    );
    return response.data.unreadCount;
  }

  /**
   * Bildirimi okundu olarak işaretle
   * POST /api/notifications/{notificationId}/read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const response = await apiClient.post<NotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId),
    );
    return response.data;
  }

  /**
   * Birden fazla bildirimi okundu olarak işaretle
   * POST /api/notifications/mark-as-read
   *
   * @param request markAll: true veya notificationIds listesi
   */
  async markMultipleAsRead(request: MarkAsReadRequest): Promise<{ markedAsRead: number }> {
    const response = await apiClient.post<{ markedAsRead: number }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
      request,
    );
    return response.data;
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   * POST /api/notifications/mark-as-read (markAll: true)
   */
  async markAllAsRead(): Promise<number> {
    const response = await this.markMultipleAsRead({ markAll: true });
    return response.markedAsRead;
  }

  /**
   * Bildirim tercihlerini getir
   * GET /api/notifications/preferences
   */
  async getPreferences(): Promise<NotificationPreferencesResponse> {
    const response = await apiClient.get<NotificationPreferencesResponse>(
      API_ENDPOINTS.NOTIFICATIONS.SETTINGS,
    );
    return response.data;
  }

  /**
   * Bildirim tercihlerini güncelle
   * PUT /api/notifications/preferences
   */
  async updatePreferences(
    request: NotificationPreferencesRequest,
  ): Promise<NotificationPreferencesResponse> {
    const response = await apiClient.put<NotificationPreferencesResponse>(
      API_ENDPOINTS.NOTIFICATIONS.UPDATE_SETTINGS,
      request,
    );
    return response.data;
  }

  /**
   * Belirli bildirim türü için tercihleri güncelle
   */
  async updateTypePreference(
    type: string,
    channels: string[],
  ): Promise<NotificationPreferencesResponse> {
    return this.updatePreferences({
      typeSettings: { [type]: channels as any },
    });
  }

  /**
   * Push bildirimlerini aç/kapat
   */
  async togglePushNotifications(enabled: boolean): Promise<NotificationPreferencesResponse> {
    return this.updatePreferences({ pushEnabled: enabled });
  }

  /**
   * E-posta bildirimlerini aç/kapat
   */
  async toggleEmailNotifications(enabled: boolean): Promise<NotificationPreferencesResponse> {
    return this.updatePreferences({ emailEnabled: enabled });
  }

  /**
   * Sessiz saatleri ayarla
   */
  async setQuietHours(
    start: number | null,
    end: number | null,
  ): Promise<NotificationPreferencesResponse> {
    return this.updatePreferences({
      quietHoursStart: start,
      quietHoursEnd: end,
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
