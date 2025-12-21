// src/shared/components/Toast/Toast.types.ts
// Dengin Design System - Toast Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import type { ViewStyle } from 'react-native';

/**
 * Toast type variants
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast position options
 */
export type ToastPosition = 'top' | 'bottom';

/**
 * Toast animation types
 */
export type ToastAnimation = 'slide' | 'fade' | 'bounce';

/**
 * Toast data structure
 */
export interface ToastData {
  /** Unique identifier */
  id: string;

  /** Toast type */
  type: ToastType;

  /** Toast message */
  message: string;

  /** Title (optional) */
  title?: string;

  /** Duration in milliseconds */
  duration?: number;

  /** Action button */
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Toast component props
 */
export interface ToastProps {
  /** Toast data */
  toast: ToastData;

  /** Callback when toast should be hidden */
  onHide: (id: string) => void;

  /** Toast position */
  position?: ToastPosition;

  /** Animation type */
  animation?: ToastAnimation;

  /** Additional container styles */
  style?: ViewStyle;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Icon mapping for toast types
 */
export const TOAST_ICONS: Record<ToastType, string> = {
  error: 'close-circle',
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
};

/**
 * Default toast durations by type
 */
export const TOAST_DURATION: Record<ToastType, number> = {
  error: 4000,
  info: 3000,
  success: 2500,
  warning: 3500,
};
