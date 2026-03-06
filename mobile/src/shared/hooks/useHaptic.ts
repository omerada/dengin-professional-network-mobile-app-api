// src/shared/hooks/useHaptic.ts
// Dengin Design System - Haptic Feedback Hook
// Oku: mobile-development-guide/ui-ux-modernization/16-HAPTIC-FEEDBACK.md

import { useCallback, useMemo } from 'react';
import { hapticService } from '@shared/services/HapticService';
import type { HapticType, HapticFeedback } from '@theme/types';

/**
 * useHaptic Hook
 * Provides easy access to haptic feedback in components
 *
 * @example
 * const { buttonPress, like, success } = useHaptic();
 *
 * const handlePress = useCallback(() => {
 *   buttonPress();
 *   onPress?.();
 * }, [buttonPress, onPress]);
 */
export const useHaptic = (): HapticFeedback => {
  // Core trigger function
  const trigger = useCallback((type: HapticType) => {
    hapticService.trigger(type);
  }, []);

  // Impact feedback
  const light = useCallback(() => {
    hapticService.light();
  }, []);

  const medium = useCallback(() => {
    hapticService.medium();
  }, []);

  const heavy = useCallback(() => {
    hapticService.heavy();
  }, []);

  // Notification feedback
  const success = useCallback(() => {
    hapticService.success();
  }, []);

  const warning = useCallback(() => {
    hapticService.warning();
  }, []);

  const error = useCallback(() => {
    hapticService.error();
  }, []);

  // Selection feedback
  const selection = useCallback(() => {
    hapticService.selection();
  }, []);

  // Semantic actions
  const buttonPress = useCallback(() => {
    hapticService.buttonPress();
  }, []);

  const like = useCallback(() => {
    hapticService.like();
  }, []);

  // Additional haptic shortcuts for common interactions
  const checkbox = useCallback(() => trigger('impactLight'), [trigger]);
  const radio = useCallback(() => trigger('impactLight'), [trigger]);
  const toggle = useCallback(() => trigger('selection'), [trigger]);
  const slider = useCallback(() => trigger('selection'), [trigger]);
  const longPressHaptic = useCallback(() => trigger('impactMedium'), [trigger]);
  const contextMenu = useCallback(() => trigger('impactLight'), [trigger]);

  return useMemo<HapticFeedback>(
    () => ({
      trigger,
      light,
      medium,
      heavy,
      success,
      warning,
      error,
      selection,
      buttonPress,
      like,
      // New shortcuts for complete UX coverage
      checkbox,
      radio,
      toggle,
      slider,
      longPress: longPressHaptic,
      contextMenu,
    }),
    [
      trigger,
      light,
      medium,
      heavy,
      success,
      warning,
      error,
      selection,
      buttonPress,
      like,
      checkbox,
      radio,
      toggle,
      slider,
      longPressHaptic,
      contextMenu,
    ],
  );
};

/**
 * useHapticPress Hook
 * Returns a press handler with haptic feedback
 *
 * @example
 * const handlePress = useHapticPress(() => {
 *   // Your logic here
 * }, 'light');
 */
export const useHapticPress = <T extends (...args: unknown[]) => void>(
  onPress: T | undefined,
  hapticType: HapticType = 'light',
): ((...args: Parameters<T>) => void) => {
  const { trigger } = useHaptic();

  return useCallback(
    (...args: Parameters<T>) => {
      trigger(hapticType);
      onPress?.(...args);
    },
    [onPress, trigger, hapticType],
  );
};

/**
 * useHapticLike Hook
 * Specialized hook for like/heart animations with heavy haptic
 *
 * @example
 * const handleLike = useHapticLike((postId) => {
 *   likePost.mutate({ postId });
 * });
 */
export const useHapticLike = <T extends (...args: unknown[]) => void>(
  onLike: T | undefined,
): ((...args: Parameters<T>) => void) => {
  const { like } = useHaptic();

  return useCallback(
    (...args: Parameters<T>) => {
      like();
      onLike?.(...args);
    },
    [onLike, like],
  );
};

export default useHaptic;
