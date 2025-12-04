// src/shared/components/EmptyState/EmptyState.tsx
// Boş durum komponenti
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART4.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { Button } from '../Button';

interface EmptyStateProps {
  /**
   * Icon name from Ionicons
   * @default 'file-tray-outline'
   */
  icon?: string;
  /**
   * Main title text
   */
  title: string;
  /**
   * Optional description message
   */
  message?: string;
  /**
   * Optional action button label
   */
  actionLabel?: string;
  /**
   * Callback when action button is pressed
   */
  onAction?: () => void;
  /**
   * Additional container styles
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * EmptyState Component
 *
 * Displays a friendly message when there's no content to show.
 * Commonly used for empty lists, search results, or initial states.
 *
 * @example
 * ```tsx
 * // Basic empty state
 * <EmptyState
 *   title="Henüz gönderi yok"
 *   message="İlk gönderinizi paylaşın!"
 * />
 *
 * // With action button
 * <EmptyState
 *   icon="people-outline"
 *   title="Henüz takipçi yok"
 *   message="Paylaşımlarınız ile topluluğunuzu oluşturun."
 *   actionLabel="Keşfet"
 *   onAction={() => navigation.navigate('Explore')}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({ icon = 'file-tray-outline', title, message, actionLabel, onAction, style, testID }) => {
    const { theme } = useTheme();

    return (
      <View style={[styles.container, style]} testID={testID}>
        <View
          style={[styles.iconContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <Icon name={icon} size={48} color={theme.colors.text.tertiary} />
        </View>

        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>

        {message && (
          <Text style={[styles.message, { color: theme.colors.text.secondary }]}>{message}</Text>
        )}

        {actionLabel && onAction && (
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="md"
            style={styles.button}
          />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});

EmptyState.displayName = 'EmptyState';
