// src/features/messaging/components/TypingIndicator.tsx
// Yazıyor göstergesi komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@contexts/ThemeContext';

interface TypingIndicatorProps {
  users: string[];
  visible?: boolean;
}

const AnimatedDot: React.FC<{ delay: number; color: string }> = memo(({ delay, color }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
});

AnimatedDot.displayName = 'AnimatedDot';

/**
 * Yazıyor metni oluştur
 */
const getTypingText = (users: string[]): string => {
  if (users.length === 0) return '';
  if (users.length === 1) return `${users[0]} yazıyor`;
  if (users.length === 2) return `${users[0]} ve ${users[1]} yazıyor`;
  return `${users[0]} ve ${users.length - 1} kişi yazıyor`;
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = memo(({
  users,
  visible = true,
}) => {
  const { theme } = useTheme();

  if (!visible || users.length === 0) {
    return null;
  }

  const typingText = getTypingText(users);
  const dotColor = theme.colors.text.secondary;

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <AnimatedDot delay={0} color={dotColor} />
        <AnimatedDot delay={150} color={dotColor} />
        <AnimatedDot delay={300} color={dotColor} />
      </View>
      <Text
        style={[styles.text, { color: theme.colors.text.secondary }]}
        numberOfLines={1}
      >
        {typingText}
      </Text>
    </View>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});

export default TypingIndicator;
