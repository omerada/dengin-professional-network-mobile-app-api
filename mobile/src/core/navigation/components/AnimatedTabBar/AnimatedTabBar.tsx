// src/core/navigation/components/AnimatedTabBar/AnimatedTabBar.tsx
// Meslektaş Design System - Modern AnimatedTabBar Component
// Oku: mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md

import React, { memo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolateColor,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';
import { styles, TAB_ICON_SIZE, CENTER_FAB_ICON_SIZE } from './AnimatedTabBar.styles';
import type { AnimatedTabBarProps, TabButtonProps } from './AnimatedTabBar.types';

// ============================================================================
// TabButton Component
// ============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabButton: React.FC<TabButtonProps> = memo(({ item, focused, onPress, onLongPress }) => {
  const colors = useColors();
  const { trigger } = useHaptic();

  // Determine if this is the center FAB
  const isCenterFab = item.isCenterFab ?? false;

  // Animation values
  const scale = useSharedValue(1);
  const focusProgress = useSharedValue(focused ? 1 : 0);

  // Update focus animation
  useEffect(() => {
    focusProgress.value = withSpring(focused ? 1 : 0, spring.snappy);

    if (focused && !isCenterFab) {
      // Very subtle bounce when focused - reduced animation (normal tabs only)
      scale.value = withSequence(
        withSpring(1.05, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 250 }),
      );
    }
  }, [focused, focusProgress, scale, isCenterFab]);

  // Handle press
  const handlePress = useCallback(() => {
    trigger('selection');
    scale.value = withSequence(withSpring(0.92, spring.press), withSpring(1, spring.snappy));
    onPress();
  }, [onPress, trigger, scale]);

  // Handle long press
  const handleLongPress = useCallback(() => {
    trigger('heavy');
    onLongPress();
  }, [onLongPress, trigger]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      ['transparent', colors.interactive.focus],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.text.tertiary, colors.interactive.default],
    ),
    opacity: 0.7 + focusProgress.value * 0.3,
  }));

  const iconColor = focused ? colors.interactive.default : colors.text.tertiary;

  // Center FAB rendering (elevated button)
  if (isCenterFab) {
    const fabContainerStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <View style={styles.centerFabContainer}>
        <AnimatedPressable
          style={[
            styles.centerFabButton,
            fabContainerStyle,
            { backgroundColor: colors.interactive.default },
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          accessibilityRole="button"
          accessibilityLabel={item.accessibilityLabel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name={item.icon} size={CENTER_FAB_ICON_SIZE} color={colors.text.inverse} />
        </AnimatedPressable>
        {item.label && (
          <Text style={[styles.centerFabLabel, { color: colors.text.secondary }]}>
            {item.label}
          </Text>
        )}
      </View>
    );
  }

  // Normal tab button rendering
  return (
    <AnimatedPressable
      style={[styles.tabButton, containerStyle]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="tab"
      accessibilityLabel={item.accessibilityLabel}
      accessibilityState={{ selected: focused }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
        <Icon
          name={focused ? item.focusedIcon : item.icon}
          size={TAB_ICON_SIZE}
          color={iconColor}
        />

        {/* Badge */}
        {item.badgeCount !== undefined && item.badgeCount > 0 && (
          <Animated.View
            entering={ZoomIn.springify()}
            style={[
              styles.badgeContainer,
              {
                backgroundColor: colors.status.error,
                borderColor: colors.background.primary,
              },
            ]}>
            <Text style={[styles.badgeText, { color: colors.text.inverse }]}>
              {item.badgeCount > 99 ? '99+' : item.badgeCount}
            </Text>
          </Animated.View>
        )}

        {/* Dot badge */}
        {item.showDot && (
          <Animated.View
            entering={ZoomIn.springify()}
            style={[styles.dotBadge, { backgroundColor: colors.status.error }]}
          />
        )}
      </Animated.View>

      <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {item.label}
      </Animated.Text>
    </AnimatedPressable>
  );
});

TabButton.displayName = 'TabButton';

// ============================================================================
// AnimatedTabBar Component
// ============================================================================

/**
 * Modern AnimatedTabBar Component
 *
 * Features:
 * - Spring-based animations on press
 * - Focus indicator with smooth transitions
 * - Badge and dot support
 * - Haptic feedback
 * - Safe area aware
 *
 * @example
 * ```tsx
 * <Tab.Navigator
 *   tabBar={(props) => (
 *     <AnimatedTabBar
 *       {...props}
 *       tabs={[
 *         { name: 'FeedTab', label: 'Ana Sayfa', icon: 'home-outline', focusedIcon: 'home' },
 *         { name: 'MessagingTab', label: 'Mesajlar', icon: 'chatbubble-outline', focusedIcon: 'chatbubble', badgeCount: 3 },
 *       ]}
 *     />
 *   )}
 * >
 * ```
 */
export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = memo(
  ({ state, navigation, tabs, style, testID }) => {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // Calculate proper bottom padding with safe area
    const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);

    const containerStyle = [
      styles.container,
      {
        paddingBottom: bottomPadding,
        borderTopColor: colors.border.default,
        backgroundColor: colors.background.primary,
      },
      style,
    ];

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        testID={testID}
        style={{ backgroundColor: colors.background.primary }}>
        {/* Background overlay - removed absolute positioning */}
        <View style={{ backgroundColor: colors.background.primary }}>
          <View style={containerStyle}>
            {state.routes.map((route, index) => {
              const tab = tabs.find(t => t.name === route.name);
              if (!tab) return null;

              const focused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              return (
                <TabButton
                  key={route.key}
                  item={tab}
                  focused={focused}
                  index={index}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            })}
          </View>
        </View>
      </Animated.View>
    );
  },
);

AnimatedTabBar.displayName = 'AnimatedTabBar';

export default AnimatedTabBar;
