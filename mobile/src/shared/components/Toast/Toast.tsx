// src/shared/components/Toast/Toast.tsx
// Meslektaş Design System - Modern Toast Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { shadows } from '@theme/shadows';
import { spring } from '@theme/animations';

import { styles } from './Toast.styles';
import { TOAST_DURATION, TOAST_ICONS, type ToastProps, type ToastType } from './Toast.types';

// Re-export types for backward compatibility
export type { ToastData, ToastType } from './Toast.types';

/**
 * Modern Toast Component
 *
 * Features:
 * - Spring-based slide animations
 * - Multiple types (success, error, warning, info)
 * - Optional title and action button
 * - Haptic feedback based on type
 * - Safe area aware positioning
 * - Swipe to dismiss (optional)
 *
 * @example
 * ```tsx
 * <Toast
 *   toast={{
 *     id: '1',
 *     type: 'success',
 *     message: 'Profile updated successfully!',
 *     title: 'Success',
 *   }}
 *   onHide={(id) => removeToast(id)}
 * />
 * ```
 */
export const Toast: React.FC<ToastProps> = memo(
  ({ toast, onHide, position = 'top', animation = 'slide', style, testID }) => {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { trigger } = useHaptic();

    // Animation values
    const translateY = useSharedValue(position === 'top' ? -100 : 100);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);

    // Get color based on toast type
    const getTypeColor = useCallback(
      (type: ToastType): string => {
        switch (type) {
          case 'success':
            return colors.status.success;
          case 'error':
            return colors.status.error;
          case 'warning':
            return colors.status.warning;
          case 'info':
            return colors.status.info;
        }
      },
      [colors.status],
    );

    const typeColor = useMemo(() => getTypeColor(toast.type), [getTypeColor, toast.type]);

    // Hide toast animation
    const hideToast = useCallback(() => {
      const hideY = position === 'top' ? -100 : 100;

      translateY.value = withTiming(hideY, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 }, () => {
        scheduleOnRN(() => onHide(toast.id));
      });
    }, [position, translateY, opacity, scale, onHide, toast.id]);

    // Show animation and auto-hide timer
    useEffect(() => {
      // Trigger haptic based on type
      if (toast.type === 'error') {
        trigger('notificationError');
      } else if (toast.type === 'success') {
        trigger('notificationSuccess');
      } else {
        trigger('impactLight');
      }

      // Show animation
      if (animation === 'bounce') {
        translateY.value = withSequence(
          withSpring(position === 'top' ? -10 : 10, spring.bouncy),
          withSpring(0, spring.gentle),
        );
      } else {
        translateY.value = withSpring(0, spring.snappy);
      }

      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, spring.snappy);

      // Auto hide
      const duration = toast.duration ?? TOAST_DURATION[toast.type];
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animated container style
    const animatedContainerStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    // Position style
    const positionStyle = useMemo(
      () =>
        position === 'top'
          ? { left: 0, right: 0, top: insets.top + 8 }
          : { bottom: insets.bottom + 8, left: 0, right: 0 },
      [position, insets.top, insets.bottom],
    );

    // Handle action press
    const handleActionPress = useCallback(() => {
      toast.action?.onPress();
      hideToast();
    }, [toast.action, hideToast]);

    return (
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background.primary },
          shadows.toast,
          positionStyle,
          animatedContainerStyle,
          style,
        ]}
        testID={testID}
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={toast.title ? `${toast.title}: ${toast.message}` : toast.message}>
        {/* Color Indicator */}
        <View style={[styles.indicator, { backgroundColor: typeColor }]} />

        {/* Icon */}
        <View style={styles.icon}>
          <Icon name={TOAST_ICONS[toast.type]} size={24} color={typeColor} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {toast.title && (
            <Text style={[styles.title, { color: colors.text.primary }]}>{toast.title}</Text>
          )}
          <Text style={[styles.message, { color: colors.text.secondary }]}>{toast.message}</Text>
        </View>

        {/* Action Button */}
        {toast.action && (
          <Pressable onPress={handleActionPress}>
            <Text style={[styles.action, { color: colors.interactive.default }]}>
              {toast.action.label}
            </Text>
          </Pressable>
        )}

        {/* Close Button */}
        <Pressable
          onPress={hideToast}
          style={styles.closeButton}
          hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Kapat">
          <Icon name="close" size={20} color={colors.text.tertiary} />
        </Pressable>
      </Animated.View>
    );
  },
);

Toast.displayName = 'Toast';
