# 🧩 Modern Component Library

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Konum:** `mobile/src/shared/components/`

---

## 📑 İçindekiler

1. [Component Mimarisi](#component-mimarisi)
2. [Core Components](#core-components)
3. [Form Components](#form-components)
4. [Feedback Components](#feedback-components)
5. [Layout Components](#layout-components)
6. [Data Display Components](#data-display-components)
7. [Navigation Components](#navigation-components)
8. [Overlay Components](#overlay-components)

---

## 🏗️ Component Mimarisi

### Dosya Yapısı

```
shared/components/
├── core/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   ├── Button.types.ts
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── Text/
│   ├── Icon/
│   └── Pressable/
├── form/
│   ├── Input/
│   ├── TextArea/
│   ├── Select/
│   ├── Checkbox/
│   ├── Switch/
│   └── SearchBar/
├── feedback/
│   ├── Skeleton/
│   ├── Spinner/
│   ├── Toast/
│   ├── Alert/
│   └── Progress/
├── layout/
│   ├── Screen/
│   ├── Card/
│   ├── Divider/
│   ├── Spacer/
│   └── Grid/
├── data/
│   ├── Avatar/
│   ├── Badge/
│   ├── List/
│   ├── Empty/
│   └── Image/
├── navigation/
│   ├── Header/
│   ├── TabBar/
│   └── BottomSheet/
└── overlay/
    ├── Modal/
    ├── Dropdown/
    ├── Popover/
    └── ActionSheet/
```

### Component Pattern

```typescript
// Component Pattern Example
// Button/Button.tsx

import React, { memo, useCallback } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHaptic } from "@hooks/useHaptic";
import { useTheme } from "@theme";
import { ButtonProps } from "./Button.types";
import { createStyles } from "./Button.styles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = memo(
  ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    onPress,
    ...props
  }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme, variant, size);
    const { triggerHaptic } = useHaptic();

    // Animated values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    // Animated style
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    // Gesture handler
    const gesture = Gesture.Tap()
      .enabled(!disabled && !loading)
      .onBegin(() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 500 });
      })
      .onFinalize(() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 500 });
      })
      .onEnd(() => {
        runOnJS(handlePress)();
      });

    const handlePress = useCallback(() => {
      triggerHaptic("light");
      onPress?.();
    }, [onPress, triggerHaptic]);

    return (
      <GestureDetector gesture={gesture}>
        <AnimatedPressable
          style={[styles.container, animatedStyle]}
          accessibilityRole="button"
          {...props}
        >
          {/* Content */}
        </AnimatedPressable>
      </GestureDetector>
    );
  }
);

Button.displayName = "Button";
```

---

## 🔘 Core Components

### Button

**Modernize Edilecek Özellikler:**

| Özellik         | Mevcut            | Hedef               |
| --------------- | ----------------- | ------------------- |
| Press Animation | activeOpacity     | Spring scale        |
| Loading         | ActivityIndicator | Animated transition |
| Variants        | 5                 | 8+                  |
| Icons           | Static            | Animated            |
| Haptic          | Minimal           | Full support        |

**Yeni Button Implementation:**

```typescript
// src/shared/components/core/Button/Button.tsx

import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";
import { spring } from "@theme/tokens/animations";

// Types
type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "gradient"
  | "premium";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

// Size configurations
const sizeConfig = {
  xs: { height: 28, paddingX: 10, fontSize: 12, iconSize: 14 },
  sm: { height: 36, paddingX: 14, fontSize: 14, iconSize: 16 },
  md: { height: 44, paddingX: 18, fontSize: 16, iconSize: 20 },
  lg: { height: 52, paddingX: 24, fontSize: 18, iconSize: 22 },
  xl: { height: 60, paddingX: 32, fontSize: 20, iconSize: 24 },
};

export const Button: React.FC<ButtonProps> = memo(
  ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    onPress,
    onLongPress,
    style,
    textStyle,
    testID,
  }) => {
    const { theme, colors } = useTheme();
    const { triggerHaptic } = useHaptic();

    // Animation values
    const pressed = useSharedValue(0);
    const scale = useSharedValue(1);

    // Get size config
    const config = sizeConfig[size];

    // Get variant styles
    const getVariantStyles = useCallback(() => {
      switch (variant) {
        case "primary":
          return {
            bg: colors.interactive.default,
            text: colors.text.inverse,
            border: "transparent",
          };
        case "secondary":
          return {
            bg: colors.background.secondary,
            text: colors.text.primary,
            border: "transparent",
          };
        case "outline":
          return {
            bg: "transparent",
            text: colors.interactive.default,
            border: colors.interactive.default,
          };
        case "ghost":
          return {
            bg: "transparent",
            text: colors.interactive.default,
            border: "transparent",
          };
        case "danger":
          return {
            bg: colors.status.error,
            text: colors.text.inverse,
            border: "transparent",
          };
        case "success":
          return {
            bg: colors.status.success,
            text: colors.text.inverse,
            border: "transparent",
          };
        default:
          return {
            bg: colors.interactive.default,
            text: colors.text.inverse,
            border: "transparent",
          };
      }
    }, [variant, colors]);

    const variantStyles = getVariantStyles();

    // Animated styles
    const animatedContainerStyle = useAnimatedStyle(() => {
      const scaleValue = interpolate(pressed.value, [0, 1], [1, 0.97]);
      return {
        transform: [{ scale: scaleValue }],
      };
    });

    const animatedBgStyle = useAnimatedStyle(() => {
      const opacityValue = interpolate(pressed.value, [0, 1], [1, 0.9]);
      return {
        opacity: opacityValue,
      };
    });

    // Gesture handlers
    const handlePressIn = useCallback(() => {
      "worklet";
      pressed.value = withSpring(1, spring.press);
    }, []);

    const handlePressOut = useCallback(() => {
      "worklet";
      pressed.value = withSpring(0, spring.press);
    }, []);

    const handlePress = useCallback(() => {
      triggerHaptic("light");
      onPress?.();
    }, [onPress, triggerHaptic]);

    const handleLongPress = useCallback(() => {
      triggerHaptic("medium");
      onLongPress?.();
    }, [onLongPress, triggerHaptic]);

    // Gesture definition
    const gesture = Gesture.Tap()
      .enabled(!disabled && !loading)
      .onBegin(handlePressIn)
      .onFinalize(handlePressOut)
      .onEnd(() => {
        runOnJS(handlePress)();
      });

    const longPressGesture = Gesture.LongPress()
      .enabled(!disabled && !loading && !!onLongPress)
      .minDuration(500)
      .onStart(() => {
        runOnJS(handleLongPress)();
      });

    const composedGesture = Gesture.Race(gesture, longPressGesture);

    // Gradient button
    if (variant === "gradient" || variant === "premium") {
      const gradientColors =
        variant === "premium"
          ? colors.gradient.premium
          : colors.gradient.primary;

      return (
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            testID={testID}
            style={[
              styles.container,
              { height: config.height },
              fullWidth && styles.fullWidth,
              disabled && styles.disabled,
              animatedContainerStyle,
              style,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled || loading }}
          >
            <Animated.View style={[StyleSheet.absoluteFill, animatedBgStyle]}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderRadius: config.height / 2 }]}
              />
            </Animated.View>

            {/* Content */}
            <View
              style={[styles.content, { paddingHorizontal: config.paddingX }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                  <Text
                    style={[
                      styles.text,
                      { fontSize: config.fontSize, color: "#FFFFFF" },
                      textStyle,
                    ]}
                  >
                    {typeof children === "string" ? children : null}
                  </Text>
                  {rightIcon && (
                    <View style={styles.rightIcon}>{rightIcon}</View>
                  )}
                </>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      );
    }

    // Standard button
    return (
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          testID={testID}
          style={[
            styles.container,
            {
              height: config.height,
              paddingHorizontal: config.paddingX,
              backgroundColor: variantStyles.bg,
              borderColor: variantStyles.border,
              borderWidth: variant === "outline" ? 1.5 : 0,
              borderRadius: config.height / 2,
            },
            fullWidth && styles.fullWidth,
            disabled && styles.disabled,
            animatedContainerStyle,
            style,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || loading }}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                variant === "outline" || variant === "ghost"
                  ? colors.interactive.default
                  : "#FFFFFF"
              }
            />
          ) : (
            <View style={styles.content}>
              {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
              <Text
                style={[
                  styles.text,
                  { fontSize: config.fontSize, color: variantStyles.text },
                  textStyle,
                ]}
              >
                {typeof children === "string" ? children : null}
              </Text>
              {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    );
  }
);

Button.displayName = "Button";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  gradient: {
    flex: 1,
  },
});
```

### Pressable (Base)

```typescript
// src/shared/components/core/Pressable/Pressable.tsx

import React, { memo, useCallback } from "react";
import { ViewStyle, AccessibilityRole } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHaptic } from "@hooks/useHaptic";
import { spring } from "@theme/tokens/animations";

interface PressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  scaleOnPress?: number;
  hapticType?: "light" | "medium" | "heavy" | "none";
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

export const Pressable: React.FC<PressableProps> = memo(
  ({
    children,
    onPress,
    onLongPress,
    disabled = false,
    scaleOnPress = 0.97,
    hapticType = "light",
    accessibilityRole = "button",
    accessibilityLabel,
    style,
    testID,
  }) => {
    const { triggerHaptic } = useHaptic();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = useCallback(() => {
      if (hapticType !== "none") {
        triggerHaptic(hapticType);
      }
      onPress?.();
    }, [onPress, hapticType, triggerHaptic]);

    const handleLongPress = useCallback(() => {
      triggerHaptic("medium");
      onLongPress?.();
    }, [onLongPress, triggerHaptic]);

    const tapGesture = Gesture.Tap()
      .enabled(!disabled)
      .onBegin(() => {
        scale.value = withSpring(scaleOnPress, spring.press);
      })
      .onFinalize(() => {
        scale.value = withSpring(1, spring.press);
      })
      .onEnd(() => {
        runOnJS(handlePress)();
      });

    const longPressGesture = Gesture.LongPress()
      .enabled(!disabled && !!onLongPress)
      .minDuration(500)
      .onStart(() => {
        runOnJS(handleLongPress)();
      });

    const gesture = onLongPress
      ? Gesture.Race(tapGesture, longPressGesture)
      : tapGesture;

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          testID={testID}
          style={[style, animatedStyle, disabled && { opacity: 0.5 }]}
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    );
  }
);

Pressable.displayName = "Pressable";
```

---

## 📝 Form Components

### Input (Modern)

```typescript
// src/shared/components/form/Input/Input.tsx

import React, { memo, useState, useCallback, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { useTheme } from "@theme";
import { spring, duration } from "@theme/tokens/animations";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  variant?: "outlined" | "filled" | "underlined";
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      required = false,
      disabled = false,
      variant = "outlined",
      value,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { theme, colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Animation values
    const focusProgress = useSharedValue(0);
    const labelPosition = useSharedValue(value ? 1 : 0);
    const shake = useSharedValue(0);

    // Floating label animation
    const animatedLabelStyle = useAnimatedStyle(() => {
      const translateY = interpolate(labelPosition.value, [0, 1], [0, -28]);
      const scale = interpolate(labelPosition.value, [0, 1], [1, 0.85]);
      const color = interpolateColor(
        focusProgress.value,
        [0, 1],
        [colors.text.tertiary, colors.interactive.default]
      );

      return {
        transform: [{ translateY }, { scale }],
        color: error ? colors.status.error : color,
      };
    });

    // Border animation
    const animatedBorderStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        focusProgress.value,
        [0, 1],
        [colors.border.default, colors.interactive.default]
      );

      return {
        borderColor: error ? colors.status.error : borderColor,
        borderWidth: withTiming(focusProgress.value > 0 ? 2 : 1, {
          duration: duration.fast,
        }),
      };
    });

    // Shake animation for error
    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shake.value }],
    }));

    // Handlers
    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        focusProgress.value = withSpring(1, spring.snappy);
        labelPosition.value = withSpring(1, spring.gentle);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        focusProgress.value = withSpring(0, spring.snappy);
        if (!value) {
          labelPosition.value = withSpring(0, spring.gentle);
        }
        onBlur?.(e);
      },
      [value, onBlur]
    );

    // Trigger shake on error
    React.useEffect(() => {
      if (error) {
        shake.value = withSpring(10, { damping: 2, stiffness: 400 });
        setTimeout(() => {
          shake.value = withSpring(0, { damping: 10 });
        }, 100);
      }
    }, [error]);

    return (
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {/* Label */}
        {label && (
          <Animated.Text style={[styles.label, animatedLabelStyle]}>
            {label}
            {required && <Text style={{ color: colors.status.error }}> *</Text>}
          </Animated.Text>
        )}

        {/* Input Container */}
        <Animated.View
          style={[
            styles.inputContainer,
            animatedBorderStyle,
            disabled && styles.disabled,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <AnimatedTextInput
            ref={ref}
            style={[
              styles.input,
              { color: colors.text.primary },
              leftIcon && { paddingLeft: 8 },
              rightIcon && { paddingRight: 8 },
            ]}
            value={value}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={colors.text.tertiary}
            selectionColor={colors.interactive.default}
            {...props}
          />

          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </Animated.View>

        {/* Helper Text */}
        {(error || hint) && (
          <Text
            style={[
              styles.helperText,
              { color: error ? colors.status.error : colors.text.tertiary },
            ]}
          >
            {error || hint}
          </Text>
        )}
      </Animated.View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    position: "absolute",
    left: 16,
    top: 16,
    fontSize: 16,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "transparent",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});
```

### SearchBar (Modern)

```typescript
// src/shared/components/form/SearchBar/SearchBar.tsx

import React, { memo, useState, useCallback } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = memo(
  ({
    value,
    onChangeText,
    placeholder = "Ara...",
    onFocus,
    onBlur,
    onClear,
    autoFocus = false,
  }) => {
    const { colors } = useTheme();
    const { triggerHaptic } = useHaptic();
    const [isFocused, setIsFocused] = useState(false);

    const focusProgress = useSharedValue(0);

    const animatedContainerStyle = useAnimatedStyle(() => {
      const scale = interpolate(focusProgress.value, [0, 1], [1, 1.02]);
      return {
        transform: [{ scale }],
        borderColor:
          focusProgress.value > 0
            ? colors.interactive.default
            : colors.border.default,
      };
    });

    const animatedIconStyle = useAnimatedStyle(() => ({
      opacity: interpolate(focusProgress.value, [0, 1], [0.5, 1]),
      transform: [
        { scale: interpolate(focusProgress.value, [0, 1], [1, 1.1]) },
      ],
    }));

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      focusProgress.value = withSpring(1);
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      focusProgress.value = withSpring(0);
      onBlur?.();
    }, [onBlur]);

    const handleClear = useCallback(() => {
      triggerHaptic("light");
      onChangeText("");
      onClear?.();
    }, [onChangeText, onClear, triggerHaptic]);

    return (
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background.secondary },
          animatedContainerStyle,
        ]}
      >
        <Animated.View style={animatedIconStyle}>
          <Icon name="search" size={20} color={colors.text.tertiary} />
        </Animated.View>

        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {value.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
          >
            <Pressable onPress={handleClear} hitSlop={8}>
              <Icon
                name="close-circle"
                size={20}
                color={colors.text.tertiary}
              />
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    );
  }
);

SearchBar.displayName = "SearchBar";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
});
```

---

## 📊 Feedback Components

### Skeleton

```typescript
// src/shared/components/feedback/Skeleton/Skeleton.tsx

import React, { memo, useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  variant?: "text" | "circular" | "rectangular";
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = memo(
  ({
    width = "100%",
    height = 20,
    borderRadius,
    variant = "rectangular",
    style,
  }) => {
    const { colors } = useTheme();
    const shimmerProgress = useSharedValue(0);

    useEffect(() => {
      shimmerProgress.value = withRepeat(
        withTiming(1, { duration: 1200 }),
        -1,
        false
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        shimmerProgress.value,
        [0, 1],
        [-200, 200]
      );
      return {
        transform: [{ translateX }],
      };
    });

    const getBorderRadius = () => {
      if (borderRadius !== undefined) return borderRadius;
      switch (variant) {
        case "circular":
          return typeof height === "number" ? height / 2 : 50;
        case "text":
          return 4;
        default:
          return 8;
      }
    };

    const containerStyle: ViewStyle = {
      width: typeof width === "number" ? width : undefined,
      height:
        variant === "circular"
          ? typeof width === "number"
            ? width
            : height
          : height,
      borderRadius: getBorderRadius(),
      backgroundColor: colors.background.tertiary,
      overflow: "hidden",
    };

    return (
      <View style={[containerStyle, style]}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    );
  }
);

Skeleton.displayName = "Skeleton";

// Skeleton Group for common patterns
export const SkeletonPost: React.FC = memo(() => (
  <View style={skeletonStyles.post}>
    <View style={skeletonStyles.header}>
      <Skeleton variant="circular" width={40} height={40} />
      <View style={skeletonStyles.headerText}>
        <Skeleton width={120} height={14} />
        <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
    <Skeleton width="100%" height={16} style={{ marginTop: 12 }} />
    <Skeleton width="80%" height={16} style={{ marginTop: 8 }} />
    <Skeleton
      width="100%"
      height={200}
      style={{ marginTop: 12 }}
      borderRadius={12}
    />
  </View>
));

const skeletonStyles = StyleSheet.create({
  post: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
});
```

### Toast (Modern)

```typescript
// src/shared/components/feedback/Toast/Toast.tsx

import React, { memo, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  duration?: number;
  onHide?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const icons: Record<ToastType, string> = {
  success: "checkmark-circle",
  error: "close-circle",
  warning: "warning",
  info: "information-circle",
};

export const Toast: React.FC<ToastProps> = memo(
  ({ visible, type, message, duration = 3000, onHide, action }) => {
    const { colors } = useTheme();
    const { triggerHaptic } = useHaptic();

    const progress = useSharedValue(0);

    useEffect(() => {
      if (visible) {
        // Haptic feedback based on type
        const hapticType =
          type === "error" ? "error" : type === "success" ? "success" : "light";
        triggerHaptic(hapticType);

        // Auto hide
        const timer = setTimeout(() => {
          onHide?.();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [visible, type, duration, onHide, triggerHaptic]);

    if (!visible) return null;

    const iconColor = {
      success: colors.status.success,
      error: colors.status.error,
      warning: colors.status.warning,
      info: colors.status.info,
    }[type];

    return (
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown.springify().damping(15)}
        style={styles.container}
      >
        <BlurView intensity={80} style={styles.blur}>
          <View style={styles.content}>
            <Icon name={icons[type]} size={24} color={iconColor} />
            <Text style={[styles.message, { color: colors.text.primary }]}>
              {message}
            </Text>
            {action && (
              <Pressable onPress={action.onPress}>
                <Text
                  style={[styles.action, { color: colors.interactive.default }]}
                >
                  {action.label}
                </Text>
              </Pressable>
            )}
          </View>
        </BlurView>
      </Animated.View>
    );
  }
);

Toast.displayName = "Toast";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  blur: {
    borderRadius: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  action: {
    fontSize: 15,
    fontWeight: "600",
  },
});
```

---

## 📱 Data Display Components

### Avatar (Modern)

```typescript
// src/shared/components/data/Avatar/Avatar.tsx

import React, { memo, useState } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  FadeIn,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@theme";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeColor?: string;
  isOnline?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const sizes: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 56,
  xl: 80,
  "2xl": 120,
};

const blurhash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4"; // Placeholder blurhash

export const Avatar: React.FC<AvatarProps> = memo(
  ({
    uri,
    name,
    size = "md",
    showBadge = false,
    badgeColor,
    isOnline = false,
    isPremium = false,
    isVerified = false,
    onPress,
    style,
  }) => {
    const { colors } = useTheme();
    const [isLoaded, setIsLoaded] = useState(false);
    const dimension = sizes[size];

    // Online pulse animation
    const pulse = useSharedValue(1);

    React.useEffect(() => {
      if (isOnline) {
        pulse.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
      }
    }, [isOnline]);

    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulse.value }],
      opacity: interpolate(pulse.value, [1, 1.2], [1, 0.5]),
    }));

    // Get initials
    const initials = React.useMemo(() => {
      if (!name) return "?";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }, [name]);

    // Generate color from name
    const backgroundColor = React.useMemo(() => {
      if (!name) return colors.background.tertiary;
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, 65%, 55%)`;
    }, [name, colors]);

    return (
      <View style={[{ width: dimension, height: dimension }, style]}>
        {/* Premium ring */}
        {isPremium && (
          <View style={[StyleSheet.absoluteFill, { margin: -3 }]}>
            <LinearGradient
              colors={colors.gradient.premium}
              style={[styles.ring, { borderRadius: (dimension + 6) / 2 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        )}

        {/* Avatar container */}
        <View
          style={[
            styles.container,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor,
            },
          ]}
        >
          {uri ? (
            <Image
              source={{ uri }}
              placeholder={blurhash}
              style={styles.image}
              contentFit="cover"
              transition={200}
              onLoad={() => setIsLoaded(true)}
            />
          ) : (
            <Animated.Text
              entering={FadeIn}
              style={[styles.initials, { fontSize: dimension * 0.4 }]}
            >
              {initials}
            </Animated.Text>
          )}
        </View>

        {/* Online indicator */}
        {isOnline && (
          <View style={[styles.badgeContainer, { right: 0, bottom: 0 }]}>
            <Animated.View
              style={[
                styles.onlineBadge,
                { backgroundColor: colors.special.online },
                pulseStyle,
              ]}
            />
            <View
              style={[
                styles.onlineBadge,
                { backgroundColor: colors.special.online },
              ]}
            />
          </View>
        )}

        {/* Verified badge */}
        {isVerified && (
          <View style={[styles.verifiedBadge, { right: -2, bottom: -2 }]}>
            <LinearGradient
              colors={["#0066FF", "#00C853"]}
              style={styles.verifiedGradient}
            >
              {/* Checkmark icon */}
            </LinearGradient>
          </View>
        )}
      </View>
    );
  }
);

Avatar.displayName = "Avatar";

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  ring: {
    flex: 1,
  },
  badgeContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineBadge: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  verifiedGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

---

## 📋 Sonraki Adım

Component library tanımlandıktan sonra [05-ANIMATION-MOTION.md](./05-ANIMATION-MOTION.md) dokümanında animasyon sistemi detaylandırılacaktır.

---

## 📎 Component Checklist

### Core Components

- [ ] Button (with all variants)
- [ ] Pressable (base)
- [ ] Text (typography variants)
- [ ] Icon (animated)

### Form Components

- [ ] Input (floating label)
- [ ] TextArea
- [ ] SearchBar
- [ ] Select
- [ ] Checkbox
- [ ] Switch

### Feedback Components

- [ ] Skeleton
- [ ] Spinner
- [ ] Toast
- [ ] Alert
- [ ] Progress

### Data Display

- [ ] Avatar
- [ ] Badge
- [ ] List / ListItem
- [ ] Empty State
- [ ] Image (with blurhash)

### Layout Components

- [ ] Screen
- [ ] Card
- [ ] Divider
- [ ] Spacer
