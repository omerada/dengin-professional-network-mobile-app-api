// src/shared/components/UploadProgress/UploadProgress.tsx
// Production-ready Upload Progress Indicator
// Oku: mobile-development-guide/ui-ux-modernization/11-UPLOAD-FEEDBACK.md

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '@theme';

// ============================================================================
// Types
// ============================================================================

export interface UploadProgressProps {
  /** Upload progress (0-100) */
  progress: number;
  /** File name */
  fileName?: string;
  /** Upload state */
  state: 'uploading' | 'success' | 'error';
  /** Error message */
  errorMessage?: string;
  /** Cancel handler */
  onCancel?: () => void;
  /** Retry handler (for error state) */
  onRetry?: () => void;
  /** Dismiss handler (for success/error) */
  onDismiss?: () => void;
}

// ============================================================================
// UploadProgress Component
// ============================================================================

/**
 * Upload Progress Indicator
 *
 * Visual feedback for file uploads (images, videos, documents).
 * WhatsApp/Instagram style progress indicator.
 *
 * Features:
 * - Animated progress bar
 * - State icons (uploading, success, error)
 * - File name display
 * - Cancel/retry actions
 * - Auto-dismiss on success
 *
 * @example
 * ```tsx
 * <UploadProgress
 *   progress={65}
 *   fileName="photo.jpg"
 *   state="uploading"
 *   onCancel={handleCancel}
 * />
 *
 * <UploadProgress
 *   progress={100}
 *   fileName="photo.jpg"
 *   state="success"
 *   onDismiss={handleDismiss}
 * />
 *
 * <UploadProgress
 *   progress={45}
 *   fileName="photo.jpg"
 *   state="error"
 *   errorMessage="Yükleme başarısız"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export const UploadProgress: React.FC<UploadProgressProps> = memo(
  ({ progress, fileName, state, errorMessage, onCancel, onRetry, onDismiss }) => {
    const colors = useColors();

    // Animation values
    const progressWidth = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
      // Entrance animation
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    }, [scale, opacity]);

    useEffect(() => {
      // Progress animation
      progressWidth.value = withTiming(progress, {
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
    }, [progress, progressWidth]);

    // Container animation
    const containerAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    // Progress bar animation
    const progressAnimatedStyle = useAnimatedStyle(() => ({
      width: `${progressWidth.value}%`,
    }));

    // State-based UI config
    const stateConfig = {
      uploading: {
        icon: 'cloud-upload-outline',
        iconColor: colors.interactive.default,
        statusText: `Yükleniyor... ${Math.round(progress)}%`,
        showCancel: true,
      },
      success: {
        icon: 'checkmark-circle',
        iconColor: colors.status.success,
        statusText: 'Yükleme tamamlandı',
        showCancel: false,
      },
      error: {
        icon: 'alert-circle',
        iconColor: colors.status.error,
        statusText: errorMessage || 'Yükleme başarısız',
        showCancel: false,
      },
    };

    const config = stateConfig[state];

    return (
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background.secondary },
          containerAnimatedStyle,
        ]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Icon name={config.icon} size={24} color={config.iconColor} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* File name */}
          {fileName && (
            <Text style={[styles.fileName, { color: colors.text.primary }]} numberOfLines={1}>
              {fileName}
            </Text>
          )}

          {/* Status text */}
          <Text style={[styles.statusText, { color: colors.text.secondary }]}>
            {config.statusText}
          </Text>

          {/* Progress bar (only for uploading state) */}
          {state === 'uploading' && (
            <View style={[styles.progressTrack, { backgroundColor: colors.border.subtle }]}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { backgroundColor: colors.interactive.default },
                  progressAnimatedStyle,
                ]}
              />
            </View>
          )}
        </View>

        {/* Action button */}
        <View style={styles.actionContainer}>
          {state === 'uploading' && config.showCancel && onCancel && (
            <Pressable style={styles.actionButton} onPress={onCancel} hitSlop={8}>
              <Icon name="close" size={20} color={colors.text.secondary} />
            </Pressable>
          )}

          {state === 'success' && onDismiss && (
            <Pressable style={styles.actionButton} onPress={onDismiss} hitSlop={8}>
              <Icon name="close" size={20} color={colors.text.secondary} />
            </Pressable>
          )}

          {state === 'error' && onRetry && (
            <Pressable style={styles.actionButton} onPress={onRetry} hitSlop={8}>
              <Icon name="refresh" size={20} color={colors.interactive.default} />
            </Pressable>
          )}
        </View>
      </Animated.View>
    );
  },
);

UploadProgress.displayName = 'UploadProgress';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  fileName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing['0.5'],
  },
  statusText: {
    fontSize: fontSize.xs,
    marginBottom: spacing['0.5'],
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing['0.5'],
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  actionContainer: {
    marginLeft: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
