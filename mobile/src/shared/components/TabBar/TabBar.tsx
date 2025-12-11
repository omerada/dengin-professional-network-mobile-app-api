// src/shared/components/TabBar/TabBar.tsx
// Meslektaş Design System - Animated Tab Bar Component
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spring } from '@theme/animations';

// ============================================================================
// Types
// ============================================================================

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  badge?: number;
}

export interface TabBarProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Currently selected tab key */
  selectedKey: string;
  /** Tab change handler */
  onTabChange: (key: string) => void;
  /** Visual variant */
  variant?: 'default' | 'pills' | 'underline';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Container style */
  style?: ViewStyle;
  /** Enable haptic feedback */
  haptic?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SIZE_CONFIG = {
  sm: { height: 36, fontSize: 13, iconSize: 18, padding: 12 },
  md: { height: 44, fontSize: 14, iconSize: 20, padding: 16 },
  lg: { height: 52, fontSize: 16, iconSize: 24, padding: 20 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// Component
// ============================================================================

/**
 * TabBar - Animated tab bar with multiple variants
 *
 * @example
 * <TabBar
 *   tabs={[
 *     { key: 'posts', label: 'Gönderiler', icon: 'grid-outline' },
 *     { key: 'likes', label: 'Beğeniler', icon: 'heart-outline' },
 *     { key: 'saved', label: 'Kaydedilenler', icon: 'bookmark-outline' },
 *   ]}
 *   selectedKey={selectedTab}
 *   onTabChange={setSelectedTab}
 *   variant="underline"
 * />
 */
export const TabBar = memo<TabBarProps>(function TabBar({
  tabs,
  selectedKey,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = true,
  style,
  haptic = true,
}) {
  const colors = useColors();
  const { trigger: triggerHaptic } = useHaptic();
  const sizeConfig = SIZE_CONFIG[size];

  // Track tab positions for indicator animation
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabWidths = useSharedValue<Record<string, { x: number; width: number }>>({});

  // Handle tab press
  const handleTabPress = useCallback(
    (key: string) => {
      if (haptic) {
        triggerHaptic('selection');
      }

      // Animate indicator
      const tabLayout = tabWidths.value[key];
      if (tabLayout) {
        indicatorPosition.value = withSpring(tabLayout.x, spring.stiff);
        indicatorWidth.value = withSpring(tabLayout.width, spring.stiff);
      }

      onTabChange(key);
    },
    [haptic, triggerHaptic, onTabChange, indicatorPosition, indicatorWidth, tabWidths],
  );

  // Handle tab layout
  const handleTabLayout = useCallback(
    (key: string, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      tabWidths.value = { ...tabWidths.value, [key]: { x, width } };

      // Initialize indicator position for selected tab
      if (key === selectedKey) {
        indicatorPosition.value = x;
        indicatorWidth.value = width;
      }
    },
    [selectedKey, indicatorPosition, indicatorWidth, tabWidths],
  );

  // Indicator animated style
  const indicatorStyle = useAnimatedStyle(() => {
    if (variant === 'underline') {
      return {
        position: 'absolute',
        bottom: 0,
        height: 3,
        backgroundColor: colors.interactive.default,
        borderRadius: 1.5,
        left: indicatorPosition.value,
        width: indicatorWidth.value,
      };
    }

    if (variant === 'pills') {
      return {
        position: 'absolute',
        top: 4,
        bottom: 4,
        backgroundColor: colors.interactive.default,
        borderRadius: sizeConfig.height / 2 - 4,
        left: indicatorPosition.value,
        width: indicatorWidth.value,
      };
    }

    return {};
  });

  // Container style
  const containerStyle = useMemo<ViewStyle[]>(
    () =>
      [
        styles.container,
        {
          backgroundColor: variant === 'pills' ? colors.background.secondary : 'transparent',
          borderRadius: variant === 'pills' ? sizeConfig.height / 2 : 0,
          borderBottomWidth: variant === 'underline' ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: colors.border.default,
        },
        style ?? null,
      ].filter(Boolean) as ViewStyle[],
    [variant, colors, sizeConfig.height, style],
  );

  return (
    <View style={containerStyle}>
      {/* Indicator */}
      {(variant === 'underline' || variant === 'pills') && <Animated.View style={indicatorStyle} />}

      {/* Tabs */}
      {tabs.map(tab => (
        <TabItem
          key={tab.key}
          tab={tab}
          isSelected={selectedKey === tab.key}
          variant={variant}
          sizeConfig={sizeConfig}
          fullWidth={fullWidth}
          onPress={() => handleTabPress(tab.key)}
          onLayout={e => handleTabLayout(tab.key, e)}
          colors={colors}
        />
      ))}
    </View>
  );
});

// ============================================================================
// TabItem Component
// ============================================================================

interface TabItemComponentProps {
  tab: TabItem;
  isSelected: boolean;
  variant: TabBarProps['variant'];
  sizeConfig: typeof SIZE_CONFIG.md;
  fullWidth: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  colors: ReturnType<typeof useColors>;
}

const TabItem = memo<TabItemComponentProps>(function TabItem({
  tab,
  isSelected,
  variant,
  sizeConfig,
  fullWidth,
  onPress,
  onLayout,
  colors,
}) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.05 }],
  }));

  const textStyle = useAnimatedStyle(() => {
    const color = isSelected ? colors.interactive.default : colors.text.secondary;
    return { color };
  });

  const handlePressIn = useCallback(() => {
    pressed.value = withSpring(1, spring.stiff);
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(0, spring.stiff);
  }, [pressed]);

  return (
    <AnimatedPressable
      style={[
        styles.tab,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.padding,
          flex: fullWidth ? 1 : undefined,
        },
        variant === 'pills' && isSelected && { zIndex: 1 },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={onLayout}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={tab.label}>
      {tab.icon && (
        <Icon
          name={isSelected ? tab.icon.replace('-outline', '') : tab.icon}
          size={sizeConfig.iconSize}
          color={isSelected ? colors.interactive.default : colors.text.secondary}
          style={styles.tabIcon}
        />
      )}
      <Animated.Text
        style={[
          styles.tabLabel,
          {
            fontSize: sizeConfig.fontSize,
            fontWeight: isSelected ? '600' : '500',
          },
          textStyle,
        ]}
        numberOfLines={1}>
        {tab.label}
      </Animated.Text>
      {tab.badge !== undefined && tab.badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.status.error }]}>
          <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    textAlign: 'center',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '700',
  },
});
