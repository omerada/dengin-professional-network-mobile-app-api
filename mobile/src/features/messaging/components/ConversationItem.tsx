// src/features/messaging/components/ConversationItem.tsx
// Konuşma listesi öğesi komponenti - Backend ConversationDto ile uyumlu
// Backend: com.meslektas.messaging.application.dto.ConversationDto
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { useMessagingStore } from '../stores';
import type { Conversation } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
  onLongPress?: (conversation: Conversation) => void;
}

/**
 * Zaman formatlama (göreli) - updatedAt alanını kullanır
 */
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'şimdi';
  if (diffMins < 60) return `${diffMins}dk`;
  if (diffHours < 24) return `${diffHours}sa`;
  if (diffDays < 7) return `${diffDays}g`;
  
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
  });
};

/**
 * Son mesaj önizlemesi - Backend LastMessageDto ile uyumlu
 */
const getLastMessagePreview = (
  conversation: Conversation,
  isTyping: boolean
): string => {
  if (isTyping) return 'yazıyor...';
  
  const lastMessage = conversation.lastMessage;
  if (!lastMessage) return 'Henüz mesaj yok';
  
  // Attachment varsa
  if (lastMessage.hasAttachment) {
    return lastMessage.sentByMe ? 'Fotoğraf gönderdiniz' : 'Fotoğraf';
  }
  
  const content = lastMessage.content;
  return content.length > 40 ? `${content.slice(0, 40)}...` : content;
};

export const ConversationItem: React.FC<ConversationItemProps> = memo(({
  conversation,
  onPress,
  onLongPress,
}) => {
  const { theme } = useTheme();
  const { typingUsers, onlineUsers } = useMessagingStore();

  const handlePress = useCallback(() => {
    onPress(conversation);
  }, [conversation, onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(conversation);
  }, [conversation, onLongPress]);

  // Typing status - conversationId kullanarak
  const conversationTypingUsers = typingUsers[conversation.conversationId] || [];
  const isTyping = conversationTypingUsers.length > 0;

  // Online status - participant.online veya onlineUsers set'i
  const isOnline = conversation.participant.online || onlineUsers.has(conversation.participant.userId);

  const hasUnread = conversation.unreadCount > 0;

  // Participant bilgileri
  const { participant } = conversation;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? theme.colors.background.secondary : theme.colors.background.primary },
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {participant.profileImageUrl ? (
          <Image
            source={{ uri: participant.profileImageUrl }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: theme.colors.primary[100] },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.colors.primary[500] }]}>
              {participant.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Online indicator */}
        {isOnline && (
          <View
            style={[
              styles.onlineIndicator,
              { backgroundColor: theme.colors.status.success },
            ]}
          />
        )}
        
        {/* Verified badge */}
        {participant.verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.primary[500] }]}>
            <Icon name="checkmark" size={8} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text
              style={[
                styles.name,
                { color: theme.colors.text.primary },
                hasUnread && styles.nameBold,
              ]}
              numberOfLines={1}
            >
              {participant.fullName}
            </Text>
          </View>
          <Text
            style={[
              styles.time,
              { color: hasUnread ? theme.colors.primary[500] : theme.colors.text.tertiary },
            ]}
          >
            {formatRelativeTime(conversation.lastMessage?.sentAt || conversation.updatedAt)}
          </Text>
        </View>

        <View style={styles.subHeader}>
          <Text
            style={[styles.profession, { color: theme.colors.text.tertiary }]}
            numberOfLines={1}
          >
            {participant.profession}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.preview,
              { color: isTyping ? theme.colors.primary[500] : theme.colors.text.secondary },
              isTyping && styles.previewTyping,
              hasUnread && styles.previewBold,
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage?.sentByMe && !isTyping && 'Sen: '}
            {getLastMessagePreview(conversation, isTyping)}
          </Text>

          {hasUnread && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.primary[500] },
              ]}
            >
              <Text style={styles.badgeText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

ConversationItem.displayName = 'ConversationItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  name: {
    fontSize: 16,
  },
  nameBold: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  subHeader: {
    marginTop: 2,
  },
  profession: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  preview: {
    fontSize: 14,
    flex: 1,
  },
  previewTyping: {
    fontStyle: 'italic',
  },
  previewBold: {
    fontWeight: '500',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ConversationItem;
