// src/shared/components/ScreenHeader/ScreenHeader.types.ts
// ScreenHeader Type Definitions

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export type ScreenHeaderVariant = 'default' | 'large' | 'minimal';

/**
 * ScreenHeader Props
 */
export interface ScreenHeaderProps {
  /** Header title */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show back button */
  showBackButton?: boolean;
  /** Custom back button press handler */
  onBackPress?: () => void;
  /** Right side element (button, icon, etc.) */
  rightElement?: ReactNode;
  /** Header variant */
  variant?: ScreenHeaderVariant;
  /** Show bottom border */
  showBorder?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Additional container styles */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Variant configuration
 */
export interface ScreenHeaderVariantConfig {
  minHeight: number;
  titleFontSize: number;
  titleFontWeight: '400' | '500' | '600' | '700';
  subtitleFontSize: number;
}

export const SCREEN_HEADER_VARIANTS: Record<ScreenHeaderVariant, ScreenHeaderVariantConfig> = {
  default: {
    minHeight: 56,
    titleFontSize: 17,
    titleFontWeight: '600',
    subtitleFontSize: 12,
  },
  large: {
    minHeight: 72,
    titleFontSize: 24,
    titleFontWeight: '700',
    subtitleFontSize: 14,
  },
  minimal: {
    minHeight: 44,
    titleFontSize: 16,
    titleFontWeight: '600',
    subtitleFontSize: 11,
  },
};
