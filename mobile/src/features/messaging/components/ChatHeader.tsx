// src/features/messaging/components/ChatHeader.tsx
// Sohbet başlık komponenti
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
import type { Conversation } from '../types';

interface ChatHeaderProps {
  conversation: Conversation;
  onBackPress: () => void;
  onProfilePress?: () => void;
  onOptionsPress?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = memo(({
  conversation,
  onBackPress,
  onProfilePress,
  onOptionsPress,
}) => {
  const { theme } = useTheme();
  const { typingUsers, onlineUsers } = useMessagingStore();

  // Typing status
  const conversationTypingUsers = typingUsers[conversation.id] || [];
  const isTyping = conversationTypingUsers.length > 0;

  // Online status - participant tek obje olarak gelir (1:1 chat)
  const participant = conversation.participant;
  const isOnline = participant?.online || onlineUsers.has(participant?.id || '');

  const getStatusText = useCallback((): string => {
    if (isTyping) {
      const names = conversationTypingUsers.slice(0, 2).join(', ');
      return `${names} yazıyor...`;
    }
    if (isOnline) return 'çevrimiçi';
    return '';
  }, [isTyping, conversationTypingUsers, isOnline]);

  const statusText = getStatusText();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      {/* Back button */}
      <Pressable
        onPress={onBackPress}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.buttonPressed,
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="arrow-back" size={24} color={theme.colors.text.primary} />
      </Pressable>

      {/* Profile */}
      <Pressable
        onPress={onProfilePress}
        style={({ pressed }) => [
          styles.profileContainer,
          pressed && styles.profilePressed,
        ]}
        disabled={!onProfilePress}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {participant?.profileImageUrl ? (
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
              <Icon name="person" size={18} color={theme.colors.primary[500]} />
            </View>
          )}

          {isOnline && (
            <View
              style={[
                styles.onlineIndicator,
                { backgroundColor: theme.colors.status.success },
              ]}
            />
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[styles.name, { color: theme.colors.text.primary }]}
            numberOfLines={1}
          >
            {participant?.fullName || 'Kullanıcı'}
          </Text>
          {statusText && (
            <Text
              style={[
                styles.status,
                {
                  color: isTyping
                    ? theme.colors.primary[500]
                    : theme.colors.status.success,
                },
              ]}
              numberOfLines={1}
            >
              {statusText}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Options button */}
      {onOptionsPress && (
        <Pressable
          onPress={onOptionsPress}
          style={({ pressed }) => [
            styles.optionsButton,
            pressed && styles.buttonPressed,
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="ellipsis-vertical" size={20} color={theme.colors.text.primary} />
        </Pressable>
      )}
    </View>
  );
});

ChatHeader.displayName = 'ChatHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 12,
  },
  profilePressed: {
    opacity: 0.8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
  optionsButton: {
    padding: 8,
  },
});

export default ChatHeader;
