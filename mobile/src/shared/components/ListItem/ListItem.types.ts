// src/shared/components/ListItem/ListItem.types.ts
// Meslektaş Design System - ListItem Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import type { ViewStyle, TextStyle } from 'react-native';
import type { ReactNode } from 'react';

/**
 * ListItem size variants
 */
export type ListItemSize = 'compact' | 'default' | 'large';

/**
 * ListItem Props
 */
export interface ListItemProps {
  /** Primary title text */
  title: string;

  /** Secondary subtitle text */
  subtitle?: string;

  /** Description text (third line) */
  description?: string;

  /** Left element (icon, avatar, etc.) */
  leftElement?: ReactNode;

  /** Right element (icon, badge, switch, etc.) */
  rightElement?: ReactNode;

  /** Show chevron arrow on right */
  showChevron?: boolean;

  /** Show divider line below */
  showDivider?: boolean;

  /** Divider inset from left */
  dividerInset?: number;

  /** Size variant */
  size?: ListItemSize;

  /** Press handler */
  onPress?: () => void;

  /** Long press handler */
  onLongPress?: () => void;

  /** Disabled state */
  disabled?: boolean;

  /** Selected/highlighted state */
  selected?: boolean;

  /** Enable haptic feedback on press */
  haptic?: boolean;

  /** Container style override */
  style?: ViewStyle;

  /** Title text style override */
  titleStyle?: TextStyle;

  /** Subtitle text style override */
  subtitleStyle?: TextStyle;

  /** Test ID for testing */
  testID?: string;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Swipe actions (left) */
  leftSwipeActions?: SwipeAction[];

  /** Swipe actions (right) */
  rightSwipeActions?: SwipeAction[];
}

/**
 * Swipe action configuration
 */
export interface SwipeAction {
  /** Action key identifier */
  key: string;
  /** Display text */
  text?: string;
  /** Icon name (Ionicons) */
  icon?: string;
  /** Background color */
  backgroundColor: string;
  /** Text/icon color */
  color?: string;
  /** Action handler */
  onPress: () => void;
}

/**
 * Size configuration constants
 */
export const LIST_ITEM_SIZE_CONFIG: Record<
  ListItemSize,
  {
    minHeight: number;
    paddingVertical: number;
    titleSize: number;
    subtitleSize: number;
    descriptionSize: number;
    leftElementSpacing: number;
    rightElementSpacing: number;
  }
> = {
  compact: {
    minHeight: 44,
    paddingVertical: 8,
    titleSize: 14,
    subtitleSize: 12,
    descriptionSize: 11,
    leftElementSpacing: 12,
    rightElementSpacing: 8,
  },
  default: {
    minHeight: 56,
    paddingVertical: 12,
    titleSize: 16,
    subtitleSize: 14,
    descriptionSize: 12,
    leftElementSpacing: 16,
    rightElementSpacing: 12,
  },
  large: {
    minHeight: 72,
    paddingVertical: 16,
    titleSize: 17,
    subtitleSize: 15,
    descriptionSize: 13,
    leftElementSpacing: 16,
    rightElementSpacing: 12,
  },
};
