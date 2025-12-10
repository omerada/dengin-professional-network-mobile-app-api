// src/features/feed/components/FeedHeader/FeedHeader.types.ts
// Meslektaş Design System - FeedHeader Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import type { FeedFilter } from '../../types';
import type { SectorCode } from '@shared/types/api.types';

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
 * Sector info for FeedHeader
 * Updated from ProfessionInfo to SectorInfo (Sprint 1)
 */
export interface SectorInfo {
  /** Sector name (e.g. "Sağlık", "Hukuk") */
  name: string;
  /** Sector code */
  code: SectorCode;
}

/**
 * @deprecated Use SectorInfo instead (Sprint 1)
 */
export type ProfessionInfo = SectorInfo;

/**
 * FeedHeader component props
 */
export interface FeedHeaderProps {
  /** Sector info (for sector icon) - Updated from profession to sector (Sprint 1) */
  sector?: SectorInfo;
  /** Callback when sector icon is pressed */
  onSectorPress?: () => void;
  /** Test ID */
  testID?: string;

  /** @deprecated Use sector instead */
  profession?: ProfessionInfo;
  /** @deprecated Use onSectorPress instead */
  onProfessionPress?: () => void;
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
