// src/features/messaging/components/TypingIndicator.tsx
// Production-ready Typing Indicator with animated dots
// Oku: mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '@theme';

// ============================================================================
// Types
// ============================================================================

interface TypingIndicatorProps {
  /** User name who is typing */
  userName?: string;
  /** Show typing indicator */
  visible?: boolean;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// AnimatedDot Component
// ============================================================================

const AnimatedDot: React.FC<{ delay: number; color: string }> = memo(({ delay, color }) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1.2, { damping: 8, stiffness: 300 }),
          withSpring(0.8, { damping: 8, stiffness: 300 }),
        ),
        -1, // infinite
        false,
      ),
    );

    return () => {
      cancelAnimation(scale);
    };
  }, [delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
});

AnimatedDot.displayName = 'AnimatedDot';

// ============================================================================
// TypingIndicator Component
// ============================================================================

/**
 * Typing Indicator with animated dots
 *
 * Features:
 * - Smooth animated dots (WhatsApp-style)
 * - Optional user name display
 * - Lightweight performance
 * - Auto cleanup on unmount
 *
 * @example
 * ```tsx
 * <TypingIndicator
 *   userName="Ahmet"
 *   visible={isTyping}
 * />
 * ```
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = memo(
  ({ userName, visible = true, testID }) => {
    const colors = useColors();

    if (!visible) {
      return null;
    }

    return (
      <View style={styles.container} testID={testID}>
        <View style={[styles.bubble, { backgroundColor: colors.background.secondary }]}>
          <View style={styles.dotsContainer}>
            <AnimatedDot delay={0} color={colors.text.tertiary} />
            <AnimatedDot delay={150} color={colors.text.tertiary} />
            <AnimatedDot delay={300} color={colors.text.tertiary} />
          </View>
        </View>
        {userName && (
          <Text style={[styles.userName, { color: colors.text.tertiary }]} numberOfLines={1}>
            {userName} yazıyor...
          </Text>
        )}
      </View>
    );
  },
);

TypingIndicator.displayName = 'TypingIndicator';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  bubble: {
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  userName: {
    fontSize: fontSize.xs,
    marginTop: spacing['0.5'],
    paddingHorizontal: spacing.xs,
  },
});
