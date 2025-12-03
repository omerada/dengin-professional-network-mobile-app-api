// src/shared/services/analytics.ts
// Firebase Analytics integration
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
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
 * Analytics service class
 */
class AnalyticsService {
  private isEnabled: boolean = true;
  private userId: string | null = null;

  /**
   * Enable or disable analytics collection
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await analytics().setAnalyticsCollectionEnabled(enabled);
    await crashlytics().setCrashlyticsCollectionEnabled(enabled);
  }

  /**
   * Set current user ID
   */
  async setUserId(userId: string | null): Promise<void> {
    this.userId = userId;

    if (userId) {
      await analytics().setUserId(userId);
      await crashlytics().setUserId(userId);
    } else {
      await analytics().setUserId(null);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: UserProperties): Promise<void> {
    if (!this.isEnabled) return;

    const analyticsProperties: Record<string, string | null> = {};

    if (properties.userId) {
      analyticsProperties.user_id = properties.userId;
    }
    if (properties.isVerified !== undefined) {
      analyticsProperties.is_verified = properties.isVerified ? 'true' : 'false';
    }
    if (properties.profession) {
      analyticsProperties.profession = properties.profession;
    }
    if (properties.accountAge !== undefined) {
      analyticsProperties.account_age_days = properties.accountAge.toString();
    }
    if (properties.platform) {
      analyticsProperties.platform = properties.platform;
    }

    await analytics().setUserProperties(analyticsProperties);

    // Also set in Crashlytics
    if (properties.isVerified !== undefined) {
      await crashlytics().setAttribute(
        'is_verified',
        properties.isVerified ? 'true' : 'false'
      );
    }
    if (properties.profession) {
      await crashlytics().setAttribute('profession', properties.profession);
    }
  }

  /**
   * Log screen view
   */
  async logScreenView(
    screenName: AnalyticsScreen | string,
    screenClass?: string
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      });

      if (__DEV__) {
        console.log(`[Analytics] Screen: ${screenName}`);
      }
    } catch (error) {
      this.logError(error as Error, { context: 'logScreenView', screenName });
    }
  }

  /**
   * Log custom event
   */
  async logEvent(
    eventName: AnalyticsEvent | string,
    params?: Record<string, any>
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const sanitizedParams = this.sanitizeParams(params);
      await analytics().logEvent(eventName, sanitizedParams);

      if (__DEV__) {
        console.log(`[Analytics] Event: ${eventName}`, sanitizedParams);
      }
    } catch (error) {
      this.logError(error as Error, { context: 'logEvent', eventName });
    }
  }

  /**
   * Log login event
   */
  async logLogin(method: 'email' | 'biometric' | 'social'): Promise<void> {
    await analytics().logLogin({ method });
  }

  /**
   * Log sign up event
   */
  async logSignUp(method: 'email' | 'social'): Promise<void> {
    await analytics().logSignUp({ method });
  }

  /**
   * Log share event
   */
  async logShare(
    contentType: string,
    itemId: string,
    method?: string
  ): Promise<void> {
    await analytics().logShare({
      content_type: contentType,
      item_id: itemId,
      method: method ?? Platform.OS,
    });
  }

  /**
   * Log search event
   */
  async logSearch(searchTerm: string): Promise<void> {
    await analytics().logSearch({ search_term: searchTerm });
  }

  /**
   * Log error to Crashlytics
   */
  logError(
    error: Error,
    context?: Record<string, any>,
    isFatal: boolean = false
  ): void {
    try {
      // Set context attributes
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          crashlytics().setAttribute(key, String(value));
        });
      }

      // Record error
      crashlytics().recordError(error);

      // Also log to analytics
      this.logEvent(AnalyticsEvent.ERROR_OCCURRED, {
        error_message: error.message,
        error_name: error.name,
        is_fatal: isFatal,
        ...context,
      });

      if (__DEV__) {
        console.error('[Analytics] Error:', error.message, context);
      }
    } catch (e) {
      console.error('[Analytics] Failed to log error:', e);
    }
  }

  /**
   * Log a custom key-value pair to Crashlytics
   */
  async setCustomKey(key: string, value: string | number | boolean): Promise<void> {
    await crashlytics().setAttribute(key, String(value));
  }

  /**
   * Log a message to Crashlytics
   */
  log(message: string): void {
    crashlytics().log(message);
  }

  /**
   * Sanitize params for analytics
   * Firebase has limits on param names and values
   */
  private sanitizeParams(
    params?: Record<string, any>
  ): Record<string, any> | undefined {
    if (!params) return undefined;

    const sanitized: Record<string, any> = {};

    Object.entries(params).forEach(([key, value]) => {
      // Limit key length to 40 characters
      const sanitizedKey = key.substring(0, 40);

      // Handle different value types
      if (value === null || value === undefined) {
        sanitized[sanitizedKey] = 'null';
      } else if (typeof value === 'string') {
        // Limit string values to 100 characters
        sanitized[sanitizedKey] = value.substring(0, 100);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[sanitizedKey] = value;
      } else if (typeof value === 'object') {
        // Convert objects to JSON string (limited)
        sanitized[sanitizedKey] = JSON.stringify(value).substring(0, 100);
      } else {
        sanitized[sanitizedKey] = String(value).substring(0, 100);
      }
    });

    return sanitized;
  }

  /**
   * Reset analytics data (for logout)
   */
  async reset(): Promise<void> {
    this.userId = null;
    await analytics().resetAnalyticsData();
  }
}

// Export singleton instance
export const Analytics = new AnalyticsService();

/**
 * Hook for screen tracking
 */
export function useScreenTracking(screenName: AnalyticsScreen | string) {
  const { useEffect } = require('react');
  const { useIsFocused } = require('@react-navigation/native');

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      Analytics.logScreenView(screenName);
    }
  }, [isFocused, screenName]);
}
