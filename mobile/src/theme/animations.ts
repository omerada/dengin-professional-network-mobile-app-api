// src/theme/animations.ts
// Meslektaş Design System - Animation Tokens
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

import { Easing } from 'react-native-reanimated';
import type { SpringConfig, SpringPreset, DurationKey } from './types';

/**
 * Duration Scale (in milliseconds)
 */
export const duration: Record<DurationKey, number> = {
  instant: 0,
  fastest: 50,
  faster: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,

  // Semantic durations
  microInteraction: 100,
  stateChange: 200,
  elementMove: 300,
  screenTransition: 400,
  celebration: 600,
} as const;

/**
 * Spring Configurations
 * Based on spring physics
 */
export const spring: Record<SpringPreset, SpringConfig> = {
  // Snappy - Quick, responsive
  snappy: {
    damping: 20,
    stiffness: 400,
    mass: 1,
  },

  // Gentle - Soft, natural
  gentle: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Bouncy - Playful, energetic
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.5,
  },

  // Stiff - Quick with minimal overshoot
  stiff: {
    damping: 25,
    stiffness: 300,
    mass: 1,
  },

  // Heavy - Slow, deliberate
  heavy: {
    damping: 20,
    stiffness: 100,
    mass: 2,
  },

  // Button press
  press: {
    damping: 15,
    stiffness: 500,
    mass: 0.5,
  },

  // Modal
  modal: {
    damping: 18,
    stiffness: 250,
    mass: 1,
  },

  // Card
  card: {
    damping: 15,
    stiffness: 180,
    mass: 1,
  },
} as const;

/**
 * Easing Functions
 * For timing-based animations
 */
export const easing = {
  // Standard
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),

  // Quad
  quadIn: Easing.in(Easing.quad),
  quadOut: Easing.out(Easing.quad),
  quadInOut: Easing.inOut(Easing.quad),

  // Cubic
  cubicIn: Easing.in(Easing.cubic),
  cubicOut: Easing.out(Easing.cubic),
  cubicInOut: Easing.inOut(Easing.cubic),

  // Back (overshoot)
  backIn: Easing.in(Easing.back(1.5)),
  backOut: Easing.out(Easing.back(1.5)),
  backInOut: Easing.inOut(Easing.back(1.5)),

  // Elastic
  elasticIn: Easing.in(Easing.elastic(1)),
  elasticOut: Easing.out(Easing.elastic(1)),
  elasticInOut: Easing.inOut(Easing.elastic(1)),

  // Bounce
  bounceIn: Easing.in(Easing.bounce),
  bounceOut: Easing.out(Easing.bounce),
  bounceInOut: Easing.inOut(Easing.bounce),
} as const;

/**
 * Preset Animations
 * Ready-to-use animation configs
 */
export const animationPresets = {
  // Button press
  buttonPress: {
    scale: 0.97,
    duration: duration.fastest,
    spring: spring.press,
  },

  // Card hover
  cardHover: {
    scale: 1.02,
    translateY: -4,
    spring: spring.card,
  },

  // Like heart
  likeHeart: {
    scale: [1, 1.3, 1],
    duration: duration.stateChange,
    spring: spring.bouncy,
  },

  // Fade in
  fadeIn: {
    opacity: [0, 1],
    duration: duration.normal,
    easing: easing.easeOut,
  },

  // Slide up
  slideUp: {
    translateY: [20, 0],
    opacity: [0, 1],
    duration: duration.slow,
    easing: easing.easeOut,
  },

  // Slide down
  slideDown: {
    translateY: [-20, 0],
    opacity: [0, 1],
    duration: duration.slow,
    easing: easing.easeOut,
  },

  // Scale in
  scaleIn: {
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: duration.normal,
    spring: spring.gentle,
  },

  // Shake
  shake: {
    translateX: [0, -10, 10, -10, 10, 0],
    duration: duration.stateChange,
    easing: easing.easeInOut,
  },

  // Pulse
  pulse: {
    scale: [1, 1.05, 1],
    duration: duration.slow,
    easing: easing.easeInOut,
  },
} as const;

/**
 * Layout Animation Configs
 */
export const layoutAnimations = {
  // List item
  listItem: {
    entering: 'FadeInRight',
    exiting: 'FadeOutLeft',
    layout: 'spring',
    staggerDelay: 50,
  },

  // Card
  card: {
    entering: 'FadeInDown',
    exiting: 'FadeOutUp',
    layout: 'spring',
  },

  // Modal
  modal: {
    entering: 'SlideInDown',
    exiting: 'SlideOutDown',
  },

  // Dropdown
  dropdown: {
    entering: 'FadeIn',
    exiting: 'FadeOut',
    duration: duration.fast,
  },

  // Toast
  toast: {
    entering: 'SlideInUp',
    exiting: 'SlideOutDown',
    duration: duration.normal,
  },
} as const;

/**
 * Gesture Animation Configs
 */
export const gestureAnimations = {
  // Swipe to dismiss
  swipeToDismiss: {
    threshold: 50,
    velocityThreshold: 500,
    spring: spring.snappy,
  },

  // Pull to refresh
  pullToRefresh: {
    triggerThreshold: 80,
    spring: spring.gentle,
  },

  // Pinch to zoom
  pinchToZoom: {
    minScale: 1,
    maxScale: 4,
    spring: spring.stiff,
  },

  // Double tap to like
  doubleTapLike: {
    timeout: 300,
    spring: spring.bouncy,
  },
} as const;

export type EasingName = keyof typeof easing;
export type AnimationPreset = keyof typeof animationPresets;
export type LayoutAnimation = keyof typeof layoutAnimations;
export type GestureAnimation = keyof typeof gestureAnimations;
