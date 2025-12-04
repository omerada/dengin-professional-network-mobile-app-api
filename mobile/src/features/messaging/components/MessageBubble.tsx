// src/features/messaging/components/MessageBubble.tsx
// Mesaj baloncuğu komponenti - Backend MessageDto ile uyumlu
// Backend: com.meslektas.messaging.application.dto.MessageDto
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import type { Message, ClientMessage, ClientMessageStatus } from '../types';

interface MessageBubbleProps {
  message: Message | ClientMessage;
  isOwn?: boolean;
  showAvatar?: boolean;
  onLongPress?: (message: Message | ClientMessage) => void;
  onImagePress?: (url: string) => void;
}

/**
 * Mesaj durumu ikonu - Backend MessageStatus ile uyumlu
 * SENT, DELIVERED, READ + client-side SENDING, FAILED
 */
const MessageStatusIcon: React.FC<{ status: ClientMessageStatus }> = memo(({ status }) => {
  const { theme } = useTheme();

  switch (status) {
    case 'SENDING':
      return <ActivityIndicator size={12} color={theme.colors.text.tertiary} />;
    case 'SENT':
      return <Icon name="checkmark" size={14} color={theme.colors.text.tertiary} />;
    case 'DELIVERED':
      return <Icon name="checkmark-done" size={14} color={theme.colors.text.tertiary} />;
    case 'READ':
      return <Icon name="checkmark-done" size={14} color={theme.colors.primary[500]} />;
    case 'FAILED':
      return <Icon name="alert-circle" size={14} color={theme.colors.status.error} />;
    default:
      return null;
  }
});

MessageStatusIcon.displayName = 'MessageStatusIcon';

/**
 * Zaman formatlama - sentAt alanını kullanır
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Dosya boyutu formatlama
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({
  message,
  isOwn,
  showAvatar = false,
  onLongPress,
  onImagePress,
}) => {
  const { theme } = useTheme();
  
  // sentByMe alanını kullan, yoksa isOwn prop'unu
  const isSentByMe = message.sentByMe ?? isOwn ?? false;

  const handleLongPress = useCallback(() => {
    onLongPress?.(message);
  }, [message, onLongPress]);

  const bubbleStyle = [
    styles.bubble,
    isSentByMe
      ? [styles.ownBubble, { backgroundColor: theme.colors.primary[500] }]
      : [styles.otherBubble, { backgroundColor: theme.colors.background.secondary }],
  ];

  const textColor = isSentByMe ? '#FFFFFF' : theme.colors.text.primary;
  const metaColor = isSentByMe ? 'rgba(255,255,255,0.7)' : theme.colors.text.tertiary;

  // Attachment render
  const renderAttachment = () => {
    if (!message.attachment) return null;

    const { url, contentType, fileName, fileSize } = message.attachment;
    const isImage = contentType?.startsWith('image/');

    if (isImage) {
      return (
        <Pressable onPress={() => onImagePress?.(url)} style={styles.imageContainer}>
          <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
        </Pressable>
      );
    }

    // File attachment
    return (
      <View style={[styles.fileContainer, { backgroundColor: isSentByMe ? 'rgba(255,255,255,0.1)' : theme.colors.background.tertiary }]}>
        <Icon name="document-outline" size={24} color={isSentByMe ? '#FFFFFF' : theme.colors.text.secondary} />
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={[styles.fileSize, { color: metaColor }]}>
            {formatFileSize(fileSize)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isSentByMe ? styles.ownContainer : styles.otherContainer]}>
      <Pressable
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          bubbleStyle,
          pressed && styles.pressed,
        ]}
      >
        {/* Attachment */}
        {renderAttachment()}

        {/* Message content */}
        {message.content && (
          <Text style={[styles.content, { color: textColor }]}>
            {message.content}
          </Text>
        )}

        {/* Meta info */}
        <View style={styles.meta}>
          <Text style={[styles.time, { color: metaColor }]}>
            {formatTime(message.sentAt)}
          </Text>
          {isSentByMe && (
            <View style={styles.statusContainer}>
              <MessageStatusIcon status={message.status as ClientMessageStatus} />
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
  imageContainer: {
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  fileInfo: {
    marginLeft: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 11,
    marginTop: 2,
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
