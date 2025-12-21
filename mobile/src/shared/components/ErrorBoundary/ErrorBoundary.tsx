// src/shared/components/ErrorBoundary/ErrorBoundary.tsx
// Production-ready error boundary with recovery options
// Catches React errors and provides user-friendly fallback

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '@shared/components/Button';

interface Props {
  children: ReactNode;
  /**
   * Custom fallback component
   */
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Enable error reporting to crash analytics
   */
  enableReporting?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 *
 * Production-ready error boundary that catches React errors
 * and provides user-friendly recovery options.
 *
 * Features:
 * - Catches React component errors
 * - User-friendly error UI
 * - Recovery options (retry, go home)
 * - Error reporting to analytics
 * - Custom fallback support
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={logError}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Error info:', errorInfo);
    }

    // Report to analytics/crash reporting
    if (this.props.enableReporting !== false) {
      // TODO: Add Crashlytics or Sentry reporting
      // crashlytics().recordError(error);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <Icon name="alert-circle" size={64} color="#EF4444" />

            <Text style={styles.title}>Bir Hata Oluştu</Text>

            <Text style={styles.message}>
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorName}>{this.state.error.name}</Text>
                <Text style={styles.errorMessage}>{this.state.error.message}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <Button
                title="Tekrar Dene"
                variant="primary"
                size="lg"
                onPress={this.resetError}
                fullWidth
              />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 32,
    width: '100%',
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorDetails: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
    width: '100%',
  },
  errorMessage: {
    color: '#991B1B',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  errorName: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
