// src/shared/components/PressableScale/PressableScale.types.ts
// PressableScale Type Definitions

import type { PressableProps } from 'react-native';

/**
 * PressableScale Props
 */
export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /** Child elements */
  children: React.ReactNode;
  /** Scale value when pressed (0-1) */
  scaleValue?: number;
  /** Enable haptic feedback */
  enableHaptic?: boolean;
  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  /** Custom style */
  style?: any;
  /** Test ID */
  testID?: string;
}
