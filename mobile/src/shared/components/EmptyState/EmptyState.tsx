// src/shared/components/EmptyState/EmptyState.tsx
// Meslektaş Design System - Modern EmptyState Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import { Button } from '../Button';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateProps {
  /** Icon name from Ionicons */
  icon?: string;
  /** Main title text */
  title: string;
  /** Optional description message */
  message?: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Callback when action button is pressed */
  onAction?: () => void;
  /** Secondary action button label */
  secondaryActionLabel?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Animated entrance */
  animated?: boolean;
  /** Subtle floating animation for icon */
  floatingIcon?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// Animated Icon Component
// ============================================================================

interface FloatingIconProps {
  icon: string;
  iconColor: string;
  backgroundColor: string;
  floating: boolean;
}

const FloatingIcon: React.FC<FloatingIconProps> = memo(
  ({ icon, iconColor, backgroundColor, floating }) => {
    const translateY = useSharedValue(0);

    React.useEffect(() => {
      if (floating) {
        translateY.value = withRepeat(
          withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          -1,
          true,
        );
      }
    }, [floating, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <Animated.View style={[styles.iconContainer, { backgroundColor }, floating && animatedStyle]}>
        <Icon name={icon} size={48} color={iconColor} />
      </Animated.View>
    );
  },
);

FloatingIcon.displayName = 'FloatingIcon';

// ============================================================================
// EmptyState Component
// ============================================================================

/**
 * Modern EmptyState Component
 *
 * Features:
 * - Animated entrance with staggered elements
 * - Optional floating icon animation
 * - Primary and secondary actions
 * - Theme-aware styling
 * - Accessibility support
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
 *   floatingIcon
 * />
 *
 * // With dual actions
 * <EmptyState
 *   icon="search-outline"
 *   title="Sonuç bulunamadı"
 *   message="Farklı anahtar kelimeler deneyin."
 *   actionLabel="Yeniden Ara"
 *   onAction={handleRetry}
 *   secondaryActionLabel="Filtreleri Temizle"
 *   onSecondaryAction={handleClearFilters}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({
    icon = 'file-tray-outline',
    title,
    message,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    animated = true,
    floatingIcon = false,
    style,
    testID,
  }) => {
    const { colors } = useTheme();

    // Entering animations for staggered reveal
    const containerEntering = animated ? FadeIn.duration(300) : undefined;
    const titleEntering = animated ? FadeInUp.delay(100).duration(300) : undefined;
    const messageEntering = animated ? FadeInUp.delay(200).duration(300) : undefined;
    const buttonEntering = animated ? FadeInUp.delay(300).duration(300) : undefined;

    return (
      <Animated.View
        entering={containerEntering}
        style={[styles.container, style]}
        testID={testID}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`${title}. ${message || ''}`}>
        <FloatingIcon
          icon={icon}
          iconColor={colors.text.tertiary}
          backgroundColor={colors.background.secondary}
          floating={floatingIcon}
        />

        <Animated.Text
          entering={titleEntering}
          style={[styles.title, { color: colors.text.primary }]}>
          {title}
        </Animated.Text>

        {message && (
          <Animated.Text
            entering={messageEntering}
            style={[styles.message, { color: colors.text.secondary }]}>
            {message}
          </Animated.Text>
        )}

        {(actionLabel || secondaryActionLabel) && (
          <Animated.View entering={buttonEntering} style={styles.buttonContainer}>
            {actionLabel && onAction && (
              <Button
                title={actionLabel}
                onPress={onAction}
                variant="primary"
                size="md"
                style={styles.button}
              />
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <Button
                title={secondaryActionLabel}
                onPress={onSecondaryAction}
                variant="outline"
                size="md"
                style={styles.secondaryButton}
              />
            )}
          </Animated.View>
        )}
      </Animated.View>
    );
  },
);

EmptyState.displayName = 'EmptyState';

// ============================================================================
// Styles
// ============================================================================

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
    maxWidth: 280,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    minWidth: 160,
  },
  secondaryButton: {
    minWidth: 160,
  },
});

export default EmptyState;
