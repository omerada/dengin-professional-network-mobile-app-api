# Accessibility (Erişilebilirlik)

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐ (Medium)

---

## 1. Overview

Accessibility (a11y) best practices for screen readers, keyboard navigation ve color contrast.

---

## 2. Screen Reader Support

**VoiceOver (iOS) / TalkBack (Android):**

```typescript
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export const AccessibleButton: React.FC<{
  title: string;
  onPress: () => void;
  disabled?: boolean;
}> = ({ title, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={title}
      accessibilityHint="Düğmeye dokunarak eylemi gerçekleştirin"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};
```

---

## 3. Accessibility Props

**Common accessibility props:**

```typescript
import React from "react";
import { View, Text, Image } from "react-native";

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <View
      accessible={true}
      accessibilityLabel={`Gönderi, ${post.author.name} tarafından`}
      accessibilityHint="Gönderiyi görüntülemek için dokunun"
      accessibilityRole="button"
    >
      <Image
        source={{ uri: post.author.avatar }}
        accessible={true}
        accessibilityLabel={`${post.author.name}'in profil fotoğrafı`}
        accessibilityRole="image"
      />

      <Text
        accessible={true}
        accessibilityLabel={post.author.name}
        accessibilityRole="text"
      >
        {post.author.name}
      </Text>

      <Text
        accessible={true}
        accessibilityLabel={post.content}
        accessibilityRole="text"
      >
        {post.content}
      </Text>

      <View
        accessible={true}
        accessibilityLabel={`${post.likesCount} beğeni`}
        accessibilityHint="Beğenileri görmek için dokunun"
      >
        <Text>{post.likesCount} Beğeni</Text>
      </View>
    </View>
  );
};
```

---

## 4. Accessibility Roles

**Available roles:**

```typescript
type AccessibilityRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'
  | 'imagebutton'
  | 'header'
  | 'summary'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar';

// Examples
<TouchableOpacity accessibilityRole="button">...</TouchableOpacity>
<Image accessibilityRole="image">...</Image>
<TextInput accessibilityRole="search">...</TextInput>
<Switch accessibilityRole="switch">...</Switch>
<View accessibilityRole="header">...</View>
```

---

## 5. Accessibility States

**Dynamic states:**

```typescript
import React, { useState } from "react";
import { TouchableOpacity, Text } from "react-native";

export const LikeButton: React.FC<{ post: Post }> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={isLiked ? "Beğenildi" : "Beğen"}
      accessibilityHint="Gönderiyi beğenmek için dokunun"
      accessibilityState={{
        selected: isLiked,
        busy: isLoading,
        disabled: isLoading,
      }}
      onPress={() => {
        setIsLoading(true);
        // Like post...
        setIsLiked(!isLiked);
        setIsLoading(false);
      }}
    >
      <Text>{isLiked ? "❤️" : "🤍"}</Text>
    </TouchableOpacity>
  );
};
```

---

## 6. Focus Management

**Auto-focus on screen:**

```typescript
import React, { useRef, useEffect } from "react";
import { View, Text, findNodeHandle, AccessibilityInfo } from "react-native";

export const LoginScreen: React.FC = () => {
  const headerRef = useRef<Text>(null);

  useEffect(() => {
    // Focus on header when screen loads
    const reactTag = findNodeHandle(headerRef.current);
    if (reactTag) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }, []);

  return (
    <View>
      <Text
        ref={headerRef}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Giriş Yap Ekranı"
      >
        Giriş Yap
      </Text>
      {/* Form fields */}
    </View>
  );
};
```

---

## 7. Accessibility Actions

**Custom actions:**

```typescript
import React from "react";
import { View, Text, Alert } from "react-native";

export const MessageCard: React.FC<{ message: Message }> = ({ message }) => {
  const accessibilityActions = [
    { name: "reply", label: "Yanıtla" },
    { name: "delete", label: "Sil" },
    { name: "report", label: "Bildir" },
  ];

  const onAccessibilityAction = (event: any) => {
    switch (event.nativeEvent.actionName) {
      case "reply":
        // Handle reply
        break;
      case "delete":
        Alert.alert("Sil", "Mesajı silmek istediğinizden emin misiniz?");
        break;
      case "report":
        // Handle report
        break;
    }
  };

  return (
    <View
      accessible={true}
      accessibilityLabel={`${message.sender.name}: ${message.content}`}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
    >
      <Text>{message.sender.name}</Text>
      <Text>{message.content}</Text>
    </View>
  );
};
```

---

## 8. Grouping Elements

**Accessibility container:**

```typescript
import React from "react";
import { View, Text, Image } from "react-native";

export const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <View
      accessible={true}
      accessibilityLabel={`${user.name}, ${user.title}, ${user.followers} takipçi`}
      accessibilityRole="summary"
    >
      {/* These children won't be individually accessible */}
      <Image source={{ uri: user.avatar }} />
      <Text>{user.name}</Text>
      <Text>{user.title}</Text>
      <Text>{user.followers} Takipçi</Text>
    </View>
  );
};
```

**Or separate elements:**

```typescript
export const UserProfileDetailed: React.FC<{ user: User }> = ({ user }) => {
  return (
    <View>
      <Image
        source={{ uri: user.avatar }}
        accessible={true}
        accessibilityLabel={`${user.name}'in profil fotoğrafı`}
        accessibilityRole="image"
      />

      <Text
        accessible={true}
        accessibilityLabel={user.name}
        accessibilityRole="header"
      >
        {user.name}
      </Text>

      <Text accessible={true} accessibilityLabel={`Unvan: ${user.title}`}>
        {user.title}
      </Text>

      <Text accessible={true} accessibilityLabel={`${user.followers} takipçi`}>
        {user.followers} Takipçi
      </Text>
    </View>
  );
};
```

---

## 9. Live Regions

**Announce changes:**

```typescript
import React, { useState, useEffect } from "react";
import { View, Text, AccessibilityInfo } from "react-native";

export const NotificationBanner: React.FC = () => {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      // Announce to screen reader
      AccessibilityInfo.announceForAccessibility(notification);
    }
  }, [notification]);

  return (
    <View
      accessible={true}
      accessibilityLiveRegion="polite" // or "assertive" for urgent
      accessibilityRole="alert"
    >
      {notification && <Text>{notification}</Text>}
    </View>
  );
};
```

---

## 10. Text Scaling

**Support dynamic type:**

```typescript
import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTheme } from "@contexts/ThemeContext";

export const ScalableText: React.FC<{
  children: React.ReactNode;
  variant?: "h1" | "h2" | "body";
}> = ({ children, variant = "body" }) => {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        theme.typography[variant],
        {
          // Allow text scaling
          textAlignVertical: "center",
        },
      ]}
      allowFontScaling={true}
      maxFontSizeMultiplier={2} // Limit to 2x
    >
      {children}
    </Text>
  );
};
```

---

## 11. Color Contrast

**WCAG AA compliance:**

```typescript
// Good contrast ratios
const theme = {
  colors: {
    // Contrast ratio: 4.5:1 (WCAG AA)
    background: "#FFFFFF",
    text: "#1A1A1A",

    // Contrast ratio: 7:1 (WCAG AAA)
    primaryBackground: "#007AFF",
    primaryText: "#FFFFFF",

    // Don't use low contrast
    // background: '#F0F0F0',
    // text: '#C0C0C0' // ❌ Too low contrast
  },
};

// Use online tools to check:
// - https://webaim.org/resources/contrastchecker/
// - https://contrast-ratio.com/
```

---

## 12. Accessibility Testing

**Test with screen reader:**

```typescript
import { AccessibilityInfo, Platform } from "react-native";

export const useScreenReader = () => {
  const [screenReaderEnabled, setScreenReaderEnabled] = React.useState(false);

  React.useEffect(() => {
    // Check if screen reader is enabled
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setScreenReaderEnabled
    );

    return () => subscription.remove();
  }, []);

  return { screenReaderEnabled };
};

// Usage
const MyComponent = () => {
  const { screenReaderEnabled } = useScreenReader();

  return (
    <View>
      <Text>
        Screen reader is {screenReaderEnabled ? "enabled" : "disabled"}
      </Text>
    </View>
  );
};
```

---

## 13. Testing Checklist

**Manual testing:**

```
✅ Enable VoiceOver (iOS) / TalkBack (Android)
✅ Navigate through all screens
✅ Test all interactive elements (buttons, inputs, links)
✅ Verify labels and hints are descriptive
✅ Test form inputs and error messages
✅ Check focus order is logical
✅ Verify announcements work correctly
✅ Test with increased text size (200%)
✅ Check color contrast ratios
✅ Test landscape orientation
```

**Automated testing:**

```typescript
import { render } from "@testing-library/react-native";

describe("LoginScreen accessibility", () => {
  it("should have accessible elements", () => {
    const { getByRole, getByLabelText } = render(<LoginScreen />);

    // Check for accessible elements
    expect(getByRole("header")).toBeTruthy();
    expect(getByLabelText("E-posta")).toBeTruthy();
    expect(getByLabelText("Şifre")).toBeTruthy();
    expect(getByRole("button", { name: "Giriş Yap" })).toBeTruthy();
  });
});
```

---

## 14. Summary

### Features:

- ✅ Screen reader support (VoiceOver/TalkBack)
- ✅ Accessibility roles and states
- ✅ Focus management
- ✅ Custom accessibility actions
- ✅ Element grouping
- ✅ Live regions for announcements
- ✅ Dynamic text scaling
- ✅ Color contrast compliance
- ✅ Accessibility testing

**Result:** Fully accessible mobile app for all users.
