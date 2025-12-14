// src/shared/components/CustomRefreshControl/CustomRefreshControl.tsx
// Branded refresh control with smooth animations
// Production-ready implementation

import React, { memo } from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { useColors } from '@contexts/ThemeContext';

interface CustomRefreshControlProps extends Omit<RefreshControlProps, 'tintColor' | 'colors'> {
  /** Override default brand color */
  color?: string;
}

/**
 * CustomRefreshControl Component
 *
 * Branded pull-to-refresh control with consistent styling.
 * Automatically uses brand colors and proper configuration for iOS/Android.
 *
 * Features:
 * - Brand color integration (Terracotta)
 * - Platform-specific optimizations
 * - Consistent appearance across app
 * - Drop-in replacement for RefreshControl
 *
 * @example
 * ```tsx
 * <FlatList
 *   data={data}
 *   refreshControl={
 *     <CustomRefreshControl
 *       refreshing={isRefreshing}
 *       onRefresh={handleRefresh}
 *     />
 *   }
 * />
 * ```
 */
export const CustomRefreshControl = memo<CustomRefreshControlProps>(
  ({ color, refreshing, onRefresh, ...props }) => {
    const colors = useColors();

    const brandColor = color || colors.interactive.default;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        // iOS
        tintColor={brandColor}
        titleColor={colors.text.secondary}
        // Android
        colors={[brandColor]}
        progressBackgroundColor={colors.background.primary}
        // Common
        {...props}
      />
    );
  },
);

CustomRefreshControl.displayName = 'CustomRefreshControl';

export default CustomRefreshControl;
