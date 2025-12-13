// src/features/profile/components/ProfileActions/ProfileActions.types.ts
// Meslektaş Design System - ProfileActions Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

/**
 * ProfileActions component props
 */
export interface ProfileActionsProps {
  /** User ID of the profile being viewed */
  userId: number;
  /** Whether current user is following this user */
  isFollowing?: boolean;
  /** Whether this user is following the current user */
  isFollowedBy?: boolean;
  /** Whether this user is blocked */
  isBlocked?: boolean;
  /** Called when follow state changes */
  onFollowChange?: (isFollowing: boolean) => void;
  /** Called when block state changes */
  onBlockChange?: (isBlocked: boolean) => void;
  /** Test ID */
  testID?: string;
}

/**
 * Get follow button text based on state
 */
export const getFollowButtonText = (isFollowing?: boolean, isFollowedBy?: boolean): string => {
  if (isFollowing) return 'Takipten Çık';
  if (isFollowedBy) return 'Takip Et Geri';
  return 'Takip Et';
};
