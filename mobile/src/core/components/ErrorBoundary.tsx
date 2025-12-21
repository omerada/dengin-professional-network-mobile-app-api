// src/core/components/ErrorBoundary.tsx
// Global Error Boundary wrapper for production app
// Oku: mobile-development-guide/ui-ux-modernization/07-ERROR-HANDLING.md

import React, { Component, ReactNode } from 'react';
import { ErrorFallback } from '@shared/components';
import { Analytics } from '@shared/services/analytics';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches React errors in child components and shows fallback UI.
 * Automatically logs errors to analytics/crashlytics.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <FeedScreen />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to analytics/crashlytics
    Analytics.logError(error, {
      source: 'error_boundary',
      componentStack: errorInfo.componentStack,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to console in dev
    if (__DEV__) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
