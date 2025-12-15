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

/**
 * Semantic Haptic Feedback System
 * Provides context-aware haptic feedback based on action semantics
 *
 * Benefits:
 * - Consistent haptic patterns across the app
 * - Self-documenting code (action intent is clear)
 * - Easy to maintain and update haptic mappings
 *
 * @example
 * const { triggerSocial } = useSemanticHaptic();
 * triggerSocial('like'); // Automatically uses correct haptic type
 */
export const SEMANTIC_HAPTICS = {
  /**
   * Social Interactions
   * Haptics for social features like likes, follows, comments
   */
  social: {
    like: 'success' as HapticType, // Positive feedback
    unlike: 'light' as HapticType, // Subtle feedback
    follow: 'medium' as HapticType, // Important action
    unfollow: 'warning' as HapticType, // Warning tone
    comment: 'light' as HapticType, // Light tap
    share: 'medium' as HapticType, // Medium feedback
    bookmark: 'success' as HapticType, // Success feedback
    unbookmark: 'light' as HapticType, // Light feedback
  },

  /**
   * Content Actions
   * Haptics for content creation and management
   */
  content: {
    create: 'success' as HapticType, // Successfully created
    edit: 'light' as HapticType, // Edit initiated
    delete: 'warning' as HapticType, // Destructive action
    save: 'success' as HapticType, // Saved successfully
    discard: 'light' as HapticType, // Discarded changes
    publish: 'success' as HapticType, // Published successfully
    draft: 'light' as HapticType, // Saved as draft
  },

  /**
   * Navigation Actions
   * Haptics for app navigation
   */
  navigation: {
    tabSwitch: 'selection' as HapticType, // Tab changed
    screenOpen: 'light' as HapticType, // Screen opened
    screenClose: 'light' as HapticType, // Screen closed
    modalOpen: 'light' as HapticType, // Modal opened
    modalClose: 'light' as HapticType, // Modal closed
    back: 'light' as HapticType, // Navigate back
  },

  /**
   * Form Actions
   * Haptics for form interactions
   */
  form: {
    input: 'light' as HapticType, // Input focused
    submit: 'medium' as HapticType, // Form submitted
    error: 'error' as HapticType, // Validation error
    success: 'success' as HapticType, // Form success
    clear: 'light' as HapticType, // Clear field
  },

  /**
   * System Actions
   * Haptics for system-level interactions
   */
  system: {
    refresh: 'medium' as HapticType, // Refresh triggered
    retry: 'medium' as HapticType, // Retry action
    cancel: 'light' as HapticType, // Action cancelled
    confirm: 'success' as HapticType, // Action confirmed
    alert: 'warning' as HapticType, // Alert shown
  },

  /**
   * Media Actions
   * Haptics for media interactions
   */
  media: {
    capture: 'medium' as HapticType, // Photo/video captured
    upload: 'light' as HapticType, // Upload started
    uploadComplete: 'success' as HapticType, // Upload finished
    uploadFailed: 'error' as HapticType, // Upload failed
    select: 'light' as HapticType, // Media selected
    remove: 'light' as HapticType, // Media removed
  },
} as const;

/**
 * Semantic Haptic Categories
 * Type definitions for haptic categories
 */
export type SemanticHapticCategory = keyof typeof SEMANTIC_HAPTICS;
export type SocialHapticAction = keyof typeof SEMANTIC_HAPTICS.social;
export type ContentHapticAction = keyof typeof SEMANTIC_HAPTICS.content;
export type NavigationHapticAction = keyof typeof SEMANTIC_HAPTICS.navigation;
export type FormHapticAction = keyof typeof SEMANTIC_HAPTICS.form;
export type SystemHapticAction = keyof typeof SEMANTIC_HAPTICS.system;
export type MediaHapticAction = keyof typeof SEMANTIC_HAPTICS.media;
