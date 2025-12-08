// src/features/feed/components/EmptyFeed/NewUserEmptyState/NewUserEmptyState.types.ts
// Type definitions for NewUserEmptyState component
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1564-1604
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 300-350

import type { IconProps } from 'react-native-vector-icons/Icon';

/**
 * Props for NewUserEmptyState component
 */
export interface NewUserEmptyStateProps {
  /**
   * User object with completion status
   */
  user: {
    name: string;
    hasAvatar: boolean;
    hasBio: boolean;
    followingCount: number;
    postCount: number;
  };

  /**
   * Callback when profile completion CTA is pressed
   */
  onCompleteProfile: () => void;

  /**
   * Callback when specific checklist item is pressed
   */
  onChecklistItemPress?: (itemId: ChecklistItemId) => void;

  /**
   * Optional test ID for testing
   * @default 'new-user-empty-state'
   */
  testID?: string;
}

/**
 * Checklist item IDs
 */
export type ChecklistItemId = 'avatar' | 'bio' | 'follow' | 'post';

/**
 * Onboarding checklist item
 */
export interface ChecklistItem {
  /**
   * Unique identifier
   */
  id: ChecklistItemId;

  /**
   * Display label
   */
  label: string;

  /**
   * Icon name from Ionicons
   */
  icon: IconProps['name'];

  /**
   * XP reward for completing this item
   */
  xp: number;

  /**
   * Navigation target when pressed
   */
  action: 'profile-edit' | 'verification' | 'discover' | 'create-post';
}

/**
 * Onboarding checklist configuration
 */
export const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  {
    id: 'avatar',
    label: 'Profil fotoğrafı ekle',
    icon: 'image-outline',
    xp: 10,
    action: 'profile-edit',
  },
  {
    id: 'bio',
    label: 'Bio yaz',
    icon: 'create-outline',
    xp: 10,
    action: 'profile-edit',
  },
  {
    id: 'follow',
    label: '5 kişiyi takip et',
    icon: 'people-outline',
    xp: 20,
    action: 'discover',
  },
  {
    id: 'post',
    label: 'İlk gönderiyi paylaş',
    icon: 'add-circle-outline',
    xp: 30,
    action: 'create-post',
  },
];

/**
 * Helper to calculate completion status
 */
export const getChecklistStatus = (
  user: NewUserEmptyStateProps['user'],
): Record<ChecklistItemId, boolean> => ({
  avatar: user.hasAvatar,
  bio: user.hasBio,
  follow: user.followingCount >= 5,
  post: user.postCount > 0,
});

/**
 * Helper to calculate completion percentage
 */
export const getCompletionPercentage = (user: NewUserEmptyStateProps['user']): number => {
  const status = getChecklistStatus(user);
  const completed = Object.values(status).filter(Boolean).length;
  const total = ONBOARDING_CHECKLIST.length;

  return Math.round((completed / total) * 100);
};

/**
 * Helper to calculate total XP earned
 */
export const getTotalXP = (user: NewUserEmptyStateProps['user']): number => {
  const status = getChecklistStatus(user);

  return ONBOARDING_CHECKLIST.reduce((total, item) => {
    return status[item.id] ? total + item.xp : total;
  }, 0);
};
