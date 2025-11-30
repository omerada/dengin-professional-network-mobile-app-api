# Design System

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium)

---

## 1. Overview

Design system ile tutarlı UI komponenti kütüphanesi, theme sistemi, typography ve spacing standartları.

---

## 2. Component Library Structure

```
src/components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   └── Divider.tsx
├── layout/
│   ├── Container.tsx
│   ├── Screen.tsx
│   └── ScrollView.tsx
└── feedback/
    ├── LoadingSpinner.tsx
    ├── ErrorView.tsx
    └── EmptyState.tsx
```

---

## 3. Button Component

**src/components/ui/Button.tsx:**

```typescript
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "@contexts/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}) => {
  const { theme } = useTheme();

  const buttonStyles = [
    styles.button,
    {
      backgroundColor:
        variant === "primary"
          ? theme.colors.primary
          : variant === "secondary"
          ? theme.colors.secondary
          : "transparent",
      borderColor: variant === "outline" ? theme.colors.border : "transparent",
      borderWidth: variant === "outline" ? 1 : 0,
      paddingVertical: size === "sm" ? 8 : size === "md" ? 12 : 16,
      paddingHorizontal: size === "sm" ? 16 : size === "md" ? 24 : 32,
      borderRadius: theme.borderRadius.md,
      opacity: disabled ? 0.5 : 1,
    },
    fullWidth && styles.fullWidth,
  ];

  const textColor =
    variant === "primary" || variant === "secondary"
      ? "#FFFFFF"
      : theme.colors.primary;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
```

---

## 4. Input Component

**src/components/ui/Input.tsx:**

```typescript
import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error
              ? theme.colors.error
              : isFocused
              ? theme.colors.primary
              : theme.colors.border,
            borderRadius: theme.borderRadius.md,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              flex: 1,
            },
            multiline && { height: numberOfLines * 20 },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
```

---

## 5. Card Component

**src/components/ui/Card.tsx:**

```typescript
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = "md",
}) => {
  const { theme } = useTheme();

  const paddingValue =
    padding === "none"
      ? 0
      : padding === "sm"
      ? theme.spacing.sm
      : padding === "md"
      ? theme.spacing.md
      : theme.spacing.lg;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: paddingValue,
          shadowColor: theme.colors.text,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

---

## 6. Avatar Component

**src/components/ui/Avatar.tsx:**

```typescript
import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  badge?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = "md",
  badge = false,
}) => {
  const { theme } = useTheme();

  const sizeValue =
    size === "sm" ? 32 : size === "md" ? 48 : size === "lg" ? 64 : 96;

  const getInitials = (name?: string): string => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <View>
      <View
        style={[
          styles.avatar,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
            }}
          />
        ) : (
          <Text
            style={[
              styles.initials,
              {
                fontSize: sizeValue / 2.5,
                color: "#FFFFFF",
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        )}
      </View>

      {badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.success,
              width: sizeValue / 4,
              height: sizeValue / 4,
              borderRadius: sizeValue / 8,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  initials: {
    fontWeight: "bold",
  },
  badge: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
```

---

## 7. Screen Layout

**src/components/layout/Screen.tsx:**

```typescript
import React from "react";
import { SafeAreaView, View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  padding = true,
}) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.container,
          padding && { padding: theme.spacing.md },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
```

---

## 8. Loading Spinner

**src/components/feedback/LoadingSpinner.tsx:**

```typescript
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = "large",
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && (
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
});
```

---

## 9. Error View

**src/components/feedback/ErrorView.tsx:**

```typescript
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@contexts/ThemeContext";
import { Button } from "@components/ui/Button";

interface ErrorViewProps {
  error: Error | any;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ error, onRetry }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.error }]}>
        Bir Hata Oluştu
      </Text>
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {error?.message || "Bilinmeyen bir hata oluştu"}
      </Text>
      {onRetry && (
        <Button
          title="Tekrar Dene"
          onPress={onRetry}
          variant="primary"
          style={{ marginTop: 16 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
  },
});
```

---

## 10. Typography System

**src/components/ui/Typography.tsx:**

```typescript
import React from "react";
import { Text as RNText, TextStyle } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

interface TextProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
  color?: "primary" | "secondary" | "text" | "textSecondary" | "error";
  align?: "left" | "center" | "right";
  style?: TextStyle;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = "body",
  color = "text",
  align = "left",
  style,
}) => {
  const { theme } = useTheme();

  return (
    <RNText
      style={[
        theme.typography[variant],
        { color: theme.colors[color], textAlign: align },
        style,
      ]}
    >
      {children}
    </RNText>
  );
};
```

---

## 11. Summary

### Components:

- ✅ Button (variants, sizes, loading)
- ✅ Input (validation, icons)
- ✅ Card (elevation, padding)
- ✅ Avatar (initials, badge)
- ✅ Screen layout (SafeAreaView)
- ✅ Loading spinner
- ✅ Error view
- ✅ Typography system

**Result:** Comprehensive design system with reusable, themed components.
