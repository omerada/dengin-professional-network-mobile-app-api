// src/shared/components/SwipeableRow/SwipeableRow.tsx
// Dengin Design System - Swipeable Row Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

export interface SwipeAction {
  /** Unique key for the action */
  key: string;
  /** Icon name (Ionicons) */
  icon: string;
  /** Label text */
  label?: string;
  /** Background color */
  backgroundColor: string;
  /** Icon/text color */
  color?: string;
  /** Action handler */
  onPress: () => void;
  /** Full swipe action (destructive) */
  destructive?: boolean;
}

export interface SwipeableRowProps {
  /** Content to render inside the row */
  children: React.ReactNode;
  /** Left swipe actions */
  leftActions?: SwipeAction[];
  /** Right swipe actions */
  rightActions?: SwipeAction[];
  /** Width of each action button */
  actionWidth?: number;
  /** Enable full swipe to trigger destructive action */
  enableFullSwipe?: boolean;
  /** Friction coefficient (higher = harder to swipe) */
  friction?: number;
  /** Container style */
  style?: ViewStyle;
  /** Callback when swipe state changes */
  onSwipeStateChange?: (isOpen: boolean) => void;
}

export interface SwipeableRowRef {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_ACTION_WIDTH = 80;
const FULL_SWIPE_THRESHOLD = 0.6; // 60% of screen width

// ============================================================================
// Component
// ============================================================================

/**
 * SwipeableRow - Swipeable row with action buttons
 *
 * @example
 * <SwipeableRow
 *   rightActions={[
 *     {
 *       key: 'delete',
 *       icon: 'trash-outline',
 *       label: 'Sil',
 *       backgroundColor: '#FF3B30',
 *       onPress: handleDelete,
 *       destructive: true,
 *     },
 *     {
 *       key: 'archive',
 *       icon: 'archive-outline',
 *       label: 'Arşivle',
 *       backgroundColor: '#007AFF',
 *       onPress: handleArchive,
 *     },
 *   ]}
 * >
 *   <ListItem title="Message" />
 * </SwipeableRow>
 */
export const SwipeableRow = memo(
  forwardRef<SwipeableRowRef, SwipeableRowProps>(function SwipeableRow(
    {
      children,
      leftActions = [],
      rightActions = [],
      actionWidth = DEFAULT_ACTION_WIDTH,
      enableFullSwipe = true,
      friction = 2,
      style,
      onSwipeStateChange,
    },
    ref,
  ) {
    useColors(); // Keep hook for future theming
    const { trigger: triggerHaptic } = useHaptic();

    // Animation values
    const translateX = useSharedValue(0);
    const isOpen = useSharedValue(false);
    const hasTriggeredFullSwipe = useSharedValue(false);

    // Calculate thresholds
    const leftActionsWidth = leftActions.length * actionWidth;
    const rightActionsWidth = rightActions.length * actionWidth;
    const fullSwipeThreshold = SCREEN_WIDTH * FULL_SWIPE_THRESHOLD;

    // Close the row
    const close = useCallback(() => {
      translateX.value = withSpring(0, spring.stiff);
      isOpen.value = false;
      if (onSwipeStateChange) {
        onSwipeStateChange(false);
      }
    }, [translateX, isOpen, onSwipeStateChange]);

    // Open left actions
    const openLeft = useCallback(() => {
      if (leftActions.length > 0) {
        translateX.value = withSpring(leftActionsWidth, spring.stiff);
        isOpen.value = true;
        if (onSwipeStateChange) {
          onSwipeStateChange(true);
        }
      }
    }, [translateX, isOpen, leftActionsWidth, leftActions.length, onSwipeStateChange]);

    // Open right actions
    const openRight = useCallback(() => {
      if (rightActions.length > 0) {
        translateX.value = withSpring(-rightActionsWidth, spring.stiff);
        isOpen.value = true;
        if (onSwipeStateChange) {
          onSwipeStateChange(true);
        }
      }
    }, [translateX, isOpen, rightActionsWidth, rightActions.length, onSwipeStateChange]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      close,
      openLeft,
      openRight,
    }));

    // Pan gesture
    const panGesture = Gesture.Pan()
      .activeOffsetX([-10, 10])
      .onUpdate(event => {
        const newTranslateX = event.translationX;

        // Apply friction when over-swiping
        if (newTranslateX > leftActionsWidth) {
          translateX.value = leftActionsWidth + (newTranslateX - leftActionsWidth) / friction;
        } else if (newTranslateX < -rightActionsWidth) {
          translateX.value = -rightActionsWidth + (newTranslateX + rightActionsWidth) / friction;
        } else {
          translateX.value = newTranslateX;
        }

        // Check for full swipe haptic
        if (enableFullSwipe) {
          const shouldTriggerHaptic =
            Math.abs(translateX.value) > fullSwipeThreshold && !hasTriggeredFullSwipe.value;

          if (shouldTriggerHaptic) {
            hasTriggeredFullSwipe.value = true;
            scheduleOnRN(() => triggerHaptic('medium'));
          }

          if (Math.abs(translateX.value) <= fullSwipeThreshold && hasTriggeredFullSwipe.value) {
            hasTriggeredFullSwipe.value = false;
          }
        }
      })
      .onEnd(event => {
        const velocityThreshold = 500;
        const swipeThreshold = actionWidth / 2;

        // Check for full swipe
        if (enableFullSwipe && Math.abs(translateX.value) > fullSwipeThreshold) {
          if (translateX.value > 0 && leftActions.length > 0) {
            const destructiveAction = leftActions.find(a => a.destructive);
            if (destructiveAction) {
              translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 });
              scheduleOnRN(destructiveAction.onPress);
              return;
            }
          } else if (translateX.value < 0 && rightActions.length > 0) {
            const destructiveAction = rightActions.find(a => a.destructive);
            if (destructiveAction) {
              translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
              scheduleOnRN(destructiveAction.onPress);
              return;
            }
          }
        }

        // Determine final position based on velocity and position
        if (
          translateX.value > swipeThreshold ||
          (event.velocityX > velocityThreshold && translateX.value > 0)
        ) {
          if (leftActions.length > 0) {
            translateX.value = withSpring(leftActionsWidth, spring.stiff);
            isOpen.value = true;
            if (onSwipeStateChange) {
              scheduleOnRN(() => onSwipeStateChange(true));
            }
          } else {
            translateX.value = withSpring(0, spring.stiff);
          }
        } else if (
          translateX.value < -swipeThreshold ||
          (event.velocityX < -velocityThreshold && translateX.value < 0)
        ) {
          if (rightActions.length > 0) {
            translateX.value = withSpring(-rightActionsWidth, spring.stiff);
            isOpen.value = true;
            if (onSwipeStateChange) {
              scheduleOnRN(() => onSwipeStateChange(true));
            }
          } else {
            translateX.value = withSpring(0, spring.stiff);
          }
        } else {
          translateX.value = withSpring(0, spring.stiff);
          isOpen.value = false;
          if (onSwipeStateChange) {
            scheduleOnRN(() => onSwipeStateChange(false));
          }
        }

        hasTriggeredFullSwipe.value = false;
      });

    // Content animated style
    const contentAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    // Left actions animated style
    const leftActionsStyle = useAnimatedStyle(() => {
      const width = Math.max(0, translateX.value);
      return {
        width,
        opacity: interpolate(translateX.value, [0, leftActionsWidth], [0, 1], Extrapolate.CLAMP),
      };
    });

    // Right actions animated style
    const rightActionsStyle = useAnimatedStyle(() => {
      const width = Math.max(0, -translateX.value);
      return {
        width,
        opacity: interpolate(translateX.value, [-rightActionsWidth, 0], [1, 0], Extrapolate.CLAMP),
      };
    });

    return (
      <View style={[styles.container, style]}>
        {/* Left Actions */}
        {leftActions.length > 0 && (
          <Animated.View style={[styles.actionsContainer, styles.leftActions, leftActionsStyle]}>
            {leftActions.map(action => (
              <ActionButton
                key={action.key}
                action={action}
                actionWidth={actionWidth}
                onPress={() => {
                  action.onPress();
                  close();
                }}
              />
            ))}
          </Animated.View>
        )}

        {/* Right Actions */}
        {rightActions.length > 0 && (
          <Animated.View style={[styles.actionsContainer, styles.rightActions, rightActionsStyle]}>
            {rightActions.map(action => (
              <ActionButton
                key={action.key}
                action={action}
                actionWidth={actionWidth}
                onPress={() => {
                  action.onPress();
                  close();
                }}
              />
            ))}
          </Animated.View>
        )}

        {/* Content */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.content, contentAnimatedStyle]}>{children}</Animated.View>
        </GestureDetector>
      </View>
    );
  }),
);

// ============================================================================
// Action Button Component
// ============================================================================

interface ActionButtonProps {
  action: SwipeAction;
  actionWidth: number;
  onPress: () => void;
}

const ActionButton = memo<ActionButtonProps>(function ActionButton({
  action,
  actionWidth,
  onPress,
}) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        {
          width: actionWidth,
          backgroundColor: action.backgroundColor,
        },
      ]}
      onPress={onPress}
      accessibilityLabel={action.label || action.key}
      accessibilityRole="button">
      <Icon name={action.icon} size={24} color={action.color || '#FFFFFF'} />
      {action.label && (
        <Text style={[styles.actionLabel, { color: action.color || '#FFFFFF' }]} numberOfLines={1}>
          {action.label}
        </Text>
      )}
    </Pressable>
  );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'transparent',
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  leftActions: {
    left: 0,
    justifyContent: 'flex-start',
  },
  rightActions: {
    right: 0,
    justifyContent: 'flex-end',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
