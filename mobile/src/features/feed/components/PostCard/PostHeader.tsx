// src/features/feed/components/PostCard/PostHeader.tsx
// Dengin Design System - Modern PostHeader Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { Avatar } from '@shared/components';
import { formatRelativeTime } from '@shared/utils/dateUtils';
import { spring } from '@theme/animations';

import { styles } from './PostCard.styles';
import type { PostHeaderProps } from './PostCard.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern PostHeader Component
 *
 * Features:
 * - Avatar with initials fallback
 * - Verified badge display
 * - Relative time formatting
 * - Menu button with press animation
 * - Haptic feedback
 *
 * @example
 * ```tsx
 * <PostHeader
 *   author={post.author}
 *   createdAt={post.createdAt}
 *   onAuthorPress={() => navigateToProfile()}
 *   onMenuPress={() => showMenu()}
 * />
 * ```
 */
export const PostHeader: React.FC<PostHeaderProps> = memo(
  ({ author, createdAt, onAuthorPress, onMenuPress, testID }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    // Animation values
    const menuScale = useSharedValue(1);

    // Animated style for menu button
    const menuAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: menuScale.value }],
    }));

    // Full name from author
    const fullName = useMemo(() => {
      if (author.fullName) return author.fullName;
      return `${author.name || ''} ${author.surname || ''}`.trim();
    }, [author.fullName, author.name, author.surname]);

    // Avatar URL (backward compatible)
    const avatarUrl = author.profileImageUrl ?? author.avatarUrl;

    // Profession text
    const professionText = author.professionName ?? author.profession ?? '';

    // Relative time
    const timeAgo = useMemo(() => formatRelativeTime(createdAt), [createdAt]);

    // Verified status (backward compatible)
    const isVerified = author.verified ?? author.isVerified ?? false;

    // Author press handler
    const handleAuthorPress = useCallback(() => {
      trigger('light');
      onAuthorPress?.();
    }, [onAuthorPress, trigger]);

    // Menu press handler
    const handleMenuPress = useCallback(() => {
      trigger('light');
      menuScale.value = withSpring(0.9, spring.press);
      setTimeout(() => {
        menuScale.value = withSpring(1, spring.snappy);
      }, 100);
      onMenuPress?.();
    }, [onMenuPress, trigger, menuScale]);

    return (
      <View style={styles.header} testID={testID}>
        {/* Author section */}
        <Pressable
          style={styles.authorContainer}
          onPress={handleAuthorPress}
          accessibilityRole="button"
          accessibilityLabel={`${fullName} profiline git`}>
          {/* Avatar */}
          <Avatar
            uri={avatarUrl}
            name={fullName}
            size="md"
            status={isVerified ? 'online' : 'none'}
          />

          {/* Author info */}
          <View style={styles.authorInfo}>
            {/* Name row with verified badge */}
            <View style={styles.nameRow}>
              <Text style={[styles.authorName, { color: colors.text.primary }]} numberOfLines={1}>
                {fullName}
              </Text>
              {isVerified && (
                <Icon
                  name="checkmark-circle"
                  size={16}
                  color={colors.interactive.default}
                  style={styles.verifiedIcon}
                />
              )}
            </View>

            {/* Meta row - profession and time */}
            <View style={styles.metaRow}>
              {professionText && (
                <>
                  <Text
                    style={[styles.metadata, { color: colors.text.tertiary }]}
                    numberOfLines={1}>
                    {professionText}
                  </Text>
                  <Text style={[styles.metadata, { color: colors.text.tertiary }]}>•</Text>
                </>
              )}
              <Text style={[styles.metadata, { color: colors.text.tertiary }]}>{timeAgo}</Text>
            </View>
          </View>
        </Pressable>

        {/* Menu button */}
        <AnimatedPressable
          style={[styles.menuButton, menuAnimatedStyle]}
          onPress={handleMenuPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Daha fazla seçenek">
          <Icon name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
        </AnimatedPressable>
      </View>
    );
  },
);

PostHeader.displayName = 'PostHeader';
