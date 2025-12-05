// src/shared/components/ActionSheet/ActionSheet.tsx
// Bottom action sheet component for menus

import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import type { Theme } from '@theme';

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
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  message,
  options,
  cancelLabel = 'İptal',
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleOptionPress = useCallback(
    (option: ActionSheetOption) => {
      if (!option.disabled) {
        onClose();
        // Small delay to allow modal to close before action
        setTimeout(() => option.onPress(), 100);
      }
    },
    [onClose],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Pressable onPress={e => e.stopPropagation()}>
            {/* Header */}
            {(title || message) && (
              <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                {message && <Text style={styles.message}>{message}</Text>}
              </View>
            )}

            {/* Options */}
            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    index === 0 && styles.firstOption,
                    index === options.length - 1 && styles.lastOption,
                    option.disabled && styles.disabledOption,
                  ]}
                  onPress={() => handleOptionPress(option)}
                  disabled={option.disabled}
                  activeOpacity={0.7}>
                  {option.icon && (
                    <Icon
                      name={option.icon}
                      size={22}
                      color={
                        option.disabled
                          ? theme.colors.text.disabled
                          : option.destructive
                            ? theme.colors.error.main
                            : theme.colors.text.primary
                      }
                      style={styles.optionIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.optionLabel,
                      option.destructive && styles.destructiveLabel,
                      option.disabled && styles.disabledLabel,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      paddingHorizontal: 8,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    header: {
      backgroundColor: theme.colors.background.secondary,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border.light,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    message: {
      fontSize: 12,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      marginTop: 4,
    },
    optionsContainer: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 14,
      overflow: 'hidden',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border.light,
    },
    firstOption: {
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
    },
    lastOption: {
      borderBottomWidth: 0,
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
    },
    disabledOption: {
      opacity: 0.5,
    },
    optionIcon: {
      marginRight: 12,
    },
    optionLabel: {
      fontSize: 18,
      color: theme.colors.primary[500],
      textAlign: 'center',
    },
    destructiveLabel: {
      color: theme.colors.error.main,
    },
    disabledLabel: {
      color: theme.colors.text.disabled,
    },
    cancelButton: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    cancelLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.primary[500],
    },
  });

export default ActionSheet;
