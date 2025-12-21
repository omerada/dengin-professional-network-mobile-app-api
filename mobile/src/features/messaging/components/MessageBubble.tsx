// src/features/messaging/components/MessageBubble.tsx
// Production-ready Message Bubble with animations
// Oku: mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { Avatar } from '@shared/components';
import { spacing, fontSize, borderRadius } from '@theme';
import { formatMessageTime } from '../utils';
import type { Message, ClientMessage } from '../types';

// ============================================================================
// Types
// ============================================================================

interface MessageBubbleProps {
  /** Message data */
  message: Message | ClientMessage;
  /** Is this message from current user */
  isOwn: boolean;
  /** Show avatar */
  showAvatar?: boolean;
  /** P3: Show timestamp separator above message */
  showTimestamp?: boolean;
  /** Sender avatar URL (for non-own messages) */
  senderAvatar?: string | null;
  /** Callback when long press */
  onLongPress?: (message: Message | ClientMessage) => void;
  /** P2 Addition: Is this a newly received message (animate entrance) */
  isNew?: boolean;
}

// ============================================================================
// MessageBubble Component
// ============================================================================

/**
 * Message Bubble with smooth entrance animation
 * P2 Optimized: Only animates new messages, old messages render instantly
 *
 * Features:
 * - Slide-in animation from left/right (only for new messages)
 * - Fade in animation (only for new messages)
 * - WhatsApp-style bubble design
 * - Avatar support
 * - Time display
 * - Long press for options
 *
 * @example
 * ```tsx
 * <MessageBubble
 *   message={message}
 *   isOwn={true}
 *   showAvatar={true}
 *   isNew={true}
 *   onLongPress={handleLongPress}
 * />
 * ```
 */
export const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({
    message,
    isOwn,
    showAvatar = true,
    showTimestamp = false,
    senderAvatar,
    onLongPress,
    isNew = false,
  }) => {
    const colors = useColors();

    // P2: Animation values - only animate if isNew
    const translateX = useSharedValue(isNew ? (isOwn ? 50 : -50) : 0);
    const opacity = useSharedValue(isNew ? 0 : 1);

    useEffect(() => {
      if (isNew) {
        // Animate entrance for new messages
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 200 });
      } else {
        // Instant render for old messages (performance optimization)
        translateX.value = 0;
        opacity.value = 1;
      }
    }, [isNew, translateX, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    }));

    const handleLongPress = () => {
      onLongPress?.(message);
    };

    const bubbleColor = isOwn ? colors.interactive.default : colors.background.secondary;
    const textColor = isOwn ? colors.text.inverse : colors.text.primary;

    // P3: Format timestamp separator (only date if today, otherwise full date)
    const formatTimestampSeparator = (date: string) => {
      const messageDate = new Date(date);
      const now = new Date();
      const isToday = messageDate.toDateString() === now.toDateString();

      if (isToday) {
        return `Bugün ${messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
      }

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (messageDate.toDateString() === yesterday.toDateString()) {
        return `Dün ${messageDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
      }

      return messageDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <>
        {/* P3: Timestamp separator */}
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={[styles.timestampText, { color: colors.text.tertiary }]}>
              {formatTimestampSeparator(message.sentAt)}
            </Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.container,
            isOwn ? styles.containerOwn : styles.containerOther,
            animatedStyle,
          ]}>
          {/* Avatar for other user's messages */}
          {!isOwn && showAvatar && <Avatar uri={senderAvatar} size="sm" style={styles.avatar} />}

          {!isOwn && !showAvatar && <View style={styles.avatarSpacer} />}

          <Pressable
            onLongPress={handleLongPress}
            style={[
              styles.bubble,
              { backgroundColor: bubbleColor },
              isOwn ? styles.bubbleOwn : styles.bubbleOther,
            ]}>
            {/* Message content */}
            <Text style={[styles.messageText, { color: textColor }]}>{message.content}</Text>

            {/* Time */}
            <Text
              style={[
                styles.timeText,
                {
                  color: isOwn ? colors.text.inverse : colors.text.tertiary,
                },
              ]}>
              {formatMessageTime(message.sentAt)}
            </Text>

            {/* Status for own messages */}
            {isOwn && (
              <View style={styles.statusContainer}>
                {/* Add read/sent status icons here if needed */}
              </View>
            )}
          </Pressable>

          {/* Avatar spacer for own messages */}
          {isOwn && <View style={styles.avatarSpacer} />}
        </Animated.View>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Optimize re-renders
    return (
      prevProps.message.messageId === nextProps.message.messageId &&
      prevProps.isOwn === nextProps.isOwn &&
      prevProps.showAvatar === nextProps.showAvatar
    );
  },
);

MessageBubble.displayName = 'MessageBubble';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: spacing.xs,
    marginTop: spacing['0.5'],
  },
  avatarSpacer: {
    width: 32, // Avatar size sm
  },
  bubble: {
    borderRadius: borderRadius.xl,
    maxWidth: '70%',
    minWidth: 60,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  timeText: {
    fontSize: fontSize.xs,
    marginTop: spacing['0.5'],
  },
  statusContainer: {
    alignItems: 'flex-end',
    marginTop: spacing['0.5'],
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  timestampText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
});
