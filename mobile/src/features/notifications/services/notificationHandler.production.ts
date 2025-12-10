// src/features/notifications/services/notificationHandler.production.ts
// Production notification handler using Firebase Cloud Messaging
// Handles notification taps and navigation

import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { fcmService } from './fcmService.production';
import { useNotificationStore } from '../stores';
import { navigationRef } from '@core/navigation/navigationRef';
import type { NotificationType, NotificationData } from '../types';
import * as Haptics from 'expo-haptics';

/**
 * Production Notification Handler
 *
 * Responsibilities:
 * - Initialize FCM
 * - Handle notification taps
 * - Navigate to appropriate screens
 * - Update notification store
 * - Trigger haptic feedback
 */
class NotificationHandler {
  private initialized = false;
  private unsubscribeOpenedApp: (() => void) | null = null;

  /**
   * Initialize notification system
   * - Request permissions
   * - Get FCM token
   * - Register with backend
   * - Setup listeners
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[NotificationHandler] Already initialized');
      return;
    }

    try {
      console.log('[NotificationHandler] Initializing FCM...');

      // Initialize FCM service
      const token = await fcmService.initialize();
      if (!token) {
        console.warn('[NotificationHandler] FCM initialization failed - no token');
        return;
      }

      // Check if app was opened from notification (quit state)
      const initialNotification = await fcmService.getInitialNotification();
      if (initialNotification) {
        console.log('[NotificationHandler] App opened from notification (quit state)');
        // Wait a bit for navigation to be ready
        setTimeout(() => {
          this.handleNotificationOpened(initialNotification);
        }, 1000);
      }

      // Setup notification opened listener (background/foreground state)
      this.unsubscribeOpenedApp = fcmService.onNotificationOpened(remoteMessage => {
        console.log('[NotificationHandler] Notification opened app (background/foreground)');
        this.handleNotificationOpened(remoteMessage);
      });

      this.initialized = true;
      console.log('[NotificationHandler] Initialized successfully');
    } catch (error) {
      console.error('[NotificationHandler] Initialization error:', error);
    }
  }

  /**
   * Handle notification tap
   * Parse notification data and navigate to appropriate screen
   */
  private async handleNotificationOpened(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    try {
      console.log('[NotificationHandler] Handling notification tap:', remoteMessage);

      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Extract notification data
      const notificationData = remoteMessage.data as NotificationData | undefined;
      if (!notificationData) {
        console.warn('[NotificationHandler] No notification data found');
        return;
      }

      const { type, ...metadata } = notificationData;
      console.log('[NotificationHandler] Notification type:', type, 'Metadata:', metadata);

      // Navigate based on notification type
      this.navigateToScreen(type as NotificationType, metadata);

      // Mark as read in store
      if (notificationData.notificationId) {
        useNotificationStore.getState().markAsRead(notificationData.notificationId);
      }
    } catch (error) {
      console.error('[NotificationHandler] Error handling notification:', error);
    }
  }

  /**
   * Navigate to appropriate screen based on notification type
   */
  private navigateToScreen(type: NotificationType, metadata: Record<string, any>): void {
    if (!navigationRef.isReady()) {
      console.warn('[NotificationHandler] Navigation not ready yet');
      // Retry after delay
      setTimeout(() => this.navigateToScreen(type, metadata), 500);
      return;
    }

    console.log('[NotificationHandler] Navigating for type:', type);

    switch (type) {
      // Message notifications
      case 'NEW_MESSAGE':
      case 'MESSAGE_RECEIVED':
        if (metadata.conversationId || metadata.matchId) {
          this.navigateToChat(metadata.conversationId || metadata.matchId, metadata.userId);
        } else {
          this.navigateToMessaging();
        }
        break;

      // Match notifications
      case 'NEW_MATCH':
      case 'MATCH_ACCEPTED':
      case 'MATCH_SUGGESTION':
        if (metadata.matchId) {
          this.navigateToMatch(metadata.matchId);
        } else {
          this.navigateToMessaging();
        }
        break;

      // Profile notifications
      case 'PROFILE_VIEW':
      case 'PROFILE_LIKE':
        if (metadata.userId) {
          this.navigateToProfile(metadata.userId);
        } else {
          this.navigateToNotifications();
        }
        break;

      // Verification notifications
      case 'VERIFICATION_APPROVED':
      case 'VERIFICATION_REJECTED':
      case 'VERIFICATION_REQUIRED':
        this.navigateToVerification();
        break;

      // Post notifications
      case 'POST_LIKE':
      case 'POST_COMMENT':
      case 'POST_MENTION':
        if (metadata.postId) {
          this.navigateToPost(metadata.postId);
        } else {
          this.navigateToFeed();
        }
        break;

      // Moderation notifications
      case 'POST_FLAGGED':
      case 'POST_REMOVED':
      case 'ACCOUNT_WARNING':
      case 'ACCOUNT_SUSPENDED':
        this.navigateToNotifications();
        break;

      // System notifications
      case 'SYSTEM_ANNOUNCEMENT':
      case 'FEATURE_ANNOUNCEMENT':
        this.navigateToNotifications();
        break;

      // Default: Go to notifications screen
      default:
        console.warn('[NotificationHandler] Unknown notification type:', type);
        this.navigateToNotifications();
        break;
    }
  }

  // =================================================================
  // Navigation Helper Methods
  // =================================================================

  private navigateToMessaging(): void {
    navigationRef.navigate('Main', {
      screen: 'MessagingTab',
      params: { screen: 'ConversationList' },
    });
  }

  private navigateToChat(conversationId: string, userId?: string): void {
    navigationRef.navigate('Main', {
      screen: 'MessagingTab',
      params: {
        screen: 'Chat',
        params: { conversationId, userId },
      },
    });
  }

  private navigateToMatch(matchId: string): void {
    // Navigate to MatchDetail screen (root level)
    navigationRef.navigate('MatchDetail', { matchId });
  }

  private navigateToProfile(userId: string): void {
    navigationRef.navigate('Main', {
      screen: 'FeedTab',
      params: {
        screen: 'Profile',
        params: { userId },
      },
    });
  }

  private navigateToVerification(): void {
    navigationRef.navigate('Main', {
      screen: 'NotificationsTab',
      params: {
        screen: 'VerificationStatus',
      },
    });
  }

  private navigateToPost(postId: string): void {
    navigationRef.navigate('Main', {
      screen: 'FeedTab',
      params: {
        screen: 'PostDetail',
        params: { postId },
      },
    });
  }

  private navigateToFeed(): void {
    navigationRef.navigate('Main', {
      screen: 'FeedTab',
      params: { screen: 'Feed' },
    });
  }

  private navigateToNotifications(): void {
    navigationRef.navigate('Main', {
      screen: 'NotificationsTab',
      params: {
        screen: 'Notifications',
      },
    });
  }

  /**
   * Cleanup listeners
   * Called on logout
   */
  cleanup(): void {
    if (this.unsubscribeOpenedApp) {
      this.unsubscribeOpenedApp();
      this.unsubscribeOpenedApp = null;
    }

    fcmService.cleanup();
    this.initialized = false;
    console.log('[NotificationHandler] Cleaned up');
  }
}

// Export singleton instance
export const notificationHandler = new NotificationHandler();
