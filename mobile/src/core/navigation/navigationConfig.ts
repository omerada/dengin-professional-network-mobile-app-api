// src/core/navigation/navigationConfig.ts
// Standardized navigation configurations for consistent transitions

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Screen transition configurations
 * Used to ensure consistent animations across all navigators
 */
export const SCREEN_TRANSITIONS = {
  /**
   * Standard stack screen transition
   * Used for: Most screen navigations
   */
  stack: {
    animation: 'slide_from_right',
    animationDuration: 300,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
  } as const,

  /**
   * Modal screen transition (bottom sheet style)
   * Used for: Create post, filters, settings
   */
  modal: {
    animation: 'slide_from_bottom',
    animationDuration: 350,
    gestureEnabled: true,
    gestureDirection: 'vertical',
  } as const,

  /**
   * Fade transition (subtle)
   * Used for: Tab switches, minimal transitions
   */
  fade: {
    animation: 'fade',
    animationDuration: 250,
  } as const,

  /**
   * Fullscreen modal (no gesture)
   * Used for: Verification flow, onboarding
   */
  fullscreenModal: {
    animation: 'slide_from_bottom',
    animationDuration: 400,
    gestureEnabled: false,
    presentation: 'modal',
  } as const,
} as const;

/**
 * Modal screen options preset
 * Includes header and gesture configuration
 */
export const MODAL_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  ...SCREEN_TRANSITIONS.modal,
  presentation: 'modal',
};

/**
 * Fullscreen modal options preset
 * No back gesture, requires explicit close
 */
export const FULLSCREEN_MODAL_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  ...SCREEN_TRANSITIONS.fullscreenModal,
  presentation: 'fullScreenModal',
};

/**
 * Default stack screen options
 * Used as base for all stack navigators
 */
export const DEFAULT_STACK_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  ...SCREEN_TRANSITIONS.stack,
};
