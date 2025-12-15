// src/shared/hooks/useSemanticHaptic.ts
// Semantic Haptic Feedback Hook
// Provides context-aware haptic feedback based on action semantics

import { useCallback } from 'react';
import { useHaptic } from './useHaptic';
import {
  SEMANTIC_HAPTICS,
  type SocialHapticAction,
  type ContentHapticAction,
  type NavigationHapticAction,
  type FormHapticAction,
  type SystemHapticAction,
  type MediaHapticAction,
} from '@constants/hapticPresets';

/**
 * Semantic Haptic Feedback Hook
 *
 * Provides type-safe, semantic haptic feedback for different action categories.
 * Instead of manually choosing haptic types, use semantic action names.
 *
 * Benefits:
 * - Consistent haptic patterns across the app
 * - Self-documenting code
 * - Type-safe action names
 * - Easy to maintain and update
 *
 * @example
 * // Social interactions
 * const { triggerSocial } = useSemanticHaptic();
 * triggerSocial('like'); // ✅ Semantic and consistent
 *
 * @example
 * // Content actions
 * const { triggerContent } = useSemanticHaptic();
 * triggerContent('create'); // ✅ Clear intent
 *
 * @example
 * // Navigation
 * const { triggerNavigation } = useSemanticHaptic();
 * triggerNavigation('tabSwitch'); // ✅ Consistent tab switching
 */
export const useSemanticHaptic = () => {
  const { trigger } = useHaptic();

  /**
   * Trigger haptic for social interactions
   * @param action - Social action type (like, follow, comment, etc.)
   */
  const triggerSocial = useCallback(
    (action: SocialHapticAction) => {
      trigger(SEMANTIC_HAPTICS.social[action]);
    },
    [trigger],
  );

  /**
   * Trigger haptic for content actions
   * @param action - Content action type (create, edit, delete, etc.)
   */
  const triggerContent = useCallback(
    (action: ContentHapticAction) => {
      trigger(SEMANTIC_HAPTICS.content[action]);
    },
    [trigger],
  );

  /**
   * Trigger haptic for navigation actions
   * @param action - Navigation action type (tabSwitch, screenOpen, etc.)
   */
  const triggerNavigation = useCallback(
    (action: NavigationHapticAction) => {
      trigger(SEMANTIC_HAPTICS.navigation[action]);
    },
    [trigger],
  );

  /**
   * Trigger haptic for form actions
   * @param action - Form action type (submit, error, success, etc.)
   */
  const triggerForm = useCallback(
    (action: FormHapticAction) => {
      trigger(SEMANTIC_HAPTICS.form[action]);
    },
    [trigger],
  );

  /**
   * Trigger haptic for system actions
   * @param action - System action type (refresh, retry, confirm, etc.)
   */
  const triggerSystem = useCallback(
    (action: SystemHapticAction) => {
      trigger(SEMANTIC_HAPTICS.system[action]);
    },
    [trigger],
  );

  /**
   * Trigger haptic for media actions
   * @param action - Media action type (capture, upload, select, etc.)
   */
  const triggerMedia = useCallback(
    (action: MediaHapticAction) => {
      trigger(SEMANTIC_HAPTICS.media[action]);
    },
    [trigger],
  );

  return {
    // Semantic triggers
    triggerSocial,
    triggerContent,
    triggerNavigation,
    triggerForm,
    triggerSystem,
    triggerMedia,

    // Legacy support - direct trigger for custom cases
    trigger,
  };
};

export default useSemanticHaptic;
