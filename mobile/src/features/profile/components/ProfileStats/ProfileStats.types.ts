// src/features/profile/components/ProfileStats/ProfileStats.types.ts
// Meslektaş Design System - ProfileStats Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import type { ProfileStats as ProfileStatsType } from '../../types';

/**
 * ProfileStats component props
 */
export interface ProfileStatsProps {
  /** Stats data */
  stats: ProfileStatsType;
  /** User ID for navigation to followers/following screens */
  userId: number;
  /** Whether stats are interactive (clickable) */
  interactive?: boolean;
  /** Test ID */
  testID?: string;
}

/**
 * StatItem component props
 */
export interface StatItemProps {
  /** Display label */
  label: string;
  /** Numeric value */
  value: number;
  /** Press callback (makes item interactive) */
  onPress?: () => void;
  /** Animation delay in ms */
  delay?: number;
}

/**
 * Format large numbers for display
 */
export const formatStatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};
