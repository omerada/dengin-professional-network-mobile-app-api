// src/constants/layoutConstants.ts
// UNIFIED LAYOUT CONSTANTS - Production Standard
// Ensures consistent layout dimensions across all screens

/**
 * UNIFIED HEADER SYSTEM
 * All screen headers must use these constants
 * iOS/Android standard: 56px (44pt iOS + spacing)
 */
export const UNIFIED_HEADER = {
  /**
   * Standard header height - ALL screens
   * iOS navigation bar: 44pt ≈ 56px
   * Android app bar: 56dp
   * Material Design 3: 56dp
   */
  HEIGHT: 56,

  /**
   * Header with search bar (e.g., ConversationListScreen)
   * Standard height + search input + spacing
   */
  HEIGHT_WITH_SEARCH: 100,

  /**
   * Header horizontal padding
   */
  PADDING_HORIZONTAL: 16,

  /**
   * Header vertical padding
   */
  PADDING_VERTICAL: 12,

  /**
   * Header icon size (back, settings, etc.)
   */
  ICON_SIZE: 24,

  /**
   * Header avatar size (e.g., ChatScreen)
   */
  AVATAR_SIZE: 32,

  /**
   * Minimum tap target (iOS Human Interface Guidelines)
   */
  MIN_TAP_TARGET: 44,
} as const;

/**
 * UNIFIED TAB BAR
 */
export const UNIFIED_TAB_BAR = {
  HEIGHT: 56,
  ICON_SIZE: 24,
  FAB_SIZE: 56, // Center floating action button
  SAFE_AREA_BOTTOM: 0, // Handled by SafeAreaView
} as const;

/**
 * UNIFIED SPACING
 * Screen and component spacing
 */
export const UNIFIED_SPACING = {
  SCREEN_HORIZONTAL: 16,
  SCREEN_VERTICAL: 16,
  CARD_HORIZONTAL: 16,
  LIST_ITEM_MIN_HEIGHT: 64,
  SEPARATOR: 1,
} as const;

/**
 * @deprecated Use UNIFIED_HEADER.HEIGHT instead
 */
export const HEADER_HEIGHT = UNIFIED_HEADER.HEIGHT;

/**
 * @deprecated Use UNIFIED_TAB_BAR.HEIGHT instead
 */
export const TAB_BAR_HEIGHT = UNIFIED_TAB_BAR.HEIGHT;

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
