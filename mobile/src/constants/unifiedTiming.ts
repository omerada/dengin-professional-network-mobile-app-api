// src/constants/unifiedTiming.ts
// Unified Animation Timing System - Production Ready
// Ensures consistent animation timing across all screens

import { duration } from '@theme/animations';

/**
 * UNIFIED TIMING CONSTANTS
 *
 * Use these constants instead of hardcoded values to ensure
 * consistent animation timing across the entire app.
 *
 * PRODUCTION STANDARD:
 * - List item delay: 40ms per item
 * - Max delay cap: 400ms
 * - List item duration: 300ms
 */
export const UNIFIED_TIMING = {
  // ============================================================================
  // Screen-Level Animations
  // ============================================================================

  /**
   * Standard screen entrance duration
   * Use for: Main screen transitions (Feed, Profile, Settings)
   * Value: 300ms
   */
  screenEnter: duration.elementMove,

  /**
   * Screen exit duration
   * Use for: Screen unmount, navigation back
   * Value: 150ms
   */
  screenExit: duration.fast,

  // ============================================================================
  // List-Level Animations
  // ============================================================================

  /**
   * Delay per list item for staggered animations
   * Use for: FlatList, FlashList item entrance
   * Value: 40ms per item
   */
  listItemDelay: 40,

  /**
   * Maximum total delay for list stagger
   * Prevents excessive delays for long lists
   * Value: 400ms
   */
  listItemDelayMax: 400,

  /**
   * List item animation duration
   * Use for: Individual item entrance/exit
   * Value: 300ms
   */
  listItemDuration: duration.elementMove,

  // ============================================================================
  // Component-Level Animations
  // ============================================================================

  /**
   * Component entrance duration
   * Use for: Cards, modals, bottom sheets
   * Value: 200ms
   */
  componentEnter: duration.stateChange,

  /**
   * Component exit duration
   * Use for: Component removal, dismissal
   * Value: 150ms
   */
  componentExit: duration.fast,

  /**
   * Header animation duration
   * Use for: Screen headers, navigation bars
   * Value: 150ms
   */
  headerEnter: duration.fast,

  /**
   * Content animation delay after header
   * Use for: Content below header
   * Value: 100ms
   */
  contentDelayAfterHeader: 100,

  // ============================================================================
  // Micro-Interactions
  // ============================================================================

  /**
   * Button press animation duration
   * Use for: All button press feedback
   * Value: 100ms
   */
  buttonPress: duration.microInteraction,

  /**
   * Like animation total cycle time
   * Use for: Post like, double-tap heart
   * Value: 320ms (optimized from 600ms)
   */
  likeAnimationCycle: 320,

  /**
   * Like heart scale-up duration
   * Value: 180ms
   */
  likeScaleUp: 180,

  /**
   * Like heart scale-down duration
   * Value: 140ms
   */
  likeScaleDown: 140,

  /**
   * Swipe gesture haptic threshold
   * Use for: Message swipe-to-reply, swipe actions
   * Value: 70% (percentage of total swipe distance)
   */
  swipeHapticThreshold: 0.7,

  /**
   * Toast message display duration
   * Use for: Success/error toast messages
   * Value: 3000ms (3 seconds)
   */
  toastDuration: 3000,

  // ============================================================================
  // Modal & Overlay Animations
  // ============================================================================

  /**
   * Modal backdrop fade duration
   * Use for: Modal background overlay
   * Value: 200ms
   */
  modalBackdrop: duration.stateChange,

  /**
   * Modal content slide duration
   * Use for: Bottom sheet, modal content
   * Value: 300ms
   */
  modalContent: duration.elementMove,

  /**
   * Action sheet slide duration
   * Use for: Action sheet entrance
   * Value: 250ms
   */
  actionSheet: 250,

  // ============================================================================
  // Loading & Skeleton States
  // ============================================================================

  /**
   * Skeleton shimmer animation cycle
   * Use for: Loading placeholders
   * Value: 1500ms
   */
  skeletonShimmer: 1500,

  /**
   * Loading spinner rotation speed
   * Use for: Activity indicators
   * Value: 1000ms per rotation
   */
  spinnerRotation: 1000,

  /**
   * Pull-to-refresh threshold time
   * Use for: RefreshControl sensitivity
   * Value: 200ms
   */
  pullToRefreshThreshold: 200,

  // ============================================================================
  // Celebration & Delight
  // ============================================================================

  /**
   * Success celebration duration
   * Use for: Post-registration, verification success
   * Value: 2000ms
   */
  celebrationDuration: 2000,

  /**
   * Confetti animation duration
   * Use for: Achievement unlocked, milestone reached
   * Value: 3000ms
   */
  confettiDuration: 3000,

  // ============================================================================
  // Empty State Transitions
  // ============================================================================

  /**
   * Empty state to content transition
   * Total duration for smooth handoff
   * Value: 400ms
   */
  emptyToContentTransition: 400,

  /**
   * Empty state fade-out
   * Value: 150ms
   */
  emptyStateFadeOut: duration.fast,

  /**
   * Skeleton placeholder display
   * Between empty state and content
   * Value: 100ms
   */
  skeletonTransitionDelay: 100,
} as const;

/**
 * Helper function: Calculate staggered delay for list items
 *
 * @param index - Item index in the list
 * @param maxItems - Maximum items to stagger (default 10)
 * @returns Calculated delay in milliseconds
 *
 * @example
 * const delay = getListItemDelay(5); // Returns 200ms (5 * 40ms)
 * const delay = getListItemDelay(15); // Returns 400ms (capped at max)
 *
 * // Usage in FlatList
 * <Animated.View entering={FadeInDown.delay(getListItemDelay(index)).duration(300)}>
 */
export function getListItemDelay(index: number, maxDelay?: number): number {
  const cap = maxDelay ?? UNIFIED_TIMING.listItemDelayMax;
  return Math.min(index * UNIFIED_TIMING.listItemDelay, cap);
}

/**
 * Helper function: Get animation config for button press
 *
 * @returns Spring config for button press animation
 *
 * @example
 * const pressConfig = getButtonPressConfig();
 * scale.value = withSpring(0.96, pressConfig);
 */
export function getButtonPressConfig() {
  return {
    damping: 15,
    stiffness: 500,
    mass: 0.5,
  };
}

/**
 * Helper function: Get like animation config
 *
 * @returns Complete like animation timing configuration
 *
 * @example
 * const likeConfig = getLikeAnimationConfig();
 * // Use likeConfig.scaleUp and likeConfig.scaleDown
 */
export function getLikeAnimationConfig() {
  return {
    scaleUp: UNIFIED_TIMING.likeScaleUp,
    scaleDown: UNIFIED_TIMING.likeScaleDown,
    totalCycle: UNIFIED_TIMING.likeAnimationCycle,
    delay: UNIFIED_TIMING.likeScaleUp, // Delay before scale down
  };
}
