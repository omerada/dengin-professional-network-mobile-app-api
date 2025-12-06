// src/features/notifications/services/notifeeService.ts
// Notifee local notification service - Web compatible
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { Platform } from 'react-native';
import { NOTIFICATION_CHANNELS, NotificationType, NotificationData } from '../types';

// Notifee tiplerini tanımla (web uyumluluğu için)
export enum EventType {
  UNKNOWN = -1,
  DISMISSED = 0,
  PRESS = 1,
  ACTION_PRESS = 2,
  DELIVERED = 3,
  APP_BLOCKED = 4,
  CHANNEL_BLOCKED = 5,
  CHANNEL_GROUP_BLOCKED = 6,
  TRIGGER_NOTIFICATION_CREATED = 7,
}

export interface Notification {
  id?: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

export interface Event {
  type: EventType;
  detail: {
    notification?: Notification;
    pressAction?: { id: string };
  };
}

// Platform spesifik modülleri dinamik olarak yükle
let notifee: any = null;
let AndroidImportance: any = {};
let AndroidStyle: any = {};
let AndroidCategory: any = {};

// Web dışında notifee'yi yükle
if (Platform.OS !== 'web') {
  try {
    const notifeeModule = require('@notifee/react-native');
    notifee = notifeeModule.default;
    AndroidImportance = notifeeModule.AndroidImportance || {};
    AndroidStyle = notifeeModule.AndroidStyle || {};
    AndroidCategory = notifeeModule.AndroidCategory || {};
  } catch (e) {
    console.log('[Notifee] Native module not available');
  }
}

/**
 * Notifee yerel bildirim servisi - Web uyumlu
 */
class NotifeeService {
  private initialized = false;
  private isNative = Platform.OS !== 'web' && notifee !== null;

  /**
   * Servisi başlat
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.isNative && Platform.OS === 'android') {
        await this.createChannels();
      }

      this.initialized = true;
      console.log('[Notifee] Initialized', this.isNative ? '(native)' : '(web stub)');
    } catch (error) {
      console.error('[Notifee] Initialization error:', error);
    }
  }

  /**
   * Android bildirim kanallarını oluştur
   */
  private async createChannels(): Promise<void> {
    if (!this.isNative || !notifee) return;

    const importanceMap: Record<string, number> = {
      none: AndroidImportance.NONE || 0,
      min: AndroidImportance.MIN || 1,
      low: AndroidImportance.LOW || 2,
      default: AndroidImportance.DEFAULT || 3,
      high: AndroidImportance.HIGH || 4,
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
    const { id, title, body, data, type = 'WELCOME', imageUrl } = options;

    // Web: Browser Notification API kullan
    if (!this.isNative) {
      return this.displayWebNotification(title, body, data);
    }

    const channelId = this.getChannelForType(type);

    const notificationId = await notifee.displayNotification({
      id,
      title,
      body,
      data: data as unknown as Record<string, string>,
      android: {
        channelId,
        importance: AndroidImportance.HIGH || 4,
        pressAction: {
          id: 'default',
        },
        style: imageUrl
          ? {
              type: AndroidStyle.BIGPICTURE || 0,
              picture: imageUrl,
            }
          : undefined,
        smallIcon: 'ic_notification',
        category: this.getCategoryForType(type),
      },
      ios: {
        sound: 'default',
        attachments: imageUrl ? [{ url: imageUrl }] : undefined,
      },
    });

    console.log('[Notifee] Notification displayed:', notificationId);
    return notificationId;
  }

  /**
   * Web bildirim göster
   */
  private async displayWebNotification(
    title: string,
    body: string,
    data?: NotificationData,
  ): Promise<string> {
    const notificationId = Date.now().toString();

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, data });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body, data });
        }
      }
    }

    console.log('[Notifee Web] Notification displayed:', notificationId);
    return notificationId;
  }

  /**
   * Badge sayısını ayarla
   */
  async setBadgeCount(count: number): Promise<void> {
    if (!this.isNative) {
      console.log('[Notifee Web] Badge count:', count);
      return;
    }

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
    if (!this.isNative) return;

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
    if (!this.isNative) return;

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
    if (!this.isNative) return 0;

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
    if (!this.isNative) return;

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
    if (!this.isNative) return;

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
    if (!this.isNative) return [];

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
    if (!this.isNative) {
      return () => {};
    }
    return notifee.onForegroundEvent(handler);
  }

  /**
   * Arka plan olay işleyicisi
   */
  onBackgroundEvent(handler: (event: Event) => Promise<void>): void {
    if (!this.isNative) return;
    notifee.onBackgroundEvent(handler);
  }

  /**
   * İlk bildirimi al (uygulama kapalıyken açılan)
   */
  async getInitialNotification(): Promise<Notification | null> {
    if (!this.isNative) return null;

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

  /**
   * Bildirim türüne göre Android kategorisi
   */
  private getCategoryForType(type: NotificationType): number {
    if (!this.isNative) return 0;

    switch (type) {
      case 'NEW_MESSAGE':
        return AndroidCategory.MESSAGE || 3;
      case 'POST_LIKED':
      case 'POST_COMMENTED':
      case 'MENTION':
      case 'NEW_FOLLOWER':
        return AndroidCategory.SOCIAL || 4;
      default:
        return AndroidCategory.STATUS || 5;
    }
  }
}

export const notifeeService = new NotifeeService();
export default notifeeService;
