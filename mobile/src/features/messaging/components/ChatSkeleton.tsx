// src/features/messaging/components/ChatSkeleton.tsx
// Skeleton loader for chat messages
// Production-ready component

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { Skeleton } from '@shared/components';
import { spacing } from '@theme';
import { UNIFIED_TIMING } from '@constants';

interface ChatSkeletonProps {
  /**
   * Number of message bubbles to render
   * @default 8
   */
  count?: number;
}

/**
 * ChatSkeleton Component
 *
 * Displays skeleton placeholders for chat messages.
 * Alternates between sent and received message styles.
 *
 * @example
 * ```tsx
 * {isLoading && <ChatSkeleton count={8} />}
 * ```
 */
export const ChatSkeleton: React.FC<ChatSkeletonProps> = memo(({ count = 8 }) => {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeIn.duration(UNIFIED_TIMING.componentEnter)}
      style={styles.container}>
      {Array.from({ length: count }).map((_, index) => {
        // Alternate between sent (right) and received (left) messages
        const isSent = index % 3 !== 0;
        const bubbleWidth = index % 2 === 0 ? '70%' : '60%';

        return (
          <View
            key={`skeleton-${index}`}
            style={[
              styles.messageContainer,
              isSent ? styles.sentContainer : styles.receivedContainer,
            ]}>
            {/* Avatar for received messages */}
            {!isSent && <Skeleton width={32} height={32} borderRadius={16} style={styles.avatar} />}

            {/* Message bubble */}
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: isSent
                    ? colors.background.secondary
                    : colors.background.tertiary,
                },
              ]}>
              <Skeleton width={bubbleWidth} height={40} borderRadius={16} />
            </View>

            {/* Avatar space for sent messages (balance layout) */}
            {isSent && <View style={styles.avatarSpace} />}
          </View>
        );
      })}
    </Animated.View>
  );
});

ChatSkeleton.displayName = 'ChatSkeleton';

const styles = StyleSheet.create({
  avatar: {
    marginRight: spacing['2'],
  },
  avatarSpace: {
    marginLeft: spacing['2'],
    width: 32,
  },
  bubble: {
    borderRadius: 16,
    maxWidth: '75%',
    padding: spacing['2'],
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
  },
  messageContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginBottom: spacing['2'],
  },
  receivedContainer: {
    justifyContent: 'flex-start',
  },
  sentContainer: {
    justifyContent: 'flex-end',
  },
});
