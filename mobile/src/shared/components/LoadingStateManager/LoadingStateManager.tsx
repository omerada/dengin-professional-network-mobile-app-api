// src/shared/components/LoadingStateManager/LoadingStateManager.tsx
// Unified Loading State Manager
// Provides consistent loading patterns across all screens

import React, { type FC, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { ErrorState } from '../ErrorState';

/**
 * Loading Strategy Types
 */
export type LoadingStrategy =
  | 'skeleton' // Initial load - show skeleton
  | 'indicator' // Simple spinner
  | 'inline' // Inline loading (buttons, etc.)
  | 'overlay'; // Fullscreen overlay

/**
 * Loading State Manager Props
 */
export interface LoadingStateManagerProps {
  /**
   * Loading strategy to use
   * @default 'skeleton'
   */
  strategy?: LoadingStrategy;

  /**
   * Initial loading state
   */
  isLoading?: boolean;

  /**
   * Refresh/pull-to-refresh state
   */
  isRefreshing?: boolean;

  /**
   * Pagination loading state
   */
  isFetchingMore?: boolean;

  /**
   * Error object
   */
  error?: Error | null;

  /**
   * Whether data is available
   */
  hasData?: boolean;

  /**
   * Children to render when data is loaded
   */
  children: ReactNode;

  /**
   * Skeleton component for initial loading
   */
  skeleton?: ReactNode;

  /**
   * Custom empty state component
   */
  emptyState?: ReactNode;

  /**
   * Retry callback for error state
   */
  onRetry?: () => void;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Loading State Manager Component
 *
 * Provides unified loading state management with consistent patterns:
 * - Initial load: Skeleton or spinner
 * - Refresh: Pull-to-refresh indicator
 * - Pagination: Footer indicator
 * - Error: Error state with retry
 * - Empty: Empty state component
 *
 * @example
 * ```tsx
 * <LoadingStateManager
 *   strategy="skeleton"
 *   isLoading={isLoading}
 *   isRefreshing={isRefreshing}
 *   isFetchingMore={isFetchingNextPage}
 *   error={error}
 *   hasData={posts.length > 0}
 *   skeleton={<FeedSkeleton />}
 *   emptyState={<EmptyFeed />}
 *   onRetry={refetch}
 * >
 *   <FlashList data={posts} {...} />
 * </LoadingStateManager>
 * ```
 */
export const LoadingStateManager: FC<LoadingStateManagerProps> = ({
  strategy = 'skeleton',
  isLoading = false,
  isRefreshing = false,
  isFetchingMore = false,
  error,
  hasData = false,
  children,
  skeleton,
  emptyState,
  onRetry,
  testID,
}) => {
  const colors = useColors();

  // Initial loading state
  if (isLoading && !hasData) {
    // Show skeleton if provided, otherwise show spinner
    if (skeleton) {
      return <View testID={testID}>{skeleton}</View>;
    }

    // Fallback to spinner
    return (
      <View style={[styles.centered, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.interactive.default} />
      </View>
    );
  }

  // Error state (only show if no data available)
  if (error && !hasData) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background.primary }]}>
        <ErrorState
          error={error}
          onRetry={onRetry}
          testID={testID ? `${testID}-error` : undefined}
        />
      </View>
    );
  }

  // Empty state (data loaded but empty)
  if (!hasData && !isLoading && !error && emptyState) {
    return <View testID={testID}>{emptyState}</View>;
  }

  // Data loaded - render children
  return (
    <View style={styles.container} testID={testID}>
      {children}

      {/* Pagination loader footer */}
      {isFetchingMore && hasData && (
        <View style={styles.paginationLoader}>
          <ActivityIndicator size="small" color={colors.interactive.default} />
        </View>
      )}
    </View>
  );
};

LoadingStateManager.displayName = 'LoadingStateManager';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  paginationLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});

export default LoadingStateManager;
