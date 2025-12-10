// src/features/notifications/services/pushNotificationHandler.ts
// Handles push notifications from backend via WebSocket and REST API
// Integrates with Firebase Cloud Messaging

import { fcmService } from './fcmService.production';
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
 * Note: With FCM, notifications are handled automatically by Firebase
 * This handler is primarily for WebSocket notifications
 */
class PushNotificationHandler {
  /**
   * Process notification from backend (WebSocket or REST)
   */
  async handleBackendNotification(payload: PushNotificationPayload): Promise<void> {
    try {
      console.log('[PushNotificationHandler] Processing notification:', payload);

      // With FCM, local notifications are displayed automatically
      // This is mainly for updating the store when receiving via WebSocket

      // Update store will be handled automatically via WebSocket/REST listeners
    } catch (error) {
      console.error('[PushNotificationHandler] Error handling notification:', error);
    }
  }

  /**
   * Update badge count
   */
  async updateBadgeCount(count: number): Promise<void> {
    await fcmService.setBadgeCount(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await fcmService.setBadgeCount(0);
  }

  /**
   * Clear all notifications (iOS only)
   */
  async clearAllNotifications(): Promise<void> {
    // FCM doesn't have a dismiss all method
    // This would need to be handled per-platform if needed
    console.log('[PushNotificationHandler] Clear all notifications called');
  }
}

export const pushNotificationHandler = new PushNotificationHandler();
export default pushNotificationHandler;
