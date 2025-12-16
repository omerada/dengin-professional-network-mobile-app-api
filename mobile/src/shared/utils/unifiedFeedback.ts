// src/shared/utils/unifiedFeedback.ts
// Unified Feedback Utility - Production Standard
// Simplifies toast and haptic feedback calls with consistent patterns

import { UNIFIED_FEEDBACK } from '@constants/unifiedFeedback';
import type { HapticType } from '@theme/types';

/**
 * Toast Interface (matches ToastContext)
 */
interface ToastInterface {
  success: (message: string, options?: { duration?: number }) => void;
  error: (message: string, options?: { duration?: number; action?: any }) => void;
  warning: (message: string, options?: { duration?: number }) => void;
  info: (message: string, options?: { duration?: number }) => void;
}

/**
 * Haptic Interface (matches useHaptic)
 */
interface HapticInterface {
  trigger: (type: HapticType) => void;
}

/**
 * Unified Feedback Options
 */
interface FeedbackOptions {
  /** Custom duration override */
  duration?: number;
  /** Show retry action (for errors) */
  showAction?: boolean;
  /** Retry action handler */
  onRetry?: () => void;
  /** Skip haptic feedback */
  skipHaptic?: boolean;
}

/**
 * showSuccess - Success feedback with toast + haptic
 *
 * @example
 * showSuccess(toast, haptic, 'Gönderi oluşturuldu');
 */
export const showSuccess = (
  toast: ToastInterface,
  haptic: HapticInterface,
  message: string,
  options?: FeedbackOptions,
) => {
  const config = UNIFIED_FEEDBACK.SUCCESS;

  // Show toast
  toast.success(message, {
    duration: options?.duration ?? config.duration,
  });

  // Trigger haptic
  if (!options?.skipHaptic) {
    haptic.trigger(config.haptic);
  }
};

/**
 * showInfo - Info feedback with toast + haptic
 *
 * @example
 * showInfo(toast, haptic, 'Bu özellik yakında eklenecek');
 */
export const showInfo = (
  toast: ToastInterface,
  haptic: HapticInterface,
  message: string,
  options?: FeedbackOptions,
) => {
  const config = UNIFIED_FEEDBACK.INFO;

  toast.info(message, {
    duration: options?.duration ?? config.duration,
  });

  if (!options?.skipHaptic) {
    haptic.trigger(config.haptic);
  }
};

/**
 * showWarning - Warning feedback with toast + haptic
 *
 * @example
 * showWarning(toast, haptic, 'İnternet bağlantınızı kontrol edin');
 */
export const showWarning = (
  toast: ToastInterface,
  haptic: HapticInterface,
  message: string,
  options?: FeedbackOptions,
) => {
  const config = UNIFIED_FEEDBACK.WARNING;

  toast.warning(message, {
    duration: options?.duration ?? config.duration,
  });

  if (!options?.skipHaptic) {
    haptic.trigger(config.haptic);
  }
};

/**
 * showError - Error feedback with toast + haptic
 * Supports retry actions for recoverable errors
 *
 * @example
 * // Simple error
 * showError(toast, haptic, 'İşlem başarısız oldu');
 *
 * // Error with retry
 * showError(toast, haptic, 'Yükleme başarısız', {
 *   showAction: true,
 *   onRetry: () => refetch()
 * });
 */
export const showError = (
  toast: ToastInterface,
  haptic: HapticInterface,
  message: string,
  options?: FeedbackOptions,
) => {
  const config = UNIFIED_FEEDBACK.ERROR_RECOVERABLE;

  toast.error(message, {
    duration: options?.duration ?? config.duration,
    ...(options?.showAction && options?.onRetry
      ? {
          action: {
            label: 'Tekrar Dene',
            onPress: options.onRetry,
          },
        }
      : {}),
  });

  if (!options?.skipHaptic) {
    haptic.trigger(config.haptic);
  }
};

/**
 * Custom hook for unified feedback
 * Combines toast and haptic in a single interface
 *
 * @example
 * ```tsx
 * import { useUnifiedFeedback } from '@shared/utils/unifiedFeedback';
 *
 * const { showSuccess, showError } = useUnifiedFeedback();
 *
 * // Usage
 * showSuccess('Kayıt başarılı!');
 * showError('Bir hata oluştu', { showAction: true, onRetry: refetch });
 * ```
 */
export const useUnifiedFeedback = () => {
  // Note: This is a placeholder for future full implementation
  // Current pattern: Use showSuccess(toast, haptic, message) directly
  // Future: This hook will wrap useToast() and useHaptic() for convenience

  // For now, developers should use the utility functions directly:
  // import { showSuccess, showError } from '@shared/utils';
  // const toast = useToast();
  // const { trigger } = useHaptic();
  // showSuccess(toast, { trigger }, 'Success!');

  throw new Error(
    'useUnifiedFeedback: Hook not yet implemented. ' +
      'Use utility functions directly: showSuccess(toast, haptic, message)',
  );
};

/**
 * Export utility functions
 */
export const UnifiedFeedbackUtils = {
  showSuccess,
  showInfo,
  showWarning,
  showError,
};
