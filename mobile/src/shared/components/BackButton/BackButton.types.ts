// src/shared/components/BackButton/BackButton.types.ts
// BackButton Type Definitions

export type BackButtonIcon = 'arrow-back' | 'chevron-back' | 'close';
export type BackButtonVariant = 'default' | 'circular';
export type BackButtonSize = 'sm' | 'md' | 'lg';

/**
 * BackButton Props
 */
export interface BackButtonProps {
  /** Custom press handler. If not provided, uses navigation.goBack() */
  onPress?: () => void;
  /** Icon variant */
  icon?: BackButtonIcon;
  /** Visual variant */
  variant?: BackButtonVariant;
  /** Size variant */
  size?: BackButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Custom color override */
  color?: string;
  /** Test ID */
  testID?: string;
}

/**
 * Size configuration
 */
export interface BackButtonSizeConfig {
  icon: number;
  container: number;
}

export const BACK_BUTTON_SIZES: Record<BackButtonSize, BackButtonSizeConfig> = {
  sm: { icon: 20, container: 32 },
  md: { icon: 24, container: 40 },
  lg: { icon: 28, container: 44 },
};
