// src/shared/types/animation.types.ts
// Dengin Design System - Animation Types
// Oku: mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md

import { Easing as ReanimatedEasing } from 'react-native-reanimated';

/**
 * Spring animation configuration
 */
export interface SpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
}

/**
 * Timing animation configuration
 */
export interface TimingConfig {
  duration?: number;
  easing?: typeof ReanimatedEasing.bezier;
}

/**
 * Decay animation configuration
 */
export interface DecayConfig {
  deceleration?: number;
  velocity?: number;
  clamp?: [number, number];
}

/**
 * Animation preset names
 */
export type AnimationPreset =
  | 'default'
  | 'spring'
  | 'springBouncy'
  | 'springStiff'
  | 'springGentle'
  | 'timing'
  | 'timingFast'
  | 'timingSlow'
  | 'ease'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut';

/**
 * Predefined spring configurations
 */
export const SPRING_CONFIGS = {
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  bouncy: {
    damping: 8,
    stiffness: 200,
    mass: 0.8,
  },
  stiff: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  quick: {
    damping: 18,
    stiffness: 250,
    mass: 0.8,
  },
} as const;

/**
 * Predefined timing durations
 */
export const TIMING_DURATIONS = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const;

/**
 * Animation direction
 */
export type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'in' | 'out';

/**
 * Entrance animation configuration
 */
export interface EnterAnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'slideAndFade' | 'scaleAndFade';
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
  springConfig?: SpringConfig;
}

/**
 * Exit animation configuration
 */
export interface ExitAnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'slideAndFade' | 'scaleAndFade';
  direction?: AnimationDirection;
  duration?: number;
  springConfig?: SpringConfig;
}

/**
 * Layout animation configuration
 */
export interface LayoutAnimationConfig {
  type: 'spring' | 'timing';
  duration?: number;
  springConfig?: SpringConfig;
}

/**
 * Gesture animation state
 */
export interface GestureAnimationState {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
  scale: number;
  rotation: number;
}

/**
 * Animation callback types
 */
export type AnimationCallback = (finished?: boolean) => void;

/**
 * Shared value type for Reanimated
 */
export type SharedAnimationValue<T = number> = {
  value: T;
};

/**
 * Worklet function type
 */
export type WorkletFunction = (...args: unknown[]) => unknown;

/**
 * Scroll event for animated scroll handlers
 */
export interface AnimatedScrollEvent {
  contentOffset: {
    x: number;
    y: number;
  };
  contentSize: {
    width: number;
    height: number;
  };
  layoutMeasurement: {
    width: number;
    height: number;
  };
  zoomScale?: number;
}

/**
 * Parallax animation configuration
 */
export interface ParallaxConfig {
  inputRange: number[];
  outputRange: number[];
  clamp?: boolean;
}

/**
 * Skeleton animation configuration
 */
export interface SkeletonAnimationConfig {
  shimmerColors?: string[];
  shimmerSpeed?: number;
  baseColor?: string;
  highlightColor?: string;
}

/**
 * Press animation configuration
 */
export interface PressAnimationConfig {
  scale?: number;
  opacity?: number;
  duration?: number;
  haptic?: boolean;
}

/**
 * Like animation configuration
 */
export interface LikeAnimationConfig {
  duration?: number;
  scale?: number;
  color?: string;
  particleCount?: number;
}
