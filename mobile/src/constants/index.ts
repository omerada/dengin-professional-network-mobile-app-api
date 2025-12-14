// src/constants/index.ts
// Central exports for all constants

export * from './animationPresets';
export * from './emptyStatePresets';
export * from './hapticPresets';
export * from './unifiedTiming';
export * from './safeAreaConfig';
export * from './loadingStrategy';
export * from './unifiedNavigation';

// Selective export from navigationConfig to avoid NAVIGATION_ANIMATIONS collision
export {
  STACK_SCREEN_OPTIONS,
  MODAL_SCREEN_OPTIONS,
  FULLSCREEN_MODAL_OPTIONS,
  SHEET_MODAL_OPTIONS,
  SCREEN_NAVIGATION_OPTIONS,
} from './navigationConfig';
