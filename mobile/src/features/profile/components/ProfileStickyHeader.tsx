// src/features/profile/components/ProfileStickyHeader.tsx
// Production-ready Animated Sticky Header for Profile
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-ENHANCEMENTS.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';

// ============================================================================
// Types
// ============================================================================

interface ProfileStickyHeaderProps {
  /** User full name */
  name: string;
  /** User avatar URL */
  avatarUrl?: string | null;
  /** Scroll Y animated value */
  scrollY: SharedValue<number>;
  /** Threshold to show header (usually avatar height + padding) */
  threshold?: number;
  /** Show back button */
  showBackButton?: boolean;
  /** Back button press handler */
  onBackPress?: () => void;
  /** Show settings button */
  showSettingsButton?: boolean;
  /** Settings button press handler */
  onSettingsPress?: () => void;
}

// ============================================================================
// ProfileStickyHeader Component
// ============================================================================

/**
 * Animated Sticky Header for Profile Screen
 *
 * Appears when user scrolls past the profile avatar.
 * Instagram-style smooth transition with avatar thumbnail.
 *
 * Features:
 * - Fade in/out based on scroll position
 * - Avatar scale animation
 * - Name fade in
 * - Blur background (iOS style)
 *
 * @example
 * ```tsx
 * const scrollY = useSharedValue(0);
 *
 * <Animated.ScrollView
 *   onScroll={scrollHandler}
 *   scrollEventThrottle={16}>
 *   <ProfileContent />
 * </Animated.ScrollView>
 *
 * <ProfileStickyHeader
 *   name="Ahmet Yılmaz"
 *   avatarUrl={user.avatarUrl}
 *   scrollY={scrollY}
 *   threshold={180}
 *   showBackButton
 *   onBackPress={goBack}
 *   showSettingsButton
 *   onSettingsPress={openSettings}
 * />
 * ```
 */
export const ProfileStickyHeader: React.FC<ProfileStickyHeaderProps> = memo(
  ({
    name,
    avatarUrl,
    scrollY,
    threshold = 180,
    showBackButton = false,
    onBackPress,
    showSettingsButton = false,
    onSettingsPress,
  }) => {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // Header animation - fade in when scrolled past threshold
    const headerAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollY.value,
        [threshold - 50, threshold],
        [0, 1],
        Extrapolation.CLAMP,
      );

      return {
        opacity,
        pointerEvents: opacity > 0.5 ? 'auto' : 'none',
      };
    });

    // Avatar scale animation
    const avatarAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollY.value,
        [threshold - 30, threshold],
        [0.8, 1],
        Extrapolation.CLAMP,
      );

      return {
        transform: [{ scale }],
      };
    });

    // Name opacity animation
    const nameAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollY.value,
        [threshold - 20, threshold],
        [0, 1],
        Extrapolation.CLAMP,
      );

      return { opacity };
    });

    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <Animated.View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: colors.background.primary,
            borderBottomColor: colors.border.subtle,
          },
          headerAnimatedStyle,
        ]}>
        {/* Left: Back button */}
        <View style={styles.leftContainer}>
          {showBackButton && (
            <Pressable style={styles.iconButton} onPress={onBackPress} hitSlop={8}>
              <Icon name="chevron-back" size={24} color={colors.text.primary} />
            </Pressable>
          )}
        </View>

        {/* Center: Avatar + Name */}
        <View style={styles.centerContainer}>
          <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[styles.avatarPlaceholder, { backgroundColor: colors.interactive.subtle }]}>
                <Text style={[styles.avatarText, { color: colors.interactive.default }]}>
                  {initials}
                </Text>
              </View>
            )}
          </Animated.View>

          <Animated.View style={nameAnimatedStyle}>
            <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
              {name}
            </Text>
          </Animated.View>
        </View>

        {/* Right: Settings button */}
        <View style={styles.rightContainer}>
          {showSettingsButton && (
            <Pressable style={styles.iconButton} onPress={onSettingsPress} hitSlop={8}>
              <Icon name="settings-outline" size={24} color={colors.text.primary} />
            </Pressable>
          )}
        </View>
      </Animated.View>
    );
  },
);

ProfileStickyHeader.displayName = 'ProfileStickyHeader';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 1000,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  avatarContainer: {
    width: 32,
    height: 32,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: '600',
    maxWidth: 200,
  },
});
