// src/shared/components/SearchBar/SearchBar.types.ts
// Dengin Design System - SearchBar Types
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import { ViewStyle, TextInputProps } from 'react-native';

/**
 * SearchBar size variants
 */
export type SearchBarSize = 'sm' | 'md' | 'lg';

/**
 * SearchBar props
 */
export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  /** Current search value */
  value?: string;
  /** Value change handler */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: SearchBarSize;
  /** Show cancel button when focused */
  showCancelButton?: boolean;
  /** Cancel button text */
  cancelText?: string;
  /** Cancel button press handler */
  onCancel?: () => void;
  /** Clear button press handler */
  onClear?: () => void;
  /** Submit handler (when user presses enter) */
  onSubmit?: (text: string) => void;
  /** Loading state */
  loading?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Show filter button */
  showFilter?: boolean;
  /** Filter button press handler */
  onFilterPress?: () => void;
  /** Container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Size configuration
 */
export const SEARCH_BAR_SIZES: Record<
  SearchBarSize,
  { height: number; fontSize: number; iconSize: number; padding: number }
> = {
  sm: { height: 36, fontSize: 14, iconSize: 18, padding: 10 },
  md: { height: 44, fontSize: 16, iconSize: 20, padding: 12 },
  lg: { height: 52, fontSize: 18, iconSize: 22, padding: 14 },
};
