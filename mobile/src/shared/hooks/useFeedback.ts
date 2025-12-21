// src/shared/hooks/useFeedback.ts
// Production-ready unified feedback system
// Standardizes success, error, and info feedback across app

import { useCallback, useState } from 'react';
import { useHaptic } from './useHaptic';
import { useToast } from '@contexts/ToastContext';

/**
 * Feedback type hierarchy
 */
export type FeedbackLevel = 'critical' | 'important' | 'minor';

/**
 * Feedback options
 */
export interface FeedbackOptions {
  /** Optional message to show in toast */
  message?: string;
  /** Optional duration for toast (ms) */
  duration?: number;
  /** Disable haptic feedback */
  noHaptic?: boolean;
}

/**
 * useFeedback Hook
 *
 * Production-ready unified feedback system for consistent UX.
 * Handles success, error, and info feedback with proper hierarchy.
 *
 * Feedback Hierarchy:
 * - Critical: Major actions (post created, verification complete, payment)
 *   → SuccessCelebration + Heavy Haptic + Toast
 * - Important: Standard actions (profile updated, followed, message sent)
 *   → ActionFeedback + Medium Haptic + Toast
 * - Minor: Quick actions (like, bookmark, dismiss)
 *   → Subtle Animation + Light Haptic + No Toast
 *
 * @example
 * ```tsx
 * const { success, error, info, showCelebration } = useFeedback();
 *
 * // Critical success
 * success('critical', { message: 'Gönderi paylaşıldı!' });
 *
 * // Important error
 * error('important', { message: 'Profil güncellenemedi' });
 *
 * // Minor info
 * info('minor', { message: 'Favorilere eklendi' });
 * ```
 */
export const useFeedback = () => {
  const { trigger } = useHaptic();
  const toast = useToast();
  const [showCelebration, setShowCelebration] = useState(false);

  /**
   * Success feedback
   */
  const success = useCallback(
    (level: FeedbackLevel, options?: FeedbackOptions) => {
      const { message, noHaptic = false } = options || {};

      switch (level) {
        case 'critical':
          // Critical success: Show celebration + heavy haptic
          setShowCelebration(true);
          if (!noHaptic) trigger('success');
          if (message) toast.show({ type: 'success', message, duration: 3000 });
          setTimeout(() => setShowCelebration(false), 2000);
          break;

        case 'important':
          // Important success: Medium haptic + toast
          if (!noHaptic) trigger('medium');
          if (message) toast.show({ type: 'success', message, duration: 2000 });
          break;

        case 'minor':
          // Minor success: Light haptic only
          if (!noHaptic) trigger('light');
          break;
      }
    },
    [trigger, toast],
  );

  /**
   * Error feedback
   */
  const error = useCallback(
    (level: FeedbackLevel, options?: FeedbackOptions) => {
      const { message, noHaptic = false } = options || {};

      switch (level) {
        case 'critical':
          // Critical error: Error haptic + modal-style toast
          if (!noHaptic) trigger('error');
          if (message) toast.show({ type: 'error', message, duration: 4000 });
          break;

        case 'important':
          // Important error: Warning haptic + toast
          if (!noHaptic) trigger('warning');
          if (message) toast.show({ type: 'error', message, duration: 3000 });
          break;

        case 'minor':
          // Minor error: Light haptic + short toast
          if (!noHaptic) trigger('light');
          if (message) toast.show({ type: 'error', message, duration: 2000 });
          break;
      }
    },
    [trigger, toast],
  );

  /**
   * Info feedback
   */
  const info = useCallback(
    (level: FeedbackLevel, options?: FeedbackOptions) => {
      const { message, noHaptic = false } = options || {};

      switch (level) {
        case 'critical':
          if (!noHaptic) trigger('medium');
          if (message) toast.show({ type: 'info', message, duration: 3000 });
          break;

        case 'important':
          if (!noHaptic) trigger('light');
          if (message) toast.show({ type: 'info', message, duration: 2000 });
          break;

        case 'minor':
          if (!noHaptic) trigger('light');
          break;
      }
    },
    [trigger, toast],
  );

  /**
   * Warning feedback
   */
  const warning = useCallback(
    (level: FeedbackLevel, options?: FeedbackOptions) => {
      const { message, noHaptic = false } = options || {};

      switch (level) {
        case 'critical':
          if (!noHaptic) trigger('warning');
          if (message) toast.show({ type: 'warning', message, duration: 4000 });
          break;

        case 'important':
          if (!noHaptic) trigger('warning');
          if (message) toast.show({ type: 'warning', message, duration: 3000 });
          break;

        case 'minor':
          if (!noHaptic) trigger('light');
          if (message) toast.show({ type: 'warning', message, duration: 2000 });
          break;
      }
    },
    [trigger, toast],
  );

  return {
    success,
    error,
    info,
    warning,
    showCelebration,
    setShowCelebration,
  };
};

export default useFeedback;
