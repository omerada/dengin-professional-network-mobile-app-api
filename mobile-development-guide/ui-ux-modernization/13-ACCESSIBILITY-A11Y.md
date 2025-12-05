# ♿ Erişilebilirlik (A11Y)

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** WCAG 2.1 AA uyumlu erişilebilir uygulama

---

## 📑 İçindekiler

1. [Erişilebilirlik Prensipleri](#erişilebilirlik-prensipleri)
2. [Screen Reader Desteği](#screen-reader-desteği)
3. [Focus Management](#focus-management)
4. [Color & Contrast](#color--contrast)
5. [Motion & Animation](#motion--animation)
6. [Touch Targets](#touch-targets)
7. [Testing Checklist](#testing-checklist)

---

## 🎯 Erişilebilirlik Prensipleri

### WCAG 2.1 AA Gereksinimleri

```
1. PERCEIVABLE: Algılanabilir içerik
   - Text alternatives for non-text content
   - Captions for audio/video
   - Sufficient color contrast

2. OPERABLE: Kullanılabilir arayüz
   - Keyboard/screen reader navigable
   - Enough time to read content
   - No seizure-inducing content

3. UNDERSTANDABLE: Anlaşılır içerik
   - Readable and predictable
   - Input assistance
   - Error prevention/correction

4. ROBUST: Sağlam implementasyon
   - Compatible with assistive tech
   - Valid, semantic markup
```

---

## 🔊 Screen Reader Desteği

### Accessibility Props Usage

```typescript
// src/shared/components/core/AccessibleButton/AccessibleButton.tsx

import React, { memo } from "react";
import { Pressable, Text, StyleSheet, AccessibilityState } from "react-native";
import { useTheme } from "@theme";

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  hint?: string; // VoiceOver hint
  testID?: string;
}

export const AccessibleButton = memo<AccessibleButtonProps>(
  ({
    title,
    onPress,
    disabled = false,
    loading = false,
    selected = false,
    hint,
    testID,
  }) => {
    const { colors } = useTheme();

    // Build accessibility state
    const accessibilityState: AccessibilityState = {
      disabled: disabled || loading,
      selected,
      busy: loading,
    };

    // Build accessibility label
    const accessibilityLabel = loading ? `${title}, yükleniyor` : title;

    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          { backgroundColor: colors.primary.main },
          disabled && styles.disabled,
        ]}
        // Core accessibility props
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={hint}
        accessibilityState={accessibilityState}
      >
        <Text style={[styles.text, { color: colors.primary.contrast }]}>
          {loading ? "Yükleniyor..." : title}
        </Text>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 48, // Touch target
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
```

### Accessibility Roles Reference

```typescript
// Correct usage of accessibilityRole

// Interactive elements
accessibilityRole = "button"; // Tappable buttons
accessibilityRole = "link"; // Navigation links
accessibilityRole = "checkbox"; // Toggle checkboxes
accessibilityRole = "radio"; // Radio buttons
accessibilityRole = "switch"; // Toggle switches
accessibilityRole = "slider"; // Sliders
accessibilityRole = "spinbutton"; // Numeric steppers

// Content elements
accessibilityRole = "header"; // Section headers
accessibilityRole = "text"; // Static text
accessibilityRole = "image"; // Images
accessibilityRole = "imagebutton"; // Image as button
accessibilityRole = "search"; // Search inputs
accessibilityRole = "alert"; // Alert messages
accessibilityRole = "progressbar"; // Progress indicators

// Structural elements
accessibilityRole = "list"; // List container
accessibilityRole = "listitem"; // List item
accessibilityRole = "menu"; // Menu container
accessibilityRole = "menuitem"; // Menu item
accessibilityRole = "tab"; // Tab button
accessibilityRole = "tablist"; // Tab container
```

### Accessible Post Card

```typescript
// src/features/feed/components/AccessiblePostCard/AccessiblePostCard.tsx

import React, { memo } from "react";
import { View, Text, Image, StyleSheet, AccessibilityInfo } from "react-native";
import { PressableScale } from "@shared/components";
import { useTheme } from "@theme";
import { formatRelativeTime } from "@utils/date";

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    isVerified: boolean;
  };
  content: string;
  imageUrl?: string;
  imageAlt?: string; // Alt text for image
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  isLiked: boolean;
}

interface AccessiblePostCardProps {
  post: Post;
  onPress: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onAuthorPress: () => void;
}

export const AccessiblePostCard = memo<AccessiblePostCardProps>(
  ({ post, onPress, onLike, onComment, onShare, onAuthorPress }) => {
    const { colors } = useTheme();

    // Build comprehensive accessibility label for post
    const postAccessibilityLabel = [
      `${post.author.name} tarafından paylaşıldı`,
      post.author.isVerified ? "(doğrulanmış hesap)" : "",
      post.content,
      post.imageUrl ? post.imageAlt || "Fotoğraf içeriyor" : "",
      `${post.likesCount} beğeni, ${post.commentsCount} yorum`,
      formatRelativeTime(post.createdAt),
    ]
      .filter(Boolean)
      .join(". ");

    return (
      <View
        style={[styles.container, { backgroundColor: colors.surface.primary }]}
        accessible={true}
        accessibilityRole="article"
        accessibilityLabel={postAccessibilityLabel}
      >
        {/* Author row */}
        <PressableScale
          onPress={onAuthorPress}
          accessibilityRole="button"
          accessibilityLabel={`${post.author.name} profiline git${
            post.author.isVerified ? ", doğrulanmış hesap" : ""
          }`}
          accessibilityHint="Profil sayfasını açar"
        >
          <View style={styles.authorRow}>
            <Image
              source={{ uri: post.author.avatar }}
              style={styles.avatar}
              accessibilityIgnoresInvertColors
            />
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: colors.text.primary }]}>
                  {post.author.name}
                </Text>
                {post.author.isVerified && (
                  <VerifiedBadge accessibilityLabel="Doğrulanmış hesap" />
                )}
              </View>
              <Text style={[styles.username, { color: colors.text.secondary }]}>
                @{post.author.username}
              </Text>
            </View>
          </View>
        </PressableScale>

        {/* Content */}
        <PressableScale
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Gönderi detayını aç"
        >
          <Text
            style={[styles.content, { color: colors.text.primary }]}
            accessibilityRole="text"
          >
            {post.content}
          </Text>

          {/* Image with alt text */}
          {post.imageUrl && (
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.image}
              accessibilityRole="image"
              accessibilityLabel={post.imageAlt || "Gönderi resmi"}
              accessibilityIgnoresInvertColors
            />
          )}
        </PressableScale>

        {/* Actions */}
        <View
          style={styles.actions}
          accessibilityRole="toolbar"
          accessibilityLabel="Gönderi işlemleri"
        >
          <PressableScale
            onPress={onLike}
            accessibilityRole="button"
            accessibilityLabel={post.isLiked ? "Beğeniyi kaldır" : "Beğen"}
            accessibilityState={{ checked: post.isLiked }}
            accessibilityHint={`${post.likesCount} beğeni`}
          >
            <HeartIcon filled={post.isLiked} />
          </PressableScale>

          <PressableScale
            onPress={onComment}
            accessibilityRole="button"
            accessibilityLabel="Yorum yap"
            accessibilityHint={`${post.commentsCount} yorum var`}
          >
            <CommentIcon />
          </PressableScale>

          <PressableScale
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel="Paylaş"
            accessibilityHint="Gönderiyi paylaşma seçeneklerini açar"
          >
            <ShareIcon />
          </PressableScale>
        </View>
      </View>
    );
  }
);
```

---

## 🎯 Focus Management

### Focus Trap for Modals

```typescript
// src/hooks/useFocusTrap.ts

import { useEffect, useRef, useCallback } from "react";
import { findNodeHandle, AccessibilityInfo, View } from "react-native";

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
}

export const useFocusTrap = ({ isActive, onEscape }: UseFocusTrapOptions) => {
  const containerRef = useRef<View>(null);
  const previousFocusRef = useRef<number | null>(null);

  // Capture previous focus when trap activates
  useEffect(() => {
    if (isActive) {
      // Store current focus
      AccessibilityInfo.announceForAccessibility("Diyalog açıldı");

      // Focus first element in trap
      if (containerRef.current) {
        const node = findNodeHandle(containerRef.current);
        if (node) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      }
    } else {
      // Restore previous focus
      if (previousFocusRef.current) {
        AccessibilityInfo.setAccessibilityFocus(previousFocusRef.current);
      }
      AccessibilityInfo.announceForAccessibility("Diyalog kapatıldı");
    }
  }, [isActive]);

  return {
    containerRef,
    containerProps: {
      accessible: true,
      accessibilityViewIsModal: isActive,
    },
  };
};
```

### Accessible Modal

```typescript
// src/shared/components/AccessibleModal/AccessibleModal.tsx

import React, { memo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";

interface AccessibleModalProps {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const AccessibleModal = memo<AccessibleModalProps>(
  ({ visible, title, children, onClose }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    // Announce modal state changes
    useEffect(() => {
      if (visible) {
        AccessibilityInfo.announceForAccessibility(`${title} açıldı`);
      }
    }, [visible, title]);

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
        // iOS specific
        accessibilityViewIsModal={true}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.surface.primary },
          ]}
          accessibilityRole="dialog"
          accessibilityLabel={title}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              accessibilityHint="Diyaloğu kapatır"
              hitSlop={16}
            >
              <CloseIcon size={24} color={colors.text.primary} />
            </Pressable>

            <Text
              style={[styles.title, { color: colors.text.primary }]}
              accessibilityRole="header"
            >
              {title}
            </Text>

            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          <View style={[styles.content, { paddingBottom: insets.bottom }]}>
            {children}
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
```

---

## 🎨 Color & Contrast

### Contrast Utilities

```typescript
// src/utils/accessibility/contrast.ts

/**
 * Calculate relative luminance
 * Based on WCAG 2.1 formula
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * Returns ratio like 4.5:1
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const parseHex = (hex: string) => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return [0, 0, 0];
    return [
      parseInt(match[1], 16),
      parseInt(match[2], 16),
      parseInt(match[3], 16),
    ];
  };

  const [r1, g1, b1] = parseHex(color1);
  const [r2, g2, b2] = parseHex(color2);

  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast meets WCAG requirements
 */
export const meetsContrastRequirements = (
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);

  // WCAG thresholds
  const thresholds = {
    AA: isLargeText ? 3 : 4.5,
    AAA: isLargeText ? 4.5 : 7,
  };

  return ratio >= thresholds[level];
};

/**
 * Get accessible text color for background
 */
export const getAccessibleTextColor = (
  backgroundColor: string,
  lightText: string = "#FFFFFF",
  darkText: string = "#000000"
): string => {
  const lightRatio = getContrastRatio(lightText, backgroundColor);
  const darkRatio = getContrastRatio(darkText, backgroundColor);

  return lightRatio > darkRatio ? lightText : darkText;
};
```

### Theme Contrast Validation

```typescript
// src/theme/validateContrast.ts

import {
  getContrastRatio,
  meetsContrastRequirements,
} from "@utils/accessibility/contrast";
import { lightColors, darkColors } from "./colors";

interface ContrastCheck {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
}

export const validateThemeContrast = (isDark: boolean): ContrastCheck[] => {
  const colors = isDark ? darkColors : lightColors;

  const checks: ContrastCheck[] = [
    // Primary text on backgrounds
    {
      pair: "Primary text on surface",
      foreground: colors.text.primary,
      background: colors.surface.primary,
    },
    {
      pair: "Secondary text on surface",
      foreground: colors.text.secondary,
      background: colors.surface.primary,
    },
    // Button contrast
    {
      pair: "Button text on primary",
      foreground: colors.primary.contrast,
      background: colors.primary.main,
    },
    // Error text
    {
      pair: "Error on surface",
      foreground: colors.semantic.error,
      background: colors.surface.primary,
    },
  ].map((check) => ({
    ...check,
    ratio: getContrastRatio(check.foreground, check.background),
    meetsAA: meetsContrastRequirements(
      check.foreground,
      check.background,
      "AA"
    ),
    meetsAAA: meetsContrastRequirements(
      check.foreground,
      check.background,
      "AAA"
    ),
  }));

  // Log warnings for failing checks
  checks.forEach((check) => {
    if (!check.meetsAA) {
      console.warn(
        `⚠️ Contrast warning: ${check.pair} (${check.ratio.toFixed(2)}:1) ` +
          `does not meet WCAG AA requirements`
      );
    }
  });

  return checks;
};
```

---

## 🎬 Motion & Animation

### Reduced Motion Support

```typescript
// src/hooks/useReducedMotion.ts

import { useEffect, useState, useCallback } from "react";
import { AccessibilityInfo } from "react-native";

export const useReducedMotion = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Get initial value
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotion);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setIsReducedMotion
    );

    return () => subscription.remove();
  }, []);

  return isReducedMotion;
};

// Usage in animations
export const useAccessibleSpring = (config: any) => {
  const isReducedMotion = useReducedMotion();

  if (isReducedMotion) {
    // Return instant timing instead of spring
    return {
      ...config,
      damping: 100,
      stiffness: 1000,
    };
  }

  return config;
};
```

### Accessible Animation Wrapper

```typescript
// src/shared/components/AccessibleAnimation/AccessibleAnimation.tsx

import React, { memo } from "react";
import Animated, { FadeIn, FadeOut, withTiming } from "react-native-reanimated";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface AccessibleAnimationProps {
  children: React.ReactNode;
  entering?: any;
  exiting?: any;
}

export const AccessibleAnimation = memo<AccessibleAnimationProps>(
  ({ children, entering = FadeIn, exiting = FadeOut }) => {
    const isReducedMotion = useReducedMotion();

    // If reduced motion, use simple fade with minimal duration
    const accessibleEntering = isReducedMotion
      ? FadeIn.duration(100)
      : entering;

    const accessibleExiting = isReducedMotion ? FadeOut.duration(100) : exiting;

    return (
      <Animated.View entering={accessibleEntering} exiting={accessibleExiting}>
        {children}
      </Animated.View>
    );
  }
);
```

---

## 👆 Touch Targets

### Minimum Touch Target Guidelines

```typescript
// src/constants/accessibility.ts

export const A11Y = {
  // Minimum touch target size (WCAG 2.5.5)
  MIN_TOUCH_TARGET: 44,

  // Recommended touch target size
  RECOMMENDED_TOUCH_TARGET: 48,

  // Minimum spacing between targets
  MIN_TARGET_SPACING: 8,

  // Focus indicator width
  FOCUS_INDICATOR_WIDTH: 2,

  // Focus indicator offset
  FOCUS_INDICATOR_OFFSET: 2,
} as const;
```

### Accessible Touch Target HOC

```typescript
// src/hoc/withAccessibleTouchTarget.tsx

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { A11Y } from "@constants/accessibility";

interface WithAccessibleTouchTargetOptions {
  minSize?: number;
  centered?: boolean;
}

export const withAccessibleTouchTarget = <P extends { style?: ViewStyle }>(
  Component: React.ComponentType<P>,
  options: WithAccessibleTouchTargetOptions = {}
) => {
  const { minSize = A11Y.MIN_TOUCH_TARGET, centered = true } = options;

  return (props: P) => (
    <View
      style={[
        styles.wrapper,
        { minWidth: minSize, minHeight: minSize },
        centered && styles.centered,
      ]}
    >
      <Component {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
```

---

## ✅ Testing Checklist

### Manual Testing

```
Screen Reader Testing (VoiceOver/TalkBack):
□ Tüm interaktif elemanlar announce ediliyor
□ Buton/link rolleeri doğru
□ Resimler için alt text mevcut
□ Form field'ları label'lı
□ Error mesajları announce ediliyor
□ Loading states announce ediliyor
□ Modal focus trap çalışıyor
□ Navigation mantıklı sırada

Visual Testing:
□ Tüm text renkleri contrast geçiyor (4.5:1 min)
□ Large text contrast (3:1 min)
□ Focus indicators görünür
□ Disabled states anlaşılır
□ Error states kırmızı dışında indicator var
□ Dark mode contrast uygun

Motor Testing:
□ Touch targets minimum 44x44
□ Targets arası yeterli boşluk
□ Gesture'lara alternatif button var
□ Timeout'lar yeterli süre

Cognitive Testing:
□ Language basit ve anlaşılır
□ İkonlar anlaşılır veya label'lı
□ Error mesajları çözüm önerili
□ Navigation tutarlı
□ Confirmation için önemli aksiyonlar
```

### Automated Testing

```typescript
// __tests__/accessibility/a11y.test.tsx

import React from "react";
import { render } from "@testing-library/react-native";
import { axe } from "axe-react-native";

describe("Accessibility Tests", () => {
  it("Button has accessible role", () => {
    const { getByRole } = render(
      <AccessibleButton title="Test" onPress={() => {}} />
    );

    expect(getByRole("button")).toBeTruthy();
  });

  it("Button has accessible label", () => {
    const { getByLabelText } = render(
      <AccessibleButton title="Submit Form" onPress={() => {}} />
    );

    expect(getByLabelText("Submit Form")).toBeTruthy();
  });

  it("Disabled button has correct state", () => {
    const { getByRole } = render(
      <AccessibleButton title="Test" onPress={() => {}} disabled />
    );

    const button = getByRole("button");
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it("Image has alt text", () => {
    const { getByLabelText } = render(
      <Image source={{ uri: "test.jpg" }} accessibilityLabel="Profile photo" />
    );

    expect(getByLabelText("Profile photo")).toBeTruthy();
  });
});
```

---

## 📚 Accessibility Resources

```
Documentation:
- React Native Accessibility: https://reactnative.dev/docs/accessibility
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- iOS Human Interface Guidelines: Accessibility
- Material Design Accessibility

Testing Tools:
- VoiceOver (iOS)
- TalkBack (Android)
- Accessibility Scanner (Android)
- Xcode Accessibility Inspector (iOS)
- axe-react-native (automated)

Screen Reader Commands:
iOS VoiceOver:
- Triple-tap: Enable/disable
- Swipe left/right: Navigate
- Double-tap: Activate
- Three-finger swipe: Scroll

Android TalkBack:
- Two-finger swipe down then right: Enable
- Swipe left/right: Navigate
- Double-tap: Activate
- Two-finger swipe: Scroll
```

---

Bu erişilebilirlik rehberi, WCAG 2.1 AA uyumlu, herkes için kullanılabilir uygulama sağlar.
