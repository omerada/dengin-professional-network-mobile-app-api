// src/shared/components/ListItem/ListItem.tsx
// Dengin Design System - ListItem Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors, useTheme } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks';
import { spring } from '@theme/animations';

import { styles } from './ListItem.styles';
import { LIST_ITEM_SIZE_CONFIG, type ListItemProps } from './ListItem.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * ListItem - Versatile list item component for settings, menus, chat lists etc.
 *
 * @example
 * // Basic usage
 * <ListItem
 *   title="Ayarlar"
 *   subtitle="Hesap ve uygulama ayarları"
 *   leftElement={<Icon name="settings-outline" size={24} />}
 *   showChevron
 *   onPress={handlePress}
 * />
 *
 * @example
 * // With avatar and badge
 * <ListItem
 *   title="Ahmet Yılmaz"
 *   subtitle="Son mesaj..."
 *   leftElement={<Avatar name="Ahmet Yılmaz" size="md" />}
 *   rightElement={<Badge count={3} />}
 *   onPress={handlePress}
 * />
 */
export const ListItem = memo<ListItemProps>(function ListItem({
  title,
  subtitle,
  description,
  leftElement,
  rightElement,
  showChevron = false,
  showDivider = false,
  dividerInset = 0,
  size = 'default',
  onPress,
  onLongPress,
  disabled = false,
  selected = false,
  haptic = true,
  style,
  titleStyle,
  subtitleStyle,
  testID,
  accessibilityLabel,
}) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { trigger: triggerHaptic } = useHaptic();
  const pressed = useSharedValue(0);

  const sizeConfig = LIST_ITEM_SIZE_CONFIG[size];

  // Press animation
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      pressed.value > 0
        ? `rgba(${isDark ? '255,255,255' : '0,0,0'}, ${pressed.value * 0.05})`
        : 'transparent',
    transform: [{ scale: 1 - pressed.value * 0.01 }],
  }));

  const handlePressIn = useCallback(() => {
    pressed.value = withSpring(1, spring.stiff);
    if (haptic) {
      triggerHaptic('light');
    }
  }, [haptic, triggerHaptic, pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, spring.stiff);
  }, [pressed]);

  // Container style
  const containerStyle = useMemo(
    () =>
      [
        styles.container,
        {
          minHeight: sizeConfig.minHeight,
          paddingVertical: sizeConfig.paddingVertical,
        },
        selected
          ? {
              ...styles.selected,
              backgroundColor: colors.interactive.default + '15',
            }
          : null,
        disabled ? styles.disabled : null,
        style || null,
      ].filter(Boolean) as ViewStyle[],
    [sizeConfig, selected, disabled, colors.interactive.default, style],
  );

  // Title style
  const titleTextStyle = useMemo(
    () => [
      styles.title,
      { fontSize: sizeConfig.titleSize, color: colors.text.primary },
      titleStyle,
    ],
    [sizeConfig.titleSize, colors.text.primary, titleStyle],
  );

  // Subtitle style
  const subtitleTextStyle = useMemo(
    () => [
      styles.subtitle,
      { fontSize: sizeConfig.subtitleSize, color: colors.text.secondary },
      subtitleStyle,
    ],
    [sizeConfig.subtitleSize, colors.text.secondary, subtitleStyle],
  );

  // Description style
  const descriptionTextStyle = useMemo(
    () => [
      styles.description,
      { fontSize: sizeConfig.descriptionSize, color: colors.text.tertiary },
    ],
    [sizeConfig.descriptionSize, colors.text.tertiary],
  );

  // Divider style
  const dividerStyle = useMemo(
    () => [
      styles.divider,
      {
        left: dividerInset || (leftElement ? sizeConfig.leftElementSpacing + 56 : 16),
        backgroundColor: colors.border.default,
      },
    ],
    [dividerInset, leftElement, sizeConfig.leftElementSpacing, colors.border.default],
  );

  const content = (
    <>
      {/* Left Element */}
      {leftElement && (
        <View style={[styles.leftContainer, { marginRight: sizeConfig.leftElementSpacing }]}>
          {leftElement}
        </View>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={titleTextStyle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={subtitleTextStyle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {description && (
          <Text style={descriptionTextStyle} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {/* Right Element */}
      {(rightElement || showChevron) && (
        <View style={[styles.rightContainer, { marginLeft: sizeConfig.rightElementSpacing }]}>
          {rightElement}
          {showChevron && (
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.text.tertiary}
              style={styles.chevron}
            />
          )}
        </View>
      )}

      {/* Divider */}
      {showDivider && <View style={dividerStyle} />}
    </>
  );

  if (onPress || onLongPress) {
    return (
      <AnimatedPressable
        style={[animatedStyle, containerStyle]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button">
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {content}
    </View>
  );
});

/**
 * ListItemSeparator - Full-width separator for FlatList
 */
export const ListItemSeparator = memo(function ListItemSeparator({
  inset = 0,
}: {
  inset?: number;
}) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.divider,
        {
          position: 'relative',
          left: inset,
          right: 0,
          backgroundColor: colors.border.default,
        },
      ]}
    />
  );
});

/**
 * ListItemGroup - Group multiple ListItems with header
 */
export interface ListItemGroupProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ListItemGroup = memo<ListItemGroupProps>(function ListItemGroup({
  title,
  children,
  style,
}) {
  const colors = useColors();

  return (
    <View style={style}>
      {title && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: colors.text.secondary,
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
          {title}
        </Text>
      )}
      <View
        style={{
          backgroundColor: colors.background.secondary,
          borderRadius: 12,
          marginHorizontal: 16,
          overflow: 'hidden',
        }}>
        {children}
      </View>
    </View>
  );
});
