// src/shared/components/Skeleton/MessageListSkeleton.tsx
// Message List Skeleton - Production Ready

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { UNIFIED_TIMING } from '@constants';

/**
 * Message List Skeleton
 * ChatScreen için skeleton loading state
 */
export const MessageListSkeleton: React.FC = () => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5].map(index => {
        const isSent = index % 3 === 0; // Alternate sent/received messages
        const delay = Math.min(
          index * UNIFIED_TIMING.listItemDelay,
          UNIFIED_TIMING.listItemDelayMax,
        );

        return (
          <Animated.View
            key={index}
            entering={FadeIn.delay(delay).duration(UNIFIED_TIMING.listItemDuration)}
            style={[styles.messageItem, isSent ? styles.sentMessage : styles.receivedMessage]}>
            <View
              style={[
                styles.bubble,
                isSent ? styles.sentBubble : styles.receivedBubble,
                { backgroundColor: colors.background.secondary },
              ]}>
              <View
                style={[
                  styles.textLine,
                  { backgroundColor: colors.border.default },
                  { width: index % 2 === 0 ? '80%' : '60%' },
                ]}
              />
              <View
                style={[
                  styles.textLine,
                  styles.shortLine,
                  { backgroundColor: colors.border.default },
                ]}
              />
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  messageItem: {
    marginBottom: spacing.sm,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: spacing.md,
  },
  sentBubble: {
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
  },
  textLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  shortLine: {
    width: '40%',
    marginBottom: 0,
  },
});
