// src/features/messaging/components/ConversationItem/ConversationAvatar.tsx
// Konuşma avatar bileşeni
// Online indicator ve verified badge ile

import React, { memo, useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { styles } from './ConversationItem.styles';
import type { ConversationAvatarProps } from './ConversationItem.types';

/**
 * ConversationAvatar - Konuşma avatar'ı
 *
 * Özellikler:
 * - Profil resmi veya initials
 * - Online indicator (pulsing animation)
 * - Verified badge
 */
export const ConversationAvatar: React.FC<ConversationAvatarProps> = memo(
  ({ profileImageUrl, fullName, isOnline, verified }) => {
    const colors = useColors();

    // Pulse animation for online indicator
    const pulseOpacity = useSharedValue(1);

    React.useEffect(() => {
      if (isOnline) {
        pulseOpacity.value = withRepeat(
          withSequence(withTiming(0.5, { duration: 1000 }), withTiming(1, { duration: 1000 })),
          -1,
          false,
        );
      }
    }, [isOnline, pulseOpacity]);

    const pulseStyle = useAnimatedStyle(() => ({
      opacity: pulseOpacity.value,
    }));

    // Dynamic styles
    const dynamicStyles = useMemo(
      () =>
        StyleSheet.create({
          avatarPlaceholder: {
            backgroundColor: colors.background.secondary,
          },
          avatarText: {
            color: colors.interactive.default,
          },
          onlineIndicator: {
            backgroundColor: colors.status.success,
          },
          verifiedBadge: {
            backgroundColor: colors.interactive.default,
          },
        }),
      [colors],
    );

    return (
      <View style={styles.avatarContainer}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, dynamicStyles.avatarPlaceholder]}>
            <Text style={[styles.avatarText, dynamicStyles.avatarText]}>
              {fullName?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        {/* Online indicator */}
        {isOnline && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.onlineIndicator, dynamicStyles.onlineIndicator, pulseStyle]}
          />
        )}

        {/* Verified badge */}
        {verified && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.verifiedBadge, dynamicStyles.verifiedBadge]}>
            <Icon name="checkmark" size={8} color={colors.text.inverse} />
          </Animated.View>
        )}
      </View>
    );
  },
);

ConversationAvatar.displayName = 'ConversationAvatar';
