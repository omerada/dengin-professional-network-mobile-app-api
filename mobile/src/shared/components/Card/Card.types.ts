// src/shared/components/Card/Card.types.ts
// Dengin Design System - Card Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

/**
 * Card variants
 */
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass' | 'gradient';

/**
 * Card padding options
 */
export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Card sizes (affects border radius)
 */
export type CardSize = 'small' | 'medium' | 'large';

/**
 * Card padding values (using 4px grid)
 */
export const CARD_PADDING_VALUES: Record<CardPadding, number> = {
  none: 0,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

/**
 * Card border radius values
 */
export const CARD_RADIUS_VALUES: Record<CardSize, number> = {
  small: 8,
  medium: 12,
  large: 16,
};

/**
 * Card component props
 */
export interface CardProps {
  /** Card content */
  children: ReactNode;

  /** Visual variant of the card */
  variant?: CardVariant;

  /** Padding size */
  padding?: CardPadding;

  /** Card size (affects border radius) */
  size?: CardSize;

  /** Callback when card is pressed (makes card interactive) */
  onPress?: () => void;

  /** Callback when card is long pressed */
  onLongPress?: () => void;

  /** Disable card interactions */
  disabled?: boolean;

  /** Whether to animate press with scale */
  animated?: boolean;

  /** Scale value when pressed (0-1) */
  pressScale?: number;

  /** Additional container styles */
  style?: ViewStyle;

  /** Test ID for testing */
  testID?: string;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Accessibility hint */
  accessibilityHint?: string;

  /** Gradient colors for gradient variant */
  gradientColors?: readonly [string, string, ...string[]];

  /** Glass blur intensity (0-100) */
  blurIntensity?: number;

  /** Whether the card is selected */
  selected?: boolean;

  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'none';

  /** Card header content */
  header?: ReactNode;

  /** Card footer content */
  footer?: ReactNode;
}

/**
 * Card variant styles
 */
export interface CardVariantStyles {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  shadowEnabled: boolean;
}
