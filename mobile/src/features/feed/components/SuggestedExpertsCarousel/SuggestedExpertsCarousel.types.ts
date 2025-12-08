// src/features/feed/components/SuggestedExpertsCarousel/SuggestedExpertsCarousel.types.ts
// Type definitions for SuggestedExpertsCarousel component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 419, 1971-1987
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

/**
 * Props for SuggestedExpertsCarousel component
 */
export interface SuggestedExpertsCarouselProps {
  /**
   * Callback when expert card is pressed
   */
  onExpertPress: (userId: number) => void;

  /**
   * Callback when follow/unfollow button is pressed
   */
  onFollowToggle: (userId: number, isFollowing: boolean) => void;

  /**
   * Optional test ID for testing
   * @default 'suggested-experts-carousel'
   */
  testID?: string;
}

/**
 * Props for ExpertCard component
 */
export interface ExpertCardProps {
  /**
   * Expert data
   */
  expert: SuggestedExpert;

  /**
   * Callback when card is pressed
   */
  onPress: () => void;

  /**
   * Callback when follow button is pressed
   */
  onFollowPress: () => void;

  /**
   * Optional test ID for testing
   */
  testID?: string;
}

/**
 * Suggested expert data structure
 */
export interface SuggestedExpert {
  /**
   * Unique user ID
   */
  id: number;

  /**
   * Full name
   */
  fullName: string;

  /**
   * Profession/title
   */
  profession: string;

  /**
   * Avatar URL (nullable)
   */
  avatarUrl: string | null;

  /**
   * Verification status
   */
  isVerified: boolean;

  /**
   * Current follow status
   */
  isFollowing: boolean;

  /**
   * Follower count
   */
  followerCount: number;
}
