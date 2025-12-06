// src/features/notifications/components/NotificationItem.tsx
// Notification list item component - Backend NotificationResponse ile uyumlu
// Backend: NotificationResponse DTO
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import type { NotificationResponse, NotificationType } from '../types';

interface NotificationItemProps {
  notification: NotificationResponse;
  onPress: (notification: NotificationResponse) => void;
  onLongPress?: (notification: NotificationResponse) => void;
}

/**
 * Bildirim türüne göre ikon - Backend NotificationType enum ile uyumlu
 * @see NotificationType.java
 */
const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
  switch (type) {
    // Social notifications
    case 'NEW_FOLLOWER':
      return { name: 'person-add', color: '#5856D6' };
    case 'POST_LIKED':
      return { name: 'heart', color: '#FF2D55' };
    case 'POST_COMMENTED':
      return { name: 'chatbubble-ellipses', color: '#FF9500' };
    case 'MENTION':
      return { name: 'at', color: '#007AFF' };

    // Messaging
    case 'NEW_MESSAGE':
      return { name: 'chatbubble', color: '#007AFF' };

    // Verification
    case 'VERIFICATION_APPROVED':
      return { name: 'shield-checkmark', color: '#34C759' };
    case 'VERIFICATION_REJECTED':
      return { name: 'shield-half', color: '#FF3B30' };
    case 'VERIFICATION_PENDING_REVIEW':
      return { name: 'time', color: '#FF9500' };

    // Moderation
    case 'POST_FLAGGED':
      return { name: 'flag', color: '#FF9500' };
    case 'CONTENT_REMOVED':
      return { name: 'trash', color: '#FF3B30' };
    case 'WARNING_ISSUED':
      return { name: 'warning', color: '#FF9500' };

    // System
    case 'WELCOME':
      return { name: 'happy', color: '#34C759' };
    case 'PASSWORD_RESET':
      return { name: 'key', color: '#8E8E93' };
    case 'ACCOUNT_SUSPENDED':
      return { name: 'ban', color: '#FF3B30' };
    case 'ACCOUNT_REACTIVATED':
      return { name: 'checkmark-circle', color: '#34C759' };

    default:
      return { name: 'notifications', color: '#8E8E93' };
  }
};

/**
 * Göreli zaman formatlama (backend relativeTime yoksa kullan)
 */
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'şimdi';
  if (diffMins < 60) return `${diffMins}dk önce`;
  if (diffHours < 24) return `${diffHours}sa önce`;
  if (diffDays < 7) return `${diffDays}g önce`;

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
  });
};

export const NotificationItem: React.FC<NotificationItemProps> = memo(
  ({ notification, onPress, onLongPress }) => {
    const colors = useColors();

    const handlePress = useCallback(() => {
      onPress(notification);
    }, [notification, onPress]);

    const handleLongPress = useCallback(() => {
      onLongPress?.(notification);
    }, [notification, onLongPress]);

    // Backend: read field (boolean)
    const isUnread = !notification.read;

    // Backend icon field (derived) veya type'dan hesapla
    const iconConfig = notification.icon
      ? { name: notification.icon, color: notification.color || '#8E8E93' }
      : getNotificationIcon(notification.type);

    // Metadata'dan resim URL'i
    const imageUrl = notification.metadata?.imageUrl || notification.metadata?.actorAvatarUrl;

    // Backend relativeTime field veya hesaplanan
    const displayTime = notification.relativeTime || formatRelativeTime(notification.createdAt);

    return (
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: isUnread
              ? colors.interactive.subtle
              : pressed
                ? colors.background.secondary
                : colors.background.primary,
          },
        ]}>
        {/* Icon or Image */}
        <View style={styles.iconContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: `${iconConfig.color}20` }]}>
              <Icon name={iconConfig.name} size={20} color={iconConfig.color} />
            </View>
          )}
        </View>
        /* Content */
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.text.primary }, isUnread && styles.titleUnread]}
            numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={[styles.body, { color: colors.text.secondary }]} numberOfLines={2}>
            {notification.body}
          </Text>
          <Text style={[styles.time, { color: colors.text.secondary }]}>{displayTime}</Text>
        </View>
        {/* Unread indicator */}
        {isUnread && (
          <View style={[styles.unreadDot, { backgroundColor: colors.interactive.default }]} />
        )}
      </Pressable>
    );
  },
);

NotificationItem.displayName = 'NotificationItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    marginBottom: 2,
  },
  titleUnread: {
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});

export default NotificationItem;
