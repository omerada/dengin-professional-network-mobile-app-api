// src/features/feed/components/PostCard/PostCard.types.ts
// Meslektaş Design System - PostCard Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import type { ViewStyle } from 'react-native';
import type { Post, PostAuthor } from '../../types';

/**
 * PostCard component props
 */
export interface PostCardProps {
  /** Post data */
  post: Post;

  /** Index in list (for staggered animation) */
  index?: number;

  /** Like callback */
  onLike?: (postId: number, isLiked: boolean) => void;

  /** Comment callback */
  onComment?: (postId: number) => void;

  /** Share callback */
  onShare?: (postId: number) => void;

  /** Bookmark callback */
  onBookmark?: (postId: number, isSaved: boolean) => void;

  /** Menu press callback */
  onMenuPress?: (postId: number) => void;

  /** Additional container styles */
  style?: ViewStyle;

  /** Test ID for testing */
  testID?: string;
}

/**
 * PostHeader component props
 */
export interface PostHeaderProps {
  /** Post author */
  author: PostAuthor;

  /** Post creation time */
  createdAt: string;

  /** Author press callback */
  onAuthorPress?: () => void;

  /** Menu press callback */
  onMenuPress?: () => void;

  /** Test ID */
  testID?: string;
}

/**
 * PostContent component props
 */
export interface PostContentProps {
  /** Post content text */
  content: string;

  /** Maximum number of lines before truncation */
  maxLines?: number;

  /** Show "more" button when truncated */
  showMoreButton?: boolean;

  /** Callback when "more" is pressed */
  onMorePress?: () => void;

  /** Test ID */
  testID?: string;
}

/**
 * PostImages component props
 */
export interface PostImagesProps {
  /** Array of image objects */
  images: Array<{
    id?: string;
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    blurhash?: string;
  }>;

  /** Post ID for navigation */
  postId: number;

  /** Callback when image is pressed */
  onImagePress?: (index: number) => void;

  /** Test ID */
  testID?: string;
}

/**
 * PostActions component props
 */
export interface PostActionsProps {
  /** Post ID */
  postId: number;

  /** Post statistics */
  stats: {
    likeCount: number;
    commentCount: number;
    viewCount?: number;
  };

  /** User interaction state */
  userInteraction: {
    isLiked: boolean;
    isSaved: boolean;
  };

  /** Like callback */
  onLike: () => void;

  /** Comment callback */
  onComment: () => void;

  /** Share callback */
  onShare: () => void;

  /** Bookmark callback */
  onBookmark: () => void;

  /** Test ID */
  testID?: string;
}

/**
 * Format number for display (1K, 1M, etc.)
 */
export const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
