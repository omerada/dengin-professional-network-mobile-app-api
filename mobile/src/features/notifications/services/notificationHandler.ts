// src/features/notifications/services/notificationHandler.ts
// Notification handler - Web compatible implementation
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { navigationRef } from '@core/navigation/navigationRef';
import { fcmService, RemoteMessage } from './fcmService';
import { notifeeService, EventType } from './notifeeService';
import { useNotificationStore } from '../stores';
import type { NotificationData, NotificationType } from '../types';

/**
 * Bildirim işleyici
 */
class NotificationHandler {
  private isInitialized = false;

  /**
   * Bildirim işleyicilerini başlat
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Notifee'yi başlat
      await notifeeService.initialize();

      // FCM ön plan mesaj dinleyicisi
      this.setupForegroundMessageHandler();

      // FCM bildirim açma dinleyicisi
      this.setupNotificationOpenedHandler();

      // Notifee olay dinleyicileri
      this.setupNotifeeEventHandlers();

      // Uygulama kapalıyken açılan bildirimi kontrol et
      await this.handleInitialNotification();

      this.isInitialized = true;
      console.log('[NotificationHandler] Initialized');
    } catch (error) {
      console.error('[NotificationHandler] Initialization error:', error);
    }
  }

  /**
   * Ön plan mesaj işleyicisi
   */
  private setupForegroundMessageHandler(): void {
    fcmService.onForegroundMessage(async (remoteMessage: RemoteMessage) => {
      console.log('[NotificationHandler] Foreground message:', remoteMessage);

      // Yerel bildirim göster
      await this.displayLocalNotification(remoteMessage);

      // Store'a bildirim ekle
      this.addNotificationToStore(remoteMessage);
    });
  }

  /**
   * Bildirim açma işleyicisi
   */
  private setupNotificationOpenedHandler(): void {
    fcmService.onNotificationOpenedApp((remoteMessage: RemoteMessage) => {
      console.log('[NotificationHandler] Notification opened app:', remoteMessage);
      this.handleNotificationNavigation(remoteMessage.data as unknown as NotificationData);
    });
  }

  /**
   * Notifee olay işleyicileri
   */
  private setupNotifeeEventHandlers(): void {
    // Ön plan olayları
    notifeeService.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('[NotificationHandler] Notification dismissed:', detail.notification?.id);
          break;

        case EventType.PRESS:
          console.log('[NotificationHandler] Notification pressed:', detail.notification?.id);
          this.handleNotificationNavigation(
            detail.notification?.data as unknown as NotificationData,
          );
          break;

        case EventType.ACTION_PRESS:
          console.log('[NotificationHandler] Action pressed:', detail.pressAction?.id);
          this.handleActionPress(
            detail.pressAction?.id,
            detail.notification?.data as unknown as NotificationData,
          );
          break;
      }
    });

    // Arka plan olayları
    notifeeService.onBackgroundEvent(async ({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          this.handleNotificationNavigation(
            detail.notification?.data as unknown as NotificationData,
          );
          break;

        case EventType.ACTION_PRESS:
          this.handleActionPress(
            detail.pressAction?.id,
            detail.notification?.data as unknown as NotificationData,
          );
          break;
      }
    });
  }

  /**
   * Uygulama kapalıyken açılan bildirimi işle
   */
  private async handleInitialNotification(): Promise<void> {
    try {
      // FCM initial notification
      const fcmInitial = await fcmService.getInitialNotification();
      if (fcmInitial) {
        console.log('[NotificationHandler] FCM initial notification:', fcmInitial);
        // Delay navigation until app is ready
        setTimeout(() => {
          this.handleNotificationNavigation(fcmInitial.data as unknown as NotificationData);
        }, 1000);
        return;
      }

      // Notifee initial notification
      const notifeeInitial = await notifeeService.getInitialNotification();
      if (notifeeInitial) {
        console.log('[NotificationHandler] Notifee initial notification:', notifeeInitial);
        setTimeout(() => {
          this.handleNotificationNavigation(notifeeInitial.data as unknown as NotificationData);
        }, 1000);
      }
    } catch (error) {
      console.error('[NotificationHandler] Error handling initial notification:', error);
    }
  }

  /**
   * FCM mesajından yerel bildirim göster
   */
  private async displayLocalNotification(remoteMessage: RemoteMessage): Promise<void> {
    const { notification, data, messageId } = remoteMessage;

    if (!notification?.title || !notification?.body) {
      console.log('[NotificationHandler] No notification content');
      return;
    }

    await notifeeService.displayNotification({
      id: messageId,
      title: notification.title,
      body: notification.body,
      data: data as unknown as NotificationData,
      type: (data?.type as NotificationType) || 'WELCOME',
      imageUrl: notification.imageUrl || (data?.imageUrl as string),
    });

    // Badge sayısını artır
    await notifeeService.incrementBadgeCount();
  }

  /**
   * Store'a bildirim ekle
   */
  private addNotificationToStore(remoteMessage: RemoteMessage): void {
    const { notification, data, messageId, sentTime } = remoteMessage;

    if (!notification?.title || !notification?.body) return;

    const notificationResponse = {
      notificationId: messageId || Date.now().toString(),
      type: (data?.type as NotificationType) || 'WELCOME',
      title: notification.title,
      body: notification.body,
      actionUrl: data?.actionUrl || null,
      metadata: (data as Record<string, string>) || {},
      status: 'DELIVERED' as const,
      deliveredChannels: ['PUSH' as const],
      read: false,
      readAt: null,
      relativeTime: 'Az önce',
      createdAt: sentTime ? new Date(sentTime).toISOString() : new Date().toISOString(),
    };

    const store = useNotificationStore.getState();
    store.addNotification(notificationResponse);
  }

  /**
   * Bildirim tıklamasında navigasyon
   */
  private handleNotificationNavigation(data?: NotificationData): void {
    if (!data) return;

    const { type, id: _id, conversationId, postId, userId } = data;

    console.log('[NotificationHandler] Navigating for type:', type);

    // Navigasyon referansı hazır mı kontrol et
    if (!navigationRef.isReady()) {
      console.log('[NotificationHandler] Navigation not ready, delaying...');
      setTimeout(() => this.handleNotificationNavigation(data), 500);
      return;
    }

    switch (type) {
      case 'NEW_MESSAGE':
        if (conversationId) {
          (navigationRef.navigate as any)('MessagingTab', {
            screen: 'Chat',
            params: { conversationId },
          });
        }
        break;

      case 'POST_LIKED':
      case 'POST_COMMENTED':
      case 'MENTION':
        if (postId) {
          (navigationRef.navigate as any)('FeedTab', {
            screen: 'PostDetail',
            params: { postId },
          });
        }
        break;

      case 'NEW_FOLLOWER':
        if (userId) {
          (navigationRef.navigate as any)('ProfileTab', {
            screen: 'Profile',
            params: { userId },
          });
        }
        break;

      case 'VERIFICATION_APPROVED':
      case 'VERIFICATION_REJECTED':
      case 'VERIFICATION_PENDING_REVIEW':
        (navigationRef.navigate as any)('Verification', {
          screen: 'UploadStatus',
        });
        break;

      default:
        // Navigate to notifications tab
        (navigationRef.navigate as any)('NotificationsTab');
        break;
    }
  }

  /**
   * Bildirim aksiyonu işle
   */
  private handleActionPress(actionId?: string, data?: NotificationData): void {
    if (!actionId || !data) return;

    console.log('[NotificationHandler] Action pressed:', actionId, data);

    switch (actionId) {
      case 'reply':
        // Quick reply işlemi
        if (data.conversationId) {
          (navigationRef.navigate as any)('MessagingTab', {
            screen: 'Chat',
            params: { conversationId: data.conversationId },
          });
        }
        break;

      case 'mark_read':
        // Okundu olarak işaretle
        if (data.id) {
          const store = useNotificationStore.getState();
          store.markAsRead(data.id);
        }
        break;

      default:
        this.handleNotificationNavigation(data);
        break;
    }
  }

  /**
   * FCM arka plan mesaj işleyicisi
   */
  setupBackgroundHandler(): void {
    fcmService.setBackgroundMessageHandler(async (remoteMessage: RemoteMessage) => {
      console.log('[NotificationHandler] Background message:', remoteMessage);
      // Arka planda yerel bildirim göster
      await this.displayLocalNotification(remoteMessage);
    });
  }
}

export const notificationHandler = new NotificationHandler();
export default notificationHandler;
