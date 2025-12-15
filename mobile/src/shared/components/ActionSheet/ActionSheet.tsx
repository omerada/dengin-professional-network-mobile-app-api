// src/shared/components/ActionSheet/ActionSheet.tsx
// Dengin Design System - Modern ActionSheet Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';

// ============================================================================
// Types
// ============================================================================

export interface ActionSheetOption {
  id: string;
  label: string;
  icon?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
  testID?: string;
}

// ============================================================================
// AnimatedPressable
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// OptionButton Component
// ============================================================================

interface OptionButtonProps {
  option: ActionSheetOption;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = memo(({ option, isFirst, isLast, onPress }) => {
  const colors = useColors();
  const { trigger } = useHaptic();
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (option.disabled) return;
    trigger(option.destructive ? 'warning' : 'selection');
    scale.value = withSequence(withSpring(0.97, spring.press), withSpring(1, spring.snappy));
    onPress();
  }, [option, onPress, trigger, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = option.disabled
    ? colors.text.disabled
    : option.destructive
      ? colors.status.error
      : colors.text.primary;

  const labelColor = option.disabled
    ? colors.text.disabled
    : option.destructive
      ? colors.status.error
      : colors.interactive.default;

  return (
    <AnimatedPressable
      style={[
        styles.option,
        {
          backgroundColor: colors.background.secondary,
          borderBottomColor: colors.border.default,
        },
        isFirst && styles.firstOption,
        isLast && styles.lastOption,
        option.disabled && styles.disabledOption,
        animatedStyle,
      ]}
      onPress={handlePress}
      disabled={option.disabled}
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ disabled: option.disabled }}>
      {option.icon && (
        <Icon name={option.icon} size={22} color={iconColor} style={styles.optionIcon} />
      )}
      <Text style={[styles.optionLabel, { color: labelColor }]}>{option.label}</Text>
    </AnimatedPressable>
  );
});

OptionButton.displayName = 'OptionButton';

// ============================================================================
// ActionSheet Component
// ============================================================================

/**
 * Modern ActionSheet Component
 *
 * Features:
 * - Animated slide-in/out with spring physics
 * - Haptic feedback on option selection
 * - Destructive option styling
 * - Safe area aware
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <ActionSheet
 *   visible={showSheet}
 *   onClose={() => setShowSheet(false)}
 *   title="Seçenekler"
 *   options={[
 *     { id: '1', label: 'Düzenle', icon: 'pencil', onPress: handleEdit },
 *     { id: '2', label: 'Sil', icon: 'trash', destructive: true, onPress: handleDelete },
 *   ]}
 * />
 * ```
 */
export const ActionSheet: React.FC<ActionSheetProps> = memo(
  ({ visible, onClose, title, message, options, cancelLabel = 'İptal', testID }) => {
    const colors = useColors();
    const { trigger } = useHaptic();
    const insets = useSafeAreaInsets();

    // Cancel button animation
    const cancelScale = useSharedValue(1);

    const handleOptionPress = useCallback(
      (option: ActionSheetOption) => {
        onClose();
        // Small delay to allow modal to close before action
        setTimeout(() => option.onPress(), 150);
      },
      [onClose],
    );

    const handleCancel = useCallback(() => {
      trigger('light');
      cancelScale.value = withSequence(
        withSpring(0.96, spring.press),
        withSpring(1, spring.snappy),
      );
      onClose();
    }, [onClose, trigger, cancelScale]);

    const cancelAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cancelScale.value }],
    }));

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent>
        <View style={styles.modalContainer} testID={testID}>
          {/* Overlay */}
          <Animated.View
            entering={FadeIn.duration(UNIFIED_TIMING.componentEnter)}
            exiting={FadeOut.duration(UNIFIED_TIMING.componentExit)}
            style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </Animated.View>

          {/* Content */}
          <Animated.View
            entering={SlideInDown.springify().damping(18)}
            exiting={SlideOutDown.duration(UNIFIED_TIMING.componentExit)}
            style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Pressable onPress={e => e.stopPropagation()}>
              {/* Header */}
              {(title || message) && (
                <View
                  style={[
                    styles.header,
                    {
                      backgroundColor: colors.background.secondary,
                      borderBottomColor: colors.border.default,
                    },
                  ]}>
                  {title && (
                    <Text style={[styles.title, { color: colors.text.secondary }]}>{title}</Text>
                  )}
                  {message && (
                    <Text style={[styles.message, { color: colors.text.tertiary }]}>{message}</Text>
                  )}
                </View>
              )}

              {/* Options */}
              <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    isFirst={index === 0 && !title && !message}
                    isLast={index === options.length - 1}
                    onPress={() => handleOptionPress(option)}
                  />
                ))}
              </View>

              {/* Cancel Button */}
              <AnimatedPressable
                style={[
                  styles.cancelButton,
                  { backgroundColor: colors.background.secondary },
                  cancelAnimatedStyle,
                ]}
                onPress={handleCancel}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}>
                <Text style={[styles.cancelLabel, { color: colors.interactive.default }]}>
                  {cancelLabel}
                </Text>
              </AnimatedPressable>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

ActionSheet.displayName = 'ActionSheet';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  cancelButton: {
    alignItems: 'center',
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 16,
  },
  cancelLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    paddingHorizontal: 8,
  },
  disabledOption: {
    opacity: 0.5,
  },
  firstOption: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  lastOption: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomWidth: 0,
  },
  message: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  option: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 18,
    textAlign: 'center',
  },
  optionsContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ActionSheet;
