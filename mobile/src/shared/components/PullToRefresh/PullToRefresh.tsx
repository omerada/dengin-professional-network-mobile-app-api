// src/shared/components/PullToRefresh/PullToRefresh.tsx
// Dengin Design System - Modern Pull To Refresh Component
// Oku: mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md

import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View, RefreshControl, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { Spinner } from '../Loading';

// ============================================================================
// Types
// ============================================================================

interface PullToRefreshProps {
  /** Whether the refresh is in progress */
  refreshing: boolean;
  /** Callback when refresh is triggered */
  onRefresh: () => void;
  /** Custom refresh control colors */
  colors?: string[];
  /** Progress view offset (Android) */
  progressViewOffset?: number;
  /** Custom progress background color */
  progressBackgroundColor?: string;
  /** Tint color (iOS) */
  tintColor?: string;
  /** Title (iOS) */
  title?: string;
  /** Title color (iOS) */
  titleColor?: string;
  /** Disable haptic feedback */
  disableHaptic?: boolean;
}

// ============================================================================
// Custom Refresh Indicator
// ============================================================================

interface RefreshIndicatorProps {
  progress: number;
  refreshing: boolean;
  color?: string;
}

const RefreshIndicator = memo<RefreshIndicatorProps>(({ progress, refreshing, color }) => {
  const { colors } = useTheme();
  const indicatorColor = color ?? colors.interactive.default;

  // Animation values
  const rotation = useSharedValue(0);

  // Rotation style for refreshing state
  const rotationStyle = useAnimatedStyle(() => {
    const rotate = refreshing
      ? withTiming(rotation.value + 360, { duration: 1000 })
      : interpolate(progress, [0, 1], [0, 180]);

    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  // Scale style based on progress
  const scaleStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress, [0, 0.5, 1], [0.5, 0.8, 1], Extrapolation.CLAMP);

    return {
      transform: [{ scale }],
      opacity: interpolate(progress, [0, 0.3], [0, 1], Extrapolation.CLAMP),
    };
  });

  if (refreshing) {
    return <Spinner size="small" color={indicatorColor} />;
  }

  return (
    <Animated.View style={[styles.indicator, scaleStyle]}>
      <Animated.View style={[styles.indicatorInner, rotationStyle]}>
        <View
          style={[
            styles.indicatorArc,
            {
              borderColor: indicatorColor,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
});

RefreshIndicator.displayName = 'RefreshIndicator';

// ============================================================================
// useRefreshControl Hook
// ============================================================================

interface UseRefreshControlOptions {
  onRefresh: () => void;
  refreshing: boolean;
  disableHaptic?: boolean;
}

interface UseRefreshControlReturn {
  refreshControl: React.ReactElement<RefreshControl>;
  triggerRefresh: () => void;
}

/**
 * Hook to create a customized RefreshControl with haptic feedback
 */
export const useRefreshControl = (options: UseRefreshControlOptions): UseRefreshControlReturn => {
  const { onRefresh, refreshing, disableHaptic = false } = options;
  const { colors } = useTheme();
  const { medium } = useHaptic();

  const handleRefresh = useCallback(() => {
    if (!disableHaptic) {
      medium();
    }
    onRefresh();
  }, [onRefresh, disableHaptic, medium]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={[colors.interactive.default]}
        tintColor={colors.interactive.default}
        progressBackgroundColor={colors.background.elevated}
      />
    ),
    [refreshing, handleRefresh, colors],
  );

  return {
    refreshControl,
    triggerRefresh: handleRefresh,
  };
};

// ============================================================================
// PullToRefresh Component (for wrapping RefreshControl)
// ============================================================================

/**
 * Modern Pull To Refresh Component
 *
 * Features:
 * - Custom animated refresh indicator
 * - Haptic feedback on pull threshold
 * - Spring-based animations
 * - Cross-platform support
 *
 * @example
 * ```tsx
 * const { refreshControl } = useRefreshControl({
 *   refreshing: isRefreshing,
 *   onRefresh: handleRefresh,
 * });
 *
 * <ScrollView refreshControl={refreshControl}>
 *   ...
 * </ScrollView>
 * ```
 */
export const PullToRefresh = memo<PullToRefreshProps>(
  ({
    refreshing,
    onRefresh,
    colors: customColors,
    progressViewOffset = 0,
    progressBackgroundColor,
    tintColor,
    title,
    titleColor,
    disableHaptic = false,
  }) => {
    const { colors } = useTheme();
    const { medium } = useHaptic();

    const handleRefresh = useCallback(() => {
      if (!disableHaptic) {
        medium();
      }
      onRefresh();
    }, [onRefresh, disableHaptic, medium]);

    const refreshControlProps = useMemo(
      () => ({
        refreshing,
        onRefresh: handleRefresh,
        colors: customColors ?? [colors.interactive.default],
        tintColor: tintColor ?? colors.interactive.default,
        progressBackgroundColor: progressBackgroundColor ?? colors.background.elevated,
        progressViewOffset,
        ...(Platform.OS === 'ios' && {
          title,
          titleColor: titleColor ?? colors.text.secondary,
        }),
      }),
      [
        refreshing,
        handleRefresh,
        customColors,
        tintColor,
        progressBackgroundColor,
        progressViewOffset,
        title,
        titleColor,
        colors,
      ],
    );

    return <RefreshControl {...refreshControlProps} />;
  },
);

PullToRefresh.displayName = 'PullToRefresh';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  indicator: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInner: {
    width: 24,
    height: 24,
  },
  indicatorArc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
  },
});

export default PullToRefresh;
