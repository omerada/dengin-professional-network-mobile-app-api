// src/shared/components/OfflineNotice.tsx
// Dengin Design System - Modern Offline Notice Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useEffect, useState } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@contexts/ThemeContext';

/**
 * Modern OfflineNotice Component
 *
 * Features:
 * - Animated slide in/out
 * - Network state monitoring
 * - Offline/online status indication
 * - Safe area aware
 * - Accessibility support
 *
 * @example
 * ```tsx
 * // Place at app root
 * <OfflineNotice />
 * ```
 */
export const OfflineNotice: React.FC = memo(() => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const offline = !state.isConnected || !state.isInternetReachable;

      if (offline !== isOffline) {
        if (offline) {
          // Going offline
          setIsOffline(true);
          setWasOffline(true);
          translateY.value = withTiming(0, { duration: 300 });
          opacity.value = withTiming(1, { duration: 300 });
        } else if (wasOffline) {
          // Coming back online
          setIsOffline(false);

          // Show "back online" briefly then hide
          setTimeout(() => {
            translateY.value = withSequence(
              withTiming(0, { duration: 300 }),
              withTiming(-100, { duration: 300 }),
            );
            opacity.value = withSequence(
              withTiming(1, { duration: 300 }),
              withTiming(0, { duration: 300 }),
            );
          }, 2000);
        }
      }
    });

    return () => unsubscribe();
  }, [isOffline, wasOffline, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: translateY.value }],
  }));

  if (!isOffline && !wasOffline) return null;

  const backgroundColor = isOffline ? colors.status.error : colors.status.success;
  const accessibilityMessage = isOffline
    ? 'İnternet bağlantısı yok. Bazı özellikler kullanılamayabilir.'
    : 'Bağlantı yeniden kuruldu.';

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor,
          paddingTop: insets.top + 8,
        },
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={accessibilityMessage}
      accessibilityLiveRegion="assertive">
      <Icon
        name={isOffline ? 'cloud-offline' : 'cloud-done'}
        size={18}
        color={colors.text.inverse}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: colors.text.inverse }]}>
        {isOffline ? 'İnternet bağlantısı yok' : 'Bağlantı yeniden kuruldu'}
      </Text>
    </Animated.View>
  );
});

OfflineNotice.displayName = 'OfflineNotice';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    paddingBottom: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OfflineNotice;
