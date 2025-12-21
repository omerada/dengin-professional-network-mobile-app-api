// src/constants/unifiedFeedback.ts
// Unified Feedback System - Production Standard
// Ensures consistent user feedback (Toast, ActionSheet, Haptic) across the app

import type { HapticType } from '@theme/types';

/**
 * Feedback Configuration
 */
interface FeedbackConfig {
  duration: number;
  haptic: HapticType;
  showAction?: boolean;
}

/**
 * UNIFIED FEEDBACK
 *
 * Standardized feedback patterns for consistent user communication.
 * Defines Toast durations, haptic feedback, and action availability.
 *
 * FEEDBACK HIERARCHY:
 * 1. Success/Info: Toast (3s, auto-dismiss)
 * 2. Warning: Toast (5s, auto-dismiss) + Haptic warning
 * 3. Error (recoverable): Toast (7s, retry action)
 * 4. Error (critical): ActionSheet (must acknowledge)
 * 5. Confirmation (destructive): ActionSheet (must confirm)
 *
 * USAGE:
 * import { UNIFIED_FEEDBACK } from '@constants/unifiedFeedback';
 *
 * toast.success(message, {
 *   duration: UNIFIED_FEEDBACK.SUCCESS.duration
 * });
 * haptic.trigger(UNIFIED_FEEDBACK.SUCCESS.haptic);
 */
export const UNIFIED_FEEDBACK = {
  /**
   * SUCCESS - Operation completed successfully
   * Duration: 3s (auto-dismiss)
   * Haptic: Success feedback
   * Use for: Post created, Profile updated, Like added
   */
  SUCCESS: {
    duration: 3000,
    haptic: 'success',
    showAction: false,
  } as FeedbackConfig,

  /**
   * INFO - Informational message
   * Duration: 3s (auto-dismiss)
   * Haptic: Light feedback
   * Use for: Tips, Feature announcements, Non-critical info
   */
  INFO: {
    duration: 3000,
    haptic: 'light',
    showAction: false,
  } as FeedbackConfig,

  /**
   * WARNING - User should be aware
   * Duration: 5s (auto-dismiss)
   * Haptic: Warning feedback
   * Use for: Partial failures, Cautions, Reminders
   */
  WARNING: {
    duration: 5000,
    haptic: 'warning',
    showAction: false,
  } as FeedbackConfig,

  /**
   * ERROR (Recoverable) - User can retry
   * Duration: 7s (auto-dismiss)
   * Haptic: Error feedback
   * Show Action: Retry button
   * Use for: Network errors, Upload failures, Temporary errors
   */
  ERROR_RECOVERABLE: {
    duration: 7000,
    haptic: 'error',
    showAction: true,
  } as FeedbackConfig,

  /**
   * ERROR (Critical) - Use ActionSheet instead of Toast
   * User must acknowledge
   * Haptic: Heavy error feedback
   * Use for: Account errors, Permission denied, Fatal errors
   */
  ERROR_CRITICAL: {
    duration: 0, // ActionSheet - no auto-dismiss
    haptic: 'error',
    showAction: true,
  } as FeedbackConfig,

  /**
   * CONFIRMATION (Destructive) - Use ActionSheet
   * User must explicitly confirm
   * Haptic: Heavy feedback
   * Use for: Delete post, Remove account, Irreversible actions
   */
  CONFIRMATION_DESTRUCTIVE: {
    duration: 0, // ActionSheet - no auto-dismiss
    haptic: 'heavy',
    showAction: true,
  } as FeedbackConfig,
} as const;

/**
 * Feedback Type Guards
 */
export type FeedbackType = keyof typeof UNIFIED_FEEDBACK;

/**
 * Get feedback config by type
 */
export const getFeedbackConfig = (type: FeedbackType): FeedbackConfig => {
  return UNIFIED_FEEDBACK[type];
};

/**
 * Toast vs ActionSheet Decision Helper
 *
 * @param type - Feedback type
 * @returns 'toast' | 'actionSheet'
 */
export const getFeedbackMethod = (type: FeedbackType): 'toast' | 'actionSheet' => {
  const config = UNIFIED_FEEDBACK[type];
  return config.duration === 0 ? 'actionSheet' : 'toast';
};
