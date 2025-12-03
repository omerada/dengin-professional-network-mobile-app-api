// src/features/messaging/components/MessageBubble.tsx
// Mesaj baloncuğu komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import type { Message, MessageStatus } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onLongPress?: (message: Message) => void;
  onReplyPress?: (message: Message) => void;
}

/**
 * Mesaj durumu ikonu
 */
const MessageStatusIcon: React.FC<{ status: MessageStatus }> = memo(({ status }) => {
  const { theme } = useTheme();

  switch (status) {
    case 'sending':
      return <ActivityIndicator size={12} color={theme.colors.text.tertiary} />;
    case 'sent':
      return <Icon name="checkmark" size={14} color={theme.colors.text.tertiary} />;
    case 'delivered':
      return <Icon name="checkmark-done" size={14} color={theme.colors.text.tertiary} />;
    case 'read':
      return <Icon name="checkmark-done" size={14} color={theme.colors.primary[500]} />;
    case 'failed':
      return <Icon name="alert-circle" size={14} color={theme.colors.status.error} />;
    default:
      return null;
  }
});

MessageStatusIcon.displayName = 'MessageStatusIcon';

/**
 * Zaman formatlama
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({
  message,
  isOwn,
  showAvatar = false,
  onLongPress,
  onReplyPress,
}) => {
  const { theme } = useTheme();

  const handleLongPress = useCallback(() => {
    onLongPress?.(message);
  }, [message, onLongPress]);

  const bubbleStyle = [
    styles.bubble,
    isOwn
      ? [styles.ownBubble, { backgroundColor: theme.colors.primary[500] }]
      : [styles.otherBubble, { backgroundColor: theme.colors.background.secondary }],
  ];

  const textColor = isOwn ? '#FFFFFF' : theme.colors.text.primary;
  const metaColor = isOwn ? 'rgba(255,255,255,0.7)' : theme.colors.text.tertiary;

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <Pressable
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          bubbleStyle,
          pressed && styles.pressed,
        ]}
      >
        {/* Reply indicator */}
        {message.replyTo && (
          <Pressable
            style={[
              styles.replyContainer,
              { borderLeftColor: isOwn ? 'rgba(255,255,255,0.5)' : theme.colors.primary[500] },
            ]}
            onPress={() => onReplyPress?.(message)}
          >
            <Text
              style={[styles.replyName, { color: isOwn ? 'rgba(255,255,255,0.9)' : theme.colors.primary[500] }]}
              numberOfLines={1}
            >
              {message.replyTo.senderName}
            </Text>
            <Text
              style={[styles.replyText, { color: metaColor }]}
              numberOfLines={1}
            >
              {message.replyTo.content}
            </Text>
          </Pressable>
        )}

        {/* Message content */}
        <Text style={[styles.content, { color: textColor }]}>
          {message.content}
        </Text>

        {/* Meta info */}
        <View style={styles.meta}>
          <Text style={[styles.time, { color: metaColor }]}>
            {formatTime(message.createdAt)}
          </Text>
          {isOwn && (
            <View style={styles.statusContainer}>
              <MessageStatusIcon status={message.status} />
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  pressed: {
    opacity: 0.9,
  },
  replyContainer: {
    borderLeftWidth: 2,
    paddingLeft: 8,
    marginBottom: 6,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
  },
  statusContainer: {
    marginLeft: 4,
  },
});

export default MessageBubble;
