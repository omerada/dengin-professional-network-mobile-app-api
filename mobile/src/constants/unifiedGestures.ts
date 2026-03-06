// src/constants/unifiedGestures.ts
// Unified Gesture System - Production Standard
// Ensures consistent gesture behavior across the entire app

import type { HapticType } from '@theme/types';

/**
 * Gesture Configuration Type
 */
interface GestureConfig {
  threshold: number;
  velocity?: number;
  haptic: HapticType;
}

/**
 * UNIFIED GESTURES
 *
 * Standardized gesture configurations for consistent UX.
 * All gesture thresholds, velocities, and haptic feedback are defined here.
 *
 * USAGE:
 * import { UNIFIED_GESTURES } from '@constants/unifiedGestures';
 *
 * <Modal
 *   swipeThreshold={UNIFIED_GESTURES.MODAL_SWIPE_DOWN.threshold}
 *   onSwipeComplete={handleClose}
 * />
 */
export const UNIFIED_GESTURES = {
  /**
   * Modal Swipe Down to Dismiss
   * Use for: All modal screens
   * Threshold: 100px vertical swipe
   * Velocity: 300px/s minimum
   */
  MODAL_SWIPE_DOWN: {
    threshold: 100,
    velocity: 300,
    haptic: 'light',
  } as GestureConfig,

  /**
   * Pull to Refresh
   * Use for: All list screens (Feed, Messages, Profile)
   * Threshold: 80px pull distance
   * Haptic: Medium feedback on trigger
   */
  LIST_PULL_REFRESH: {
    threshold: 80,
    haptic: 'medium',
  } as GestureConfig,

  /**
   * Double Tap to Like
   * Use for: PostCard, Image viewer
   * Max delay: 300ms between taps
   * Haptic: Medium feedback on success
   */
  ITEM_DOUBLE_TAP: {
    threshold: 300, // Max delay in ms
    haptic: 'medium',
  } as GestureConfig,

  /**
   * Long Press for Context Menu
   * Use for: All interactive items
   * Min duration: 500ms
   * Haptic: Heavy feedback on trigger
   */
  ITEM_LONG_PRESS: {
    threshold: 500, // Min duration in ms
    haptic: 'heavy',
  } as GestureConfig,

  /**
   * Swipe to Reply (Chat)
   * Use for: Chat messages
   * Threshold: 60px horizontal swipe
   * Haptic: Light feedback on start
   */
  CHAT_SWIPE_REPLY: {
    threshold: 60,
    haptic: 'light',
  } as GestureConfig,

  /**
   * Swipe to Delete
   * Use for: List items (opt-in)
   * Threshold: 80px horizontal swipe
   * Haptic: Heavy feedback (destructive action)
   */
  ITEM_SWIPE_DELETE: {
    threshold: 80,
    haptic: 'heavy',
  } as GestureConfig,
} as const;

/**
 * Press Animation Configuration
 * Standardized press/tap animations for ALL interactive elements
 */
interface PressAnimationConfig {
  scale: number;
  spring: {
    damping: number;
    stiffness: number;
    mass: number;
  };
}

export const PRESS_ANIMATION_CONFIG = {
  /**
   * Standard press scale - ALL interactive elements
   * Target: 0.96 scale (4% shrink)
   * Spring config: Fast & snappy
   * Use for: Buttons, Tab bar items, Cards, List items
   */
  STANDARD: {
    scale: 0.96,
    spring: { damping: 15, stiffness: 500, mass: 0.5 },
  } as PressAnimationConfig,

  /**
   * Heavy press scale - Destructive actions
   * Target: 0.92 scale (8% shrink) - more dramatic
   * Use for: Delete buttons, Danger actions
   */
  DESTRUCTIVE: {
    scale: 0.92,
    spring: { damping: 12, stiffness: 600, mass: 0.6 },
  } as PressAnimationConfig,
} as const;

/**
 * Gesture Type Guards
 */
export type GestureName = keyof typeof UNIFIED_GESTURES;

/**
 * Get gesture config by name
 */
export const getGestureConfig = (name: GestureName): GestureConfig => {
  return UNIFIED_GESTURES[name];
};
