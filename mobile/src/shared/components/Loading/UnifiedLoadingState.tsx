// src/shared/components/Loading/UnifiedLoadingState.tsx
// Unified Loading State Component - Production Standard
// Oku: mobile/UX-IYILESTIRME-PLANI.md Section 2.2

import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { SkeletonPost } from '../Skeleton';
import { Loading } from './Loading';

export type LoadingStrategy = 'skeleton' | 'spinner' | 'inline' | 'button';
export type LoadingVariant = 'screen' | 'section' | 'overlay';

export interface UnifiedLoadingStateProps {
  /** Loading strategy to use */
  strategy?: LoadingStrategy;
  /** Variant determines layout and spacing */
  variant?: LoadingVariant;
  /** Optional loading message (for spinner strategy) */
  message?: string;
  /** Size of loading indicator */
  size?: 'small' | 'large';
  /** Number of skeleton items (for skeleton strategy) */
  count?: number;
  /** Test ID */
  testID?: string;
}

/**
 * UnifiedLoadingState Component
 *
 * Centralized loading state component that provides consistent loading UX across the app.
 * Supports multiple strategies: skeleton, spinner, inline, button.
 *
 * @example
 * ```tsx
 * // Skeleton loading for feed
 * <UnifiedLoadingState strategy="skeleton" variant="screen" count={3} />
 *
 * // Spinner with message
 * <UnifiedLoadingState strategy="spinner" message="Yükleniyor..." variant="screen" />
 *
 * // Inline loading
 * <UnifiedLoadingState strategy="inline" size="small" />
 * ```
 */
export const UnifiedLoadingState = memo<UnifiedLoadingStateProps>(
  ({
    strategy = 'spinner',
    variant = 'screen',
    message,
    size = 'large',
    count = 3,
    testID = 'unified-loading-state',
  }) => {
    const colors = useColors();

    // Skeleton strategy
    if (strategy === 'skeleton') {
      return (
        <View
          style={[
            variant === 'screen' && styles.screenContainer,
            variant === 'section' && styles.sectionContainer,
          ]}
          testID={testID}>
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonPost key={index} style={styles.skeletonItem} />
          ))}
        </View>
      );
    }

    // Spinner strategy with Loading component
    if (strategy === 'spinner') {
      return (
        <View
          style={[
            variant === 'screen' && styles.screenContainer,
            variant === 'section' && styles.sectionContainer,
            variant === 'overlay' && styles.overlayContainer,
          ]}
          testID={testID}>
          <Loading size={size} message={message} />
        </View>
      );
    }

    // Inline strategy (minimal spinner)
    if (strategy === 'inline') {
      return (
        <View style={styles.inlineContainer} testID={testID}>
          <ActivityIndicator size={size} color={colors.interactive.default} />
        </View>
      );
    }

    // Button strategy (small spinner for button states)
    return <ActivityIndicator size="small" color={colors.text.inverse} />;
  },
);

UnifiedLoadingState.displayName = 'UnifiedLoadingState';

const styles = StyleSheet.create({
  inlineContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionContainer: {
    paddingVertical: spacing.md,
  },
  skeletonItem: {
    marginBottom: spacing.md,
  },
});
