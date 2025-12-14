// src/features/profile/components/ProfileHeader/ProfileHeader.types.ts
// Dengin Design System - ProfileHeader Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import type { ProfileResponse, MyProfileResponse } from '../../types';

/**
 * ProfileHeader component props
 */
export interface ProfileHeaderProps {
  /** Profile data - either own profile or other user's profile */
  profile: ProfileResponse | MyProfileResponse;
  /** Whether this is the current user's own profile */
  isOwnProfile?: boolean;
  /** Called when avatar is pressed (for editing on own profile) */
  onAvatarPress?: () => void;
  /** Called when edit button is pressed */
  onEditPress?: () => void;
  /** Test ID */
  testID?: string;
}

/**
 * Normalized profile data for consistent rendering
 */
export interface NormalizedProfileData {
  fullName: string;
  avatarUrl: string | null;
  professionName: string | null;
  isProfessionVerified: boolean;
}
