// src/shared/components/ScreenHeader/ScreenHeader.tsx
// Dengin Design System - Standardized Screen Header
// Production Standard: UNIFIED_HEADER.HEIGHT = 56px

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';
import { UNIFIED_HEADER } from '@constants/layoutConstants';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';
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
        entering={FadeIn.duration(UNIFIED_TIMING.headerEnter)}
        style={[
          styles.container,
          {
            backgroundColor: backgroundColor || colors.background.primary,
            borderBottomColor: colors.border.subtle,
            borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
            height: UNIFIED_HEADER.HEIGHT, // ✅ Enforced 56px height
            paddingHorizontal: UNIFIED_HEADER.PADDING_HORIZONTAL,
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
    // height and padding set dynamically using UNIFIED_HEADER
  },
  leftSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: UNIFIED_HEADER.MIN_TAP_TARGET,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: UNIFIED_HEADER.MIN_TAP_TARGET,
  },
  subtitle: {
    marginTop: 2,
  },
  title: {
    letterSpacing: -0.4,
  },
});
