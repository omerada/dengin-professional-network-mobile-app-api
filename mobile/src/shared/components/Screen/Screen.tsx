// src/shared/components/Screen/Screen.tsx
// Screen wrapper bileşeni - SafeAreaView wrapper
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useColors, useTheme } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { Loading } from '../Loading';

/**
 * Screen padding options
 */
export type ScreenPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Screen props
 */
export interface ScreenProps {
  /** Children */
  children: React.ReactNode;
  /** Safe area edges */
  edges?: Edge[];
  /** Enable scroll */
  scroll?: boolean;
  /** Padding */
  padding?: ScreenPadding;
  /** Background color override */
  backgroundColor?: string;
  /** Status bar style */
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  /** Enable keyboard avoiding */
  keyboardAvoiding?: boolean;
  /** Keyboard vertical offset */
  keyboardVerticalOffset?: number;
  /** Is loading */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Refreshing state */
  refreshing?: boolean;
  /** On refresh callback */
  onRefresh?: () => void;
  /** Center content */
  centerContent?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Content container style (for scroll) */
  contentContainerStyle?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Screen component
 *
 * Wrapper component that provides consistent screen layout with
 * SafeAreaView, optional scrolling, keyboard avoiding, and loading states.
 */
export const Screen = React.memo<ScreenProps>(
  ({
    children,
    edges = ['top', 'bottom'],
    scroll = false,
    padding = 'md',
    backgroundColor,
    statusBarStyle,
    keyboardAvoiding = true,
    keyboardVerticalOffset = 0,
    loading = false,
    loadingMessage,
    refreshing = false,
    onRefresh,
    centerContent = false,
    style,
    contentContainerStyle,
    testID,
  }) => {
    const colors = useColors();
    const { isDark } = useTheme();

    const bgColor = backgroundColor ?? colors.background.primary;
    const barStyle = statusBarStyle ?? (isDark ? 'light-content' : 'dark-content');

    // Padding values
    const paddingValues = useMemo(
      () => ({
        none: 0,
        sm: spacing['2'],
        md: spacing['4'],
        lg: spacing['6'],
      }),
      [],
    );

    const paddingValue = paddingValues[padding];

    // Content styles
    const contentStyle = useMemo<ViewStyle>(
      () => ({
        flex: 1,
        padding: paddingValue,
        ...(centerContent && {
          justifyContent: 'center',
          alignItems: 'center',
        }),
        ...style,
      }),
      [paddingValue, centerContent, style],
    );

    // Scroll content container style
    const scrollContentStyle = useMemo<ViewStyle>(
      () => ({
        flexGrow: 1,
        padding: paddingValue,
        ...(centerContent && {
          justifyContent: 'center',
          alignItems: 'center',
        }),
        ...contentContainerStyle,
      }),
      [paddingValue, centerContent, contentContainerStyle],
    );

    // RefreshControl colors
    const refreshControlColor = colors.interactive.default;

    // Loading overlay
    if (loading) {
      return (
        <SafeAreaView
          style={[styles.container, { backgroundColor: bgColor }]}
          edges={edges}
          testID={testID}>
          <StatusBar barStyle={barStyle} backgroundColor={bgColor} />
          <Loading fullScreen message={loadingMessage} />
        </SafeAreaView>
      );
    }

    // Render content
    const renderContent = () => {
      if (scroll) {
        return (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={scrollContentStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={refreshControlColor}
                  colors={[refreshControlColor]}
                />
              ) : undefined
            }>
            {children}
          </ScrollView>
        );
      }

      return <View style={contentStyle}>{children}</View>;
    };

    // With keyboard avoiding
    if (keyboardAvoiding && Platform.OS === 'ios') {
      return (
        <SafeAreaView
          style={[styles.container, { backgroundColor: bgColor }]}
          edges={edges}
          testID={testID}>
          <StatusBar barStyle={barStyle} backgroundColor={bgColor} />
          <KeyboardAvoidingView
            style={styles.keyboardAvoiding}
            behavior="padding"
            keyboardVerticalOffset={keyboardVerticalOffset}>
            {renderContent()}
          </KeyboardAvoidingView>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: bgColor }]}
        edges={edges}
        testID={testID}>
        <StatusBar barStyle={barStyle} backgroundColor={bgColor} />
        {renderContent()}
      </SafeAreaView>
    );
  },
);

Screen.displayName = 'Screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default Screen;
