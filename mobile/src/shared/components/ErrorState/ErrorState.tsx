// src/shared/components/ErrorState/ErrorState.tsx
// Meslektaş Design System - Error State Component
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Section 4.1

import React, { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { Button } from '../Button';
import { spacing } from '@theme';

import type { ErrorStateProps } from './ErrorState.types';
import { ERROR_STATE_CONFIGS } from './ErrorState.types';

/**
 * ErrorState Component
 *
 * Displays error states with retry functionality.
 * Provides consistent error handling across the app.
 *
 * Features:
 * - Multiple error variants (network, server, notFound, etc.)
 * - Customizable title, message, and icon
 * - Optional retry button with haptic feedback
 * - Animated entrance
 * - Theme-aware styling
 *
 * @example
 * ```tsx
 * // Network error with retry
 * <ErrorState
 *   variant="network"
 *   onRetry={refetch}
 * />
 *
 * // Server error without retry
 * <ErrorState
 *   variant="server"
 *   showRetry={false}
 * />
 *
 * // Custom error
 * <ErrorState
 *   title="Custom Error"
 *   message="Something went wrong"
 *   icon="warning-outline"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export const ErrorState = memo<ErrorStateProps>(
  ({
    error,
    onRetry,
    variant = 'generic',
    title: customTitle,
    message: customMessage,
    icon: customIcon,
    showRetry = true,
    retryLabel = 'Tekrar Dene',
    testID = 'error-state',
  }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    // Get config for variant
    const config = ERROR_STATE_CONFIGS[variant];

    // Use custom values or fall back to config
    const title = customTitle || config.title;
    const message = customMessage || config.message;
    const icon = customIcon || config.icon;

    // Handle retry with haptic feedback
    const handleRetry = useCallback(() => {
      if (onRetry) {
        trigger('light');
        onRetry();
      }
    }, [onRetry, trigger]);

    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        testID={testID}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`${title}. ${message}`}>
        {/* Error Icon */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.iconContainer, { backgroundColor: colors.background.secondary }]}>
          <Icon name={icon} size={64} color={colors.status.error} />
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.title, { color: colors.text.primary }]}
          accessibilityRole="header">
          {title}
        </Animated.Text>

        {/* Message */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.message, { color: colors.text.secondary }]}>
          {message}
        </Animated.Text>

        {/* Error details (in development) */}
        {__DEV__ && error && (
          <Animated.Text
            entering={FadeInDown.delay(350).duration(400)}
            style={[styles.errorDetails, { color: colors.text.tertiary }]}
            numberOfLines={3}>
            {error instanceof Error ? error.message : String(error)}
          </Animated.Text>
        )}

        {/* Retry Button */}
        {showRetry && onRetry && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.buttonContainer}>
            <Button title={retryLabel} onPress={handleRetry} variant="outline" size="md" />
          </Animated.View>
        )}
      </Animated.View>
    );
  },
);

ErrorState.displayName = 'ErrorState';

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: spacing.md,
    minWidth: 160,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorDetails: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 64,
    height: 128,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 128,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
