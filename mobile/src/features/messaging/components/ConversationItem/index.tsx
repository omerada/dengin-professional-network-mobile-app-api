// src/features/messaging/components/ConversationItem/index.tsx
// Modern ConversationItem with animations
// Instagram DM kalitesinde konuşma listesi öğesi

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks';
import { useMessagingStore } from '../../stores';
import { styles } from './ConversationItem.styles';
import { ConversationAvatar } from './ConversationAvatar';
import { UnreadBadge } from './UnreadBadge';
import type { ConversationItemProps } from './ConversationItem.types';

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
  lastMessage: { content: string; hasAttachment: boolean } | null,
  isTyping: boolean,
): string => {
  if (isTyping) return 'yazıyor...';
  if (!lastMessage) return 'Henüz mesaj yok';
  if (lastMessage.hasAttachment) return '📷 Fotoğraf';

  const content = lastMessage.content;
  return content.length > 40 ? `${content.slice(0, 40)}...` : content;
};

/**
 * ConversationItem - Modern konuşma listesi öğesi
 *
 * Özellikler:
 * - Animasyonlu giriş (staggered)
 * - Press feedback (scale)
 * - Online indicator with pulse
 * - Typing indicator
 * - Unread badge with bounce
 */
export const ConversationItem: React.FC<ConversationItemProps> = memo(
  ({ conversation, onPress, onLongPress, index = 0, style }) => {
    const colors = useColors();
    const { trigger: triggerHaptic } = useHaptic();
    const { typingUsers, onlineUsers } = useMessagingStore();

    // Animation values
    const scale = useSharedValue(1);
    const pressed = useSharedValue(false);

    // Typing and online status
    const conversationTypingUsers = typingUsers[conversation.conversationId] || [];
    const isTyping = conversationTypingUsers.length > 0;
    const isOnline =
      conversation.participant.online || onlineUsers.has(conversation.participant.userId);
    const hasUnread = conversation.unreadCount > 0;

    // Participant info
    const { participant, lastMessage } = conversation;

    // Callbacks
    const handlePress = useCallback(() => {
      triggerHaptic('selection');
      onPress(conversation);
    }, [conversation, onPress, triggerHaptic]);

    const handleLongPress = useCallback(() => {
      triggerHaptic('medium');
      onLongPress?.(conversation);
    }, [conversation, onLongPress, triggerHaptic]);

    // Tap gesture
    const tapGesture = useMemo(
      () =>
        Gesture.Tap()
          .onBegin(() => {
            scale.value = withSpring(0.98, { damping: 15 });
            pressed.value = true;
          })
          .onFinalize(() => {
            scale.value = withSpring(1, { damping: 15 });
            pressed.value = false;
          })
          .onEnd(() => {
            handlePress();
          }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [handlePress],
    );

    // Long press gesture
    const longPressGesture = useMemo(
      () =>
        Gesture.LongPress()
          .minDuration(500)
          .onStart(() => {
            handleLongPress();
          }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [handleLongPress],
    );

    const composedGesture = useMemo(
      () => Gesture.Race(tapGesture, longPressGesture),
      [tapGesture, longPressGesture],
    );

    // Animated styles
    const containerAnimatedStyle = useAnimatedStyle(() => ({
      backgroundColor: pressed.value ? colors.background.secondary : colors.background.primary,
      transform: [{ scale: scale.value }],
    }));

    // Dynamic text styles
    const dynamicStyles = useMemo(
      () =>
        StyleSheet.create({
          name: {
            color: colors.text.primary,
          },
          preview: {
            color: isTyping ? colors.interactive.default : colors.text.secondary,
          },
          profession: {
            color: colors.text.tertiary,
          },
          time: {
            color: hasUnread ? colors.interactive.default : colors.text.tertiary,
          },
        }),
      [colors, isTyping, hasUnread],
    );

    // Entry animation
    const enteringAnimation = FadeInDown.delay(Math.min(index * 50, 500))
      .springify()
      .damping(15);

    return (
      <Animated.View entering={enteringAnimation}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.container, containerAnimatedStyle, style]}>
            {/* Avatar */}
            <ConversationAvatar
              profileImageUrl={participant.profileImageUrl}
              fullName={participant.fullName}
              isOnline={isOnline}
              verified={participant.verified}
            />

            {/* Content */}
            <View style={styles.content}>
              {/* Header: Name + Time */}
              <View style={styles.header}>
                <View style={styles.nameContainer}>
                  <Text
                    style={[styles.name, dynamicStyles.name, hasUnread && styles.nameBold]}
                    numberOfLines={1}>
                    {participant.fullName}
                  </Text>
                </View>
                <Text style={[styles.time, dynamicStyles.time]}>
                  {formatRelativeTime(lastMessage?.sentAt || conversation.updatedAt)}
                </Text>
              </View>

              {/* SubHeader: Profession */}
              <View style={styles.subHeader}>
                <Text style={[styles.profession, dynamicStyles.profession]} numberOfLines={1}>
                  {participant.profession}
                </Text>
              </View>

              {/* Footer: Preview + Badge */}
              <View style={styles.footer}>
                <Text
                  style={[
                    styles.preview,
                    dynamicStyles.preview,
                    isTyping && styles.previewTyping,
                    hasUnread && styles.previewBold,
                  ]}
                  numberOfLines={1}>
                  {lastMessage?.sentByMe && !isTyping && 'Sen: '}
                  {getLastMessagePreview(lastMessage, isTyping)}
                </Text>

                {hasUnread && <UnreadBadge count={conversation.unreadCount} />}
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    );
  },
);

ConversationItem.displayName = 'ConversationItem';

export { ConversationAvatar } from './ConversationAvatar';
export { UnreadBadge } from './UnreadBadge';
export type {
  ConversationItemProps,
  ConversationAvatarProps,
  UnreadBadgeProps,
} from './ConversationItem.types';
