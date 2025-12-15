// src/constants/layoutConstants.ts
// Standardized layout dimensions across the app

/**
 * Standard header height for all screens
 * Used in: ScreenHeader, ChatHeader, FeedHeader, etc.
 */
export const HEADER_HEIGHT = 56;

/**
 * Standard tab bar height
 * Used in: AnimatedTabBar
 */
export const TAB_BAR_HEIGHT = 64;

/**
 * Standard bottom sheet header height
 */
export const BOTTOM_SHEET_HEADER_HEIGHT = 48;

/**
 * Standard list item height
 */
export const LIST_ITEM_HEIGHT = {
  small: 44,
  medium: 56,
  large: 72,
} as const;

/**
 * Standard card heights
 */
export const CARD_HEIGHT = {
  compact: 80,
  normal: 120,
  expanded: 200,
} as const;
