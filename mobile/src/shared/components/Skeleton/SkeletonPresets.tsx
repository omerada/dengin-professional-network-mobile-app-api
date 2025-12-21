// src/shared/components/Skeleton/SkeletonPresets.tsx
// Pre-configured skeleton loaders for common UI patterns
// Production-ready implementation

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';

/**
 * Post card skeleton
 * Use in: FeedScreen, ProfileScreen (posts tab)
 */
export const SkeletonPostCard: React.FC = () => {
  const colors = useColors();

  return (
    <View style={[styles.postCard, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Skeleton variant="circular" width={40} height={40} />
        <View style={styles.postHeaderText}>
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="95%" height={14} />
        <Skeleton variant="text" width="70%" height={14} />
      </View>

      {/* Image */}
      <Skeleton variant="rectangular" width="100%" height={300} />

      {/* Actions */}
      <View style={styles.postActions}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
      </View>
    </View>
  );
};

/**
 * Profile header skeleton
 * Use in: ProfileScreen
 */
export const SkeletonProfileHeader: React.FC = () => {
  const colors = useColors();

  return (
    <View style={[styles.profileHeader, { backgroundColor: colors.background.primary }]}>
      {/* Premium background blur */}
      <View style={styles.profileBackground}>
        <Skeleton variant="rectangular" width="100%" height={200} />
      </View>

      {/* Avatar */}
      <View style={styles.profileAvatar}>
        <Skeleton variant="circular" width={120} height={120} />
      </View>

      {/* Name and username */}
      <View style={styles.profileInfo}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={16} />
      </View>

      {/* Stats */}
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="text" width={60} height={14} />
        </View>
        <View style={styles.statItem}>
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="text" width={60} height={14} />
        </View>
        <View style={styles.statItem}>
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="text" width={60} height={14} />
        </View>
      </View>

      {/* Bio */}
      <View style={styles.profileBio}>
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="90%" height={14} />
      </View>

      {/* Actions */}
      <View style={styles.profileActions}>
        <Skeleton variant="rounded" width="48%" height={40} />
        <Skeleton variant="rounded" width="48%" height={40} />
      </View>
    </View>
  );
};

/**
 * Conversation list item skeleton
 * Use in: ConversationListScreen
 */
export const SkeletonConversationItem: React.FC = () => {
  const colors = useColors();

  return (
    <View style={[styles.conversationItem, { backgroundColor: colors.background.primary }]}>
      <Skeleton variant="circular" width={56} height={56} />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="20%" height={12} />
        </View>
        <Skeleton variant="text" width="80%" height={14} />
      </View>
    </View>
  );
};

/**
 * Notification item skeleton
 * Use in: NotificationsScreen
 */
export const SkeletonNotificationItem: React.FC = () => {
  const colors = useColors();

  return (
    <View style={[styles.notificationItem, { backgroundColor: colors.background.primary }]}>
      <Skeleton variant="circular" width={48} height={48} />
      <View style={styles.notificationContent}>
        <Skeleton variant="text" width="90%" height={14} />
        <Skeleton variant="text" width="70%" height={14} />
        <Skeleton variant="text" width="30%" height={12} />
      </View>
    </View>
  );
};

/**
 * Comment item skeleton
 * Use in: CommentsScreen
 */
export const SkeletonCommentItem: React.FC = () => {
  const colors = useColors();

  return (
    <View style={[styles.commentItem, { backgroundColor: colors.background.primary }]}>
      <Skeleton variant="circular" width={36} height={36} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Skeleton variant="text" width="40%" height={14} />
          <Skeleton variant="text" width="20%" height={12} />
        </View>
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="80%" height={14} />
      </View>
    </View>
  );
};

/**
 * User list item skeleton
 * Use in: FollowersList, FollowingList, SearchResults
 */
export const SkeletonUserListItem: React.FC = () => {
  const colors = useColors();

  return (
    <View style={[styles.userListItem, { backgroundColor: colors.background.primary }]}>
      <Skeleton variant="circular" width={48} height={48} />
      <View style={styles.userInfo}>
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={14} />
      </View>
      <Skeleton variant="rounded" width={80} height={32} />
    </View>
  );
};

/**
 * List skeleton with multiple items
 * Use for loading states of any list
 */
export const SkeletonList: React.FC<{
  ItemSkeleton: React.ComponentType;
  count?: number;
}> = ({ ItemSkeleton, count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ItemSkeleton key={index} />
      ))}
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  // Post Card
  postCard: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  postHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  postHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  postContent: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },

  // Profile Header
  profileHeader: {
    gap: spacing.md,
  },
  profileBackground: {
    height: 200,
  },
  profileAvatar: {
    alignItems: 'center',
    marginTop: -60,
  },
  profileInfo: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileBio: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  profileActions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },

  // Conversation Item
  conversationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  conversationContent: {
    flex: 1,
    gap: spacing.xs,
  },
  conversationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Notification Item
  notificationItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  notificationContent: {
    flex: 1,
    gap: spacing.xs,
  },

  // Comment Item
  commentItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  commentContent: {
    flex: 1,
    gap: spacing.xs,
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // User List Item
  userListItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  userInfo: {
    flex: 1,
    gap: spacing.xs,
  },
});
