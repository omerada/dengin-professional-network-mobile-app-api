// src/features/feed/components/EmptyFeed/NoFollowingEmptyState/NoFollowingEmptyState.types.ts
// Type definitions for NoFollowingEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1607-1632
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 376-410

/**
 * Props for NoFollowingEmptyState component
 */
export interface NoFollowingEmptyStateProps {
  /**
   * Callback when discover CTA is pressed
   */
  onDiscover: () => void;

  /**
   * Callback when "Show all suggestions" is pressed
   */
  onShowAllSuggestions?: () => void;

  /**
   * Optional test ID for testing
   * @default 'no-following-empty-state'
   */
  testID?: string;
}

/**
 * Suggested expert preview (for quick follow without navigating)
 * Backend: SuggestedUserResponse.java
 */
export interface SuggestedExpertPreview {
  id: number;
  fullName: string;
  profession: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isFollowing: boolean;
}
