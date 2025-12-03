// src/features/notifications/components/NotificationItem.tsx
// Notification list item component
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

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
import type { Notification, NotificationType } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onLongPress?: (notification: Notification) => void;
}

/**
 * Bildirim türüne göre ikon
 */
const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
  switch (type) {
    case 'message':
      return { name: 'chatbubble', color: '#007AFF' };
    case 'post_like':
      return { name: 'heart', color: '#FF2D55' };
    case 'post_comment':
    case 'comment_reply':
      return { name: 'chatbubble-ellipses', color: '#FF9500' };
    case 'follow':
      return { name: 'person-add', color: '#5856D6' };
    case 'verification_update':
      return { name: 'shield-checkmark', color: '#34C759' };
    default:
      return { name: 'notifications', color: '#8E8E93' };
  }
};

/**
 * Göreli zaman formatlama
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

export const NotificationItem: React.FC<NotificationItemProps> = memo(({
  notification,
  onPress,
  onLongPress,
}) => {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    onPress(notification);
  }, [notification, onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(notification);
  }, [notification, onLongPress]);

  const isUnread = notification.status === 'unread';
  const iconConfig = getNotificationIcon(notification.type);
  const imageUrl = notification.data?.imageUrl;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isUnread
            ? theme.colors.primary[50]
            : pressed
              ? theme.colors.background.secondary
              : theme.colors.background.primary,
        },
      ]}
    >
      {/* Icon or Image */}
      <View style={styles.iconContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${iconConfig.color}20` },
            ]}
          >
            <Icon
              name={iconConfig.name}
              size={20}
              color={iconConfig.color}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text.primary },
            isUnread && styles.titleUnread,
          ]}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text
          style={[styles.body, { color: theme.colors.text.secondary }]}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
        <Text style={[styles.time, { color: theme.colors.text.tertiary }]}>
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>

      {/* Unread indicator */}
      {isUnread && (
        <View
          style={[
            styles.unreadDot,
            { backgroundColor: theme.colors.primary[500] },
          ]}
        />
      )}
    </Pressable>
  );
});

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
