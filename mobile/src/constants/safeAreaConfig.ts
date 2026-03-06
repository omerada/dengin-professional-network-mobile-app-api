// src/constants/safeAreaConfig.ts
// Standardized Safe Area Configuration - Production Ready
// Ensures consistent safe area handling across all screens

import { Edge } from 'react-native-safe-area-context';

/**
 * SAFE AREA EDGE CONFIGURATIONS
 *
 * Use these predefined configurations instead of hardcoding edges
 * to ensure consistent safe area handling.
 */
export const SAFE_AREA_EDGES = {
  /**
   * Standard screen configuration
   * Use for: Most screens in the app
   * Edges: ['top']
   *
   * Bottom is handled by tab bar or screen's own padding
   */
  standard: ['top'] as Edge[],

  /**
   * Full screen configuration
   * Use for: Auth screens, onboarding, splash
   * Edges: ['top', 'bottom', 'left', 'right']
   */
  full: ['top', 'bottom', 'left', 'right'] as Edge[],

  /**
   * Modal configuration
   * Use for: Modal presentations, sheets
   * Edges: ['top', 'bottom']
   */
  modal: ['top', 'bottom'] as Edge[],

  /**
   * No safe area
   * Use for: Full screen camera, video, immersive experiences
   * Edges: []
   */
  none: [] as Edge[],

  /**
   * Bottom only
   * Use for: Screens with custom header
   * Edges: ['bottom']
   */
  bottomOnly: ['bottom'] as Edge[],

  /**
   * Top only (alias for standard)
   * Use for: Tab screens
   * Edges: ['top']
   */
  topOnly: ['top'] as Edge[],

  /**
   * Horizontal only
   * Use for: Landscape orientations, horizontal scrolls
   * Edges: ['left', 'right']
   */
  horizontal: ['left', 'right'] as Edge[],
} as const;

/**
 * SCREEN TYPE TO SAFE AREA MAPPING
 *
 * Quick reference for which safe area config to use per screen type
 */
export const SCREEN_SAFE_AREA_MAP = {
  // Tab Screens
  feed: SAFE_AREA_EDGES.standard,
  profile: SAFE_AREA_EDGES.standard,
  messaging: SAFE_AREA_EDGES.standard,
  notifications: SAFE_AREA_EDGES.standard,
  activity: SAFE_AREA_EDGES.standard,

  // Detail Screens
  postDetail: SAFE_AREA_EDGES.standard,
  userProfile: SAFE_AREA_EDGES.standard,
  chat: SAFE_AREA_EDGES.standard,
  comments: SAFE_AREA_EDGES.standard,

  // Modal Screens
  createPost: SAFE_AREA_EDGES.modal,
  editProfile: SAFE_AREA_EDGES.modal,
  settings: SAFE_AREA_EDGES.modal,

  // Auth Screens
  welcome: SAFE_AREA_EDGES.full,
  login: SAFE_AREA_EDGES.full,
  register: SAFE_AREA_EDGES.full,
  onboarding: SAFE_AREA_EDGES.full,

  // Immersive Screens
  camera: SAFE_AREA_EDGES.none,
  verification: SAFE_AREA_EDGES.full,
} as const;

/**
 * Helper: Get safe area edges for screen type
 *
 * @param screenType - Type of screen
 * @returns Safe area edges configuration
 *
 * @example
 * const edges = getSafeAreaForScreen('feed');
 * <SafeAreaView edges={edges}>
 */
export function getSafeAreaForScreen(screenType: keyof typeof SCREEN_SAFE_AREA_MAP): Edge[] {
  return SCREEN_SAFE_AREA_MAP[screenType] || SAFE_AREA_EDGES.standard;
}
