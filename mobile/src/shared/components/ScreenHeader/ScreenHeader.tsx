// src/shared/components/ScreenHeader/ScreenHeader.tsx
// Meslektaş Design System - Standardized Screen Header
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Section 1.2

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { BackButton } from '../BackButton';

import type { ScreenHeaderProps } from './ScreenHeader.types';
import { SCREEN_HEADER_VARIANTS } from './ScreenHeader.types';

/**
 * ScreenHeader Component
 *
 * Standardized header for all screens.
 * Ensures consistent layout, spacing, and behavior.
 *
 * Features:
 * - Consistent layout (left: back button, center: title, right: custom element)
 * - Multiple variants (default, large, minimal)
 * - Animated entrance
 * - Optional subtitle
 * - Optional border
 *
 * @example
 * ```tsx
 * // Default header with title
 * <ScreenHeader title="Bildirimler" />
 *
 * // Header with subtitle
 * <ScreenHeader
 *   title="Bildirimler"
 *   subtitle="3 okunmamış"
 * />
 *
 * // Large variant
 * <ScreenHeader
 *   title="Profil"
 *   variant="large"
 *   rightElement={<SettingsButton />}
 * />
 *
 * // No back button
 * <ScreenHeader
 *   title="Ana Sayfa"
 *   showBackButton={false}
 *   rightElement={<NotificationButton />}
 * />
 *
 * // Custom back handler
 * <ScreenHeader
 *   title="Kayıt"
 *   onBackPress={() => navigation.replace('Welcome')}
 * />
 * ```
 */
export const ScreenHeader = memo<ScreenHeaderProps>(
  ({
    title,
    subtitle,
    showBackButton = true,
    onBackPress,
    rightElement,
    variant = 'default',
    showBorder = true,
    backgroundColor,
    style,
    testID = 'screen-header',
  }) => {
    const colors = useColors();
    const variantConfig = SCREEN_HEADER_VARIANTS[variant];

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.container,
          {
            backgroundColor: backgroundColor || colors.background.primary,
            borderBottomColor: colors.border.subtle,
            borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
            minHeight: variantConfig.minHeight,
            paddingVertical: variant === 'large' ? spacing.md : spacing.sm,
          },
          style,
        ]}
        testID={testID}>
        {/* Left Section - Back Button */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <BackButton
              onPress={onBackPress}
              variant={variant === 'minimal' ? 'default' : 'circular'}
              size={variant === 'large' ? 'lg' : 'md'}
            />
          )}
        </View>

        {/* Center Section - Title & Subtitle */}
        <View style={styles.centerSection}>
          {title && (
            <Text
              style={[
                styles.title,
                {
                  color: colors.text.primary,
                  fontSize: variantConfig.titleFontSize,
                  fontWeight: variantConfig.titleFontWeight,
                },
              ]}
              numberOfLines={1}
              accessibilityRole="header">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.text.tertiary,
                  fontSize: variantConfig.subtitleFontSize,
                },
              ]}
              numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section - Custom Element */}
        <View style={styles.rightSection}>{rightElement}</View>
      </Animated.View>
    );
  },
);

ScreenHeader.displayName = 'ScreenHeader';

const styles = StyleSheet.create({
  centerSection: {
    alignItems: 'center',
    flex: 1,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  leftSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 44,
  },
  subtitle: {
    marginTop: 2,
  },
  title: {
    letterSpacing: -0.4,
  },
});
