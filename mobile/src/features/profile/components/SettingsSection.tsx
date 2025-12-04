// src/features/profile/components/SettingsSection.tsx
// Settings section with title and items
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
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
    const { theme } = useTheme();

    return (
      <View style={styles.container}>
        {/* Section Title */}
        <Text style={[styles.title, { color: theme.colors.text.secondary }]}>
          {title}
        </Text>

        {/* Items */}
        <View
          style={[
            styles.itemsContainer,
            {
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.light,
            },
          ]}
        >
          {items.map((item, index) => (
            <View key={item.id}>
              <SettingsItem {...item} isLoading={loadingStates[item.id]} />
              {index < items.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: theme.colors.border.light },
                  ]}
                />
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
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  separator: {
    height: 1,
    marginLeft: 66, // icon width + padding
  },
});
