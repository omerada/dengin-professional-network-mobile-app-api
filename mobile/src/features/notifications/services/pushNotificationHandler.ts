// src/features/notifications/services/pushNotificationHandler.ts
// Handles push notifications from backend via WebSocket and REST API
// Integrates with Expo notification service

import { expoNotificationService } from './expoNotificationService';
import { notificationHandler } from './notificationHandler.production';
import type { NotificationData, NotificationType } from '../types';

/**
 * Push notification payload from backend
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  data: NotificationData;
  type: NotificationType;
}

/**
 * Handles push notifications received from backend
 */
class PushNotificationHandler {
  /**
   * Process notification from backend (WebSocket or REST)
   */
  async handleBackendNotification(payload: PushNotificationPayload): Promise<void> {
    try {
      console.log('[PushNotificationHandler] Processing notification:', payload);

      // Display local notification
      await expoNotificationService.displayLocalNotification(
        payload.title,
        payload.body,
        payload.data,
      );

      // Update store via notification handler
      // Store will be updated automatically via WebSocket/REST listeners
    } catch (error) {
      console.error('[PushNotificationHandler] Error handling notification:', error);
    }
  }

  /**
   * Handle notification tap
   */
  handleNotificationTap(data: NotificationData): void {
    notificationHandler.handleNotificationNavigation(data);
  }

  /**
   * Update badge count
   */
  async updateBadgeCount(count: number): Promise<void> {
    await expoNotificationService.setBadgeCount(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await expoNotificationService.setBadgeCount(0);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await expoNotificationService.clearAllNotifications();
  }
}

export const pushNotificationHandler = new PushNotificationHandler();
export default pushNotificationHandler;
