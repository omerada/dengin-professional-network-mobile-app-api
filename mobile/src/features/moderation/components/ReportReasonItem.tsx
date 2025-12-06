// src/features/moderation/components/ReportReasonItem.tsx
// Rapor nedeni seçim öğesi
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '@theme';
import type { ReportReasonInfo } from '../types';

/**
 * ReportReasonItem props
 */
interface ReportReasonItemProps {
  /** Reason info */
  reason: ReportReasonInfo;
  /** Is selected */
  isSelected: boolean;
  /** Selection handler */
  onSelect: () => void;
  /** Is disabled */
  disabled?: boolean;
  /** Test ID */
  testID?: string;
}

/**
 * ReportReasonItem component
 *
 * Single selectable report reason item with icon and label.
 */
export const ReportReasonItem = React.memo<ReportReasonItemProps>(
  ({ reason, isSelected, onSelect, disabled = false, testID }) => {
    const colors = useColors();

    return (
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? colors.interactive.subtle : colors.background.secondary,
            borderColor: isSelected ? colors.interactive.default : colors.border.default,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={onSelect}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected, disabled }}
        accessibilityLabel={reason.label}
        accessibilityHint={`${reason.label} nedenini seçmek için dokunun`}
        testID={testID}>
        <View style={styles.left}>
          <Icon
            name={reason.icon}
            size={24}
            color={isSelected ? colors.interactive.default : colors.text.secondary}
          />
          <Text
            style={[
              styles.label,
              {
                color: isSelected ? colors.interactive.pressed : colors.text.primary,
              },
            ]}>
            {reason.label}
          </Text>
        </View>
        {isSelected && (
          <Icon name="checkmark-circle" size={24} color={colors.interactive.default} />
        )}
      </TouchableOpacity>
    );
  },
);

ReportReasonItem.displayName = 'ReportReasonItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});

export default ReportReasonItem;
