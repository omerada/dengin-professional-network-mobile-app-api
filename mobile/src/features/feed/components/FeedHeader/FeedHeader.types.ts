// src/features/feed/components/FeedHeader/FeedHeader.types.ts
// Meslektaş Design System - FeedHeader Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import type { FeedFilter } from '../../types';

/**
 * Filter option interface
 */
export interface FilterOption {
  /** Filter key */
  key: FeedFilter;
  /** Display label */
  label: string;
  /** Ionicons icon name */
  icon: string;
}

/**
 * FeedHeader component props
 */
export interface FeedHeaderProps {
  /** Callback when create button is pressed */
  onCreatePress?: () => void;
  /** Test ID */
  testID?: string;
}

/**
 * Available filter options
 */
export const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Tümü', icon: 'grid-outline' },
  { key: 'following', label: 'Takip', icon: 'people-outline' },
  { key: 'popular', label: 'Popüler', icon: 'flame-outline' },
  { key: 'nearby', label: 'Yakın', icon: 'location-outline' },
];
