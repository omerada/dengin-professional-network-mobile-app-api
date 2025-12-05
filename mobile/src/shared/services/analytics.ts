// src/shared/services/analytics.ts
// Analytics stub for Expo managed workflow
// Note: Full implementation with expo-firebase-analytics will be done during EAS Build phase
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import { Platform } from 'react-native';

/**
 * Analytics event names
 */
export enum AnalyticsEvent {
  // Auth events
  LOGIN = 'login',
  LOGOUT = 'logout',
  SIGN_UP = 'sign_up',
  PASSWORD_RESET = 'password_reset',
  BIOMETRIC_ENABLED = 'biometric_enabled',

  // Verification events
  VERIFICATION_STARTED = 'verification_started',
  VERIFICATION_DOCUMENT_CAPTURED = 'verification_document_captured',
  VERIFICATION_SELFIE_CAPTURED = 'verification_selfie_captured',
  VERIFICATION_SUBMITTED = 'verification_submitted',
  VERIFICATION_COMPLETED = 'verification_completed',
  VERIFICATION_FAILED = 'verification_failed',

  // Feed events
  POST_CREATED = 'post_created',
  POST_VIEWED = 'post_viewed',
  POST_LIKED = 'post_liked',
  POST_UNLIKED = 'post_unliked',
  POST_SHARED = 'post_shared',
  POST_REPORTED = 'post_reported',
  POST_DELETED = 'post_deleted',

  // Comment events
  COMMENT_CREATED = 'comment_created',
  COMMENT_LIKED = 'comment_liked',
  COMMENT_DELETED = 'comment_deleted',

  // Messaging events
  CONVERSATION_STARTED = 'conversation_started',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_READ = 'message_read',

  // Notification events
  NOTIFICATION_RECEIVED = 'notification_received',
  NOTIFICATION_TAPPED = 'notification_tapped',
  NOTIFICATION_SETTINGS_CHANGED = 'notification_settings_changed',

  // Profile events
  PROFILE_VIEWED = 'profile_viewed',
  PROFILE_EDITED = 'profile_edited',
  FOLLOW_USER = 'follow_user',
  UNFOLLOW_USER = 'unfollow_user',

  // App events
  APP_OPENED = 'app_opened',
  APP_BACKGROUNDED = 'app_backgrounded',
  DEEP_LINK_OPENED = 'deep_link_opened',
  SEARCH_PERFORMED = 'search_performed',
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * Screen names for tracking
 */
export enum AnalyticsScreen {
  // Auth screens
  LOGIN = 'Login',
  REGISTER = 'Register',
  FORGOT_PASSWORD = 'ForgotPassword',
  BIOMETRIC_SETUP = 'BiometricSetup',

  // Verification screens
  VERIFICATION_INTRO = 'VerificationIntro',
  DOCUMENT_CAPTURE = 'DocumentCapture',
  SELFIE_CAPTURE = 'SelfieCapture',
  VERIFICATION_REVIEW = 'VerificationReview',
  VERIFICATION_STATUS = 'VerificationStatus',

  // Main screens
  FEED = 'Feed',
  POST_DETAIL = 'PostDetail',
  CREATE_POST = 'CreatePost',
  CONVERSATION_LIST = 'ConversationList',
  CHAT = 'Chat',
  NEW_CONVERSATION = 'NewConversation',
  NOTIFICATIONS = 'Notifications',
  NOTIFICATION_SETTINGS = 'NotificationSettings',
  PROFILE = 'Profile',
  EDIT_PROFILE = 'EditProfile',
  SETTINGS = 'Settings',
}

/**
 * User properties
 */
export interface UserProperties {
  userId?: string;
  isVerified?: boolean;
  profession?: string;
  accountAge?: number;
  platform?: string;
}

/**
 * Analytics service - Stub implementation for Expo
 * Replace with real implementation when using EAS Build
 */
class AnalyticsService {
  private isEnabled: boolean = true;
  private userId: string | null = null;

  /**
   * Enable or disable analytics collection
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    if (__DEV__) {
      console.log(`[Analytics] Collection ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Set current user ID
   */
  async setUserId(userId: string | null): Promise<void> {
    this.userId = userId;
    if (__DEV__) {
      console.log(`[Analytics] User ID set: ${userId}`);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: UserProperties): Promise<void> {
    if (!this.isEnabled) return;
    if (__DEV__) {
      console.log('[Analytics] User properties:', properties);
    }
  }

  /**
   * Log screen view
   */
  async logScreenView(screenName: AnalyticsScreen | string, screenClass?: string): Promise<void> {
    if (!this.isEnabled) return;
    if (__DEV__) {
      console.log(`[Analytics] Screen: ${screenName}`);
    }
  }

  /**
   * Log custom event
   */
  async logEvent(eventName: AnalyticsEvent | string, params?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;
    if (__DEV__) {
      console.log(`[Analytics] Event: ${eventName}`, params);
    }
  }

  /**
   * Log error to crashlytics
   */
  logError(error: Error, context?: Record<string, any>): void {
    if (__DEV__) {
      console.error('[Analytics] Error:', error.message, context);
    }
  }

  /**
   * Log message to crashlytics
   */
  log(message: string): void {
    if (__DEV__) {
      console.log(`[Analytics] Log: ${message}`);
    }
  }

  /**
   * Record a non-fatal error
   */
  recordError(error: Error, jsErrorName?: string): void {
    if (__DEV__) {
      console.error('[Analytics] Recorded error:', error.message);
    }
  }

  /**
   * Set custom key for crashlytics
   */
  async setAttribute(key: string, value: string): Promise<void> {
    if (__DEV__) {
      console.log(`[Analytics] Attribute: ${key} = ${value}`);
    }
  }

  /**
   * Log login event
   */
  async logLogin(method: string): Promise<void> {
    await this.logEvent(AnalyticsEvent.LOGIN, { method });
  }

  /**
   * Log signup event
   */
  async logSignUp(method: string): Promise<void> {
    await this.logEvent(AnalyticsEvent.SIGN_UP, { method });
  }

  /**
   * Log share event
   */
  async logShare(contentType: string, itemId: string): Promise<void> {
    await this.logEvent(AnalyticsEvent.POST_SHARED, {
      content_type: contentType,
      item_id: itemId,
    });
  }

  /**
   * Log search event
   */
  async logSearch(searchTerm: string): Promise<void> {
    await this.logEvent(AnalyticsEvent.SEARCH_PERFORMED, {
      search_term: searchTerm,
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

/**
 * React hook for screen tracking
 */
export const useScreenTracking = (screenName: AnalyticsScreen | string) => {
  // Lazy require to avoid import issues
  const React = require('react');
  const Navigation = require('@react-navigation/native');

  const isFocused = Navigation.useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      analyticsService.logScreenView(screenName);
    }
  }, [isFocused, screenName]);
};

export default analyticsService;
