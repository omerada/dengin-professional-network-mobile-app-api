// src/features/profile/components/ProfileHeader.tsx
// Profile header component with avatar and name
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
import type { ProfileResponse, MyProfileResponse } from '../types';

interface ProfileHeaderProps {
  /**
   * Profile data - either own profile or other user's profile
   */
  profile: ProfileResponse | MyProfileResponse;
  /**
   * Whether this is the current user's own profile
   */
  isOwnProfile?: boolean;
  /**
   * Called when avatar is pressed (for editing on own profile)
   */
  onAvatarPress?: () => void;
  /**
   * Called when edit button is pressed
   */
  onEditPress?: () => void;
}

/**
 * ProfileHeader Component
 *
 * Displays user avatar, name, profession, and verification badge
 *
 * Features:
 * - Avatar with edit overlay for own profile
 * - Profession verified badge
 * - Profession name display
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = memo(
  ({ profile, isOwnProfile = false, onAvatarPress, onEditPress }) => {
    const { theme } = useTheme();

    // Normalize profile data (handles both ProfileResponse and MyProfileResponse)
    const profileData = useMemo(() => {
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

    return (
      <View style={styles.container}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={isOwnProfile ? onAvatarPress : undefined}
          disabled={!isOwnProfile}
          activeOpacity={0.8}
        >
          {profileData.avatarUrl ? (
            <Image
              source={{ uri: profileData.avatarUrl }}
              style={[styles.avatar, { borderColor: theme.colors.border.light }]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <Text style={[styles.initials, { color: theme.colors.primary[600] }]}>
                {initials}
              </Text>
            </View>
          )}

          {/* Edit overlay for own profile */}
          {isOwnProfile && (
            <View
              style={[
                styles.editOverlay,
                { backgroundColor: theme.colors.surface.overlay },
              ]}
            >
              <Icon name="camera" size={20} color="#FFFFFF" />
            </View>
          )}

          {/* Verification badge */}
          {profileData.isProfessionVerified && (
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: theme.colors.success.main },
              ]}
            >
              <Icon name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Name and Profession */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.colors.text.primary }]}>
              {profileData.fullName}
            </Text>
            {isOwnProfile && onEditPress && (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.colors.background.secondary }]}
                onPress={onEditPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="pencil" size={16} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {profileData.professionName && (
            <View style={styles.professionRow}>
              <Icon
                name="briefcase-outline"
                size={14}
                color={theme.colors.text.secondary}
                style={styles.professionIcon}
              />
              <Text
                style={[styles.profession, { color: theme.colors.text.secondary }]}
              >
                {profileData.professionName}
              </Text>
              {profileData.isProfessionVerified && (
                <View
                  style={[
                    styles.verifiedText,
                    { backgroundColor: theme.colors.success.background },
                  ]}
                >
                  <Icon
                    name="shield-checkmark"
                    size={12}
                    color={theme.colors.success.dark}
                  />
                  <Text
                    style={[
                      styles.verifiedLabel,
                      { color: theme.colors.success.dark },
                    ]}
                  >
                    Doğrulanmış
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  },
);

ProfileHeader.displayName = 'ProfileHeader';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 32,
    fontWeight: '700',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  professionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  professionIcon: {
    marginRight: spacing.xs,
  },
  profession: {
    fontSize: typography.fontSize.sm,
  },
  verifiedText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  verifiedLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
});
