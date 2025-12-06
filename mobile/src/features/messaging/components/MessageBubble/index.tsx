// src/features/messaging/components/MessageBubble/index.tsx
// Modern MessageBubble with swipe-to-reply and animations
// Instagram/WhatsApp kalitesinde mesaj deneyimi

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  SlideInRight,
  SlideInLeft,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks';
import { styles, SWIPE_THRESHOLD } from './MessageBubble.styles';
import { MessageStatusIcon } from './MessageStatusIcon';
import { MessageAttachment } from './MessageAttachment';
import type { MessageBubbleProps } from './MessageBubble.types';
import type { ClientMessageStatus } from '../../types';

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

/**
 * MessageBubble - Modern mesaj baloncuğu
 *
 * Özellikler:
 * - Animasyonlu giriş (slide + fade)
 * - Swipe-to-reply gesture
 * - Long press ile menu
 * - Animated status icons
 * - Retry button for failed messages
 */
export const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({
    message,
    isOwn,
    showAvatar = false,
    index = 0,
    onLongPress,
    onReply,
    onImagePress,
    onRetry,
    style,
  }) => {
    const colors = useColors();
    const { trigger: triggerHaptic } = useHaptic();

    // sentByMe alanını kullan, yoksa isOwn prop'unu
    const isSentByMe = message.sentByMe ?? isOwn ?? false;

    // Animation values
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const replyIconOpacity = useSharedValue(0);
    const isSwipeTriggered = useSharedValue(false);

    // Colors
    const textColor = isSentByMe ? '#FFFFFF' : colors.text.primary;
    const metaColor = isSentByMe ? 'rgba(255,255,255,0.7)' : colors.text.tertiary;

    // Entry animation
    const enteringAnimation = useMemo(() => {
      const baseDelay = Math.min(index * 30, 300);
      return isSentByMe
        ? SlideInRight.delay(baseDelay).springify().damping(15)
        : SlideInLeft.delay(baseDelay).springify().damping(15);
    }, [isSentByMe, index]);

    // Callbacks
    const handleTriggerHaptic = useCallback(() => {
      triggerHaptic('medium');
    }, [triggerHaptic]);

    const handleLongPressHaptic = useCallback(() => {
      triggerHaptic('heavy');
    }, [triggerHaptic]);

    const handleReplyTrigger = useCallback(() => {
      if (onReply) {
        onReply(message);
      }
    }, [onReply, message]);

    const handleLongPressTrigger = useCallback(() => {
      if (onLongPress) {
        onLongPress(message);
      }
    }, [onLongPress, message]);

    const handleRetry = useCallback(() => {
      if (onRetry) {
        triggerHaptic('light');
        onRetry(message);
      }
    }, [onRetry, message, triggerHaptic]);

    // Swipe-to-reply gesture
    const panGesture = useMemo(
      () =>
        Gesture.Pan()
          .activeOffsetX(isSentByMe ? [-15, 0] : [0, 15])
          .failOffsetY([-10, 10])
          .onUpdate(event => {
            const direction = isSentByMe ? -1 : 1;
            const clampedX = Math.max(0, Math.min(SWIPE_THRESHOLD, event.translationX * direction));
            translateX.value = clampedX * direction;
            replyIconOpacity.value = interpolate(
              clampedX,
              [0, SWIPE_THRESHOLD],
              [0, 1],
              Extrapolate.CLAMP,
            );

            // Haptic at threshold
            if (clampedX >= SWIPE_THRESHOLD - 5 && !isSwipeTriggered.value) {
              isSwipeTriggered.value = true;
              runOnJS(handleTriggerHaptic)();
            } else if (clampedX < SWIPE_THRESHOLD - 10) {
              isSwipeTriggered.value = false;
            }
          })
          .onEnd(() => {
            const shouldTriggerReply = Math.abs(translateX.value) >= SWIPE_THRESHOLD;

            translateX.value = withSpring(0, { damping: 15 });
            replyIconOpacity.value = withSpring(0);
            isSwipeTriggered.value = false;

            if (shouldTriggerReply && onReply) {
              runOnJS(handleReplyTrigger)();
            }
          }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isSentByMe, onReply, handleTriggerHaptic, handleReplyTrigger],
    );

    // Long press gesture
    const longPressGesture = useMemo(
      () =>
        Gesture.LongPress()
          .minDuration(500)
          .onStart(() => {
            scale.value = withSequence(withSpring(0.95), withSpring(1));
            runOnJS(handleLongPressHaptic)();
            runOnJS(handleLongPressTrigger)();
          }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [handleLongPressHaptic, handleLongPressTrigger],
    );

    const composedGesture = useMemo(
      () => Gesture.Race(panGesture, longPressGesture),
      [panGesture, longPressGesture],
    );

    // Animated styles
    const bubbleAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    }));

    const replyIconAnimatedStyle = useAnimatedStyle(() => ({
      opacity: replyIconOpacity.value,
      transform: [{ scale: replyIconOpacity.value }],
    }));

    // Bubble colors
    const bubbleBackgroundColor = isSentByMe
      ? colors.interactive.default
      : colors.background.secondary;

    // Check if message has failed
    const isFailed = message.status === 'FAILED';

    return (
      <Animated.View
        entering={enteringAnimation}
        style={[styles.container, isSentByMe ? styles.ownContainer : styles.otherContainer, style]}>
        {/* Avatar placeholder for alignment */}
        {!isSentByMe && !showAvatar && <View style={styles.avatarPlaceholder} />}

        {/* Reply icon (appears on swipe) */}
        <Animated.View
          style={[
            styles.replyIconContainer,
            isSentByMe ? styles.replyIconOwnSide : styles.replyIconOtherSide,
            replyIconAnimatedStyle,
          ]}>
          <Icon name="arrow-undo" size={18} color={colors.text.secondary} />
        </Animated.View>

        {/* Message Bubble */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[
              styles.bubble,
              isSentByMe ? styles.ownBubble : styles.otherBubble,
              { backgroundColor: bubbleBackgroundColor },
              bubbleAnimatedStyle,
            ]}>
            {/* Attachment */}
            {message.attachment && (
              <MessageAttachment
                attachment={message.attachment}
                isOwn={isSentByMe}
                onImagePress={onImagePress}
              />
            )}

            {/* Message content */}
            {message.content && (
              <Text style={[styles.content, { color: textColor }]}>{message.content}</Text>
            )}

            {/* Meta info (time + status) */}
            <View style={styles.meta}>
              <Text style={[styles.time, { color: metaColor }]}>{formatTime(message.sentAt)}</Text>
              {isSentByMe && (
                <View style={styles.statusContainer}>
                  <MessageStatusIcon status={message.status as ClientMessageStatus} />
                </View>
              )}
            </View>

            {/* Retry button for failed messages */}
            {isFailed && onRetry && (
              <Pressable onPress={handleRetry} style={styles.retryButton} hitSlop={8}>
                <Icon name="refresh" size={14} color={colors.status.error} />
                <Text style={[styles.retryText, { color: colors.status.error }]}>Tekrar dene</Text>
              </Pressable>
            )}
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    );
  },
);

MessageBubble.displayName = 'MessageBubble';

export { MessageStatusIcon } from './MessageStatusIcon';
export { MessageAttachment } from './MessageAttachment';
export type {
  MessageBubbleProps,
  MessageStatusIconProps,
  MessageAttachmentProps,
} from './MessageBubble.types';
