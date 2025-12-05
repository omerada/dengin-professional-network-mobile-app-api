// src/features/feed/components/EmptyFeed/EmptyFeed.types.ts
// Meslektaş Design System - EmptyFeed Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

/**
 * EmptyFeed component props
 */
export interface EmptyFeedProps {
  /** Empty state title */
  title?: string;
  /** Empty state message */
  message?: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Ionicons icon name */
  icon?: string;
  /** Test ID */
  testID?: string;
}
