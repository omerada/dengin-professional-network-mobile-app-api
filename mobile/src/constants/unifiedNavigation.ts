// src/constants/unifiedNavigation.ts
// UNIFIED NAVIGATION CONFIGURATION - Production Ready
// Tüm navigation geçişleri bu standardize edilmiş konfigürasyonları kullanmalı

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { UNIFIED_TIMING } from './unifiedTiming';

/**
 * UNIFIED NAVIGATION SYSTEM
 *
 * Tüm uygulama genelinde tutarlı navigation deneyimi için
 * standardize edilmiş navigation konfigürasyonları.
 *
 * KULLANIM:
 * import { UNIFIED_NAVIGATION } from '@constants/unifiedNavigation';
 *
 * <Stack.Navigator screenOptions={UNIFIED_NAVIGATION.stack}>
 */

/**
 * Standard Stack Navigation
 * Kullanım: Normal screen-to-screen geçişler
 * Ekranlar: Feed → PostDetail, Profile → Settings, vb.
 */
export const STACK_NAVIGATION: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: UNIFIED_TIMING.screenEnter, // 300ms
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

/**
 * Modal Presentation
 * Kullanım: CreatePost, EditProfile, Filters, ActionSheets
 * Özellik: Bottom-to-top slide, swipe-to-dismiss
 */
export const MODAL_NAVIGATION: NativeStackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: UNIFIED_TIMING.screenEnter, // 300ms (standardized)
  gestureEnabled: true,
  gestureDirection: 'vertical',
  headerShown: false,
};

/**
 * Full Screen Modal
 * Kullanım: Camera, Verification, ImageViewer
 * Özellik: Fade in, no gesture dismiss
 */
export const FULLSCREEN_NAVIGATION: NativeStackNavigationOptions = {
  presentation: 'fullScreenModal',
  animation: 'fade',
  animationDuration: UNIFIED_TIMING.componentEnter, // 200ms
  gestureEnabled: false,
  headerShown: false,
};

/**
 * Sheet Modal (Transparent Overlay)
 * Kullanım: Context menus, Action sheets, Overlays
 * Özellik: Fade with transparent background
 */
export const SHEET_NAVIGATION: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  animation: 'fade',
  animationDuration: UNIFIED_TIMING.componentEnter, // 200ms
  gestureEnabled: true,
  headerShown: false,
};

/**
 * Instant Navigation (No Animation)
 * Kullanım: Tab switches, instant state changes
 */
export const INSTANT_NAVIGATION: NativeStackNavigationOptions = {
  animation: 'none',
  headerShown: false,
  gestureEnabled: true,
};

/**
 * Card Style Navigation (Slide from Right)
 * Kullanım: iOS-style push navigation
 */
export const CARD_NAVIGATION: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
  animationDuration: UNIFIED_TIMING.screenEnter, // 300ms
  gestureEnabled: true,
  headerShown: false,
};

/**
 * Interactive Modal
 * Kullanım: CreatePost, EditProfile, Forms - Kullanıcı input alan modaller
 * Özellik: Easy swipe-to-dismiss, larger gesture response
 */
export const INTERACTIVE_MODAL_NAVIGATION: NativeStackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: UNIFIED_TIMING.screenEnter, // 300ms
  gestureEnabled: true,
  gestureDirection: 'vertical',
  headerShown: false,
};

/**
 * Critical Modal
 * Kullanım: Verification flow, Payment, Important processes
 * Özellik: No gesture dismiss - kazara kapatmayı engeller
 */
export const CRITICAL_MODAL_NAVIGATION: NativeStackNavigationOptions = {
  presentation: 'fullScreenModal',
  animation: 'fade',
  animationDuration: UNIFIED_TIMING.componentEnter, // 200ms
  gestureEnabled: false, // Kritik akışlarda kazara kapatmayı engelle
  headerShown: false,
};

/**
 * Unified Navigation Options Collection
 * Tüm navigation tiplerini içeren ana export
 */
export const UNIFIED_NAVIGATION = {
  stack: STACK_NAVIGATION,
  modal: MODAL_NAVIGATION,
  fullScreen: FULLSCREEN_NAVIGATION,
  sheet: SHEET_NAVIGATION,
  instant: INSTANT_NAVIGATION,
  card: CARD_NAVIGATION,
  interactiveModal: INTERACTIVE_MODAL_NAVIGATION,
  criticalModal: CRITICAL_MODAL_NAVIGATION,
} as const;

/**
 * Navigation Type Guards
 * Navigation tipini kontrol etmek için yardımcı fonksiyonlar
 */
export const NavigationType = {
  isModal: (options?: NativeStackNavigationOptions) => options?.presentation === 'modal',

  isFullScreen: (options?: NativeStackNavigationOptions) =>
    options?.presentation === 'fullScreenModal',

  isSheet: (options?: NativeStackNavigationOptions) => options?.presentation === 'transparentModal',

  hasGesture: (options?: NativeStackNavigationOptions) => options?.gestureEnabled === true,
} as const;
