// src/features/notifications/services/notifeeService.ts
// Notifee local notification service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { NOTIFICATION_CHANNELS, NotificationType, NotificationData } from '../types';

// Lazy load notifee to handle missing native module gracefully
let notifee: any = null;
let AndroidImportance: any = null;
let AndroidStyle: any = null;
let AndroidCategory: any = null;

// Export EventType as 'any' when module is not available
export const EventType = (() => {
  try {
    const notifeeModule = require('@notifee/react-native');
    return notifeeModule.EventType || {};
  } catch {
    return {};
  }
})();

try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default;
  AndroidImportance = notifeeModule.AndroidImportance;
  AndroidStyle = notifeeModule.AndroidStyle;
  AndroidCategory = notifeeModule.AndroidCategory;
} catch (error) {
  // Silently handle missing module in development
  // Production builds will have native module available
}

/**
 * Notifee yerel bildirim servisi
 * Gracefully handles missing native module
 */
class NotifeeService {
  private initialized = false;
  private isAvailable = notifee !== null;

  /**
   * Servisi başlat
   */
  async initialize(): Promise<void> {
    if (this.initialized || !this.isAvailable) return;

    try {
      await this.createChannels();
      this.initialized = true;
    } catch (error) {
      console.error('[Notifee] Initialization error:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Android bildirim kanallarını oluştur
   */
  private async createChannels(): Promise<void> {
    if (!this.isAvailable || !notifee) return;

    const importanceMap: Record<string, any> = {
      none: AndroidImportance?.NONE || 0,
      min: AndroidImportance?.MIN || 1,
      low: AndroidImportance?.LOW || 2,
      default: AndroidImportance?.DEFAULT || 3,
      high: AndroidImportance?.HIGH || 4,
    };

    for (const channel of NOTIFICATION_CHANNELS) {
      await notifee.createChannel({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        importance: importanceMap[channel.importance] || importanceMap.default,
        sound: channel.sound || 'default',
        vibration: channel.vibration ?? true,
      });
    }
  }

  /**
   * Bildirim göster
   */
  async displayNotification(options: {
    id?: string;
    title: string;
    body: string;
    data?: NotificationData;
    type?: NotificationType;
    imageUrl?: string;
  }): Promise<string> {
    if (!this.isAvailable || !notifee) {
      // Silently skip in development when native module not available
      return '';
    }

    const { id, title, body, data, type = 'WELCOME', imageUrl } = options;

    const channelId = this.getChannelForType(type);

    try {
      const notificationId = await notifee.displayNotification({
        id,
        title,
        body,
        data: data as unknown as Record<string, string>,
        android: {
          channelId,
          importance: AndroidImportance?.HIGH || 4,
          pressAction: {
            id: 'default',
          },
          style: imageUrl
            ? {
                type: AndroidStyle?.BIGPICTURE,
                picture: imageUrl,
              }
            : undefined,
          smallIcon: 'ic_notification',
          category: AndroidCategory?.MESSAGE,
        },
        ios: {
          sound: 'default',
          attachments: imageUrl ? [{ url: imageUrl }] : undefined,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('[Notifee] Error displaying notification:', error);
      return '';
    }
  }

  /**
   * Uygulama badge sayısını ayarla
   */
  async setBadgeCount(count: number): Promise<void> {
    if (!this.isAvailable || !notifee) return;

    try {
      await notifee.setBadgeCount(count);
    } catch (error) {
      console.error('[Notifee] Error setting badge count:', error);
    }
  }

  /**
   * Badge sayısını artır
   */
  async incrementBadgeCount(): Promise<void> {
    if (!this.isAvailable || !notifee) return;

    try {
      const current = await notifee.getBadgeCount();
      await notifee.setBadgeCount(current + 1);
    } catch (error) {
      console.error('[Notifee] Error incrementing badge count:', error);
    }
  }

  /**
   * Badge sayısını azalt
   */
  async decrementBadgeCount(): Promise<void> {
    if (!this.isAvailable || !notifee) return;

    try {
      const current = await notifee.getBadgeCount();
      await notifee.setBadgeCount(Math.max(0, current - 1));
    } catch (error) {
      console.error('[Notifee] Error decrementing badge count:', error);
    }
  }

  /**
   * Mevcut badge sayısını al
   */
  async getBadgeCount(): Promise<number> {
    if (!this.isAvailable || !notifee) return 0;

    try {
      return await notifee.getBadgeCount();
    } catch (error) {
      console.error('[Notifee] Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Belirli bir bildirimi temizle
   */
  async cancelNotification(id: string): Promise<void> {
    if (!this.isAvailable || !notifee) return;

    try {
      await notifee.cancelNotification(id);
    } catch (error) {
      console.error('[Notifee] Error cancelling notification:', error);
    }
  }

  /**
   * Tüm bildirimleri iptal et
   */
  async cancelAllNotifications(): Promise<void> {
    if (!this.isAvailable || !notifee) return;

    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('[Notifee] Error cancelling all notifications:', error);
    }
  }

  /**
   * Görüntülenen bildirimleri al
   */
  async getDisplayedNotifications(): Promise<any[]> {
    if (!this.isAvailable || !notifee) return [];

    try {
      return await notifee.getDisplayedNotifications();
    } catch (error) {
      console.error('[Notifee] Error getting displayed notifications:', error);
      return [];
    }
  }

  /**
   * Ön plan olay dinleyicisi
   */
  onForegroundEvent(handler: (event: any) => void): () => void {
    if (!this.isAvailable || !notifee) {
      return () => {}; // No-op unsubscribe
    }
    return notifee.onForegroundEvent(handler);
  }

  /**
   * Arka plan olay işleyicisi
   */
  onBackgroundEvent(handler: (event: any) => Promise<void>): void {
    if (!this.isAvailable || !notifee) return;
    notifee.onBackgroundEvent(handler);
  }

  /**
   * İlk bildirimi al (uygulama kapalıyken açılan)
   */
  async getInitialNotification(): Promise<any> {
    if (!this.isAvailable || !notifee) return null;

    try {
      const initialNotification = await notifee.getInitialNotification();
      return initialNotification?.notification || null;
    } catch (error) {
      console.error('[Notifee] Error getting initial notification:', error);
      return null;
    }
  }

  /**
   * Bildirim türüne göre kanal ID'si
   */
  private getChannelForType(type: NotificationType): string {
    const channelMap: Partial<Record<NotificationType, string>> = {
      NEW_MESSAGE: 'messages',
      POST_LIKED: 'posts',
      POST_COMMENTED: 'posts',
      MENTION: 'posts',
      NEW_FOLLOWER: 'social',
      VERIFICATION_APPROVED: 'verification',
      VERIFICATION_REJECTED: 'verification',
      VERIFICATION_PENDING_REVIEW: 'verification',
      WELCOME: 'system',
      PASSWORD_RESET: 'system',
      POST_FLAGGED: 'system',
      CONTENT_REMOVED: 'system',
      WARNING_ISSUED: 'system',
      ACCOUNT_SUSPENDED: 'system',
      ACCOUNT_REACTIVATED: 'system',
    };

    return channelMap[type] || 'system';
  }
}

export const notifeeService = new NotifeeService();
export default notifeeService;
