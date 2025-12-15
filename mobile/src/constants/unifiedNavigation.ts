// src/constants/unifiedNavigation.ts
// UNIFIED NAVIGATION - Production Standard (3 Presets Only)
// Simplified: 12 presets → 3 core presets for consistency

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { UNIFIED_TIMING } from './unifiedTiming';

/**
 * UNIFIED NAVIGATION SYSTEM - SIMPLIFIED
 *
 * Only 3 navigation patterns for maximum consistency:
 * 1. SCREEN: Normal screen transitions (fade 300ms)
 * 2. MODAL: Form/create screens (slide_from_bottom 300ms)
 * 3. FULLSCREEN: Camera/critical flows (fade 300ms, no back)
 *
 * USAGE:
 * import { UNIFIED_NAVIGATION } from '@constants/unifiedNavigation';
 * <Stack.Navigator screenOptions={UNIFIED_NAVIGATION.SCREEN}>
 */

/**
 * SCREEN - Default screen transitions
 * Use for: Feed → PostDetail, Profile → Settings, Messaging → Chat
 * Animation: Fade 300ms
 * Back gesture: Enabled
 */
export const SCREEN: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: UNIFIED_TIMING.screenEnter, // 300ms
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
} as const;

/**
 * MODAL - Form presentations
 * Use for: CreatePost, EditProfile, Comments, Filters
 * Animation: Slide from bottom 300ms
 * Back gesture: Enabled (swipe down to dismiss)
 */
export const MODAL: NativeStackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: UNIFIED_TIMING.screenEnter, // 300ms
  gestureEnabled: true,
  gestureDirection: 'vertical',
  headerShown: false,
} as const;

/**
 * FULLSCREEN - Critical flows (no accidental dismiss)
 * Use for: Camera, Verification, Image Viewer
 * Animation: Fade 300ms
 * Back gesture: DISABLED (intentional - prevent accidents)
 */
export const FULLSCREEN: NativeStackNavigationOptions = {
  presentation: 'fullScreenModal',
  animation: 'fade',
  animationDuration: UNIFIED_TIMING.screenEnter, // 300ms
  gestureEnabled: false, // No accidental dismiss
  headerShown: false,
} as const;

/**
 * Main Export - 3 Core Presets
 */
export const UNIFIED_NAVIGATION = {
  SCREEN,
  MODAL,
  FULLSCREEN,
} as const;
