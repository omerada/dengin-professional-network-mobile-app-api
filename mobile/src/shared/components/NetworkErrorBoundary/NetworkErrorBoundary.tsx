// src/shared/components/NetworkErrorBoundary/NetworkErrorBoundary.tsx
// Production-ready network error handler
// Provides consistent network error UI and retry logic

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { Button } from '@shared/components/Button';
import { spacing, fontSize } from '@theme';

interface NetworkErrorBoundaryProps {
  /**
   * Error object
   */
  error: Error | null;
  /**
   * Retry callback
   */
  onRetry: () => void;
  /**
   * Is retrying
   */
  isRetrying?: boolean;
  /**
   * Custom error message
   */
  message?: string;
  /**
   * Show compact version
   */
  compact?: boolean;
  /**
   * Children to render when no error
   */
  children?: React.ReactNode;
}

/**
 * NetworkErrorBoundary Component
 *
 * Production-ready network error handler with retry logic.
 * Displays user-friendly error UI for network failures.
 *
 * Features:
 * - Network error detection
 * - Retry functionality
 * - User-friendly messages
 * - Compact and full modes
 * - Consistent error UX
 *
 * @example
 * ```tsx
 * <NetworkErrorBoundary
 *   error={error}
 *   onRetry={refetch}
 *   isRetrying={isRefetching}
 * >
 *   <Content />
 * </NetworkErrorBoundary>
 * ```
 */
export const NetworkErrorBoundary = memo<NetworkErrorBoundaryProps>(
  ({ error, onRetry, isRetrying = false, message, compact = false, children }) => {
    const colors = useColors();

    const getErrorMessage = useCallback(() => {
      if (message) return message;

      if (!error) return 'Bir hata oluştu';

      // Network error detection
      if (
        error.message.includes('Network') ||
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('connection')
      ) {
        return 'İnternet bağlantısı yok';
      }

      // Server error
      if (error.message.includes('500') || error.message.includes('server')) {
        return 'Sunucu hatası oluştu';
      }

      // Generic error
      return 'Bir hata oluştu';
    }, [error, message]);

    const getErrorDescription = useCallback(() => {
      if (!error) return '';

      if (
        error.message.includes('Network') ||
        error.message.includes('network') ||
        error.message.includes('timeout')
      ) {
        return 'İnternet bağlantınızı kontrol edin';
      }

      if (error.message.includes('500') || error.message.includes('server')) {
        return 'Lütfen daha sonra tekrar deneyin';
      }

      return 'Lütfen tekrar deneyin';
    }, [error]);

    // Render children if no error
    if (!error && children) {
      return <>{children}</>;
    }

    // Compact mode - inline error
    if (compact) {
      return (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.compactContainer, { backgroundColor: colors.status.errorBg }]}>
          <Icon name="alert-circle" size={20} color={colors.status.error} />
          <Text style={[styles.compactMessage, { color: colors.status.error }]}>
            {getErrorMessage()}
          </Text>
          <Button
            title="Tekrar Dene"
            variant="ghost"
            size="sm"
            onPress={onRetry}
            loading={isRetrying}
          />
        </Animated.View>
      );
    }

    // Full mode - centered error
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.content}>
          <Icon name="cloud-offline-outline" size={80} color={colors.interactive.default} />

          <Text style={[styles.title, { color: colors.text.primary }]}>{getErrorMessage()}</Text>

          <Text style={[styles.description, { color: colors.text.secondary }]}>
            {getErrorDescription()}
          </Text>

          <View style={styles.actions}>
            <Button
              title="Tekrar Dene"
              variant="primary"
              size="lg"
              onPress={onRetry}
              loading={isRetrying}
              fullWidth
            />
          </View>
        </View>
      </Animated.View>
    );
  },
);

NetworkErrorBoundary.displayName = 'NetworkErrorBoundary';

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing['2xl'],
    width: '100%',
  },
  compactContainer: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  compactMessage: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    width: '100%',
  },
  description: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.5,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});

export default NetworkErrorBoundary;
