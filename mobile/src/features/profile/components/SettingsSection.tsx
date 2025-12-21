// src/features/profile/components/SettingsSection.tsx
// Settings section with title and items
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { SettingsItem } from './SettingsItem';
import type { SettingsSectionType } from '../types';

interface SettingsSectionProps extends SettingsSectionType {
  /**
   * Loading states for items (key: item id)
   */
  loadingStates?: Record<string, boolean>;
}

/**
 * SettingsSection Component
 *
 * Groups related settings items under a title
 */
export const SettingsSection: React.FC<SettingsSectionProps> = memo(
  ({ title, items, loadingStates = {} }) => {
    const colors = useColors();

    return (
      <View style={styles.container}>
        {/* Section Title */}
        <Text style={[styles.title, { color: colors.text.secondary }]}>{title}</Text>

        {/* Items */}
        <View
          style={[
            styles.itemsContainer,
            {
              backgroundColor: colors.background.primary,
              borderColor: colors.border.default,
            },
          ]}>
          {items.map((item, index) => (
            <View key={item.id}>
              <SettingsItem {...item} isLoading={loadingStates[item.id]} />
              {index < items.length - 1 && (
                <View style={[styles.separator, { backgroundColor: colors.border.default }]} />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  },
);

SettingsSection.displayName = 'SettingsSection';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  itemsContainer: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  separator: {
    height: 1,
    marginLeft: 66, // icon width + padding
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    textTransform: 'uppercase',
  },
});
