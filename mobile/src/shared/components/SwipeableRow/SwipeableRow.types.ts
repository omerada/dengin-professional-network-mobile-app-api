// src/shared/components/SwipeableRow/SwipeableRow.types.ts
// SwipeableRow Type Definitions

import type { ReactNode } from 'react';

/**
 * Swipeable Action Definition
 */
export interface SwipeableAction {
  /** Unique ID for the action */
  id: string;
  /** Action label */
  label: string;
  /** Icon name (Ionicons) */
  icon: string;
  /** Background color */
  backgroundColor: string;
  /** Text color */
  textColor?: string;
  /** Action handler */
  onPress: () => void;
  /** Is destructive action (shows confirmation) */
  destructive?: boolean;
}

/**
 * SwipeableRow Props
 */
export interface SwipeableRowProps {
  /** Child elements */
  children: ReactNode;
  /** Left swipe actions */
  leftActions?: SwipeableAction[];
  /** Right swipe actions */
  rightActions?: SwipeableAction[];
  /** Enable haptic feedback */
  enableHaptic?: boolean;
  /** On press handler */
  onPress?: () => void;
  /** Close threshold (0-1) */
  closeThreshold?: number;
  /** Test ID */
  testID?: string;
}
