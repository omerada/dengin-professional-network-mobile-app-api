// src/shared/components/Avatar/Avatar.types.ts
// Dengin Design System - Avatar Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import type { ViewStyle, ImageSourcePropType } from 'react-native';

/**
 * Avatar size options
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Avatar status options
 */
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away' | 'none';

/**
 * Avatar size configuration
 */
export interface AvatarSizeConfig {
  /** Avatar dimension in pixels */
  dimension: number;
  /** Font size for initials */
  fontSize: number;
  /** Badge size */
  badgeSize: number;
  /** Badge border width */
  badgeBorderWidth: number;
}

/**
 * Avatar size configurations
 */
export const AVATAR_SIZE_CONFIG: Record<AvatarSize, AvatarSizeConfig> = {
  xs: {
    dimension: 24,
    fontSize: 10,
    badgeSize: 8,
    badgeBorderWidth: 1.5,
  },
  sm: {
    dimension: 32,
    fontSize: 12,
    badgeSize: 10,
    badgeBorderWidth: 2,
  },
  md: {
    dimension: 40,
    fontSize: 14,
    badgeSize: 12,
    badgeBorderWidth: 2,
  },
  lg: {
    dimension: 56,
    fontSize: 20,
    badgeSize: 14,
    badgeBorderWidth: 2,
  },
  xl: {
    dimension: 80,
    fontSize: 28,
    badgeSize: 18,
    badgeBorderWidth: 3,
  },
  '2xl': {
    dimension: 120,
    fontSize: 42,
    badgeSize: 24,
    badgeBorderWidth: 3,
  },
};

/**
 * Status colors mapping
 */
export const STATUS_COLORS: Record<Exclude<AvatarStatus, 'none'>, string> = {
  online: '#22C55E', // Success green
  offline: '#9CA3AF', // Gray
  busy: '#EF4444', // Red
  away: '#F59E0B', // Amber
};

/**
 * Avatar component props
 */
export interface AvatarProps {
  /** Image URI for the avatar */
  uri?: string | null;

  /** Local image source (takes priority over uri) */
  source?: ImageSourcePropType;

  /** User's name for generating initials and background color */
  name?: string;

  /** Size of the avatar */
  size?: AvatarSize;

  /** Callback when avatar is pressed */
  onPress?: () => void;

  /** Long press callback */
  onLongPress?: () => void;

  /** Status badge to show */
  status?: AvatarStatus;

  /** Custom badge color (overrides status color) */
  badgeColor?: string;

  /** Custom badge content (e.g., notification count) */
  badgeContent?: string | number;

  /** Whether to show an edit/camera icon overlay */
  showEditOverlay?: boolean;

  /** Whether to animate the avatar appearance */
  animated?: boolean;

  /** Border color */
  borderColor?: string;

  /** Border width */
  borderWidth?: number;

  /** Additional container styles */
  style?: ViewStyle;

  /** Test ID for testing */
  testID?: string;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Whether the avatar is selected */
  selected?: boolean;

  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'none';
}

/**
 * Palette of colors for avatar backgrounds
 */
export const AVATAR_BACKGROUND_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#DDA0DD', // Plum
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F0B27A', // Orange
  '#82E0AA', // Mint
];
