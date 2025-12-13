// src/shared/components/LoadingState/LoadingState.tsx
// Meslektaş Design System - Loading State Component
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Section 4.1

import React, { memo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';

import type { LoadingStateProps } from './LoadingState.types';

/**
 * LoadingState Component
 *
 * Displays loading states with optional message.
 * Provides consistent loading UI across the app.
 *
 * Features:
 * - Animated entrance
 * - Theme-aware styling
 * - Customizable message, size, and color
 * - Accessibility support
 *
 * @example
 * ```tsx
 * // Basic loading
 * <LoadingState />
 *
 * // With message
 * <LoadingState message="Yükleniyor..." />
 *
 * // Custom size and color
 * <LoadingState
 *   message="Lütfen bekleyin"
 *   size="large"
 *   color="#10B981"
 * />
 * ```
 */
export const LoadingState = memo<LoadingStateProps>(
  ({
    message = 'Yükleniyor...',
    showSpinner = true,
    size = 'large',
    color,
    testID = 'loading-state',
  }) => {
    const colors = useColors();
    const spinnerColor = color || colors.interactive.default;

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        testID={testID}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={message}>
        {/* Spinner */}
        {showSpinner && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size={size} color={spinnerColor} />
          </View>
        )}

        {/* Message */}
        {message && (
          <Text style={[styles.message, { color: colors.text.secondary }]} accessibilityRole="text">
            {message}
          </Text>
        )}
      </Animated.View>
    );
  },
);

LoadingState.displayName = 'LoadingState';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  spinnerContainer: {
    marginBottom: spacing.md,
  },
});
