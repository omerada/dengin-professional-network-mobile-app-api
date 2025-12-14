// src/constants/navigationConfig.ts
// Navigation configuration constants for consistent navigation behavior
// Production-ready implementation

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { UNIFIED_TIMING } from './unifiedTiming';

/**
 * Standard stack screen options
 * Use for normal screen-to-screen navigation
 */
export const STACK_SCREEN_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: UNIFIED_TIMING.screenEnter,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

/**
 * Modal screen options
 * Use for modal presentations (CreatePost, EditProfile, etc.)
 */
export const MODAL_SCREEN_OPTIONS: NativeStackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: 400,
  gestureEnabled: true,
  gestureDirection: 'vertical',
  headerShown: false,
};

/**
 * Full screen modal options
 * Use for immersive experiences (Camera, Verification)
 */
export const FULLSCREEN_MODAL_OPTIONS: NativeStackNavigationOptions = {
  presentation: 'fullScreenModal',
  animation: 'fade',
  animationDuration: 300,
  gestureEnabled: false,
  headerShown: false,
};

/**
 * Sheet modal options
 * Use for bottom sheets and action sheets
 */
export const SHEET_MODAL_OPTIONS: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  animation: 'fade',
  animationDuration: 250,
  gestureEnabled: true,
  headerShown: false,
};

/**
 * Navigation animation presets
 * Use in stack navigators for consistent animations
 */
export const NAVIGATION_ANIMATIONS = {
  /**
   * Standard stack navigation (fade)
   */
  stack: {
    animation: 'fade' as const,
    animationDuration: UNIFIED_TIMING.screenEnter,
  },

  /**
   * Modal presentation (slide from bottom)
   */
  modal: {
    presentation: 'modal' as const,
    animation: 'slide_from_bottom' as const,
    animationDuration: 400,
    gestureEnabled: true,
  },

  /**
   * Card style navigation (slide from right)
   */
  card: {
    animation: 'slide_from_right' as const,
    animationDuration: UNIFIED_TIMING.screenEnter,
  },

  /**
   * Simple push (iOS default)
   */
  push: {
    animation: 'simple_push' as const,
    animationDuration: UNIFIED_TIMING.screenEnter,
  },

  /**
   * No animation
   */
  none: {
    animation: 'none' as const,
  },
} as const;

/**
 * Screen-specific navigation options
 * Pre-configured for common screen types
 */
export const SCREEN_NAVIGATION_OPTIONS = {
  /**
   * Feed screens (list-based)
   */
  feed: {
    ...STACK_SCREEN_OPTIONS,
    gestureEnabled: true,
  },

  /**
   * Detail screens (post detail, profile, etc.)
   */
  detail: {
    ...STACK_SCREEN_OPTIONS,
    animation: 'slide_from_right',
  },

  /**
   * Chat screen (messaging)
   */
  chat: {
    ...STACK_SCREEN_OPTIONS,
    animation: 'slide_from_right',
    gestureEnabled: true,
  },

  /**
   * Create/Edit screens (modal)
   */
  createEdit: MODAL_SCREEN_OPTIONS,

  /**
   * Settings screens (stack)
   */
  settings: {
    ...STACK_SCREEN_OPTIONS,
    animation: 'slide_from_right',
  },

  /**
   * Camera/Verification screens (fullscreen)
   */
  immersive: FULLSCREEN_MODAL_OPTIONS,
} as const;
