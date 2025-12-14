// src/features/feed/components/FeedSkeleton.tsx
// Dengin Design System - Feed Skeleton Loading Component
// Oku: mobile-development-guide/ui-ux-modernization/17-LOADING-STATES.md

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from '@shared/components/Skeleton';
import { useTheme } from '@contexts/ThemeContext';
import { spacing } from '@theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

interface FeedSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Show with images */
  showImages?: boolean;
  /** Test ID */
  testID?: string;
}

interface PostSkeletonProps {
  /** Show image placeholder */
  showImage?: boolean;
  /** Index for staggered animation */
  index?: number;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Post Skeleton Component
// ============================================================================

/**
 * Single Post Skeleton
 * Mimics the PostCard layout with shimmer animation
 */
export const PostSkeleton = memo<PostSkeletonProps>(({ showImage = true, index = 0, testID }) => {
  const { colors } = useTheme();

  // Stagger animation delay based on index
  const animationDelay = index * 100;

  return (
    <View
      testID={testID}
      style={[styles.postContainer, { backgroundColor: colors.background.primary }]}>
      {/* Header: Avatar + Name + Time */}
      <View style={styles.header}>
        <Skeleton
          variant="circular"
          height={40}
          animation="shimmer"
          animationDuration={1500 + animationDelay}
        />
        <View style={styles.headerText}>
          <Skeleton
            width="60%"
            height={14}
            animation="shimmer"
            animationDuration={1500 + animationDelay}
          />
          <View style={styles.subHeaderRow}>
            <Skeleton
              width="30%"
              height={12}
              animation="shimmer"
              animationDuration={1500 + animationDelay}
            />
          </View>
        </View>
        <Skeleton
          variant="circular"
          height={24}
          animation="shimmer"
          animationDuration={1500 + animationDelay}
        />
      </View>

      {/* Content: Text lines */}
      <View style={styles.content}>
        <Skeleton
          width="100%"
          height={14}
          animation="shimmer"
          animationDuration={1500 + animationDelay}
        />
        <View style={styles.spacerSm} />
        <Skeleton
          width="85%"
          height={14}
          animation="shimmer"
          animationDuration={1500 + animationDelay}
        />
        <View style={styles.spacerSm} />
        <Skeleton
          width="70%"
          height={14}
          animation="shimmer"
          animationDuration={1500 + animationDelay}
        />
      </View>

      {/* Image placeholder */}
      {showImage && (
        <View style={styles.imageContainer}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            borderRadius={12}
            animation="shimmer"
            animationDuration={1500 + animationDelay}
          />
        </View>
      )}

      {/* Actions: Like, Comment, Share, Bookmark */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <Skeleton
            width={60}
            height={24}
            borderRadius={12}
            animation="shimmer"
            animationDuration={1500 + animationDelay}
          />
          <Skeleton
            width={50}
            height={24}
            borderRadius={12}
            animation="shimmer"
            animationDuration={1500 + animationDelay}
          />
          <Skeleton
            width={40}
            height={24}
            borderRadius={12}
            animation="shimmer"
            animationDuration={1500 + animationDelay}
          />
        </View>
        <Skeleton
          width={24}
          height={24}
          borderRadius={12}
          animation="shimmer"
          animationDuration={1500 + animationDelay}
        />
      </View>
    </View>
  );
});

PostSkeleton.displayName = 'PostSkeleton';

// ============================================================================
// Feed Skeleton Component
// ============================================================================

/**
 * Feed Skeleton Component
 *
 * Features:
 * - Multiple post skeletons with staggered animations
 * - Mimics actual feed layout
 * - Shimmer effect for loading state
 *
 * @example
 * ```tsx
 * // While loading feed
 * {isLoading && <FeedSkeleton count={3} />}
 *
 * // Or as FlashList placeholder
 * <FlashList
 *   ListEmptyComponent={<FeedSkeleton count={5} />}
 * />
 * ```
 */
export const FeedSkeleton = memo<FeedSkeletonProps>(({ count = 3, showImages = true, testID }) => {
  return (
    <View testID={testID} style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton
          key={index}
          index={index}
          showImage={showImages && index % 2 === 0} // Alternate images
          testID={testID ? `${testID}-item-${index}` : undefined}
        />
      ))}
    </View>
  );
});

FeedSkeleton.displayName = 'FeedSkeleton';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    width: SCREEN_WIDTH,
    paddingVertical: spacing['3'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['3'],
  },
  headerText: {
    flex: 1,
    marginLeft: spacing['3'],
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing['1'],
  },
  content: {
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['3'],
  },
  spacerSm: {
    height: spacing['1.5'],
  },
  imageContainer: {
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['3'],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
  },
});

export default FeedSkeleton;
