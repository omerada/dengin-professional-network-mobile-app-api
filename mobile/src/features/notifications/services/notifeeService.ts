// src/features/notifications/services/notifeeService.ts
// Notifee local notification service
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import notifee, {
  AndroidImportance,
  AndroidStyle,
  AndroidCategory,
  EventType,
  Event,
  Notification,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import {
  NOTIFICATION_CHANNELS,
  NotificationType,
  NotificationData,
} from '../types';

/**
 * Notifee yerel bildirim servisi
 */
class NotifeeService {
  private initialized = false;

  /**
   * Servisi başlat
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Android kanallarını oluştur
      if (Platform.OS === 'android') {
        await this.createChannels();
      }

      this.initialized = true;
      console.log('[Notifee] Initialized');
    } catch (error) {
      console.error('[Notifee] Initialization error:', error);
    }
  }

  /**
   * Android bildirim kanallarını oluştur
   */
  private async createChannels(): Promise<void> {
    const importanceMap: Record<string, AndroidImportance> = {
      none: AndroidImportance.NONE,
      min: AndroidImportance.MIN,
      low: AndroidImportance.LOW,
      default: AndroidImportance.DEFAULT,
      high: AndroidImportance.HIGH,
    };

    for (const channel of NOTIFICATION_CHANNELS) {
      await notifee.createChannel({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        importance: importanceMap[channel.importance] || AndroidImportance.DEFAULT,
        sound: channel.sound || 'default',
        vibration: channel.vibration ?? true,
      });
    }

    console.log('[Notifee] Channels created');
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
    const { id, title, body, data, type = 'system', imageUrl } = options;

    const channelId = this.getChannelForType(type);

    const notificationId = await notifee.displayNotification({
      id,
      title,
      body,
      data: data as Record<string, string>,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        style: imageUrl
          ? {
              type: AndroidStyle.BIGPICTURE,
              picture: imageUrl,
            }
          : undefined,
        smallIcon: 'ic_notification',
        category: this.getCategoryForType(type),
      },
      ios: {
        sound: 'default',
        attachments: imageUrl
          ? [{ url: imageUrl }]
          : undefined,
      },
    });

    console.log('[Notifee] Notification displayed:', notificationId);
    return notificationId;
  }

  /**
   * Badge sayısını ayarla
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await notifee.setBadgeCount(count);
      console.log('[Notifee] Badge count set:', count);
    } catch (error) {
      console.error('[Notifee] Error setting badge count:', error);
    }
  }

  /**
   * Badge sayısını artır
   */
  async incrementBadgeCount(): Promise<void> {
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
    try {
      const current = await notifee.getBadgeCount();
      await notifee.setBadgeCount(Math.max(0, current - 1));
    } catch (error) {
      console.error('[Notifee] Error decrementing badge count:', error);
    }
  }

  /**
   * Badge sayısını al
   */
  async getBadgeCount(): Promise<number> {
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
    try {
      await notifee.cancelNotification(id);
      console.log('[Notifee] Notification cancelled:', id);
    } catch (error) {
      console.error('[Notifee] Error cancelling notification:', error);
    }
  }

  /**
   * Tüm bildirimleri temizle
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('[Notifee] All notifications cancelled');
    } catch (error) {
      console.error('[Notifee] Error cancelling all notifications:', error);
    }
  }

  /**
   * Gösterilen bildirimleri al
   */
  async getDisplayedNotifications(): Promise<Notification[]> {
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
  onForegroundEvent(handler: (event: Event) => void): () => void {
    return notifee.onForegroundEvent(handler);
  }

  /**
   * Arka plan olay işleyicisi
   */
  onBackgroundEvent(handler: (event: Event) => Promise<void>): void {
    notifee.onBackgroundEvent(handler);
  }

  /**
   * İlk bildirimi al (uygulama kapalıyken açılan)
   */
  async getInitialNotification(): Promise<Notification | null> {
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
    const channelMap: Record<NotificationType, string> = {
      message: 'messages',
      post_like: 'posts',
      post_comment: 'posts',
      comment_reply: 'posts',
      follow: 'social',
      verification_update: 'verification',
      system: 'system',
    };

    return channelMap[type] || 'system';
  }

  /**
   * Bildirim türüne göre Android kategorisi
   */
  private getCategoryForType(type: NotificationType): AndroidCategory {
    switch (type) {
      case 'message':
        return AndroidCategory.MESSAGE;
      case 'post_like':
      case 'post_comment':
      case 'comment_reply':
      case 'follow':
        return AndroidCategory.SOCIAL;
      default:
        return AndroidCategory.STATUS;
    }
  }
}

export const notifeeService = new NotifeeService();
export default notifeeService;

// Event types export for convenience
export { EventType };
