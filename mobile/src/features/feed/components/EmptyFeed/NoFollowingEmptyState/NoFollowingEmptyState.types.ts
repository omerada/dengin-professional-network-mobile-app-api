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
 */
export interface SuggestedExpertPreview {
  id: number;
  fullName: string;
  profession: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isFollowing: boolean;
}

/**
 * Mock suggested experts for preview (3 experts)
 * TODO: Replace with real API call when backend ready
 */
export const MOCK_SUGGESTED_EXPERTS: SuggestedExpertPreview[] = [
  {
    id: 1,
    fullName: 'Dr. Ayşe Yılmaz',
    profession: 'Kardiyolog',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
  },
  {
    id: 2,
    fullName: 'Av. Mehmet Demir',
    profession: 'İş Hukuku Avukatı',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
  },
  {
    id: 3,
    fullName: 'Mimar Can Öztürk',
    profession: 'Mimarlık',
    avatarUrl: null,
    isVerified: false,
    isFollowing: false,
  },
];
