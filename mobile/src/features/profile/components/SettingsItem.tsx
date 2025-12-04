// src/features/profile/components/SettingsItem.tsx
// Settings list item component
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
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
    const { theme } = useTheme();

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
    const textColor =
      type === 'danger' ? theme.colors.error[500] : theme.colors.text.primary;
    const iconColor =
      type === 'danger' ? theme.colors.error[500] : theme.colors.text.secondary;

    const content = (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.background.secondary },
          ]}
        >
          <Icon name={icon} size={20} color={iconColor} />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: theme.colors.text.tertiary }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightContainer}>
          {isLoading && <ActivityIndicator size="small" color={theme.colors.primary[500]} />}

          {!isLoading && type === 'toggle' && (
            <Switch
              value={value}
              onValueChange={handleToggle}
              trackColor={{
                false: theme.colors.border.medium,
                true: theme.colors.primary[500],
              }}
              thumbColor="#FFFFFF"
            />
          )}

          {!isLoading && type === 'navigation' && (
            <Icon
              name="chevron-forward"
              size={20}
              color={theme.colors.text.tertiary}
            />
          )}
        </View>
      </View>
    );

    // Toggle items don't need to be wrapped in TouchableOpacity
    if (type === 'toggle') {
      return content;
    }

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.7}
      >
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
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
