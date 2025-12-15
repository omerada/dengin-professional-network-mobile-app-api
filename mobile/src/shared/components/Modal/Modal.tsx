// src/shared/components/Modal/Modal.tsx
// Modal ve BottomSheet komponentleri
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART4.md

import React, { memo, ReactNode, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '@theme';
import { spring as springPresets } from '@theme/animations';
import { useHaptic } from '@shared/hooks/useHaptic';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ModalProps {
  /**
   * Whether modal is visible
   */
  visible: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Optional modal title
   */
  title?: string;
  /**
   * Modal content
   */
  children: ReactNode;
  /**
   * Show close button in header
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Close modal when backdrop is tapped
   * @default true
   */
  closeOnBackdrop?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Modal Component
 *
 * Centered modal dialog with optional title and close button.
 * Supports keyboard avoidance on iOS and smooth Reanimated 3 animations.
 *
 * @example
 * ```tsx
 * <Modal
 *   visible={isModalVisible}
 *   onClose={() => setModalVisible(false)}
 *   title="Confirm Action"
 * >
 *   <Text>Are you sure you want to proceed?</Text>
 *   <Button title="Confirm" onPress={handleConfirm} />
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = memo(
  ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    closeOnBackdrop = true,
    testID,
  }) => {
    const colors = useColors();
    const haptic = useHaptic();

    // Close button animation
    const closeButtonScale = useSharedValue(1);

    const closeButtonAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: closeButtonScale.value }],
    }));

    const handleClosePress = useCallback(() => {
      haptic.light();
      onClose();
    }, [haptic, onClose]);

    return (
      <RNModal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={onClose}
        testID={testID}
        accessibilityViewIsModal>
        <Animated.View
          entering={FadeIn.duration(UNIFIED_TIMING.componentEnter)}
          exiting={FadeOut.duration(UNIFIED_TIMING.componentExit)}
          style={styles.overlay}>
          <TouchableWithoutFeedback
            onPress={closeOnBackdrop ? handleClosePress : undefined}
            accessible={false}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Animated.View
              entering={FadeIn.duration(UNIFIED_TIMING.componentEnter)
                .springify()
                .damping(20)
                .stiffness(300)}
              exiting={FadeOut.duration(UNIFIED_TIMING.componentExit)}
              style={[styles.content, { backgroundColor: colors.background.primary }]}>
              {(title || showCloseButton) && (
                <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
                  {title && (
                    <Text
                      style={[styles.title, { color: colors.text.primary }]}
                      accessibilityRole="header">
                      {title}
                    </Text>
                  )}
                  {showCloseButton && (
                    <AnimatedPressable
                      onPress={handleClosePress}
                      onPressIn={() => {
                        closeButtonScale.value = withSpring(0.9, springPresets.press);
                      }}
                      onPressOut={() => {
                        closeButtonScale.value = withSpring(1, springPresets.press);
                      }}
                      style={[styles.closeButton, closeButtonAnimatedStyle]}
                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      accessibilityLabel="Kapat"
                      accessibilityRole="button">
                      <Icon name="close" size={24} color={colors.text.secondary} />
                    </AnimatedPressable>
                  )}
                </View>
              )}
              <View style={styles.body}>{children}</View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </RNModal>
    );
  },
);

export interface BottomSheetProps {
  /**
   * Whether bottom sheet is visible
   */
  visible: boolean;
  /**
   * Callback when bottom sheet should close
   */
  onClose: () => void;
  /**
   * Optional sheet title
   */
  title?: string;
  /**
   * Sheet content
   */
  children: ReactNode;
  /**
   * Height of the sheet ('auto' or specific number)
   * @default 'auto'
   */
  height?: number | 'auto';
  /**
   * Enable swipe to dismiss
   * @default true
   */
  swipeToDismiss?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * BottomSheet Component
 *
 * Bottom-sliding sheet modal for actions, menus, or content.
 * Supports swipe to dismiss with haptic feedback.
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   visible={isSheetVisible}
 *   onClose={() => setSheetVisible(false)}
 *   title="Options"
 * >
 *   <TouchableOpacity onPress={handleEdit}>
 *     <Text>Edit</Text>
 *   </TouchableOpacity>
 *   <TouchableOpacity onPress={handleDelete}>
 *     <Text>Delete</Text>
 *   </TouchableOpacity>
 * </BottomSheet>
 * ```
 */
export const BottomSheet: React.FC<BottomSheetProps> = memo(
  ({ visible, onClose, title, children, height = 'auto', swipeToDismiss = true, testID }) => {
    const colors = useColors();
    const haptic = useHaptic();
    const translateY = useSharedValue(0);
    const isClosing = useSharedValue(false);

    // Reset position when opened
    useEffect(() => {
      if (visible) {
        translateY.value = 0;
        isClosing.value = false;
      }
    }, [visible, translateY, isClosing]);

    const handleClose = useCallback(() => {
      haptic.light();
      onClose();
    }, [haptic, onClose]);

    // Pan gesture for swipe to dismiss
    const panGesture = Gesture.Pan()
      .enabled(swipeToDismiss)
      .onUpdate(event => {
        if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
      })
      .onEnd(event => {
        if (event.translationY > 100 || event.velocityY > 500) {
          isClosing.value = true;
          translateY.value = withSpring(SCREEN_HEIGHT, springPresets.snappy, () => {
            'worklet';
            scheduleOnRN(() => {
              handleClose();
            });
          });
        } else {
          translateY.value = withSpring(0, springPresets.bouncy);
        }
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const maxHeight = height === 'auto' ? SCREEN_HEIGHT * 0.9 : height;

    return (
      <RNModal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={onClose}
        testID={testID}
        accessibilityViewIsModal>
        <Animated.View
          entering={FadeIn.duration(UNIFIED_TIMING.componentEnter)}
          exiting={FadeOut.duration(UNIFIED_TIMING.componentExit)}
          style={styles.overlay}>
          <TouchableWithoutFeedback onPress={handleClose} accessible={false}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <GestureDetector gesture={panGesture}>
            <Animated.View
              entering={SlideInDown.springify().damping(20).stiffness(200)}
              exiting={SlideOutDown.duration(UNIFIED_TIMING.componentExit)}
              style={[
                styles.bottomSheetContent,
                {
                  backgroundColor: colors.background.primary,
                  maxHeight,
                },
                animatedStyle,
              ]}>
              <View
                style={[styles.handle, { backgroundColor: colors.border.strong }]}
                accessibilityLabel="Kapatmak için aşağı kaydır"
              />

              {title && (
                <View
                  style={[styles.bottomSheetHeader, { borderBottomColor: colors.border.default }]}>
                  <Text
                    style={[styles.title, { color: colors.text.primary }]}
                    accessibilityRole="header">
                    {title}
                  </Text>
                </View>
              )}

              <View style={styles.bottomSheetBody}>{children}</View>
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </RNModal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    borderRadius: borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.8,
    overflow: 'hidden',
    width: SCREEN_WIDTH - 48,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['4'],
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing['1'],
  },
  body: {
    padding: spacing['6'],
  },
  // BottomSheet styles
  bottomSheetContent: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  handle: {
    alignSelf: 'center',
    borderRadius: borderRadius.xs,
    height: 4,
    marginTop: spacing['2'],
    width: 40,
  },
  bottomSheetHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['4'],
  },
  bottomSheetBody: {
    padding: spacing['6'],
    paddingBottom: spacing['12'],
  },
});

Modal.displayName = 'Modal';
BottomSheet.displayName = 'BottomSheet';
