// src/constants/animationPresets.ts
// Standardized Animation Presets for Dengin App
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

import { FadeIn, FadeOut, FadeInDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { duration } from '@theme/animations';
import { UNIFIED_TIMING } from './unifiedTiming';

/**
 * Standardized Screen Animations
 *
 * Usage:
 * import { SCREEN_ANIMATIONS } from '@constants/animationPresets';
 * <Animated.View entering={SCREEN_ANIMATIONS.screenEnter}>
 */
export const SCREEN_ANIMATIONS = {
  /**
   * Standard screen entrance animation
   * Use for: Main screen entry (Feed, Profile, Settings, etc.)
   */
  screenEnter: FadeIn.duration(duration.elementMove),

  /**
   * Standard screen exit animation
   * Use for: Screen unmount
   */
  screenExit: FadeOut.duration(duration.fast),

  /**
   * Staggered list item entrance animation
   * Use for: List items, cards in feed
   * @param index - Item index for stagger delay
   * PRODUCTION STANDARD: Always use 40ms delay, max 400ms cap
   */
  listItemEnter: (index: number) => {
    // UNIFIED TIMING: 40ms per item, max 400ms total delay
    const delay = Math.min(index * UNIFIED_TIMING.listItemDelay, UNIFIED_TIMING.listItemDelayMax);
    return FadeInDown.delay(delay).duration(UNIFIED_TIMING.listItemDuration);
  },

  /**
   * Modal entrance animation
   * Use for: Modal presentations, bottom sheets
   */
  modalEnter: SlideInDown.springify(),

  /**
   * Modal exit animation
   * Use for: Modal dismissal
   */
  modalExit: SlideOutDown.duration(duration.fast),

  /**
   * Card entrance animation
   * Use for: Individual cards, items
   */
  cardEnter: FadeIn.duration(duration.stateChange),

  /**
   * Card exit animation
   * Use for: Card removal
   */
  cardExit: FadeOut.duration(duration.fastest),

  /**
   * Header entrance animation
   * Use for: Screen headers
   */
  headerEnter: FadeIn.duration(duration.fast),

  /**
   * Content entrance with delay
   * Use for: Content after header
   */
  contentEnter: FadeInDown.delay(100).duration(duration.elementMove),

  /**
   * Hero element entrance
   * Use for: Hero sections, large images
   */
  heroEnter: FadeIn.duration(duration.screenTransition),

  /**
   * Quick fade in
   * Use for: Small UI elements, badges
   */
  quickFadeIn: FadeIn.duration(duration.fast),

  /**
   * Quick fade out
   * Use for: Small UI elements removal
   */
  quickFadeOut: FadeOut.duration(duration.fastest),

  /**
   * Fade in list animation
   * Use for: List containers
   */
  fadeInList: {
    entering: FadeIn.duration(duration.elementMove),
  },
} as const;

/**
 * Navigation Animation Presets
 */
export const NAVIGATION_ANIMATIONS = {
  /**
   * Standard stack navigation animation
   * Use for: Regular page navigation
   */
  stack: {
    animation: 'slide_from_right' as const,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
  },

  /**
   * Modal presentation animation
   * Use for: Create screens, settings, forms
   */
  modal: {
    presentation: 'modal' as const,
    animation: 'slide_from_bottom' as const,
    gestureEnabled: true,
  },

  /**
   * Full screen modal animation
   * Use for: Camera, verification, immersive experiences
   */
  fullScreenModal: {
    presentation: 'fullScreenModal' as const,
    animation: 'slide_from_bottom' as const,
    gestureEnabled: false,
  },

  /**
   * Root level transition animation
   * Use for: Auth state changes, main navigation switches
   */
  root: {
    animation: 'fade' as const,
    gestureEnabled: false,
  },

  /**
   * Card style modal
   * Use for: iOS-style card modals
   */
  card: {
    presentation: 'card' as const,
    gestureEnabled: true,
  },
} as const;
