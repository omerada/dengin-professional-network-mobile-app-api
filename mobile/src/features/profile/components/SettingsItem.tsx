// src/features/profile/components/SettingsItem.tsx
// Settings list item component
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks';
import { PressableScale } from '@shared/components';
import { spacing, fontSize, borderRadius } from '@theme';
import { HAPTIC_TYPES } from '@constants';
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
  ({ id: _id, title, subtitle, icon, type, value, onPress, onToggle, isLoading = false }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    const handlePress = useCallback(() => {
      if (!isLoading && onPress) {
        // Haptic feedback based on type
        if (type === 'danger') {
          trigger(HAPTIC_TYPES.warning);
        } else {
          trigger(HAPTIC_TYPES.buttonPress);
        }
        onPress();
      }
    }, [isLoading, onPress, type, trigger]);

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
              thumbColor={colors.background.primary}
            />
          )}

          {!isLoading && type === 'navigation' && (
            <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
          )}
        </View>
      </View>
    );

    // Toggle items don't need to be wrapped in PressableScale
    if (type === 'toggle') {
      return content;
    }

    return (
      <PressableScale
        onPress={handlePress}
        disabled={isLoading}
        activeScale={0.98}
        haptic
        hapticType={type === 'danger' ? 'heavy' : 'light'}>
        {content}
      </PressableScale>
    );
  },
);

SettingsItem.displayName = 'SettingsItem';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 36,
  },
  rightContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
});
