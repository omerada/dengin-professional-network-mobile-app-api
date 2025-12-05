// src/shared/components/Skeleton/Skeleton.types.ts
// Meslektaş Design System - Skeleton Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import type { ViewStyle } from 'react-native';

/**
 * Skeleton shape variants
 */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

/**
 * Skeleton animation types
 */
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'wave' | 'none';

/**
 * Skeleton component props
 */
export interface SkeletonProps {
  /** Shape variant of the skeleton */
  variant?: SkeletonVariant;

  /** Width of the skeleton (number or percentage string) */
  width?: number | string;

  /** Height of the skeleton */
  height?: number;

  /** Border radius override */
  borderRadius?: number;

  /** Animation type */
  animation?: SkeletonAnimation;

  /** Animation duration in ms */
  animationDuration?: number;

  /** Number of skeleton items to render */
  count?: number;

  /** Gap between skeleton items when count > 1 */
  gap?: number;

  /** Additional container styles */
  style?: ViewStyle;

  /** Test ID for testing */
  testID?: string;
}

/**
 * SkeletonGroup component props
 */
export interface SkeletonGroupProps {
  /** Number of skeleton lines */
  lines?: number;

  /** Gap between lines */
  gap?: number;

  /** Width pattern for lines (e.g., ['100%', '80%', '60%']) */
  widthPattern?: (number | string)[];

  /** Height of each line */
  lineHeight?: number;

  /** Additional container styles */
  style?: ViewStyle;
}

/**
 * SkeletonPost component props
 */
export interface SkeletonPostProps {
  /** Whether to show image placeholder */
  showImage?: boolean;

  /** Whether to show action buttons placeholder */
  showActions?: boolean;

  /** Additional container styles */
  style?: ViewStyle;
}

/**
 * SkeletonMessage component props
 */
export interface SkeletonMessageProps {
  /** Whether the message is from the current user */
  isOwn?: boolean;

  /** Whether to show avatar */
  showAvatar?: boolean;

  /** Additional container styles */
  style?: ViewStyle;
}

/**
 * SkeletonCard component props
 */
export interface SkeletonCardProps {
  /** Whether to show image placeholder */
  showImage?: boolean;

  /** Image height */
  imageHeight?: number;

  /** Number of text lines */
  lines?: number;

  /** Additional container styles */
  style?: ViewStyle;
}
