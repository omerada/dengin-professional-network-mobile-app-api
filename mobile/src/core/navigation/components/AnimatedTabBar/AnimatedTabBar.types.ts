// src/core/navigation/components/AnimatedTabBar/AnimatedTabBar.types.ts
// Dengin Design System - AnimatedTabBar Types
// Oku: mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ViewStyle } from 'react-native';

/**
 * Tab item configuration
 */
export interface TabItem {
  /** Route name */
  name: string;
  /** Tab label */
  label: string;
  /** Icon name (unfocused) */
  icon: string;
  /** Icon name (focused) */
  focusedIcon: string;
  /** Badge count (optional) */
  badgeCount?: number;
  /** Show dot badge (optional) */
  showDot?: boolean;
  /** Accessibility label */
  accessibilityLabel: string;
  /** Whether this tab is center FAB (Floating Action Button) */
  isCenterFab?: boolean;
}

/**
 * AnimatedTabBar props
 */
export interface AnimatedTabBarProps extends BottomTabBarProps {
  /** Tab items configuration */
  tabs: TabItem[];
  /** Additional container styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * TabButton props
 */
export interface TabButtonProps {
  /** Tab item configuration */
  item: TabItem;
  /** Whether tab is focused */
  focused: boolean;
  /** Index for key identification */
  index: number;
  /** Press handler */
  onPress: () => void;
  /** Long press handler */
  onLongPress: () => void;
}
