// src/contexts/ThemeContext.tsx
// Meslektaş Design System - Modern Theme Provider
// Oku: mobile-development-guide/ui-ux-modernization/03-DESIGN-SYSTEM-OVERHAUL.md

import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { useColorScheme, StatusBar, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { light, dark, duration } from '@theme';
import { asyncStorage, STORAGE_KEYS } from '@core/storage';
import type {
  Theme,
  ThemeMode,
  ThemeContextValue,
  ThemeColors,
  TypographyStyles,
} from '@theme/types';

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Modern Theme Provider
 * Manages theme state with animated transitions
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Animated theme transition value
  const themeProgress = useSharedValue(0);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await asyncStorage.get<ThemeMode>(STORAGE_KEYS.THEME);
        if (savedMode) {
          setThemeModeState(savedMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  // Calculate effective theme based on mode
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Update theme progress when isDark changes
  useEffect(() => {
    themeProgress.value = withTiming(isDark ? 1 : 0, {
      duration: duration.stateChange,
    });
  }, [isDark, themeProgress]);

  // Update status bar based on theme
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(
        isDark ? dark.colors.background.primary : light.colors.background.primary,
      );
    }
  }, [isDark]);

  const theme = useMemo<Theme>(() => (isDark ? dark : light), [isDark]);

  // Memoized colors for quick access
  const colors = useMemo<ThemeColors>(() => theme.colors, [theme.colors]);

  // Memoized typography for quick access
  const typography = useMemo<TypographyStyles>(() => theme.typography, [theme.typography]);

  // Memoized spacing for quick access
  const spacing = useMemo(() => theme.spacing, [theme.spacing]);

  // Memoized shadows for quick access
  const shadows = useMemo(() => theme.shadows, [theme.shadows]);

  // Set theme mode and persist
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await asyncStorage.set(STORAGE_KEYS.THEME, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors,
      typography,
      spacing,
      shadows,
      isDark,
      themeMode,
      setThemeMode,
      toggleTheme,
    }),
    [theme, colors, typography, spacing, shadows, isDark, themeMode, setThemeMode, toggleTheme],
  );

  // Don't render until theme preference is loaded
  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access theme context
 * Provides full theme access with type safety
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

/**
 * Hook for animated theme transitions
 * Returns animated style that transitions between light/dark
 */
export const useAnimatedThemeStyle = (
  lightStyle: Record<string, string>,
  darkStyle: Record<string, string>,
) => {
  const { isDark } = useTheme();
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, {
      duration: duration.stateChange,
    });
  }, [isDark, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const result: Record<string, string> = {};

    Object.keys(lightStyle).forEach(key => {
      if (lightStyle[key] && darkStyle[key]) {
        result[key] = interpolateColor(
          progress.value,
          [0, 1],
          [lightStyle[key], darkStyle[key]],
        ) as string;
      }
    });

    return result;
  });

  return animatedStyle;
};

/**
 * Hook for quick color access
 */
export const useColors = (): ThemeColors => {
  const { colors } = useTheme();
  return colors;
};

/**
 * Hook for quick typography access
 */
export const useTypography = (): TypographyStyles => {
  const { typography } = useTheme();
  return typography;
};

/**
 * Hook for quick spacing access
 */
export const useSpacing = () => {
  const { spacing } = useTheme();
  return spacing;
};
