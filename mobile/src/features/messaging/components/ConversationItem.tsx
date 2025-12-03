// src/features/messaging/components/ConversationItem.tsx
// Konuşma listesi öğesi komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

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
import type { ConversationSummary } from '../types';

interface ConversationItemProps {
  conversation: ConversationSummary;
  onPress: (conversation: ConversationSummary) => void;
  onLongPress?: (conversation: ConversationSummary) => void;
}

/**
 * Zaman formatlama (göreli)
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
 * Son mesaj önizlemesi
 */
const getLastMessagePreview = (
  lastMessage: string | undefined,
  isTyping: boolean
): string => {
  if (isTyping) return 'yazıyor...';
  if (!lastMessage) return 'Henüz mesaj yok';
  return lastMessage.length > 40 ? `${lastMessage.slice(0, 40)}...` : lastMessage;
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

  // Typing status
  const conversationTypingUsers = typingUsers[conversation.id] || [];
  const isTyping = conversationTypingUsers.length > 0;

  // Online status (for 1:1 conversations)
  const otherUserId = conversation.participants.find(p => p.id !== conversation.id)?.id;
  const isOnline = otherUserId ? onlineUsers.has(otherUserId) : false;

  const hasUnread = conversation.unreadCount > 0;

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
        {conversation.avatarUrl ? (
          <Image
            source={{ uri: conversation.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: theme.colors.primary[100] },
            ]}
          >
            <Icon
              name="person"
              size={24}
              color={theme.colors.primary[500]}
            />
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
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.name,
              { color: theme.colors.text.primary },
              hasUnread && styles.nameBold,
            ]}
            numberOfLines={1}
          >
            {conversation.name}
          </Text>
          <Text
            style={[
              styles.time,
              { color: hasUnread ? theme.colors.primary[500] : theme.colors.text.tertiary },
            ]}
          >
            {formatRelativeTime(conversation.lastMessageAt || conversation.updatedAt)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.preview,
              { color: isTyping ? theme.colors.primary[500] : theme.colors.text.secondary },
              isTyping && styles.previewTyping,
            ]}
            numberOfLines={1}
          >
            {getLastMessagePreview(conversation.lastMessage, isTyping)}
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

          {conversation.isPinned && (
            <Icon
              name="pin"
              size={14}
              color={theme.colors.text.tertiary}
              style={styles.pinIcon}
            />
          )}

          {conversation.isMuted && (
            <Icon
              name="volume-mute"
              size={14}
              color={theme.colors.text.tertiary}
              style={styles.muteIcon}
            />
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  nameBold: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preview: {
    fontSize: 14,
    flex: 1,
  },
  previewTyping: {
    fontStyle: 'italic',
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
  pinIcon: {
    marginLeft: 6,
  },
  muteIcon: {
    marginLeft: 4,
  },
});

export default ConversationItem;
