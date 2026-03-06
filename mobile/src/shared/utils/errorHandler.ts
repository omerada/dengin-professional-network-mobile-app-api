// src/shared/utils/errorHandler.ts
// Centralized error handling utility
// Provides consistent error handling across the app

import { Alert } from 'react-native';
import { getErrorMessage } from '@core/utils/errorUtils';

/**
 * Error handling options
 */
export interface ErrorHandlerOptions {
  /**
   * Context where error occurred (for logging)
   */
  context?: string;

  /**
   * Show toast notification
   * @default true
   */
  showToast?: boolean;

  /**
   * Show alert dialog
   * @default false
   */
  showAlert?: boolean;

  /**
   * Custom error message
   */
  customMessage?: string;

  /**
   * Log to analytics/crashlytics
   * @default true
   */
  logToAnalytics?: boolean;

  /**
   * Show to user
   * @default true
   */
  showToUser?: boolean;

  /**
   * Retry callback
   */
  onRetry?: () => void;
}

/**
 * Handle error with consistent behavior
 *
 * @example
 * ```tsx
 * try {
 *   await createPost(data);
 * } catch (error) {
 *   handleError(error as Error, {
 *     context: 'CreatePost',
 *     showToast: true,
 *   });
 * }
 * ```
 */
export const handleError = (error: Error | unknown, options?: ErrorHandlerOptions): void => {
  const {
    context = 'Unknown',
    showToast = true,
    showAlert = false,
    customMessage,
    logToAnalytics = true,
    showToUser = true,
  } = options || {};

  // Convert to Error if needed
  const err = error instanceof Error ? error : new Error(String(error));

  // Log to console in development
  if (__DEV__) {
    console.error(`[${context}]`, err);
  }

  // Log to analytics in production
  // Production-ready: Analytics integration point for Firebase Crashlytics
  if (logToAnalytics && !__DEV__) {
    try {
      // When Firebase is configured, uncomment:
      // crashlytics().recordError(err);
      // analytics().logEvent('error', {
      //   context,
      //   message: err.message,
      // });

      // Structured logging for monitoring until Firebase setup
      console.error('[Production Error]', {
        context,
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    } catch (analyticsError) {
      // Fail silently - analytics errors should not crash app
    }
  }

  // Don't show to user if disabled
  if (!showToUser) {
    return;
  }

  // Get user-friendly message
  const message = customMessage || getErrorMessage(err);

  // Show alert dialog
  if (showAlert) {
    const buttons: any[] = [{ text: 'Tamam', style: 'default' }];
    if (options?.onRetry) {
      buttons.push({ text: 'Tekrar Dene', onPress: options.onRetry, style: 'cancel' });
    }
    Alert.alert('Hata', message, buttons);
    return;
  }

  // Show toast notification
  if (showToast) {
    // Import dynamically to avoid circular dependency
    const { showToast: showToastFn } = require('@contexts/ToastContext');
    showToastFn({
      type: 'error',
      message,
      duration: 4000,
    });
  }
};

/**
 * Handle network error
 */
export const handleNetworkError = (
  error: Error | unknown,
  options?: Omit<ErrorHandlerOptions, 'customMessage'>,
): void => {
  handleError(error, {
    ...options,
    customMessage: 'İnternet bağlantınızı kontrol edin',
  });
};

/**
 * Handle API error
 */
export const handleApiError = (error: Error | unknown, options?: ErrorHandlerOptions): void => {
  // Check if it's a network error
  const err = error instanceof Error ? error : new Error(String(error));

  if (err.message.includes('Network') || err.message.includes('network')) {
    handleNetworkError(error, options);
    return;
  }

  handleError(error, options);
};

/**
 * Handle validation error
 */
export const handleValidationError = (
  error: Error | unknown,
  options?: Omit<ErrorHandlerOptions, 'showToast' | 'showAlert'>,
): void => {
  handleError(error, {
    ...options,
    showToast: true,
    showAlert: false,
  });
};

/**
 * Handle authentication error
 */
export const handleAuthError = (error: Error | unknown, options?: ErrorHandlerOptions): void => {
  handleError(error, {
    ...options,
    context: 'Auth',
    showAlert: true,
  });
};

/**
 * Handle upload error
 */
export const handleUploadError = (error: Error | unknown, options?: ErrorHandlerOptions): void => {
  handleError(error, {
    ...options,
    context: 'Upload',
    customMessage: 'Dosya yüklenemedi. Lütfen tekrar deneyin.',
  });
};
