// src/shared/components/OfflineNotice.tsx
// Offline network notice component
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import React, { memo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
import { useTheme } from '@contexts/ThemeContext';

export const OfflineNotice: React.FC = memo(() => {
  const { theme } = useTheme();
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
              withTiming(-100, { duration: 300 })
            );
            opacity.value = withSequence(
              withTiming(1, { duration: 300 }),
              withTiming(0, { duration: 300 })
            );
          }, 2000);
        }
      }
    });

    return () => unsubscribe();
  }, [isOffline, wasOffline, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      opacity.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  if (!isOffline && !wasOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          paddingTop: insets.top + 8,
          backgroundColor: isOffline
            ? theme.colors.error[500]
            : theme.colors.success[500],
        },
      ]}
    >
      <Icon
        name={isOffline ? 'cloud-offline' : 'cloud-done'}
        size={18}
        color="#FFFFFF"
        style={styles.icon}
      />
      <Text style={styles.text}>
        {isOffline
          ? 'İnternet bağlantısı yok'
          : 'Bağlantı yeniden kuruldu'}
      </Text>
    </Animated.View>
  );
});

OfflineNotice.displayName = 'OfflineNotice';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OfflineNotice;
