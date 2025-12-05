// src/shared/layout/Container.tsx
// Container layout bileşeni - Responsive padding ve max-width wrapper
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing } from '@theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Container sizes
 */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Container padding options
 */
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Container props
 */
interface ContainerProps {
  /** Children */
  children: React.ReactNode;
  /** Container size (max-width) */
  size?: ContainerSize;
  /** Horizontal padding */
  padding?: ContainerPadding;
  /** Center content horizontally */
  center?: boolean;
  /** Flex grow */
  flex?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Max width values for container sizes
 */
const maxWidthValues: Record<ContainerSize, number | undefined> = {
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  full: undefined,
};

/**
 * Padding values
 */
const paddingValues: Record<ContainerPadding, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

/**
 * Container component
 *
 * A layout wrapper that provides consistent horizontal padding
 * and optional max-width constraints for responsive layouts.
 *
 * @example
 * ```tsx
 * <Container size="lg" padding="md">
 *   <Text>Content with consistent padding</Text>
 * </Container>
 * ```
 */
export const Container = React.memo<ContainerProps>(
  ({
    children,
    size = 'full',
    padding = 'md',
    center = true,
    flex = false,
    backgroundColor,
    style,
    testID,
  }) => {
    const { theme } = useTheme();

    const maxWidth = maxWidthValues[size];
    const horizontalPadding = paddingValues[padding];

    const containerStyle: ViewStyle = {
      width: '100%',
      maxWidth: maxWidth ? Math.min(maxWidth, SCREEN_WIDTH) : undefined,
      paddingHorizontal: horizontalPadding,
      alignSelf: center ? 'center' : undefined,
      flex: flex ? 1 : undefined,
      backgroundColor: backgroundColor || theme.colors.background.primary,
    };

    return (
      <View style={[containerStyle, style]} testID={testID}>
        {children}
      </View>
    );
  },
);

Container.displayName = 'Container';

/**
 * Row component for horizontal layouts
 */
interface RowProps {
  children: React.ReactNode;
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  wrap?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Row = React.memo<RowProps>(
  ({
    children,
    gap = spacing.sm,
    align = 'center',
    justify = 'flex-start',
    wrap = false,
    style,
    testID,
  }) => {
    return (
      <View
        style={[
          styles.row,
          {
            gap,
            alignItems: align,
            justifyContent: justify,
            flexWrap: wrap ? 'wrap' : 'nowrap',
          },
          style,
        ]}
        testID={testID}>
        {children}
      </View>
    );
  },
);

Row.displayName = 'Row';

/**
 * Column component for vertical layouts
 */
interface ColumnProps {
  children: React.ReactNode;
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  flex?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Column = React.memo<ColumnProps>(
  ({
    children,
    gap = spacing.sm,
    align = 'stretch',
    justify = 'flex-start',
    flex = false,
    style,
    testID,
  }) => {
    return (
      <View
        style={[
          styles.column,
          {
            gap,
            alignItems: align,
            justifyContent: justify,
            flex: flex ? 1 : undefined,
          },
          style,
        ]}
        testID={testID}>
        {children}
      </View>
    );
  },
);

Column.displayName = 'Column';

/**
 * Spacer component for adding fixed space
 */
interface SpacerProps {
  size?: number;
  horizontal?: boolean;
}

export const Spacer = React.memo<SpacerProps>(({ size = spacing.md, horizontal = false }) => {
  return <View style={horizontal ? { width: size, height: 1 } : { height: size, width: 1 }} />;
});

Spacer.displayName = 'Spacer';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});
