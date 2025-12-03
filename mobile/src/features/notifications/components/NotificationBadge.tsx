// src/features/notifications/components/NotificationBadge.tsx
// Badge indicator for notification icon in header/tab bar
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@contexts/ThemeContext';
import { useNotificationStore } from '../stores';

interface NotificationBadgeProps {
  size?: 'small' | 'medium' | 'large';
  maxCount?: number;
  showZero?: boolean;
  animated?: boolean;
}

const SIZES = {
  small: {
    minSize: 16,
    fontSize: 10,
    padding: 3,
  },
  medium: {
    minSize: 20,
    fontSize: 11,
    padding: 4,
  },
  large: {
    minSize: 24,
    fontSize: 13,
    padding: 5,
  },
};

export const NotificationBadge: React.FC<NotificationBadgeProps> = memo(
  ({ size = 'medium', maxCount = 99, showZero = false, animated = true }) => {
    const { theme } = useTheme();
    const unreadCount = useNotificationStore((state) => state.unreadCount);

    const scale = useSharedValue(1);
    const prevCount = useSharedValue(unreadCount);

    // Animate when count changes
    useEffect(() => {
      if (animated && unreadCount > prevCount.value) {
        scale.value = withSequence(
          withSpring(1.3, { damping: 6, stiffness: 400 }),
          withSpring(1, { damping: 8, stiffness: 300 })
        );
      }
      prevCount.value = unreadCount;
    }, [unreadCount, animated, scale, prevCount]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Don't render if no unread and showZero is false
    if (unreadCount <= 0 && !showZero) {
      return null;
    }

    const sizeConfig = SIZES[size];
    const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();
    const isLargeNumber = unreadCount > 9;

    return (
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          {
            minWidth: sizeConfig.minSize,
            height: sizeConfig.minSize,
            paddingHorizontal: isLargeNumber ? sizeConfig.padding + 2 : 0,
            borderRadius: sizeConfig.minSize / 2,
            backgroundColor: theme.colors.error[500],
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeConfig.fontSize,
            },
          ]}
        >
          {displayCount}
        </Text>
      </Animated.View>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default NotificationBadge;
