// src/contexts/ThemeContext.tsx
// Oku: mobile-development-guide/state/16-CONTEXT-API.md

import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, light, dark } from '@theme';
import { asyncStorage, STORAGE_KEYS } from '@core/storage';
import { ThemeMode } from '@shared/types';

/**
 * Theme context value type
 */
interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

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
 * Theme Provider
 * Manages theme state and provides theme to entire app
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      const savedMode = await asyncStorage.get<ThemeMode>(STORAGE_KEYS.THEME);
      if (savedMode) {
        setThemeModeState(savedMode);
      }
      setIsLoaded(true);
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

  const theme = useMemo(() => (isDark ? dark : light), [isDark]);

  // Set theme mode and persist
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await asyncStorage.set(STORAGE_KEYS.THEME, mode);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      toggleTheme,
      isDark,
    }),
    [theme, themeMode, setThemeMode, toggleTheme, isDark],
  );

  // Don't render until theme preference is loaded
  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
