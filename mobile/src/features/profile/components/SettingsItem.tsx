// src/features/profile/components/SettingsItem.tsx
// Settings list item component
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import type { SettingsItemType } from '../types';

interface SettingsItemProps extends SettingsItemType {
  /**
   * Whether item is loading
   */
  isLoading?: boolean;
}

/**
 * SettingsItem Component
 *
 * Displays a single settings item with support for:
 * - Navigation (with chevron)
 * - Toggle (with switch)
 * - Action (just text)
 * - Danger (red text for destructive actions)
 */
export const SettingsItem: React.FC<SettingsItemProps> = memo(
  ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id,
    title,
    subtitle,
    icon,
    type,
    value,
    onPress,
    onToggle,
    isLoading = false,
  }) => {
    const colors = useColors();

    const handlePress = useCallback(() => {
      if (!isLoading && onPress) {
        onPress();
      }
    }, [isLoading, onPress]);

    const handleToggle = useCallback(
      (newValue: boolean) => {
        if (!isLoading && onToggle) {
          onToggle(newValue);
        }
      },
      [isLoading, onToggle],
    );

    // Determine colors based on type
    const textColor = type === 'danger' ? colors.status.error : colors.text.primary;
    const iconColor = type === 'danger' ? colors.status.error : colors.text.secondary;

    const content = (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.background.secondary }]}>
          <Icon name={icon} size={20} color={iconColor} />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.text.secondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightContainer}>
          {isLoading && <ActivityIndicator size="small" color={colors.interactive.default} />}

          {!isLoading && type === 'toggle' && (
            <Switch
              value={value}
              onValueChange={handleToggle}
              trackColor={{
                false: colors.border.default,
                true: colors.interactive.default,
              }}
              thumbColor="#FFFFFF"
            />
          )}

          {!isLoading && type === 'navigation' && (
            <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
          )}
        </View>
      </View>
    );

    // Toggle items don't need to be wrapped in TouchableOpacity
    if (type === 'toggle') {
      return content;
    }

    return (
      <TouchableOpacity onPress={handlePress} disabled={isLoading} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  },
);

SettingsItem.displayName = 'SettingsItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
