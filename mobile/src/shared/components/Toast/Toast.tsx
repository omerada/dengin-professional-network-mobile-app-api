// src/shared/components/Toast/Toast.tsx
// Toast bildirim komponenti
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART4.md

import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  /**
   * Toast data containing type, message, etc.
   */
  toast: ToastData;
  /**
   * Callback when toast should be hidden
   */
  onHide: (id: string) => void;
}

const ICONS: Record<ToastType, string> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

/**
 * Toast Component
 * 
 * Animated toast notification that appears at the top of the screen.
 * Auto-hides after specified duration.
 * 
 * @example
 * ```tsx
 * // Used internally by ToastProvider
 * <Toast
 *   toast={{ id: '1', type: 'success', message: 'Saved!' }}
 *   onHide={(id) => removeToast(id)}
 * />
 * ```
 */
export const Toast: React.FC<ToastProps> = memo(({ toast, onHide }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const getColor = (): string => {
    switch (toast.type) {
      case 'success':
        return theme.colors.success.main;
      case 'error':
        return theme.colors.error.main;
      case 'warning':
        return theme.colors.warning.main;
      case 'info':
        return theme.colors.info.main;
    }
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide(toast.id));
  };

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    const timer = setTimeout(() => {
      hideToast();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.primary,
          top: insets.top + spacing.sm,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: getColor() }]} />
      <Icon name={ICONS[toast.type]} size={24} color={getColor()} />
      <Text
        style={[styles.message, { color: theme.colors.text.primary }]}
        numberOfLines={2}
      >
        {toast.message}
      </Text>
      <TouchableOpacity
        onPress={hideToast}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Icon name="close" size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  message: {
    flex: 1,
    fontSize: fontSize.base,
    marginHorizontal: spacing.sm,
  },
});

Toast.displayName = 'Toast';

