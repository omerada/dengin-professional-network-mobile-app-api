// src/shared/components/ActionFeedback/ActionFeedback.tsx
// Action feedback overlay for success, error, and info states
// Provides visual confirmation without blocking interaction

import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { HAPTIC_TYPES } from '@constants/hapticPresets';
import { spring } from '@theme/animations';

export type ActionFeedbackType = 'success' | 'error' | 'info' | 'warning';

export interface ActionFeedbackProps {
  /**
   * Type of feedback
   */
  type: ActionFeedbackType;
  /**
   * Whether feedback is visible
   */
  visible: boolean;
  /**
   * Auto-dismiss duration in ms
   * @default 1500
   */
  duration?: number;
  /**
   * Callback when dismissed
   */
  onDismiss?: () => void;
  /**
   * Icon name override
   */
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * Disable haptic feedback
   */
  disableHaptic?: boolean;
}

const FEEDBACK_CONFIG: Record<
  ActionFeedbackType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    haptic: keyof typeof HAPTIC_TYPES;
  }
> = {
  success: {
    icon: 'checkmark-circle',
    haptic: 'success' as keyof typeof HAPTIC_TYPES,
  },
  error: {
    icon: 'close-circle',
    haptic: 'error' as keyof typeof HAPTIC_TYPES,
  },
  info: {
    icon: 'information-circle',
    haptic: 'selection' as keyof typeof HAPTIC_TYPES,
  },
  warning: {
    icon: 'warning',
    haptic: 'warning' as keyof typeof HAPTIC_TYPES,
  },
};

/**
 * ActionFeedback Component
 *
 * Displays floating feedback overlay for user actions.
 * Auto-dismisses after duration with smooth animations.
 *
 * Features:
 * - Spring-based entrance animation
 * - Automatic haptic feedback
 * - Color-coded by feedback type
 * - Auto-dismiss with callback
 * - Non-blocking overlay
 *
 * @example
 * ```tsx
 * const [showFeedback, setShowFeedback] = useState(false);
 *
 * <ActionFeedback
 *   type="success"
 *   visible={showFeedback}
 *   onDismiss={() => setShowFeedback(false)}
 * />
 * ```
 */
export const ActionFeedback: React.FC<ActionFeedbackProps> = memo(
  ({ type, visible, duration = 1500, onDismiss, icon: customIcon, disableHaptic = false }) => {
    const colors = useColors();
    const haptic = useHaptic();

    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    const config = FEEDBACK_CONFIG[type];
    const iconName = customIcon || config.icon;

    useEffect(() => {
      if (visible) {
        // Trigger haptic
        if (!disableHaptic) {
          const hapticType =
            config.haptic === 'success' || config.haptic === 'error' || config.haptic === 'warning'
              ? config.haptic
              : 'selection';
          haptic.trigger(hapticType);
        }

        // Entrance animation
        scale.value = withSequence(
          withSpring(1.2, { ...spring.bouncy, mass: 0.5 }),
          withSpring(1, spring.press),
        );
        opacity.value = withTiming(1, { duration: 200 });

        // Auto-dismiss
        const timer = setTimeout(() => {
          scale.value = withSpring(0.8, spring.press);
          opacity.value = withTiming(0, { duration: 200 }, finished => {
            if (finished && onDismiss) {
              runOnJS(onDismiss)();
            }
          });
        }, duration);

        return () => clearTimeout(timer);
      } else {
        scale.value = 0;
        opacity.value = 0;
      }
      return undefined;
    }, [visible, duration, onDismiss, disableHaptic, haptic, config.haptic, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const getIconColor = () => {
      switch (type) {
        case 'success':
          return '#4CAF50';
        case 'error':
          return '#F44336';
        case 'info':
          return '#2196F3';
        case 'warning':
          return '#FF9800';
        default:
          return colors.text.primary;
      }
    };

    if (!visible) return null;

    return (
      <View style={styles.container} pointerEvents="none">
        <Animated.View
          style={[styles.feedback, { backgroundColor: colors.background.elevated }, animatedStyle]}>
          <Ionicons name={iconName} size={48} color={getIconColor()} />
        </Animated.View>
      </View>
    );
  },
);

ActionFeedback.displayName = 'ActionFeedback';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  feedback: {
    alignItems: 'center',
    borderRadius: 20,
    elevation: 8,
    height: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 80,
  },
});
