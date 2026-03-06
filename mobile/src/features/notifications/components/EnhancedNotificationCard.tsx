// src/features/notifications/components/EnhancedNotificationCard.tsx
// Production-ready Enhanced Notification Card with Rich Actions
// Oku: mobile-development-guide/ui-ux-modernization/13-NOTIFICATION-TYPES.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { spacing, fontSize, borderRadius } from '@theme';
import type { NotificationResponse, NotificationType } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface EnhancedNotificationCardProps {
  notification: NotificationResponse;
  onPress?: (notification: NotificationResponse) => void;
  onAccept?: (notification: NotificationResponse) => void;
  onDecline?: (notification: NotificationResponse) => void;
  onDismiss?: (notification: NotificationResponse) => void;
  showActions?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getNotificationConfig = (
  type: NotificationType,
  colors: ReturnType<typeof useColors>,
): {
  icon: string;
  iconColor: string;
  backgroundColor: string;
  showActions: boolean;
} => {
  switch (type) {
    case 'NEW_FOLLOWER':
      return {
        icon: 'person-add',
        iconColor: colors.special.verified,
        backgroundColor: `${colors.special.verified}15`,
        showActions: true, // Follow back option
      };

    case 'POST_LIKED':
      return {
        icon: 'heart',
        iconColor: colors.status.error,
        backgroundColor: `${colors.status.error}15`,
        showActions: false,
      };

    case 'POST_COMMENTED':
      return {
        icon: 'chatbubble-ellipses',
        iconColor: colors.interactive.default,
        backgroundColor: `${colors.interactive.default}15`,
        showActions: true, // Reply option
      };

    case 'VERIFICATION_APPROVED':
      return {
        icon: 'shield-checkmark',
        iconColor: colors.status.success,
        backgroundColor: `${colors.status.success}15`,
        showActions: false,
      };

    case 'VERIFICATION_REJECTED':
      return {
        icon: 'shield-half',
        iconColor: colors.status.error,
        backgroundColor: `${colors.status.error}15`,
        showActions: true, // Retry option
      };

    case 'NEW_MESSAGE':
      return {
        icon: 'chatbubble',
        iconColor: colors.interactive.default,
        backgroundColor: `${colors.interactive.default}15`,
        showActions: true, // Reply option
      };

    default:
      return {
        icon: 'notifications',
        iconColor: colors.text.tertiary,
        backgroundColor: colors.background.secondary,
        showActions: false,
      };
  }
};

// ============================================================================
// EnhancedNotificationCard Component
// ============================================================================

/**
 * Enhanced Notification Card with Rich Actions
 *
 * Features:
 * - Type-based icons and colors
 * - Contextual action buttons (Follow back, Reply, Retry)
 * - Animated entrance
 * - Unread indicator
 * - Haptic feedback
 * - Avatar support
 *
 * @example
 * ```tsx
 * <EnhancedNotificationCard
 *   notification={notification}
 *   onPress={handlePress}
 *   onAccept={handleFollowBack}
 *   showActions={true}
 * />
 * ```
 */
export const EnhancedNotificationCard: React.FC<EnhancedNotificationCardProps> = memo(
  ({ notification, onPress, onAccept, onDecline, onDismiss, showActions = true }) => {
    const colors = useColors();
    const { triggerNavigation, triggerSystem } = useSemanticHaptic();

    // Animation
    const scale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, [scale]);

    const handlePress = useCallback(() => {
      triggerNavigation('navigate');
      onPress?.(notification);
    }, [triggerNavigation, onPress, notification]);

    const handleAccept = useCallback(() => {
      triggerSystem('success');
      onAccept?.(notification);
    }, [triggerSystem, onAccept, notification]);

    const handleDecline = useCallback(() => {
      triggerSystem('cancel');
      onDecline?.(notification);
    }, [triggerSystem, onDecline, notification]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const config = getNotificationConfig(notification.type, colors);
    const isUnread = !notification.read;

    return (
      <Animated.View entering={FadeInDown.springify()}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
          <Animated.View
            style={[
              styles.container,
              {
                backgroundColor: isUnread ? colors.background.secondary : colors.background.primary,
                borderLeftColor: isUnread ? colors.interactive.default : 'transparent',
              },
              animatedStyle,
            ]}>
            {/* Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor: config.backgroundColor }]}>
              <Icon name={config.icon} size={24} color={config.iconColor} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Message */}
              <Text
                style={[
                  styles.message,
                  {
                    color: colors.text.primary,
                    fontWeight: isUnread ? '600' : '400',
                  },
                ]}
                numberOfLines={2}>
                {notification.body}
              </Text>

              {/* Metadata */}
              <View style={styles.metadata}>
                <Text style={[styles.time, { color: colors.text.tertiary }]}>
                  {notification.relativeTime}
                </Text>
                {isUnread && (
                  <View
                    style={[styles.unreadDot, { backgroundColor: colors.interactive.default }]}
                  />
                )}
              </View>

              {/* Actions */}
              {showActions && config.showActions && (
                <View style={styles.actions}>
                  {notification.type === 'NEW_FOLLOWER' && (
                    <>
                      <Pressable
                        style={[
                          styles.actionButton,
                          styles.primaryAction,
                          { backgroundColor: colors.interactive.default },
                        ]}
                        onPress={handleAccept}>
                        <Text style={[styles.primaryActionText, { color: colors.text.inverse }]}>
                          Takip Et
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.actionButton,
                          styles.secondaryAction,
                          { borderColor: colors.border.default },
                        ]}
                        onPress={handleDecline}>
                        <Text
                          style={[styles.secondaryActionText, { color: colors.text.secondary }]}>
                          Yoksay
                        </Text>
                      </Pressable>
                    </>
                  )}

                  {notification.type === 'POST_COMMENTED' && (
                    <Pressable
                      style={[
                        styles.actionButton,
                        styles.primaryAction,
                        { backgroundColor: colors.interactive.default },
                      ]}
                      onPress={handleAccept}>
                      <Text style={[styles.primaryActionText, { color: colors.text.inverse }]}>
                        Yanıtla
                      </Text>
                    </Pressable>
                  )}

                  {notification.type === 'VERIFICATION_REJECTED' && (
                    <Pressable
                      style={[
                        styles.actionButton,
                        styles.primaryAction,
                        { backgroundColor: colors.interactive.default },
                      ]}
                      onPress={handleAccept}>
                      <Text style={[styles.primaryActionText, { color: colors.text.inverse }]}>
                        Tekrar Dene
                      </Text>
                    </Pressable>
                  )}

                  {notification.type === 'NEW_MESSAGE' && (
                    <Pressable
                      style={[
                        styles.actionButton,
                        styles.primaryAction,
                        { backgroundColor: colors.interactive.default },
                      ]}
                      onPress={handleAccept}>
                      <Text style={[styles.primaryActionText, { color: colors.text.inverse }]}>
                        Mesaj Gönder
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>

            {/* Dismiss button */}
            {onDismiss && (
              <Pressable
                style={styles.dismissButton}
                onPress={() => onDismiss(notification)}
                hitSlop={8}>
                <Icon name="close" size={20} color={colors.text.tertiary} />
              </Pressable>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  },
);

EnhancedNotificationCard.displayName = 'EnhancedNotificationCard';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 3,
    marginBottom: spacing.xs,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing['0.5'],
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: fontSize.xs,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  primaryAction: {
    // backgroundColor set dynamically
  },
  primaryActionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  secondaryAction: {
    borderWidth: 1,
    // borderColor set dynamically
  },
  secondaryActionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  dismissButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
