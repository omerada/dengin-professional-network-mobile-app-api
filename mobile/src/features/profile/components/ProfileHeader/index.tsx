// src/features/profile/components/ProfileHeader/index.tsx
// Dengin Design System - Modern ProfileHeader Component
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import React, { memo, useCallback, useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { spring } from '@theme/animations';

import { styles } from './ProfileHeader.styles';
import type { NormalizedProfileData, ProfileHeaderProps } from './ProfileHeader.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Modern ProfileHeader Component
 *
 * Features:
 * - Animated avatar with scale effect
 * - Spring-based edit button
 * - Haptic feedback on interactions
 * - Staggered entrance animations
 * - Verified badge display
 *
 * @example
 * ```tsx
 * <ProfileHeader
 *   profile={userProfile}
 *   isOwnProfile={true}
 *   onAvatarPress={() => handleAvatarEdit()}
 *   onEditPress={() => navigation.navigate('EditProfile')}
 * />
 * ```
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = memo(
  ({ profile, isOwnProfile = false, onAvatarPress, testID }) => {
    const colors = useColors();
    const { triggerMedia } = useSemanticHaptic();

    // Animation values
    const avatarScale = useSharedValue(1);

    // Animated styles
    const avatarAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: avatarScale.value }],
    }));

    // Normalize profile data (handles both ProfileResponse and MyProfileResponse)
    const profileData: NormalizedProfileData = useMemo(() => {
      if ('userId' in profile) {
        // ProfileResponse
        return {
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          professionName: profile.professionName,
          isProfessionVerified: profile.isProfessionVerified,
        };
      }
      // MyProfileResponse
      return {
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        professionName: profile.profession?.name ?? null,
        isProfessionVerified: profile.isProfessionVerified,
      };
    }, [profile]);

    // Generate initials from full name
    const initials = useMemo(() => {
      const names = profileData.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0]?.substring(0, 2).toUpperCase() ?? '';
    }, [profileData.fullName]);

    // Handle avatar press
    const handleAvatarPress = useCallback(() => {
      if (!isOwnProfile) return;

      triggerMedia('select');
      avatarScale.value = withSpring(0.96, spring.press);
      setTimeout(() => {
        avatarScale.value = withSpring(1, spring.snappy);
      }, 100);
      onAvatarPress?.();
    }, [isOwnProfile, onAvatarPress, triggerMedia, avatarScale]);

    return (
      <View style={styles.container} testID={testID}>
        {/* Avatar */}
        <Animated.View entering={FadeIn.duration(400)}>
          <AnimatedPressable
            style={[styles.avatarContainer, avatarAnimatedStyle]}
            onPress={handleAvatarPress}
            disabled={!isOwnProfile}
            accessibilityRole="button"
            accessibilityLabel={isOwnProfile ? 'Profil fotoğrafını düzenle' : 'Profil fotoğrafı'}>
            {profileData.avatarUrl ? (
              <Image
                source={{ uri: profileData.avatarUrl }}
                style={[styles.avatar, { borderColor: colors.border.default }]}
              />
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

            {/* Verification badge */}
            {profileData.isProfessionVerified && (
              <View
                style={[
                  styles.verifiedBadge,
                  {
                    backgroundColor: colors.status.success,
                    borderColor: colors.background.primary,
                  },
                ]}>
                <Icon name="checkmark" size={12} color={colors.text.inverse} />
              </View>
            )}
          </AnimatedPressable>
        </Animated.View>
      </View>
    );
  },
);

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader;
