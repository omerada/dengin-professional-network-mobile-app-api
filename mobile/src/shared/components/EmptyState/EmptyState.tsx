// src/shared/components/EmptyState/EmptyState.tsx
// @deprecated This component is deprecated. Use UnifiedEmptyState instead.
// UnifiedEmptyState provides a simpler, more consistent API with standardized semantics.
// This file will be removed in a future version.
//
// Migration guide:
// OLD: <EmptyState icon="x" title="y" message="z" action={{ title: "a", onPress: fn }} />
// NEW: <UnifiedEmptyState icon="x" title="y" description="z" primaryAction={{ label: "a", onPress: fn }} />

import React, { memo } from 'react';
import { StyleSheet, ViewStyle, Image } from 'react-native';
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
  /** Custom image source (alternative to icon) */
  customImage?: any;
  /** Icon color override */
  iconColor?: string;
  /** Main title text */
  title: string;
  /** Optional description message */
  description?: string;
  /** @deprecated Use description instead */
  message?: string;
  /** Action configuration */
  action?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  /** @deprecated Use action instead */
  actionLabel?: string;
  /** @deprecated Use action instead */
  onAction?: () => void;
  /** Secondary action configuration */
  secondaryAction?: {
    title: string;
    onPress: () => void;
  };
  /** @deprecated Use secondaryAction instead */
  secondaryActionLabel?: string;
  /** @deprecated Use secondaryAction instead */
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
  icon?: string;
  customImage?: any;
  iconColor: string;
  backgroundColor: string;
  floating: boolean;
}

const FloatingIcon: React.FC<FloatingIconProps> = memo(
  ({ icon, customImage, iconColor, backgroundColor, floating }) => {
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
        {customImage ? (
          <Image source={customImage} style={styles.customImage} resizeMode="contain" />
        ) : (
          <Icon name={icon || 'file-tray-outline'} size={48} color={iconColor} />
        )}
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
    customImage,
    iconColor,
    title,
    description,
    message, // deprecated
    action,
    actionLabel, // deprecated
    onAction, // deprecated
    secondaryAction,
    secondaryActionLabel, // deprecated
    onSecondaryAction, // deprecated
    animated = true,
    floatingIcon = false,
    style,
    testID,
  }) => {
    const { colors } = useTheme();

    // Backwards compatibility
    const displayDescription = description || message;
    const displayAction =
      action ||
      (actionLabel && onAction
        ? { title: actionLabel, onPress: onAction, variant: 'primary' as const }
        : undefined);
    const displaySecondaryAction =
      secondaryAction ||
      (secondaryActionLabel && onSecondaryAction
        ? { title: secondaryActionLabel, onPress: onSecondaryAction }
        : undefined);

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
        accessibilityLabel={`${title}. ${displayDescription || ''}`}>
        <FloatingIcon
          icon={icon}
          customImage={customImage}
          iconColor={iconColor || colors.text.tertiary}
          backgroundColor={colors.background.secondary}
          floating={floatingIcon}
        />

        <Animated.Text
          entering={titleEntering}
          style={[styles.title, { color: colors.text.primary }]}>
          {title}
        </Animated.Text>

        {displayDescription && (
          <Animated.Text
            entering={messageEntering}
            style={[styles.message, { color: colors.text.secondary }]}>
            {displayDescription}
          </Animated.Text>
        )}

        {(displayAction || displaySecondaryAction) && (
          <Animated.View entering={buttonEntering} style={styles.buttonContainer}>
            {displayAction && (
              <Button
                title={displayAction.title}
                onPress={displayAction.onPress}
                variant={displayAction.variant || 'primary'}
                size="md"
                style={styles.button}
              />
            )}

            {displaySecondaryAction && (
              <Button
                title={displaySecondaryAction.title}
                onPress={displaySecondaryAction.onPress}
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
  button: {
    minWidth: 160,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 96,
  },
  customImage: {
    height: 56,
    width: 56,
  },
  message: {
    fontSize: fontSize.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
    maxWidth: 280,
    textAlign: 'center',
  },
  secondaryButton: {
    minWidth: 160,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default EmptyState;
