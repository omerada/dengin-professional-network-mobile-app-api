# Sprint 13-14: Part 4 - Shared Components

**Continues from:** 29-SPRINT-13-14-PART3.md

---

## 📁 Day 4-5: Eksik Shared Components

### Hedef Dosya Yapısı

```
src/shared/components/
├── Avatar/
│   ├── index.ts
│   └── Avatar.tsx
├── Badge/
│   ├── index.ts
│   └── Badge.tsx
├── Card/
│   ├── index.ts
│   └── Card.tsx
├── Modal/
│   ├── index.ts
│   ├── Modal.tsx
│   └── BottomSheet.tsx
├── Toast/
│   ├── index.ts
│   ├── Toast.tsx
│   └── ToastProvider.tsx
├── EmptyState/
│   ├── index.ts
│   └── EmptyState.tsx
├── Skeleton/
│   ├── index.ts
│   └── Skeleton.tsx
└── index.ts (güncelleme)
```

---

### 1. Avatar Component (`Avatar/Avatar.tsx`)

```typescript
// src/shared/components/Avatar/Avatar.tsx
// Kullanıcı avatar komponenti

import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useTheme } from "@contexts/ThemeContext";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  onPress?: () => void;
  showBadge?: boolean;
  badgeColor?: string;
  style?: ViewStyle;
  testID?: string;
}

const SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  "2xl": 120,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
  "2xl": 42,
};

export const Avatar: React.FC<AvatarProps> = memo(
  ({
    uri,
    name,
    size = "md",
    onPress,
    showBadge = false,
    badgeColor,
    style,
    testID,
  }) => {
    const { theme } = useTheme();
    const dimension = SIZES[size];
    const fontSize = FONT_SIZES[size];

    const initials = useMemo(() => {
      if (!name) return "?";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }, [name]);

    const backgroundColor = useMemo(() => {
      if (!name) return theme.colors.neutral[300];
      // Generate consistent color from name
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const colors = [
        theme.colors.primary[400],
        theme.colors.secondary[400],
        theme.colors.success.main,
        theme.colors.warning.main,
        theme.colors.info.main,
      ];
      return colors[Math.abs(hash) % colors.length];
    }, [name, theme]);

    const containerStyle: ViewStyle = {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
      backgroundColor,
      overflow: "hidden",
    };

    const content = uri ? (
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
    ) : (
      <View style={[styles.placeholder, { backgroundColor }]}>
        <Text style={[styles.initials, { fontSize, color: "#FFFFFF" }]}>
          {initials}
        </Text>
      </View>
    );

    const badge = showBadge && (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: badgeColor || theme.colors.success.main,
            width: dimension * 0.25,
            height: dimension * 0.25,
            borderRadius: dimension * 0.125,
            borderColor: theme.colors.background.primary,
          },
        ]}
      />
    );

    if (onPress) {
      return (
        <TouchableOpacity
          style={[containerStyle, style]}
          onPress={onPress}
          activeOpacity={0.7}
          testID={testID}
          accessibilityLabel={
            name ? `${name} profil fotoğrafı` : "Profil fotoğrafı"
          }
          accessibilityRole="button"
        >
          {content}
          {badge}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[containerStyle, style]} testID={testID}>
        {content}
        {badge}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});

Avatar.displayName = "Avatar";
```

---

### 2. Badge Component (`Badge/Badge.tsx`)

```typescript
// src/shared/components/Badge/Badge.tsx
// Bildirim/sayı badge komponenti

import React, { memo } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  count?: number;
  maxCount?: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const SIZES: Record<
  BadgeSize,
  { minWidth: number; height: number; fontSize: number; padding: number }
> = {
  sm: { minWidth: 16, height: 16, fontSize: 10, padding: 4 },
  md: { minWidth: 20, height: 20, fontSize: 11, padding: 5 },
  lg: { minWidth: 24, height: 24, fontSize: 12, padding: 6 },
};

export const Badge: React.FC<BadgeProps> = memo(
  ({
    count,
    maxCount = 99,
    variant = "primary",
    size = "md",
    dot = false,
    style,
    textStyle,
    testID,
  }) => {
    const { theme } = useTheme();
    const sizeConfig = SIZES[size];

    const getBackgroundColor = () => {
      switch (variant) {
        case "primary":
          return theme.colors.primary[500];
        case "secondary":
          return theme.colors.secondary[500];
        case "success":
          return theme.colors.success.main;
        case "warning":
          return theme.colors.warning.main;
        case "error":
          return theme.colors.error.main;
        case "info":
          return theme.colors.info.main;
        default:
          return theme.colors.primary[500];
      }
    };

    // Dot mode
    if (dot) {
      return (
        <View
          style={[
            styles.dot,
            {
              width: sizeConfig.height / 2,
              height: sizeConfig.height / 2,
              borderRadius: sizeConfig.height / 4,
              backgroundColor: getBackgroundColor(),
            },
            style,
          ]}
          testID={testID}
        />
      );
    }

    // No count or zero
    if (count === undefined || count === 0) {
      return null;
    }

    const displayText = count > maxCount ? `${maxCount}+` : count.toString();

    return (
      <View
        style={[
          styles.container,
          {
            minWidth: sizeConfig.minWidth,
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.padding,
            borderRadius: sizeConfig.height / 2,
            backgroundColor: getBackgroundColor(),
          },
          style,
        ]}
        testID={testID}
        accessibilityLabel={`${count} bildirim`}
      >
        <Text
          style={[styles.text, { fontSize: sizeConfig.fontSize }, textStyle]}
        >
          {displayText}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
  dot: {},
});

Badge.displayName = "Badge";
```

---

### 3. Card Component (`Card/Card.tsx`)

```typescript
// src/shared/components/Card/Card.tsx
// Genel amaçlı kart komponenti

import React, { memo, ReactNode } from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, shadows } from "@theme";

type CardVariant = "elevated" | "outlined" | "filled";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const PADDING_VALUES: Record<CardPadding, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

export const Card: React.FC<CardProps> = memo(
  ({
    children,
    variant = "elevated",
    padding = "md",
    onPress,
    disabled = false,
    style,
    testID,
  }) => {
    const { theme } = useTheme();

    const getContainerStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        borderRadius: 12,
        padding: PADDING_VALUES[padding],
        backgroundColor: theme.colors.background.primary,
      };

      switch (variant) {
        case "elevated":
          return {
            ...baseStyle,
            ...shadows.md,
          };
        case "outlined":
          return {
            ...baseStyle,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
          };
        case "filled":
          return {
            ...baseStyle,
            backgroundColor: theme.colors.background.secondary,
          };
        default:
          return baseStyle;
      }
    };

    if (onPress) {
      return (
        <TouchableOpacity
          style={[getContainerStyle(), style]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.7}
          testID={testID}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[getContainerStyle(), style]} testID={testID}>
        {children}
      </View>
    );
  }
);

const styles = StyleSheet.create({});

Card.displayName = "Card";
```

---

### 4. EmptyState Component (`EmptyState/EmptyState.tsx`)

```typescript
// src/shared/components/EmptyState/EmptyState.tsx
// Boş durum komponenti

import React, { memo } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";
import { Button } from "../Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({
    icon = "file-tray-outline",
    title,
    message,
    actionLabel,
    onAction,
    style,
    testID,
  }) => {
    const { theme } = useTheme();

    return (
      <View style={[styles.container, style]} testID={testID}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.background.secondary },
          ]}
        >
          <Icon name={icon} size={48} color={theme.colors.text.tertiary} />
        </View>

        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>

        {message && (
          <Text
            style={[styles.message, { color: theme.colors.text.secondary }]}
          >
            {message}
          </Text>
        )}

        {actionLabel && onAction && (
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="md"
            style={styles.button}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSize.base,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 160,
  },
});

EmptyState.displayName = "EmptyState";
```

---

### 5. Skeleton Component (`Skeleton/Skeleton.tsx`)

```typescript
// src/shared/components/Skeleton/Skeleton.tsx
// Shimmer loading placeholder

import React, { memo, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Dimensions,
} from "react-native";
import { useTheme } from "@contexts/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type SkeletonVariant = "text" | "circular" | "rectangular";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Skeleton: React.FC<SkeletonProps> = memo(
  ({
    variant = "text",
    width = "100%",
    height,
    borderRadius,
    style,
    testID,
  }) => {
    const { theme } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }, [shimmerAnim]);

    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case "circular":
          const size = typeof height === "number" ? height : 40;
          return {
            width: size,
            height: size,
            borderRadius: size / 2,
          };
        case "rectangular":
          return {
            width,
            height: height || 100,
            borderRadius: borderRadius || 8,
          };
        case "text":
        default:
          return {
            width,
            height: height || 16,
            borderRadius: borderRadius || 4,
          };
      }
    };

    const translateX = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
    });

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.neutral[200] },
          getVariantStyles(),
          style,
        ]}
        testID={testID}
      >
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: theme.colors.neutral[100],
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  }
);

// Pre-built skeleton layouts
export const SkeletonPost: React.FC = memo(() => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        skeletonStyles.postContainer,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <View style={skeletonStyles.header}>
        <Skeleton variant="circular" height={40} />
        <View style={skeletonStyles.headerText}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="30%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
      <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
});

export const SkeletonMessage: React.FC<{ isOwn?: boolean }> = memo(
  ({ isOwn = false }) => {
    return (
      <View
        style={[
          skeletonStyles.messageContainer,
          isOwn && skeletonStyles.ownMessage,
        ]}
      >
        {!isOwn && (
          <Skeleton variant="circular" height={32} style={{ marginRight: 8 }} />
        )}
        <View
          style={{ flex: 1, alignItems: isOwn ? "flex-end" : "flex-start" }}
        >
          <Skeleton
            width={isOwn ? "60%" : "70%"}
            height={36}
            borderRadius={16}
          />
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 80,
  },
});

const skeletonStyles = StyleSheet.create({
  postContainer: {
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  ownMessage: {
    flexDirection: "row-reverse",
  },
});

Skeleton.displayName = "Skeleton";
SkeletonPost.displayName = "SkeletonPost";
SkeletonMessage.displayName = "SkeletonMessage";
```

---

### 6. Modal & BottomSheet (`Modal/Modal.tsx`)

```typescript
// src/shared/components/Modal/Modal.tsx

import React, { memo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  testID?: string;
}

export const Modal: React.FC<ModalProps> = memo(
  ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    closeOnBackdrop = true,
    testID,
  }) => {
    const { theme } = useTheme();

    return (
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        testID={testID}
      >
        <TouchableWithoutFeedback
          onPress={closeOnBackdrop ? onClose : undefined}
        >
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <View
                  style={[
                    styles.content,
                    { backgroundColor: theme.colors.background.primary },
                  ]}
                >
                  {(title || showCloseButton) && (
                    <View
                      style={[
                        styles.header,
                        { borderBottomColor: theme.colors.border.light },
                      ]}
                    >
                      {title && (
                        <Text
                          style={[
                            styles.title,
                            { color: theme.colors.text.primary },
                          ]}
                        >
                          {title}
                        </Text>
                      )}
                      {showCloseButton && (
                        <TouchableOpacity
                          onPress={onClose}
                          style={styles.closeButton}
                          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        >
                          <Icon
                            name="close"
                            size={24}
                            color={theme.colors.text.secondary}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  <View style={styles.body}>{children}</View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    );
  }
);

// BottomSheet variant
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: number | "auto";
  testID?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = memo(
  ({ visible, onClose, title, children, height = "auto", testID }) => {
    const { theme } = useTheme();

    return (
      <RNModal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        testID={testID}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.bottomSheetContent,
                  {
                    backgroundColor: theme.colors.background.primary,
                    maxHeight: height === "auto" ? SCREEN_HEIGHT * 0.9 : height,
                  },
                ]}
              >
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: theme.colors.border.medium },
                  ]}
                />

                {title && (
                  <View
                    style={[
                      styles.bottomSheetHeader,
                      { borderBottomColor: theme.colors.border.light },
                    ]}
                  >
                    <Text
                      style={[
                        styles.title,
                        { color: theme.colors.text.primary },
                      ]}
                    >
                      {title}
                    </Text>
                  </View>
                )}

                <View style={styles.bottomSheetBody}>{children}</View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: Dimensions.get("window").width - 48,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  body: {
    padding: spacing.lg,
  },
  // BottomSheet styles
  bottomSheetContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
  },
  bottomSheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  bottomSheetBody: {
    padding: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
});

Modal.displayName = "Modal";
BottomSheet.displayName = "BottomSheet";
```

---

### 7. Toast Component (`Toast/Toast.tsx`)

```typescript
// src/shared/components/Toast/Toast.tsx

import React, { memo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onHide: (id: string) => void;
}

const ICONS: Record<ToastType, string> = {
  success: "checkmark-circle",
  error: "close-circle",
  warning: "warning",
  info: "information-circle",
};

export const Toast: React.FC<ToastProps> = memo(({ toast, onHide }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const getColor = () => {
    switch (toast.type) {
      case "success":
        return theme.colors.success.main;
      case "error":
        return theme.colors.error.main;
      case "warning":
        return theme.colors.warning.main;
      case "info":
        return theme.colors.info.main;
    }
  };

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    const timer = setTimeout(() => {
      hideToast();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide(toast.id));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.primary,
          top: insets.top + spacing.sm,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: getColor() }]} />
      <Icon name={ICONS[toast.type]} size={24} color={getColor()} />
      <Text
        style={[styles.message, { color: theme.colors.text.primary }]}
        numberOfLines={2}
      >
        {toast.message}
      </Text>
      <TouchableOpacity
        onPress={hideToast}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Icon name="close" size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.base,
    marginHorizontal: spacing.sm,
  },
});

Toast.displayName = "Toast";
```

---

### 8. Updated Shared Components Index

```typescript
// src/shared/components/index.ts

// Existing components
export { Button } from "./Button";
export { Input } from "./Input";
export { Loading } from "./Loading";
export { ErrorFallback } from "./ErrorFallback";
export { OfflineNotice } from "./OfflineNotice";

// New components
export { Avatar } from "./Avatar";
export { Badge } from "./Badge";
export { Card } from "./Card";
export { EmptyState } from "./EmptyState";
export { Skeleton, SkeletonPost, SkeletonMessage } from "./Skeleton";
export { Modal, BottomSheet } from "./Modal";
export { Toast } from "./Toast";
export type { ToastType, ToastData } from "./Toast";
```

---

**Bu Part içerir:**

- Avatar ✅
- Badge ✅
- Card ✅
- EmptyState ✅
- Skeleton (+ SkeletonPost, SkeletonMessage) ✅
- Modal & BottomSheet ✅
- Toast ✅

**Sonraki Part:** Social Features (Follow/Unfollow), Report/Block
