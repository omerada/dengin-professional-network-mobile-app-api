// src/shared/components/Loading/Loading.tsx
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing } from '@theme';

/**
 * Loading component props
 */
interface LoadingProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

/**
 * Loading spinner component
 */
export const Loading = React.memo<LoadingProps>(
  ({ size = 'large', message, fullScreen = false, style }) => {
    const { theme } = useTheme();

    const containerStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
      ...(fullScreen && {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
      }),
      ...style,
    };

    return (
      <View
        style={containerStyle}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={message || 'Yükleniyor'}>
        <ActivityIndicator size={size} color={theme.colors.primary[500]} />
        {message && (
          <Text
            style={{
              marginTop: spacing.md,
              color: theme.colors.text.secondary,
              fontSize: 14,
            }}>
            {message}
          </Text>
        )}
      </View>
    );
  },
);

Loading.displayName = 'Loading';

/**
 * Full screen loading overlay
 */
export const LoadingOverlay = React.memo<{ message?: string }>(({ message }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.surface.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      }}>
      <View
        style={{
          backgroundColor: theme.colors.surface.card,
          borderRadius: 12,
          padding: spacing.xl,
        }}>
        <Loading message={message} />
      </View>
    </View>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';
