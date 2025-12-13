// src/shared/components/PressableOpacity/PressableOpacity.types.ts
// PressableOpacity Type Definitions

import type { PressableProps } from 'react-native';

/**
 * PressableOpacity Props
 */
export interface PressableOpacityProps extends Omit<PressableProps, 'style'> {
  /** Child elements */
  children: React.ReactNode;
  /** Opacity value when pressed (0-1) */
  activeOpacity?: number;
  /** Enable haptic feedback */
  enableHaptic?: boolean;
  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  /** Custom style */
  style?: any;
  /** Test ID */
  testID?: string;
}
