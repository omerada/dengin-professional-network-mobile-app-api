// src/shared/components/Modal/Modal.tsx
// Modal ve BottomSheet komponentleri
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART4.md

import React, { memo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface ModalProps {
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
 * Supports keyboard avoidance on iOS.
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
    const { theme } = useTheme();

    return (
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        testID={testID}>
        <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View
                  style={[styles.content, { backgroundColor: theme.colors.background.primary }]}>
                  {(title || showCloseButton) && (
                    <View style={[styles.header, { borderBottomColor: theme.colors.border.light }]}>
                      {title && (
                        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                          {title}
                        </Text>
                      )}
                      {showCloseButton && (
                        <TouchableOpacity
                          onPress={onClose}
                          style={styles.closeButton}
                          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                          <Icon name="close" size={24} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  <View style={styles.body}>{children}</View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    );
  },
);

interface BottomSheetProps {
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
   * Test ID for testing
   */
  testID?: string;
}

/**
 * BottomSheet Component
 *
 * Bottom-sliding sheet modal for actions, menus, or content.
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
  ({ visible, onClose, title, children, height = 'auto', testID }) => {
    const { theme } = useTheme();

    return (
      <RNModal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        testID={testID}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.bottomSheetContent,
                  {
                    backgroundColor: theme.colors.background.primary,
                    maxHeight: height === 'auto' ? SCREEN_HEIGHT * 0.9 : height,
                  },
                ]}>
                <View style={[styles.handle, { backgroundColor: theme.colors.border.medium }]} />

                {title && (
                  <View
                    style={[
                      styles.bottomSheetHeader,
                      { borderBottomColor: theme.colors.border.light },
                    ]}>
                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                      {title}
                    </Text>
                  </View>
                )}

                <View style={styles.bottomSheetBody}>{children}</View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: SCREEN_WIDTH - 48,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  body: {
    padding: spacing.lg,
  },
  // BottomSheet styles
  bottomSheetContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  bottomSheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  bottomSheetBody: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
});

Modal.displayName = 'Modal';
BottomSheet.displayName = 'BottomSheet';
