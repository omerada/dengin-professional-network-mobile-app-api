// src/features/profile/components/ParallaxProfileHeader/index.tsx
// Dengin Design System - ParallaxProfileHeader Component
// Oku: mobile-development-guide/ui-ux-modernization/10-PROFILE-EXPERIENCE.md

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { Button } from '@shared/components';
import { spring } from '@theme/animations';

import { styles } from './ParallaxProfileHeader.styles';
import { HEADER_CONSTANTS, type ParallaxProfileHeaderProps } from './ParallaxProfileHeader.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * ParallaxProfileHeader - Instagram-style parallax profile header
 *
 * Features:
 * - Parallax cover image effect
 * - Smooth header collapse on scroll
 * - Avatar scaling animation
 * - Sticky name on collapse
 * - Spring-based button animations
 * - Haptic feedback on interactions
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * const scrollY = useSharedValue(0);
 *
 * <ParallaxProfileHeader
 *   user={profile}
 *   scrollY={scrollY}
 *   onEditPress={() => navigation.navigate('EditProfile')}
 *   onFollowPress={() => handleFollow()}
 * />
 * ```
 */
export const ParallaxProfileHeader: React.FC<ParallaxProfileHeaderProps> = memo(
  ({
    user,
    scrollY,
    onFollowPress,
    onEditPress,
    onSettingsPress,
    onAvatarPress,
    onMessagePress,
    style,
    testID,
  }) => {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { triggerMedia, triggerNavigation, triggerSocial } = useSemanticHaptic();

    // Local animation values
    const avatarScale = useSharedValue(1);
    const buttonScale = useSharedValue(1);

    // Generate initials from name
    const initials = useMemo(() => {
      if (!user.fullName) return '?';
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0]?.substring(0, 2).toUpperCase() ?? '';
    }, [user.fullName]);

    // === Animated Styles ===

    // Header container height
    const headerAnimatedStyle = useAnimatedStyle(() => {
      const height = interpolate(
        scrollY.value,
        [0, HEADER_CONSTANTS.SCROLL_DISTANCE],
        [HEADER_CONSTANTS.MAX_HEIGHT, HEADER_CONSTANTS.MIN_HEIGHT],
        Extrapolation.CLAMP,
      );
      return { height };
    });

    // Cover image parallax
    const coverAnimatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollY.value,
        [0, HEADER_CONSTANTS.SCROLL_DISTANCE],
        [0, -HEADER_CONSTANTS.SCROLL_DISTANCE * 0.5],
        Extrapolation.CLAMP,
      );
      const scale = interpolate(scrollY.value, [-100, 0], [1.5, 1], Extrapolation.CLAMP);

      return {
        transform: [{ translateY }, { scale }],
      };
    });

    // Blur overlay opacity
    const blurAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollY.value,
        [0, HEADER_CONSTANTS.SCROLL_DISTANCE],
        [0, 0.95],
        Extrapolation.CLAMP,
      );
      return { opacity };
    });

    // Sticky name opacity
    const stickyNameAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollY.value,
        [HEADER_CONSTANTS.SCROLL_DISTANCE - 50, HEADER_CONSTANTS.SCROLL_DISTANCE],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return { opacity };
    });

    // Avatar transform on scroll
    const avatarAnimatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollY.value,
        [0, HEADER_CONSTANTS.SCROLL_DISTANCE],
        [0, -30],
        Extrapolation.CLAMP,
      );
      const scale = interpolate(
        scrollY.value,
        [0, HEADER_CONSTANTS.SCROLL_DISTANCE],
        [1, 0.5],
        Extrapolation.CLAMP,
      );
      const translateX = interpolate(
        scrollY.value,
        [0, HEADER_CONSTANTS.SCROLL_DISTANCE],
        [0, -50],
        Extrapolation.CLAMP,
      );

      return {
        transform: [{ translateY }, { scale: scale * avatarScale.value }, { translateX }],
      };
    });

    // Profile info fade out on scroll
    const infoAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollY.value,
        [0, HEADER_CONSTANTS.SCROLL_DISTANCE * 0.5],
        [1, 0],
        Extrapolation.CLAMP,
      );
      return { opacity };
    });

    // === Handlers ===

    const handleAvatarPress = useCallback(() => {
      if (!onAvatarPress) return;
      triggerMedia('select');
      avatarScale.value = withSpring(0.96, spring.press);
      setTimeout(() => {
        avatarScale.value = withSpring(1, spring.snappy);
      }, 100);
      onAvatarPress();
    }, [onAvatarPress, triggerMedia, avatarScale]);

    const handleSettingsPress = useCallback(() => {
      triggerNavigation('navigate');
      onSettingsPress?.();
    }, [onSettingsPress, triggerNavigation]);

    const handleFollowPress = useCallback(() => {
      triggerSocial('follow');
      buttonScale.value = withSpring(0.96, spring.press);
      setTimeout(() => {
        buttonScale.value = withSpring(1, spring.snappy);
      }, 100);
      onFollowPress?.();
    }, [onFollowPress, triggerSocial, buttonScale]);

    const handleEditPress = useCallback(() => {
      triggerNavigation('navigate');
      onEditPress?.();
    }, [onEditPress, triggerNavigation]);

    const handleMessagePress = useCallback(() => {
      triggerNavigation('navigate');
      onMessagePress?.();
    }, [onMessagePress, triggerNavigation]);

    return (
      <Animated.View
        style={[styles.container, headerAnimatedStyle, style]}
        testID={testID}
        accessibilityRole="header"
        accessibilityLabel={`${user.fullName} profili`}>
        {/* Cover Image with Parallax */}
        <Animated.View style={[styles.coverContainer, coverAnimatedStyle]}>
          {user.coverImageUrl ? (
            <Image
              source={{ uri: user.coverImageUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={[colors.interactive.default, colors.interactive.pressed]}
              style={styles.coverGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          {/* Gradient overlay */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.coverOverlay} />
        </Animated.View>

        {/* Blur overlay for sticky header */}
        <Animated.View
          style={[
            styles.blurOverlay,
            { backgroundColor: colors.background.primary },
            blurAnimatedStyle,
          ]}
        />

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.spacer} />

          <Animated.Text
            style={[styles.stickyName, { color: colors.text.primary }, stickyNameAnimatedStyle]}>
            {user.fullName}
          </Animated.Text>

          {onSettingsPress && (
            <Pressable
              style={[styles.topBarButton, { backgroundColor: colors.background.overlay }]}
              onPress={handleSettingsPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Ayarlar">
              <Icon name="settings-outline" size={22} color={colors.text.inverse} />
            </Pressable>
          )}
        </View>

        {/* Avatar */}
        <AnimatedPressable
          style={[styles.avatarContainer, avatarAnimatedStyle]}
          onPress={handleAvatarPress}
          disabled={!onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel={
            user.isOwnProfile ? 'Profil fotoğrafını düzenle' : `${user.fullName} profil fotoğrafı`
          }>
          <View style={[styles.avatarBorder, { borderColor: colors.background.primary }]}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.interactive.focus },
                ]}>
                <Text style={[styles.initials, { color: colors.interactive.default }]}>
                  {initials}
                </Text>
              </View>
            )}
          </View>

          {/* Verification badge */}
          {user.isProfessionVerified && (
            <View
              style={[
                styles.verificationBadge,
                {
                  backgroundColor: colors.status.success,
                  borderColor: colors.background.primary,
                },
              ]}>
              <Icon name="checkmark" size={14} color={colors.text.inverse} />
            </View>
          )}
        </AnimatedPressable>

        {/* Profile info */}
        <Animated.View style={[styles.profileInfo, infoAnimatedStyle]}>
          {/* Name row */}
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text.primary }]}>{user.fullName}</Text>
            {user.isProfessionVerified && (
              <Icon name="shield-checkmark" size={18} color={colors.status.success} />
            )}
          </View>

          {/* Profession */}
          {user.professionName && (
            <Text style={[styles.profession, { color: colors.interactive.default }]}>
              {user.professionName}
            </Text>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            {user.isOwnProfile ? (
              <Button
                title="Profili Düzenle"
                variant="outline"
                size="md"
                onPress={handleEditPress}
                style={styles.actionButton}
                testID="edit-profile-button"
              />
            ) : (
              <>
                <Button
                  title={user.isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                  variant={user.isFollowing ? 'outline' : 'primary'}
                  size="md"
                  onPress={handleFollowPress}
                  style={styles.actionButton}
                  testID="follow-button"
                />
                {onMessagePress && (
                  <Pressable
                    style={[
                      styles.smallActionButton,
                      {
                        backgroundColor: colors.background.secondary,
                        borderColor: colors.border.default,
                      },
                    ]}
                    onPress={handleMessagePress}
                    accessibilityRole="button"
                    accessibilityLabel="Mesaj gönder">
                    <Icon name="chatbubble-outline" size={20} color={colors.text.primary} />
                  </Pressable>
                )}
              </>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    );
  },
);

ParallaxProfileHeader.displayName = 'ParallaxProfileHeader';

export type { ParallaxProfileHeaderProps, ProfileHeaderUser } from './ParallaxProfileHeader.types';
