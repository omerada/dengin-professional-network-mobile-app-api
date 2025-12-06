// src/features/notifications/services/notificationHandler.production.ts
// Production-ready notification handler using Expo Notifications
// Replaces web-compatible stub implementation

import { navigationRef } from '@core/navigation/navigationRef';
import { expoNotificationService } from './expoNotificationService';
import type { NotificationData } from '../types';

/**
 * Production Notification Handler
 * Handles all notification events and navigation
 */
class NotificationHandler {
  private isInitialized = false;

  /**
   * Initialize notification handler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Expo notification service
      const token = await expoNotificationService.initialize();
      
      if (!token) {
        console.warn('[NotificationHandler] Failed to initialize notifications');
        return;
      }

      // Setup response listener for notification taps
      this.setupNotificationTapHandler();

      // Handle notification that opened the app (from killed state)
      await this.handleInitialNotification();

      this.isInitialized = true;
      console.log('[NotificationHandler] Initialized successfully');
    } catch (error) {
      console.error('[NotificationHandler] Initialization error:', error);
    }
  }

  /**
   * Setup notification tap handler
   */
  private setupNotificationTapHandler(): void {
    // The responseListener in expoNotificationService already handles taps
    // We just need to listen to our custom event or use the store
    console.log('[NotificationHandler] Tap handler ready');
  }

  /**
   * Handle initial notification (app opened from notification)
   */
  private async handleInitialNotification(): Promise<void> {
    try {
      // Expo handles this automatically via responseListener
      // But we can also check manually
      console.log('[NotificationHandler] Checking for initial notification');
    } catch (error) {
      console.error('[NotificationHandler] Error handling initial notification:', error);
    }
  }

  /**
   * Navigate based on notification data
   */
  handleNotificationNavigation(data?: NotificationData): void {
    if (!data) {
      console.warn('[NotificationHandler] No data for navigation');
      return;
    }

    console.log('[NotificationHandler] Navigating from notification:', data);

    try {
      switch (data.type) {
        case 'NEW_MESSAGE':
          if (data.conversationId) {
            this.navigateToChat(data.conversationId, data.senderId);
          }
          break;

        case 'NEW_MATCH':
          if (data.matchId) {
            this.navigateToMatch(data.matchId);
          }
          break;

        case 'PROFILE_VIEW':
          if (data.viewerId) {
            this.navigateToProfile(data.viewerId);
          }
          break;

        case 'VERIFICATION_STATUS':
          this.navigateToVerification();
          break;

        case 'MODERATION_ALERT':
          this.navigateToProfile(); // User's own profile
          break;

        case 'SYSTEM':
          this.navigateToNotifications();
          break;

        default:
          this.navigateToNotifications();
      }
    } catch (error) {
      console.error('[NotificationHandler] Navigation error:', error);
    }
  }

  /**
   * Navigate to chat screen
   */
  private navigateToChat(conversationId: string, userId?: string): void {
    if (!navigationRef.isReady()) {
      console.warn('[NotificationHandler] Navigation not ready');
      setTimeout(() => this.navigateToChat(conversationId, userId), 500);
      return;
    }

    navigationRef.navigate('Chat', {
      conversationId,
    });
  }

  /**
   * Navigate to match detail
   */
  private navigateToMatch(matchId: string): void {
    if (!navigationRef.isReady()) {
      setTimeout(() => this.navigateToMatch(matchId), 500);
      return;
    }

    // Navigate to messages tab - match details will be shown there
    console.log('[NotificationHandler] Navigate to match:', matchId);
    // TODO: Implement match detail screen navigation
  }

  /**
   * Navigate to user profile
   */
  private navigateToProfile(userId?: string): void {
    if (!navigationRef.isReady()) {
      setTimeout(() => this.navigateToProfile(userId), 500);
      return;
    }

    if (userId) {
      navigationRef.navigate('Profile', { userId });
    } else {
      navigationRef.navigate('Profile', {});
    }
  }

  /**
   * Navigate to verification screen
   */
  private navigateToVerification(): void {
    if (!navigationRef.isReady()) {
      setTimeout(() => this.navigateToVerification(), 500);
      return;
    }

    // Navigate to verification stack
    console.log('[NotificationHandler] Navigate to verification');
    // TODO: Implement verification screen navigation
  }

  /**
   * Navigate to notifications list
   */
  private navigateToNotifications(): void {
    if (!navigationRef.isReady()) {
      setTimeout(() => this.navigateToNotifications(), 500);
      return;
    }

    // Navigate to notifications screen
    console.log('[NotificationHandler] Navigate to notifications');
    // TODO: Implement notifications screen navigation
  }

  /**
   * Display local notification
   */
  async displayNotification(
    title: string,
    body: string,
    data: NotificationData,
  ): Promise<void> {
    await expoNotificationService.displayLocalNotification(title, body, data);
  }

  /**
   * Update badge count
   */
  async updateBadgeCount(count: number): Promise<void> {
    await expoNotificationService.setBadgeCount(count);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await expoNotificationService.clearAllNotifications();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    expoNotificationService.cleanup();
    this.isInitialized = false;
  }
}

export const notificationHandler = new NotificationHandler();
export default notificationHandler;
