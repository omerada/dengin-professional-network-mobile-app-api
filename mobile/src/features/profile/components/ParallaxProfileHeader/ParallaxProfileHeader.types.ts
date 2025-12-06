// src/features/profile/components/ParallaxProfileHeader/ParallaxProfileHeader.types.ts
// Meslektaş Design System - ParallaxProfileHeader Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/10-PROFILE-EXPERIENCE.md

import type { ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/**
 * User data structure for profile header
 */
export interface ProfileHeaderUser {
  /** User ID */
  id: number;
  /** Full display name */
  fullName: string;
  /** Avatar URL */
  avatarUrl?: string | null;
  /** Cover image URL */
  coverImageUrl?: string | null;
  /** User bio */
  bio?: string | null;
  /** Profession name */
  professionName?: string | null;
  /** Whether profession is verified */
  isProfessionVerified?: boolean;
  /** User stats */
  stats?: {
    postCount: number;
    followerCount: number;
    followingCount: number;
  };
  /** Whether this is the current user's profile */
  isOwnProfile?: boolean;
  /** Whether current user follows this user */
  isFollowing?: boolean;
}

/**
 * ParallaxProfileHeader Props
 */
export interface ParallaxProfileHeaderProps {
  /** User data */
  user: ProfileHeaderUser;

  /** Animated scroll value for parallax effect */
  scrollY: SharedValue<number>;

  /** Callback when follow/unfollow button is pressed */
  onFollowPress?: () => void;

  /** Callback when edit profile button is pressed */
  onEditPress?: () => void;

  /** Callback when settings button is pressed */
  onSettingsPress?: () => void;

  /** Callback when avatar is pressed */
  onAvatarPress?: () => void;

  /** Callback when message button is pressed */
  onMessagePress?: () => void;

  /** Custom style for container */
  style?: ViewStyle;

  /** Test ID */
  testID?: string;
}

/**
 * Header dimension constants
 */
export const HEADER_CONSTANTS = {
  MAX_HEIGHT: 280,
  MIN_HEIGHT: 100,
  get SCROLL_DISTANCE(): number {
    return this.MAX_HEIGHT - this.MIN_HEIGHT;
  },
  AVATAR_SIZE: 100,
  AVATAR_MIN_SIZE: 40,
} as const;
