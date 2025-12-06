// src/shared/hooks/useDimensions.ts
// Meslektaş Design System - Dimensions Hook
// Oku: mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize, PixelRatio, Platform } from 'react-native';

/**
 * Dimension types
 */
export interface WindowDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

export interface ScreenDimensions extends WindowDimensions {
  isPortrait: boolean;
  isLandscape: boolean;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;
}

/**
 * Device size breakpoints
 */
const BREAKPOINTS = {
  small: 375,
  medium: 414,
  large: 768,
} as const;

/**
 * Check if device is a tablet
 */
const isTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  const isLargeScreen = Math.min(width, height) >= 600;

  if (Platform.OS === 'ios') {
    return Platform.isPad || isLargeScreen;
  }

  // Android tablet detection
  return isLargeScreen && aspectRatio < 1.6;
};

/**
 * Get screen dimensions with computed properties
 */
const getScreenDimensions = (window: ScaledSize): ScreenDimensions => {
  const { width, height, scale, fontScale } = window;
  const minDimension = Math.min(width, height);

  return {
    width,
    height,
    scale,
    fontScale,
    isPortrait: height > width,
    isLandscape: width > height,
    isSmallDevice: minDimension < BREAKPOINTS.small,
    isMediumDevice: minDimension >= BREAKPOINTS.small && minDimension < BREAKPOINTS.large,
    isLargeDevice: minDimension >= BREAKPOINTS.large,
    isTablet: isTablet(),
  };
};

/**
 * useDimensions Hook
 * Returns current window dimensions and updates on orientation change
 *
 * @example
 * const { width, height, isPortrait } = useDimensions();
 */
export function useDimensions(): ScreenDimensions {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(() =>
    getScreenDimensions(Dimensions.get('window')),
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(getScreenDimensions(window));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return dimensions;
}

/**
 * useWindowSize Hook
 * Returns only width and height, updates on change
 *
 * @example
 * const { width, height } = useWindowSize();
 */
export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState(() => ({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  }));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setSize({ width: window.width, height: window.height });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return size;
}

/**
 * useOrientation Hook
 * Returns current device orientation
 *
 * @example
 * const orientation = useOrientation(); // 'portrait' | 'landscape'
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    const { width, height } = Dimensions.get('window');
    return height > width ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.height > window.width ? 'portrait' : 'landscape');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return orientation;
}

/**
 * useResponsiveValue Hook
 * Returns different values based on screen size
 *
 * @example
 * const padding = useResponsiveValue({
 *   small: 8,
 *   medium: 16,
 *   large: 24,
 * });
 */
export function useResponsiveValue<T>(values: { small: T; medium: T; large: T; tablet?: T }): T {
  const dimensions = useDimensions();

  if (dimensions.isTablet && values.tablet !== undefined) {
    return values.tablet;
  }

  if (dimensions.isLargeDevice) {
    return values.large;
  }

  if (dimensions.isMediumDevice) {
    return values.medium;
  }

  return values.small;
}

/**
 * useScaledSize Hook
 * Returns a size scaled relative to screen width
 * Useful for responsive typography and spacing
 *
 * @example
 * const fontSize = useScaledSize(16); // Scales based on screen width
 */
export function useScaledSize(baseSize: number, scaleBase: number = 375): number {
  const { width } = useDimensions();
  const scale = width / scaleBase;
  return Math.round(baseSize * Math.min(scale, 1.5));
}

/**
 * Utility: Normalize size across different pixel densities
 */
export function normalize(size: number): number {
  const scale = Dimensions.get('window').width / 375;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}

/**
 * Utility: Get responsive spacing
 */
export function getResponsiveSpacing(
  base: number,
  options?: { min?: number; max?: number },
): number {
  const { width } = Dimensions.get('window');
  const scale = width / 375;
  const scaled = base * scale;

  if (options?.min !== undefined && scaled < options.min) {
    return options.min;
  }

  if (options?.max !== undefined && scaled > options.max) {
    return options.max;
  }

  return Math.round(scaled);
}
