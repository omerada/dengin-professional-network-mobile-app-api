// src/shared/utils/errorHandling.ts
// Error handling utilities with crash reporting
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import { Alert } from 'react-native';
import { Analytics } from '@shared/services/analytics';

/**
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  PERMISSION = 'PERMISSION',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * App error class with additional context
 */
export class AppError extends Error {
  type: ErrorType;
  code?: string;
  context?: Record<string, unknown>;
  isRecoverable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    options?: {
      code?: string;
      context?: Record<string, unknown>;
      isRecoverable?: boolean;
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = options?.code;
    this.context = options?.context;
    this.isRecoverable = options?.isRecoverable ?? true;
  }
}

/**
 * Parse API error response
 */
export function parseApiError(error: any): AppError {
  // Network errors
  if (error.message === 'Network Error' || !error.response) {
    return new AppError('İnternet bağlantınızı kontrol edin', ErrorType.NETWORK, {
      isRecoverable: true,
    });
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new AppError(
      'Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.',
      ErrorType.TIMEOUT,
      { isRecoverable: true },
    );
  }

  // HTTP errors
  const status = error.response?.status;
  const data = error.response?.data;

  switch (status) {
    case 400:
      return new AppError(data?.message || 'Geçersiz istek', ErrorType.VALIDATION, {
        code: data?.code,
        context: data?.errors,
      });

    case 401:
      return new AppError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.', ErrorType.AUTH, {
        code: 'SESSION_EXPIRED',
        isRecoverable: false,
      });

    case 403:
      return new AppError('Bu işlem için yetkiniz yok', ErrorType.PERMISSION, {
        code: 'FORBIDDEN',
      });

    case 404:
      return new AppError(data?.message || 'İstek yapılan kaynak bulunamadı', ErrorType.SERVER, {
        code: 'NOT_FOUND',
      });

    case 422:
      return new AppError(data?.message || 'Doğrulama hatası', ErrorType.VALIDATION, {
        context: data?.errors,
      });

    case 429:
      return new AppError('Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.', ErrorType.SERVER, {
        code: 'RATE_LIMITED',
        isRecoverable: true,
      });

    case 500:
    case 502:
    case 503:
    case 504:
      return new AppError(
        'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
        ErrorType.SERVER,
        { code: 'SERVER_ERROR', isRecoverable: true },
      );

    default:
      return new AppError(data?.message || 'Beklenmeyen bir hata oluştu', ErrorType.UNKNOWN, {
        context: { status, data },
      });
  }
}

/**
 * Show error alert to user
 */
export function showErrorAlert(
  error: Error | AppError,
  options?: {
    title?: string;
    onRetry?: () => void;
    onDismiss?: () => void;
  },
): void {
  const isAppError = error instanceof AppError;
  const title = options?.title || 'Hata';
  const message = error.message || 'Beklenmeyen bir hata oluştu';

  const buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: 'cancel' | 'default' | 'destructive';
  }> = [];

  if (options?.onDismiss) {
    buttons.push({
      text: 'Tamam',
      onPress: options.onDismiss,
      style: 'cancel',
    });
  } else {
    buttons.push({ text: 'Tamam', style: 'cancel' });
  }

  if (options?.onRetry && (!isAppError || (isAppError && error.isRecoverable))) {
    buttons.push({
      text: 'Tekrar Dene',
      onPress: options.onRetry,
      style: 'default',
    });
  }

  Alert.alert(title, message, buttons);
}

/**
 * Global error handler
 */
export function setupGlobalErrorHandler(): void {
  // Handle unhandled JS errors
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    // Log to analytics
    Analytics.logError(error, { source: 'global_handler', isFatal });

    // Call original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });

  // Handle unhandled promise rejections
  const promiseRejectionTracking = require('promise/setimmediate/rejection-tracking');
  promiseRejectionTracking.enable({
    allRejections: true,
    onUnhandled: (id: number, error: Error) => {
      Analytics.logError(error, {
        source: 'unhandled_promise_rejection',
        rejectionId: id,
      });

      if (__DEV__) {
        console.warn(`Unhandled promise rejection (${id}):`, error);
      }
    },
    onHandled: (id: number) => {
      if (__DEV__) {
        console.log(`Promise rejection handled (${id})`);
      }
    },
  });
}

/**
 * Error boundary fallback component props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Create error boundary wrapper
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<ErrorFallbackProps>,
): React.ComponentType<P> {
  const React = require('react');

  class ErrorBoundary extends React.Component<P, { hasError: boolean; error: Error | null }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      Analytics.logError(error, {
        source: 'error_boundary',
        componentStack: errorInfo.componentStack,
      });
    }

    resetError = () => {
      this.setState({ hasError: false, error: null });
    };

    render() {
      if (this.state.hasError && this.state.error) {
        return React.createElement(FallbackComponent, {
          error: this.state.error,
          resetError: this.resetError,
        });
      }

      return React.createElement(Component, this.props);
    }
  }

  return ErrorBoundary as unknown as React.ComponentType<P>;
}

/**
 * Try-catch wrapper with error logging
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorContext?: Record<string, any>,
): Promise<[T, null] | [null, AppError]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const appError = parseApiError(error);
    Analytics.logError(error as Error, errorContext);
    return [null, appError];
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    onRetry?: (attempt: number, error: Error) => void;
  },
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry,
  } = options || {};

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, lastError);

        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }
  }

  throw lastError;
}
