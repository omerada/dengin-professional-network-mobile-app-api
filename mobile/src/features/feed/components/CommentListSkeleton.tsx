// src/features/feed/components/CommentListSkeleton.tsx
// P3: Comment list skeleton loader for consistent UX

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@shared/components';
import { spacing } from '@theme';

/**
 * Single comment skeleton item
 */
const CommentSkeleton: React.FC = memo(() => {
  return (
    <View style={styles.commentItem}>
      <Skeleton variant="circular" width={40} height={40} />
      <View style={styles.commentContent}>
        <Skeleton variant="text" width="30%" height={16} style={styles.authorName} />
        <Skeleton variant="text" width="90%" height={14} style={styles.commentText} />
        <Skeleton variant="text" width="60%" height={14} style={styles.commentText} />
        <View style={styles.actions}>
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="text" width={50} height={12} />
        </View>
      </View>
    </View>
  );
});

CommentSkeleton.displayName = 'CommentSkeleton';

/**
 * Comment List Skeleton
 * PostDetailScreen için comment section loading state
 *
 * @example
 * ```tsx
 * {commentsLoading ? (
 *   <CommentListSkeleton count={3} />
 * ) : (
 *   comments.map(comment => <CommentCard key={comment.id} comment={comment} />)
 * )}
 * ```
 */
interface CommentListSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
}

export const CommentListSkeleton: React.FC<CommentListSkeletonProps> = memo(({ count = 3 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={`comment-skeleton-${index}`} />
      ))}
    </View>
  );
});

CommentListSkeleton.displayName = 'CommentListSkeleton';

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  authorName: {
    marginBottom: spacing.xs,
  },
  commentContent: {
    flex: 1,
    gap: spacing.xs,
  },
  commentItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  commentText: {
    marginBottom: spacing.xs,
  },
  container: {
    paddingVertical: spacing.sm,
  },
});
