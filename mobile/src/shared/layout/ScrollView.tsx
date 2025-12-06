// src/shared/layout/ScrollView.tsx
// Enhanced ScrollView bileşeni - Pull-to-refresh, infinite scroll desteği
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import React, { useCallback, useRef, useMemo } from 'react';
import {
  ScrollView as RNScrollView,
  StyleSheet,
  ViewStyle,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';

/**
 * EnhancedScrollView props
 */
export interface EnhancedScrollViewProps {
  /** Children */
  children: React.ReactNode;
  /** Horizontal scroll */
  horizontal?: boolean;
  /** Show scroll indicators */
  showsScrollIndicator?: boolean;
  /** Content container style */
  contentContainerStyle?: ViewStyle;
  /** Custom style */
  style?: ViewStyle;
  /** Enable pull-to-refresh */
  refreshable?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** On refresh callback */
  onRefresh?: () => void;
  /** Enable infinite scroll */
  infiniteScroll?: boolean;
  /** On end reached callback */
  onEndReached?: () => void;
  /** End reached threshold (0-1) */
  onEndReachedThreshold?: number;
  /** Is loading more */
  isLoadingMore?: boolean;
  /** Enable bounce */
  bounces?: boolean;
  /** Keyboard dismiss mode */
  keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
  /** Keyboard should persist taps */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  /** On scroll callback */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Scroll event throttle */
  scrollEventThrottle?: number;
  /** Nested scroll enabled */
  nestedScrollEnabled?: boolean;
  /** Content padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Test ID */
  testID?: string;
}

/**
 * Padding values
 */
const paddingValues = {
  none: 0,
  sm: spacing['2'],
  md: spacing['4'],
  lg: spacing['6'],
};

/**
 * Enhanced ScrollView component
 *
 * A ScrollView with built-in support for pull-to-refresh,
 * infinite scrolling, and consistent theming.
 *
 * @example
 * ```tsx
 * <EnhancedScrollView
 *   refreshable
 *   refreshing={isRefreshing}
 *   onRefresh={handleRefresh}
 *   infiniteScroll
 *   onEndReached={loadMore}
 * >
 *   {content}
 * </EnhancedScrollView>
 * ```
 */
export const EnhancedScrollView = React.memo<EnhancedScrollViewProps>(
  ({
    children,
    horizontal = false,
    showsScrollIndicator = true,
    contentContainerStyle,
    style,
    refreshable = false,
    refreshing = false,
    onRefresh,
    infiniteScroll = false,
    onEndReached,
    onEndReachedThreshold = 0.2,
    isLoadingMore = false,
    bounces = true,
    keyboardDismissMode = 'on-drag',
    keyboardShouldPersistTaps = 'handled',
    onScroll,
    scrollEventThrottle = 16,
    nestedScrollEnabled = true,
    padding = 'none',
    testID,
  }) => {
    const colors = useColors();
    const isEndReachedCalled = useRef(false);

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScroll?.(event);

        if (infiniteScroll && onEndReached && !isLoadingMore) {
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

          const isHorizontalEnd =
            horizontal &&
            contentOffset.x + layoutMeasurement.width >=
              contentSize.width * (1 - onEndReachedThreshold);

          const isVerticalEnd =
            !horizontal &&
            contentOffset.y + layoutMeasurement.height >=
              contentSize.height * (1 - onEndReachedThreshold);

          if ((isHorizontalEnd || isVerticalEnd) && !isEndReachedCalled.current) {
            isEndReachedCalled.current = true;
            onEndReached();
          } else if (!isHorizontalEnd && !isVerticalEnd) {
            isEndReachedCalled.current = false;
          }
        }
      },
      [horizontal, infiniteScroll, isLoadingMore, onEndReached, onEndReachedThreshold, onScroll],
    );

    const paddingValue = paddingValues[padding];

    const mergedContentStyle = useMemo<ViewStyle>(
      () => ({
        padding: paddingValue,
        flexGrow: 1,
        ...contentContainerStyle,
      }),
      [paddingValue, contentContainerStyle],
    );

    // RefreshControl color
    const refreshColor = colors.interactive.default;

    return (
      <RNScrollView
        style={[styles.container, style]}
        contentContainerStyle={mergedContentStyle}
        horizontal={horizontal}
        showsVerticalScrollIndicator={!horizontal && showsScrollIndicator}
        showsHorizontalScrollIndicator={horizontal && showsScrollIndicator}
        bounces={bounces}
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        nestedScrollEnabled={nestedScrollEnabled}
        testID={testID}
        refreshControl={
          refreshable ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={refreshColor}
              colors={[refreshColor]}
              progressBackgroundColor={colors.background.secondary}
            />
          ) : undefined
        }>
        {children}
      </RNScrollView>
    );
  },
);

EnhancedScrollView.displayName = 'EnhancedScrollView';

/**
 * AnimatedScrollView for scroll animations
 */
export interface AnimatedScrollViewProps extends EnhancedScrollViewProps {
  /** Animated scroll Y value */
  scrollY?: Animated.Value;
}

export const AnimatedScrollView = React.memo<AnimatedScrollViewProps>(
  ({ scrollY, onScroll, ...props }) => {
    const colors = useColors();
    const internalScrollY = useRef(new Animated.Value(0)).current;
    const animatedValue = scrollY ?? internalScrollY;

    // RefreshControl color
    const refreshColor = colors.interactive.default;

    const handleScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: animatedValue } } }],
      {
        useNativeDriver: true,
        listener: onScroll,
      },
    );

    return (
      <Animated.ScrollView
        {...props}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          props.refreshable ? (
            <RefreshControl
              refreshing={props.refreshing ?? false}
              onRefresh={props.onRefresh}
              tintColor={refreshColor}
              colors={[refreshColor]}
            />
          ) : undefined
        }
      />
    );
  },
);

AnimatedScrollView.displayName = 'AnimatedScrollView';

/**
 * HorizontalScrollView shorthand
 */
export interface HorizontalScrollViewProps extends Omit<EnhancedScrollViewProps, 'horizontal'> {
  /** Show pagination dots */
  showPagination?: boolean;
  /** Current page index */
  currentPage?: number;
  /** Page width */
  pageWidth?: number;
  /** On page change */
  onPageChange?: (page: number) => void;
}

export const HorizontalScrollView = React.memo<HorizontalScrollViewProps>(
  ({ showPagination = false, currentPage = 0, pageWidth, onPageChange, onScroll, ...props }) => {
    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScroll?.(event);

        if (showPagination && pageWidth && onPageChange) {
          const offsetX = event.nativeEvent.contentOffset.x;
          const page = Math.round(offsetX / pageWidth);
          if (page !== currentPage) {
            onPageChange(page);
          }
        }
      },
      [currentPage, onPageChange, onScroll, pageWidth, showPagination],
    );

    return (
      <EnhancedScrollView
        {...props}
        horizontal
        onScroll={handleScroll}
        showsScrollIndicator={false}
      />
    );
  },
);

HorizontalScrollView.displayName = 'HorizontalScrollView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
