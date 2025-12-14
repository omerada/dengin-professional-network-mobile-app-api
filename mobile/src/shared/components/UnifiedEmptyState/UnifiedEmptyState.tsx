// src/shared/components/UnifiedEmptyState/UnifiedEmptyState.tsx
// Unified Empty State System - Production Ready
// Tüm empty state'ler için standardize edilmiş component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
import { Button } from '../Button';
import { UNIFIED_TIMING } from '@constants';

interface ActionConfig {
  label: string;
  icon?: string;
  onPress: () => void;
}

interface UnifiedEmptyStateProps {
  /** Icon name (Ionicons) */
  icon: string;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Primary action button */
  primaryAction?: ActionConfig;
  /** Secondary action button */
  secondaryAction?: ActionConfig;
  /** Icon color override */
  iconColor?: string;
  /** Test ID */
  testID?: string;
}

/**
 * Unified Empty State Component
 *
 * Tüm empty state senaryoları için tek bir standardize edilmiş UI.
 *
 * KULLANIM:
 *
 * ```tsx
 * // No messages
 * <UnifiedEmptyState
 *   icon="chatbubbles-outline"
 *   title="Henüz Mesajınız Yok"
 *   description="Profesyonellerle sohbet başlatın ve ağınızı genişletin"
 *   primaryAction={{
 *     label: 'Yeni Sohbet Başlat',
 *     icon: 'add-circle-outline',
 *     onPress: () => navigation.navigate('NewConversation'),
 *   }}
 * />
 *
 * // No notifications
 * <UnifiedEmptyState
 *   icon="notifications-outline"
 *   title="Tüm Bildirimler Okundu"
 *   description="Yeni aktiviteler burada görünecek"
 * />
 * ```
 */
export const UnifiedEmptyState: React.FC<UnifiedEmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  iconColor,
  testID,
}) => {
  const colors = useColors();

  return (
    <Animated.View
      testID={testID}
      entering={FadeInDown.duration(UNIFIED_TIMING.screenEnter)}
      style={styles.container}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.background.secondary }]}>
        <Icon name={icon} size={64} color={iconColor || colors.text.tertiary} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>

      {/* Description */}
      <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>

      {/* Actions */}
      {primaryAction && (
        <View style={styles.actionsContainer}>
          <Button
            title={primaryAction.label}
            onPress={primaryAction.onPress}
            variant="primary"
            size="lg"
            leftIcon={
              primaryAction.icon ? (
                <Icon name={primaryAction.icon} size={20} color="#FFFFFF" />
              ) : undefined
            }
            style={styles.primaryButton}
          />

          {secondaryAction && (
            <Button
              title={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="ghost"
              size="md"
              leftIcon={
                secondaryAction.icon ? (
                  <Icon name={secondaryAction.icon} size={18} color={colors.interactive.default} />
                ) : undefined
              }
              style={styles.secondaryButton}
            />
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    maxWidth: 300,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  secondaryButton: {
    width: '100%',
  },
});
