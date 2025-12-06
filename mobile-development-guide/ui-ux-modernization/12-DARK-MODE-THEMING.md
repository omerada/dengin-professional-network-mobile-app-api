# 🌙 Dark Mode & Theming

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Seamless dark/light mode geçişleri

---

## 📑 İçindekiler

1. [Theme Architecture](#theme-architecture)
2. [Color System](#color-system)
3. [Theme Context](#theme-context)
4. [Animated Theme Switching](#animated-theme-switching)
5. [System Theme Detection](#system-theme-detection)
6. [Component Theming](#component-theming)

---

## 🏗️ Theme Architecture

### Theme Token Structure

```typescript
// src/theme/types.ts

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ThemeColors {
  // Brand colors
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  accent: {
    main: string;
    light: string;
    dark: string;
  };

  // Surface colors
  surface: {
    primary: string; // Main background
    secondary: string; // Card background
    tertiary: string; // Input background
    elevated: string; // Elevated cards
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };

  // Border colors
  border: {
    light: string;
    medium: string;
    dark: string;
  };

  // Semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Social colors
  social: {
    google: string;
    apple: string;
    facebook: string;
    twitter: string;
  };

  // Overlay
  overlay: {
    light: string;
    medium: string;
    dark: string;
  };
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  animation: typeof animation;
}

export type ThemeMode = "light" | "dark" | "system";
```

---

## 🎨 Color System

### Light Theme Colors

```typescript
// src/theme/colors.light.ts

import { ThemeColors } from "./types";

export const lightColors: ThemeColors = {
  // Brand - Meslektaş Orange/Coral
  primary: {
    main: "#FF6B35",
    light: "#FF8A5B",
    dark: "#E85A2A",
    contrast: "#FFFFFF",
  },
  secondary: {
    main: "#1A1A2E",
    light: "#2D2D44",
    dark: "#0F0F1A",
    contrast: "#FFFFFF",
  },
  accent: {
    main: "#00D9FF",
    light: "#4DE8FF",
    dark: "#00B8D9",
  },

  // Surfaces
  surface: {
    primary: "#FFFFFF",
    secondary: "#F8F9FA",
    tertiary: "#F1F3F4",
    elevated: "#FFFFFF",
  },

  // Text
  text: {
    primary: "#1A1A2E",
    secondary: "#5F6368",
    tertiary: "#9AA0A6",
    disabled: "#DADCE0",
    inverse: "#FFFFFF",
  },

  // Borders
  border: {
    light: "rgba(0, 0, 0, 0.08)",
    medium: "rgba(0, 0, 0, 0.12)",
    dark: "rgba(0, 0, 0, 0.20)",
  },

  // Semantic
  semantic: {
    success: "#34A853",
    warning: "#FBBC04",
    error: "#EA4335",
    info: "#4285F4",
  },

  // Social
  social: {
    google: "#4285F4",
    apple: "#000000",
    facebook: "#1877F2",
    twitter: "#1DA1F2",
  },

  // Overlay
  overlay: {
    light: "rgba(0, 0, 0, 0.04)",
    medium: "rgba(0, 0, 0, 0.32)",
    dark: "rgba(0, 0, 0, 0.64)",
  },
};
```

### Dark Theme Colors

```typescript
// src/theme/colors.dark.ts

import { ThemeColors } from "./types";

export const darkColors: ThemeColors = {
  // Brand - Slightly brighter for dark mode
  primary: {
    main: "#FF7A4D",
    light: "#FF9A75",
    dark: "#FF6B35",
    contrast: "#FFFFFF",
  },
  secondary: {
    main: "#F8F9FA",
    light: "#FFFFFF",
    dark: "#E8EAED",
    contrast: "#1A1A2E",
  },
  accent: {
    main: "#00E5FF",
    light: "#6EFFFF",
    dark: "#00B8D4",
  },

  // Surfaces - True dark mode
  surface: {
    primary: "#121212",
    secondary: "#1E1E1E",
    tertiary: "#2C2C2C",
    elevated: "#2D2D2D",
  },

  // Text
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
    tertiary: "rgba(255, 255, 255, 0.5)",
    disabled: "rgba(255, 255, 255, 0.38)",
    inverse: "#1A1A2E",
  },

  // Borders
  border: {
    light: "rgba(255, 255, 255, 0.08)",
    medium: "rgba(255, 255, 255, 0.12)",
    dark: "rgba(255, 255, 255, 0.20)",
  },

  // Semantic - Slightly desaturated for dark mode
  semantic: {
    success: "#81C995",
    warning: "#FDD663",
    error: "#F28B82",
    info: "#8AB4F8",
  },

  // Social
  social: {
    google: "#8AB4F8",
    apple: "#FFFFFF",
    facebook: "#4599FF",
    twitter: "#1DA1F2",
  },

  // Overlay
  overlay: {
    light: "rgba(255, 255, 255, 0.04)",
    medium: "rgba(0, 0, 0, 0.64)",
    dark: "rgba(0, 0, 0, 0.80)",
  },
};
```

---

## 🎛️ Theme Context

### Theme Provider

```typescript
// src/contexts/ThemeContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useColorScheme, StatusBar, Platform } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors } from "@theme/colors.light";
import { darkColors } from "@theme/colors.dark";
import { spacing, typography, shadows, animation } from "@theme";
import type { Theme, ThemeMode, ThemeColors } from "@theme/types";

const THEME_STORAGE_KEY = "@meslektas_theme_mode";

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  progress: Animated.SharedValue<number>; // For animations
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation progress: 0 = light, 1 = dark
  const progress = useSharedValue(0);

  // Calculate effective dark mode
  const isDark = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "dark";
    }
    return themeMode === "dark";
  }, [themeMode, systemColorScheme]);

  // Get colors based on mode
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  // Build theme object
  const theme: Theme = useMemo(
    () => ({
      isDark,
      colors,
      spacing,
      typography,
      shadows,
      animation,
    }),
    [isDark, colors]
  );

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && ["light", "dark", "system"].includes(saved)) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Animate progress when dark mode changes
  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, { duration: 300 });
  }, [isDark]);

  // Update status bar
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(colors.surface.primary);
    }
  }, [isDark, colors]);

  // Set theme mode
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newMode = isDark ? "light" : "dark";
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      isDark,
      colors,
      setThemeMode,
      toggleTheme,
      progress,
    }),
    [theme, themeMode, isDark, colors, setThemeMode, toggleTheme, progress]
  );

  // Don't render until theme is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hook for animated colors
export const useAnimatedThemeColor = (
  lightColor: string,
  darkColor: string
) => {
  const { progress } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [lightColor, darkColor]
    );

    return { backgroundColor };
  });

  return animatedStyle;
};
```

---

## ✨ Animated Theme Switching

### Circular Reveal Animation

```typescript
// src/shared/components/ThemeSwitcher/ThemeSwitcher.tsx

import React, { memo, useCallback, useRef } from "react";
import { StyleSheet, View, Dimensions, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  scheduleOnRN,
  Easing,
} from "react-native-reanimated";
import { Canvas, Circle, Group, Paint } from "@shopify/react-native-skia";
import { useTheme } from "@contexts/ThemeContext";
import { useHaptic } from "@hooks/useHaptic";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_RADIUS = Math.sqrt(SCREEN_WIDTH ** 2 + SCREEN_HEIGHT ** 2);

interface ThemeSwitcherProps {
  size?: number;
}

export const ThemeSwitcher = memo<ThemeSwitcherProps>(({ size = 48 }) => {
  const { isDark, toggleTheme, colors, progress } = useTheme();
  const { trigger: triggerHaptic } = useHaptic();

  const circleRadius = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const [touchPoint, setTouchPoint] = React.useState({ x: 0, y: 0 });
  const isAnimating = useRef(false);

  const handlePress = useCallback(
    (event: any) => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      // Get touch position
      const { pageX, pageY } = event.nativeEvent;
      setTouchPoint({ x: pageX, y: pageY });

      // Haptic feedback
      triggerHaptic("impactMedium");

      // Start reveal animation
      circleOpacity.value = 1;
      circleRadius.value = withTiming(
        MAX_RADIUS,
        {
          duration: 500,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          // Toggle theme when animation reaches midpoint
          scheduleOnRN(toggleTheme)();

          // Fade out circle
          circleOpacity.value = withTiming(0, { duration: 200 }, () => {
            circleRadius.value = 0;
            isAnimating.current = false;
          });
        }
      );
    },
    [toggleTheme, triggerHaptic]
  );

  // Icon animation
  const iconStyle = useAnimatedStyle(() => {
    const rotate = progress.value * 360;
    const scale = 1 - Math.abs(progress.value - 0.5) * 0.4;

    return {
      transform: [{ rotate: `${rotate}deg` }, { scale }],
    };
  });

  return (
    <>
      {/* Reveal overlay */}
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Group>
          <Circle
            cx={touchPoint.x}
            cy={touchPoint.y}
            r={circleRadius}
            opacity={circleOpacity}
          >
            <Paint color={isDark ? "#FFFFFF" : "#121212"} />
          </Circle>
        </Group>
      </Canvas>

      {/* Switch button */}
      <Pressable onPress={handlePress}>
        <View
          style={[styles.button, { backgroundColor: colors.surface.secondary }]}
        >
          <Animated.View style={iconStyle}>
            {isDark ? (
              <SunIcon size={24} color={colors.text.primary} />
            ) : (
              <MoonIcon size={24} color={colors.text.primary} />
            )}
          </Animated.View>
        </View>
      </Pressable>
    </>
  );
});

ThemeSwitcher.displayName = "ThemeSwitcher";

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

### Simple Theme Toggle

```typescript
// src/shared/components/ThemeToggle/ThemeToggle.tsx

import React, { memo, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "@contexts/ThemeContext";
import { useHaptic } from "@hooks/useHaptic";

interface ThemeToggleProps {
  showLabel?: boolean;
}

export const ThemeToggle = memo<ThemeToggleProps>(({ showLabel = true }) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { trigger: triggerHaptic } = useHaptic();

  const translateX = useSharedValue(isDark ? 26 : 0);
  const scale = useSharedValue(1);

  // Sync with isDark
  useEffect(() => {
    translateX.value = withSpring(isDark ? 26 : 0, {
      damping: 15,
      stiffness: 300,
    });
  }, [isDark]);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.9);
    })
    .onFinalize((_, success) => {
      scale.value = withSpring(1);
      if (success) {
        scheduleOnRN(triggerHaptic)("selection");
        scheduleOnRN(toggleTheme)();
      }
    });

  // Track style
  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, 26],
      [colors.surface.tertiary, colors.primary.main]
    );

    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
    };
  });

  // Thumb style
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Sun/moon icon style
  const sunStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, 26], [1, 0]);
    const scale = interpolate(translateX.value, [0, 26], [1, 0.5]);
    return { opacity, transform: [{ scale }] };
  });

  const moonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, 26], [0, 1]);
    const scale = interpolate(translateX.value, [0, 26], [0.5, 1]);
    return { opacity, transform: [{ scale }] };
  });

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          {isDark ? "Karanlık Mod" : "Aydınlık Mod"}
        </Text>
      )}

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.thumb, thumbStyle]}>
            {/* Sun icon */}
            <Animated.View style={[styles.icon, sunStyle]}>
              <SunIcon size={16} color="#FFA000" />
            </Animated.View>

            {/* Moon icon */}
            <Animated.View
              style={[styles.icon, styles.iconAbsolute, moonStyle]}
            >
              <MoonIcon size={16} color="#5C6BC0" />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

ThemeToggle.displayName = "ThemeToggle";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  track: {
    width: 56,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    position: "relative",
  },
  iconAbsolute: {
    position: "absolute",
  },
});
```

---

## 📱 System Theme Detection

### useSystemTheme Hook

```typescript
// src/hooks/useSystemTheme.ts

import { useColorScheme } from "react-native";
import { useEffect, useCallback } from "react";
import { Appearance, AppState, AppStateStatus } from "react-native";

interface UseSystemThemeOptions {
  onThemeChange?: (isDark: boolean) => void;
}

export const useSystemTheme = ({
  onThemeChange,
}: UseSystemThemeOptions = {}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      onThemeChange?.(colorScheme === "dark");
    });

    return () => subscription.remove();
  }, [onThemeChange]);

  // Re-check on app state change (some devices need this)
  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === "active") {
        const currentScheme = Appearance.getColorScheme();
        if (currentScheme && (currentScheme === "dark") !== isDark) {
          onThemeChange?.(currentScheme === "dark");
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [isDark, onThemeChange]);

  return {
    isDark,
    colorScheme,
  };
};
```

---

## 🎨 Component Theming

### Themed Component HOC

```typescript
// src/hoc/withTheme.tsx

import React from "react";
import { useTheme } from "@contexts/ThemeContext";
import type { Theme } from "@theme/types";

export interface ThemedComponentProps {
  theme: Theme;
  isDark: boolean;
}

export const withTheme = <P extends object>(
  Component: React.ComponentType<P & ThemedComponentProps>
) => {
  const ThemedComponent: React.FC<Omit<P, keyof ThemedComponentProps>> = (
    props
  ) => {
    const { theme, isDark } = useTheme();

    return <Component {...(props as P)} theme={theme} isDark={isDark} />;
  };

  ThemedComponent.displayName = `withTheme(${
    Component.displayName || Component.name
  })`;

  return ThemedComponent;
};
```

### Themed StyleSheet

```typescript
// src/utils/createThemedStyles.ts

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { Theme } from "@theme/types";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const createThemedStyles = <T extends NamedStyles<T>>(
  styleFactory: (theme: Theme) => T
) => {
  return (theme: Theme) => StyleSheet.create(styleFactory(theme));
};

// Usage example:
// const useStyles = createThemedStyles((theme) => ({
//   container: {
//     backgroundColor: theme.colors.surface.primary,
//   },
//   text: {
//     color: theme.colors.text.primary,
//   },
// }));
//
// const Component = () => {
//   const { theme } = useTheme();
//   const styles = useStyles(theme);
//   return <View style={styles.container} />;
// };
```

---

## 🎛️ Theme Settings Screen

```typescript
// src/features/settings/screens/ThemeSettingsScreen.tsx

import React, { memo, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@contexts/ThemeContext";
import { PressableScale } from "@shared/components";
import { useHaptic } from "@hooks/useHaptic";

type ThemeOption = {
  id: "light" | "dark" | "system";
  title: string;
  description: string;
  icon: React.ReactNode;
};

const themeOptions: ThemeOption[] = [
  {
    id: "light",
    title: "Aydınlık",
    description: "Her zaman aydınlık tema kullan",
    icon: <SunIcon size={24} />,
  },
  {
    id: "dark",
    title: "Karanlık",
    description: "Her zaman karanlık tema kullan",
    icon: <MoonIcon size={24} />,
  },
  {
    id: "system",
    title: "Sistem",
    description: "Sistem ayarlarını takip et",
    icon: <PhoneIcon size={24} />,
  },
];

export const ThemeSettingsScreen: React.FC = () => {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { trigger: triggerHaptic } = useHaptic();
  const insets = useSafeAreaInsets();

  const handleSelectTheme = useCallback(
    (mode: "light" | "dark" | "system") => {
      triggerHaptic("selection");
      setThemeMode(mode);
    },
    [setThemeMode, triggerHaptic]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface.primary }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        GÖRÜNÜM
      </Text>

      <View
        style={[
          styles.optionsContainer,
          { backgroundColor: colors.surface.secondary },
        ]}
      >
        {themeOptions.map((option, index) => (
          <Animated.View
            key={option.id}
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
          >
            <ThemeOptionRow
              option={option}
              isSelected={themeMode === option.id}
              onSelect={() => handleSelectTheme(option.id)}
              colors={colors}
              isLast={index === themeOptions.length - 1}
            />
          </Animated.View>
        ))}
      </View>

      {/* Preview section */}
      <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
        ÖNİZLEME
      </Text>

      <ThemePreview />
    </ScrollView>
  );
};

// Theme option row
interface ThemeOptionRowProps {
  option: ThemeOption;
  isSelected: boolean;
  onSelect: () => void;
  colors: any;
  isLast: boolean;
}

const ThemeOptionRow = memo<ThemeOptionRowProps>(
  ({ option, isSelected, onSelect, colors, isLast }) => (
    <PressableScale
      onPress={onSelect}
      style={[
        styles.optionRow,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        },
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          { backgroundColor: colors.surface.tertiary },
        ]}
      >
        {React.cloneElement(option.icon as React.ReactElement, {
          color: isSelected ? colors.primary.main : colors.text.secondary,
        })}
      </View>

      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
          {option.title}
        </Text>
        <Text
          style={[styles.optionDescription, { color: colors.text.secondary }]}
        >
          {option.description}
        </Text>
      </View>

      {isSelected && <CheckIcon size={22} color={colors.primary.main} />}
    </PressableScale>
  )
);

// Theme preview component
const ThemePreview = memo(() => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.previewContainer,
        { backgroundColor: colors.surface.secondary },
      ]}
    >
      {/* Mini phone mockup */}
      <View
        style={[
          styles.phoneMockup,
          { backgroundColor: colors.surface.primary },
        ]}
      >
        <View
          style={[
            styles.mockupHeader,
            { backgroundColor: colors.primary.main },
          ]}
        />
        <View style={styles.mockupContent}>
          <View
            style={[
              styles.mockupCard,
              { backgroundColor: colors.surface.secondary },
            ]}
          />
          <View
            style={[
              styles.mockupCard,
              { backgroundColor: colors.surface.secondary },
            ]}
          />
        </View>
        <View
          style={[
            styles.mockupTabBar,
            { backgroundColor: colors.surface.primary },
          ]}
        >
          <View
            style={[
              styles.mockupTabItem,
              { backgroundColor: colors.text.tertiary },
            ]}
          />
          <View
            style={[
              styles.mockupTabItem,
              { backgroundColor: colors.primary.main },
            ]}
          />
          <View
            style={[
              styles.mockupTabItem,
              { backgroundColor: colors.text.tertiary },
            ]}
          />
        </View>
      </View>

      <Text style={[styles.previewLabel, { color: colors.text.secondary }]}>
        {isDark ? "Karanlık Mod Aktif" : "Aydınlık Mod Aktif"}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  optionsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  previewContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  phoneMockup: {
    width: 120,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
  },
  mockupHeader: {
    height: 30,
  },
  mockupContent: {
    flex: 1,
    padding: 8,
  },
  mockupCard: {
    height: 40,
    borderRadius: 6,
    marginBottom: 8,
  },
  mockupTabBar: {
    height: 24,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  mockupTabItem: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  previewLabel: {
    fontSize: 14,
    marginTop: 16,
  },
});
```

---

## ✅ Acceptance Criteria

```
□ Theme değişimi <300ms
□ System theme detection çalışıyor
□ Theme preference persist ediliyor
□ Tüm componentler theme-aware
□ Animasyonlu geçişler smooth
□ Status bar rengi senkron
□ Image tinting dark mode'da doğru
□ Semantic colors kontrastlı
□ Accessibility contrast ratio uygun
□ Performans: re-render minimize
```

---

Bu dark mode implementasyonu, Instagram/Happen kalitesinde seamless tema geçişleri sağlar.
