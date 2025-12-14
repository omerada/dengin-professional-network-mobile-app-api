// src/constants/hapticPresets.ts
// Standardized Haptic Feedback Presets for Dengin App

import type { HapticType } from '@theme/types';

/**
 * Standardized Haptic Feedback Types
 *
 * Usage:
 * import { HAPTIC_TYPES } from '@constants/hapticPresets';
 * const { trigger } = useHaptic();
 * trigger(HAPTIC_TYPES.buttonPress);
 */
export const HAPTIC_TYPES = {
  /**
   * Button press - Light feedback
   * Use for: Regular button presses, navigation
   */
  buttonPress: 'light' as HapticType,

  /**
   * Important button press - Medium feedback
   * Use for: Important actions (submit, send, post)
   */
  buttonPressImportant: 'medium' as HapticType,

  /**
   * Success feedback
   * Use for: Successful operations (post created, profile updated)
   */
  success: 'success' as HapticType,

  /**
   * Error feedback
   * Use for: Error states, failed operations
   */
  error: 'error' as HapticType,

  /**
   * Warning feedback
   * Use for: Warning states, confirmation needed
   */
  warning: 'warning' as HapticType,

  /**
   * Selection feedback
   * Use for: Toggle switches, radio buttons, checkboxes
   */
  selection: 'selection' as HapticType,

  /**
   * List item press
   * Use for: List item taps, card taps
   */
  listItemPress: 'light' as HapticType,

  /**
   * Swipe action
   * Use for: Swipe gestures
   */
  swipe: 'selection' as HapticType,

  /**
   * Pull to refresh
   * Use for: Pull to refresh gesture
   */
  pullToRefresh: 'medium' as HapticType,

  /**
   * Like action
   * Use for: Like/unlike actions
   */
  like: 'light' as HapticType,

  /**
   * Delete action
   * Use for: Delete confirmations
   */
  delete: 'warning' as HapticType,
} as const;
