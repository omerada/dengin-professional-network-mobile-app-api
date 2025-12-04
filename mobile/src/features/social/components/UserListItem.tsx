// src/features/social/components/UserListItem.tsx
// User list item for followers/following lists
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { Avatar, Badge } from '@shared/components';
import { spacing, typography } from '@theme';
import { FollowButton } from './FollowButton';
import type { FollowUser } from '../types';

interface UserListItemProps {
  /**
   * User data to display
   */
  user: FollowUser;
  /**
   * Show follow button
   * @default true
   */
  showFollowButton?: boolean;
  /**
   * Callback when follow state changes
   */
  onFollowChange?: (userId: number, isFollowing: boolean) => void;
}

/**
 * UserListItem Component
 *
 * Displays a user row with avatar, name, profession, and optional follow button.
 * Used in followers/following lists.
 *
 * @example
 * ```tsx
 * <UserListItem
 *   user={followUser}
 *   showFollowButton
 *   onFollowChange={(id, following) => refetch()}
 * />
 * ```
 */
export const UserListItem: React.FC<UserListItemProps> = memo(
  ({ user, showFollowButton = true, onFollowChange }) => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const handlePress = useCallback(() => {
      navigation.navigate('Profile' as never, { userId: user.id.toString() } as never);
    }, [navigation, user.id]);

    return (
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Avatar
          uri={user.avatarUrl}
          name={user.fullName}
          size="lg"
          showBadge={user.isProfessionVerified}
          badgeColor={theme.colors.success.main}
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.name, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {user.fullName}
            </Text>
            {user.isProfessionVerified && (
              <Badge variant="success" dot size="sm" style={styles.verifiedBadge} />
            )}
          </View>

          {user.profession && (
            <Text
              style={[styles.profession, { color: theme.colors.text.secondary }]}
              numberOfLines={1}
            >
              {user.profession.name}
            </Text>
          )}

          {user.isFollowedBy && !user.isFollowing && (
            <Text style={[styles.followsYou, { color: theme.colors.text.tertiary }]}>
              Seni takip ediyor
            </Text>
          )}
        </View>

        {showFollowButton && (
          <FollowButton
            userId={user.id}
            isFollowing={user.isFollowing}
            onFollowChange={onFollowChange}
            size="sm"
          />
        )}
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: spacing.xs,
  },
  profession: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  followsYou: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
});

UserListItem.displayName = 'UserListItem';
