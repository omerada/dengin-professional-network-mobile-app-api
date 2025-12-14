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
  bubble: {
    borderRadius: 18,
    maxWidth: '75%',
    padding: spacing.md,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  messageItem: {
    marginBottom: spacing.sm,
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  sentBubble: {
    borderBottomRightRadius: 4,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  shortLine: {
    marginBottom: 0,
    width: '40%',
  },
  textLine: {
    borderRadius: 6,
    height: 12,
    marginBottom: spacing.xs,
  },
});
