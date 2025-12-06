// src/shared/components/Typography/Typography.tsx
// Typography bileşeni - Tutarlı metin stilleri
// Oku: mobile-development-guide/ui/17-DESIGN-SYSTEM.md

import React, { useMemo } from 'react';
import { Text, TextProps, TextStyle, AccessibilityRole } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { fontSize as fontSizes } from '@theme';

/**
 * Typography variants
 */
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button';

/**
 * Typography colors
 */
export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'inherit';

/**
 * Typography alignment
 */
export type TypographyAlign = 'left' | 'center' | 'right' | 'auto';

/**
 * Typography weight
 */
export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Typography props
 */
export interface TypographyProps extends Omit<TextProps, 'style'> {
  /** Text variant */
  variant?: TypographyVariant;
  /** Text color */
  color?: TypographyColor;
  /** Text alignment */
  align?: TypographyAlign;
  /** Font weight override */
  weight?: TypographyWeight;
  /** Italic text */
  italic?: boolean;
  /** Underline text */
  underline?: boolean;
  /** Strike through text */
  strikethrough?: boolean;
  /** Uppercase text */
  uppercase?: boolean;
  /** Custom style */
  style?: TextStyle;
  /** Children */
  children: React.ReactNode;
}

/**
 * Get accessibility role for variant
 */
const getAccessibilityRole = (variant: TypographyVariant): AccessibilityRole | undefined => {
  switch (variant) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'header';
    default:
      return undefined;
  }
};

/**
 * Typography component
 *
 * Provides consistent text styling across the app with support for
 * different variants, colors, and text decorations.
 */
export const Typography = React.memo<TypographyProps>(
  ({
    variant = 'body1',
    color = 'primary',
    align = 'auto',
    weight,
    italic = false,
    underline = false,
    strikethrough = false,
    uppercase = false,
    style,
    children,
    ...props
  }) => {
    const colors = useColors();

    // Variant styles (memoized)
    const variantStyles = useMemo<Record<TypographyVariant, TextStyle>>(
      () => ({
        h1: {
          fontSize: fontSizes['3xl'],
          fontWeight: '700',
          lineHeight: fontSizes['3xl'] * 1.2,
          letterSpacing: -0.5,
        },
        h2: {
          fontSize: fontSizes['2xl'],
          fontWeight: '700',
          lineHeight: fontSizes['2xl'] * 1.2,
          letterSpacing: -0.3,
        },
        h3: {
          fontSize: fontSizes.xl,
          fontWeight: '600',
          lineHeight: fontSizes.xl * 1.3,
        },
        h4: {
          fontSize: fontSizes.lg,
          fontWeight: '600',
          lineHeight: fontSizes.lg * 1.3,
        },
        h5: {
          fontSize: fontSizes.md,
          fontWeight: '600',
          lineHeight: fontSizes.md * 1.4,
        },
        h6: {
          fontSize: fontSizes.sm,
          fontWeight: '600',
          lineHeight: fontSizes.sm * 1.4,
        },
        subtitle1: {
          fontSize: fontSizes.md,
          fontWeight: '500',
          lineHeight: fontSizes.md * 1.5,
          letterSpacing: 0.1,
        },
        subtitle2: {
          fontSize: fontSizes.sm,
          fontWeight: '500',
          lineHeight: fontSizes.sm * 1.5,
          letterSpacing: 0.1,
        },
        body1: {
          fontSize: fontSizes.md,
          fontWeight: '400',
          lineHeight: fontSizes.md * 1.5,
        },
        body2: {
          fontSize: fontSizes.sm,
          fontWeight: '400',
          lineHeight: fontSizes.sm * 1.5,
        },
        caption: {
          fontSize: fontSizes.xs,
          fontWeight: '400',
          lineHeight: fontSizes.xs * 1.4,
          letterSpacing: 0.2,
        },
        overline: {
          fontSize: fontSizes.xs,
          fontWeight: '500',
          lineHeight: fontSizes.xs * 1.4,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        button: {
          fontSize: fontSizes.sm,
          fontWeight: '600',
          lineHeight: fontSizes.sm * 1.4,
          letterSpacing: 0.5,
        },
      }),
      [],
    );

    // Color mapping
    const getColor = useMemo((): string => {
      switch (color) {
        case 'primary':
          return colors.text.primary;
        case 'secondary':
          return colors.text.secondary;
        case 'tertiary':
          return colors.text.tertiary;
        case 'disabled':
          return colors.text.disabled;
        case 'error':
          return colors.status.error;
        case 'success':
          return colors.status.success;
        case 'warning':
          return colors.status.warning;
        case 'info':
          return colors.status.info;
        case 'inherit':
        default:
          return 'inherit' as unknown as string;
      }
    }, [color, colors]);

    // Weight mapping
    const getWeight = (): TextStyle['fontWeight'] => {
      if (!weight) return undefined;
      switch (weight) {
        case 'regular':
          return '400';
        case 'medium':
          return '500';
        case 'semibold':
          return '600';
        case 'bold':
          return '700';
        default:
          return undefined;
      }
    };

    // Build text decoration
    const getTextDecoration = (): TextStyle['textDecorationLine'] => {
      if (underline && strikethrough) return 'underline line-through';
      if (underline) return 'underline';
      if (strikethrough) return 'line-through';
      return 'none';
    };

    // Combined styles
    const textStyle = useMemo<TextStyle>(
      () => ({
        ...variantStyles[variant],
        color: color !== 'inherit' ? getColor : undefined,
        textAlign: align,
        fontStyle: italic ? 'italic' : 'normal',
        textDecorationLine: getTextDecoration(),
        textTransform: uppercase ? 'uppercase' : variantStyles[variant].textTransform,
        ...(weight ? { fontWeight: getWeight() } : {}),
        ...style,
      }),
      [variantStyles, variant, color, getColor, align, italic, uppercase, weight, style],
    );

    return (
      <Text style={textStyle} accessibilityRole={getAccessibilityRole(variant)} {...props}>
        {children}
      </Text>
    );
  },
);

Typography.displayName = 'Typography';

// Named exports for convenience
export const H1: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h4" {...props} />
);

export const H5: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h5" {...props} />
);

export const H6: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="h6" {...props} />
);

export const Subtitle1: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="subtitle1" {...props} />
);

export const Subtitle2: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="subtitle2" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant="overline" {...props} />
);

export default Typography;
