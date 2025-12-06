// src/features/messaging/components/ChatHeader.tsx
// Meslektaş Design System - Modern Chat Header
// Oku: mobile-development-guide/ui-ux-modernization/09-MESSAGING-EXPERIENCE.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';
import { useMessagingStore } from '../stores';
import type { Conversation } from '../types';

// ============================================================================
// Types
// ============================================================================

interface ChatHeaderProps {
  conversation: Conversation;
  onBackPress: () => void;
  onProfilePress?: () => void;
  onOptionsPress?: () => void;
}

// ============================================================================
// AnimatedPressable
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// ChatHeader Component
// ============================================================================

/**
 * Modern ChatHeader Component
 *
 * Features:
 * - Animated button presses with spring physics
 * - Online/typing status indicators
 * - Haptic feedback on interactions
 * - Modern color tokens
 *
 * @example
 * ```tsx
 * <ChatHeader
 *   conversation={conversation}
 *   onBackPress={() => navigation.goBack()}
 *   onProfilePress={() => navigation.navigate('Profile')}
 *   onOptionsPress={() => showOptions()}
 * />
 * ```
 */
export const ChatHeader: React.FC<ChatHeaderProps> = memo(
  ({ conversation, onBackPress, onProfilePress, onOptionsPress }) => {
    const colors = useColors();
    const { trigger } = useHaptic();
    const { typingUsers, onlineUsers } = useMessagingStore();

    // Animation values
    const backScale = useSharedValue(1);
    const optionsScale = useSharedValue(1);

    // Typing status
    const conversationTypingUsers = typingUsers[conversation.conversationId] || [];
    const isTyping = conversationTypingUsers.length > 0;

    // Online status - participant tek obje olarak gelir (1:1 chat)
    const participant = conversation.participant;
    const isOnline = participant?.online || (participant?.userId ? onlineUsers.has(participant.userId) : false);

    const getStatusText = useCallback((): string => {
      if (isTyping) {
        const names = conversationTypingUsers.slice(0, 2).join(', ');
        return `${names} yazıyor...`;
      }
      if (isOnline) return 'çevrimiçi';
      return '';
    }, [isTyping, conversationTypingUsers, isOnline]);

    const statusText = getStatusText();

    // Handle back press
    const handleBackPress = useCallback(() => {
      trigger('light');
      backScale.value = withSequence(withSpring(0.8, spring.press), withSpring(1, spring.snappy));
      onBackPress();
    }, [onBackPress, trigger, backScale]);

    // Handle options press
    const handleOptionsPress = useCallback(() => {
      trigger('light');
      optionsScale.value = withSequence(
        withSpring(0.8, spring.press),
        withSpring(1, spring.snappy),
      );
      onOptionsPress?.();
    }, [onOptionsPress, trigger, optionsScale]);

    // Handle profile press
    const handleProfilePress = useCallback(() => {
      trigger('light');
      onProfilePress?.();
    }, [onProfilePress, trigger]);

    // Animated styles
    const backAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: backScale.value }],
    }));

    const optionsAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: optionsScale.value }],
    }));

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background.primary,
            borderBottomColor: colors.border.default,
          },
        ]}>
        {/* Back button */}
        <AnimatedPressable
          onPress={handleBackPress}
          style={[styles.backButton, backAnimatedStyle]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Geri"
          accessibilityRole="button">
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </AnimatedPressable>

        {/* Profile */}
        <Pressable
          onPress={handleProfilePress}
          style={styles.profileContainer}
          disabled={!onProfilePress}
          accessibilityLabel={`${participant?.fullName || 'Kullanıcı'} profili`}
          accessibilityRole="button">
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {participant?.profileImageUrl ? (
              <Image source={{ uri: participant.profileImageUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[styles.avatarPlaceholder, { backgroundColor: colors.interactive.focus }]}>
                <Icon name="person" size={18} color={colors.interactive.default} />
              </View>
            )}

            {isOnline && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={[
                  styles.onlineIndicator,
                  {
                    backgroundColor: colors.status.success,
                    borderColor: colors.background.primary,
                  },
                ]}
              />
            )}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
              {participant?.fullName || 'Kullanıcı'}
            </Text>
            {statusText && (
              <Text
                style={[
                  styles.status,
                  {
                    color: isTyping ? colors.interactive.default : colors.status.success,
                  },
                ]}
                numberOfLines={1}>
                {statusText}
              </Text>
            )}
          </View>
        </Pressable>

        {/* Options button */}
        {onOptionsPress && (
          <AnimatedPressable
            onPress={handleOptionsPress}
            style={[styles.optionsButton, optionsAnimatedStyle]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Seçenekler"
            accessibilityRole="button">
            <Icon name="ellipsis-vertical" size={20} color={colors.text.primary} />
          </AnimatedPressable>
        )}
      </View>
    );
  },
);

ChatHeader.displayName = 'ChatHeader';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  container: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  onlineIndicator: {
    borderRadius: 6,
    borderWidth: 2,
    bottom: -2,
    height: 12,
    position: 'absolute',
    right: -2,
    width: 12,
  },
  optionsButton: {
    padding: 8,
  },
  profileContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 8,
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ChatHeader;
