# 🛠️ Uygulama Rehberi

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** AI Agent için production-ready implementation guide

---

## 📑 İçindekiler

1. [Genel Kurallar](#genel-kurallar)
2. [Dosya Yapısı](#dosya-yapısı)
3. [Kod Standartları](#kod-standartları)
4. [Component Patterns](#component-patterns)
5. [Animation Patterns](#animation-patterns)
6. [Testing Patterns](#testing-patterns)
7. [Performance Patterns](#performance-patterns)
8. [Error Handling](#error-handling)

---

## 🎯 Genel Kurallar

### AI Agent İçin Kritik Kurallar

```
1. HER ZAMAN mevcut dosyaları kontrol et
2. HER ZAMAN TypeScript strict mode kullan
3. HER ZAMAN mevcut import path'lerini koru
4. HER ZAMAN mevcut test pattern'lerini takip et
5. ASLA breaking change yapma (backward compatible)
6. ASLA doğrudan state manipülasyonu yapma
7. ASLA inline styles kullanma (StyleSheet.create)
8. ASLA any type kullanma
```

### Önce Oku Listesi

```typescript
// Her feature için önce şunları oku:
1. mobile/src/theme/index.ts              // Theme exports
2. mobile/src/contexts/ThemeContext.tsx   // Theme usage
3. mobile/src/shared/components/index.ts  // Existing components
4. mobile/src/shared/hooks/index.ts       // Existing hooks
5. İlgili feature/*/types/index.ts        // Type definitions
```

---

## 📁 Dosya Yapısı

### Component Klasör Yapısı

```
ComponentName/
├── ComponentName.tsx        # Main component
├── ComponentName.styles.ts  # Styles (StyleSheet.create)
├── ComponentName.types.ts   # TypeScript types
├── ComponentName.test.tsx   # Unit tests
├── ComponentName.stories.tsx # Storybook (opsiyonel)
├── index.ts                 # Export barrel
└── hooks/                   # Component-specific hooks
    └── useComponentName.ts
```

### index.ts Pattern

```typescript
// ComponentName/index.ts
export { ComponentName } from "./ComponentName";
export type { ComponentNameProps } from "./ComponentName.types";
```

### Types File Pattern

```typescript
// ComponentName/ComponentName.types.ts
import { ViewStyle, TextStyle } from "react-native";
import { SharedValue } from "react-native-reanimated";

export interface ComponentNameProps {
  /** Description of prop */
  propName: string;

  /** Optional prop with default */
  optionalProp?: number;

  /** Callback props */
  onPress?: () => void;

  /** Style overrides */
  style?: ViewStyle;

  /** Test ID for testing */
  testID?: string;
}

export type ComponentNameVariant = "primary" | "secondary";
```

---

## 📝 Kod Standartları

### Import Sıralaması

```typescript
// 1. React & React Native
import React, { memo, useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

// 2. Third-party libraries
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

// 3. Project imports (absolute paths)
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";
import { Avatar, Badge } from "@shared/components";

// 4. Relative imports
import { ComponentStyles } from "./Component.styles";
import type { ComponentProps } from "./Component.types";
```

### Component Template

````typescript
// src/shared/components/core/ComponentName/ComponentName.tsx

import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@theme";
import type { ComponentNameProps } from "./ComponentName.types";

/**
 * ComponentName
 *
 * Description of what the component does.
 *
 * @example
 * ```tsx
 * <ComponentName
 *   propName="value"
 *   onPress={() => console.log('pressed')}
 * />
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = memo(
  ({ propName, optionalProp = defaultValue, onPress, style, testID }) => {
    const { theme, colors } = useTheme();

    // Shared values for animations
    const scale = useSharedValue(1);

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Callbacks
    const handlePress = useCallback(() => {
      scale.value = withSpring(0.97);
      onPress?.();
    }, [onPress]);

    return (
      <Animated.View
        testID={testID}
        style={[styles.container, animatedStyle, style]}
        accessibilityRole="button"
        accessibilityLabel={propName}
      >
        {/* Component content */}
      </Animated.View>
    );
  }
);

ComponentName.displayName = "ComponentName";

const styles = StyleSheet.create({
  container: {
    // styles
  },
});
````

### Hook Template

````typescript
// src/shared/hooks/useHookName.ts

import { useCallback, useMemo } from "react";
import { useSharedValue, withSpring } from "react-native-reanimated";

interface UseHookNameConfig {
  initialValue?: number;
  onComplete?: () => void;
}

interface UseHookNameReturn {
  value: Animated.SharedValue<number>;
  trigger: () => void;
  reset: () => void;
}

/**
 * useHookName
 *
 * Description of what the hook does.
 *
 * @example
 * ```tsx
 * const { value, trigger } = useHookName({ initialValue: 0 });
 * ```
 */
export const useHookName = ({
  initialValue = 0,
  onComplete,
}: UseHookNameConfig = {}): UseHookNameReturn => {
  const value = useSharedValue(initialValue);

  const trigger = useCallback(() => {
    value.value = withSpring(1, undefined, (finished) => {
      if (finished && onComplete) {
        scheduleOnRN(onComplete)();
      }
    });
  }, [onComplete]);

  const reset = useCallback(() => {
    value.value = withSpring(initialValue);
  }, [initialValue]);

  return { value, trigger, reset };
};
````

---

## 🎬 Animation Patterns

### Spring Animation Pattern

```typescript
// DOĞRU: Spring physics kullan
const handlePress = () => {
  scale.value = withSpring(0.97, {
    damping: 15,
    stiffness: 400,
  });
};

// YANLIŞ: Timing animation
const handlePress = () => {
  scale.value = withTiming(0.97, { duration: 100 });
};
```

### Gesture Animation Pattern

```typescript
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-reanimated";

const Component = ({ onPress }) => {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      // Worklet - runs on UI thread
      scale.value = withSpring(0.97);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    })
    .onEnd(() => {
      // Switch to JS thread for callbacks
      scheduleOnRN(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>{/* content */}</Animated.View>
    </GestureDetector>
  );
};
```

### Layout Animation Pattern

```typescript
import { FadeIn, FadeOut, Layout } from "react-native-reanimated";

const ListItem = ({ index }) => (
  <Animated.View
    entering={FadeIn.delay(index * 50).springify()}
    exiting={FadeOut.duration(200)}
    layout={Layout.springify()}
  >
    {/* content */}
  </Animated.View>
);
```

### Interpolation Pattern

```typescript
const animatedStyle = useAnimatedStyle(() => {
  const opacity = interpolate(
    scrollY.value,
    [0, 100],
    [1, 0],
    Extrapolate.CLAMP
  );

  const translateY = interpolate(
    scrollY.value,
    [0, 100],
    [0, -50],
    Extrapolate.CLAMP
  );

  return {
    opacity,
    transform: [{ translateY }],
  };
});
```

---

## 🧪 Testing Patterns

### Component Test Template

```typescript
// ComponentName.test.tsx

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ComponentName } from "./ComponentName";
import { ThemeProvider } from "@contexts/ThemeContext";

// Test wrapper with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe("ComponentName", () => {
  it("renders correctly", () => {
    const { getByTestId } = renderWithProviders(
      <ComponentName propName="test" testID="component" />
    );

    expect(getByTestId("component")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithProviders(
      <ComponentName propName="test" onPress={onPress} testID="component" />
    );

    fireEvent.press(getByTestId("component"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("applies custom styles", () => {
    const { getByTestId } = renderWithProviders(
      <ComponentName
        propName="test"
        style={{ backgroundColor: "red" }}
        testID="component"
      />
    );

    expect(getByTestId("component").props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: "red" })
    );
  });

  it("handles disabled state", () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithProviders(
      <ComponentName
        propName="test"
        disabled
        onPress={onPress}
        testID="component"
      />
    );

    fireEvent.press(getByTestId("component"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Snapshot Test

```typescript
it("matches snapshot", () => {
  const tree = renderWithProviders(<ComponentName propName="test" />).toJSON();

  expect(tree).toMatchSnapshot();
});
```

---

## ⚡ Performance Patterns

### Memoization Pattern

```typescript
// Memoize component
export const Component = memo(({ data, onPress }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map((item) => expensiveOperation(item));
  }, [data]);

  // Memoize callbacks
  const handlePress = useCallback(() => {
    onPress(processedData);
  }, [onPress, processedData]);

  return <View />;
});
```

### FlashList Pattern

```typescript
import { FlashList } from "@shopify/flash-list";

const List = ({ data }) => {
  const renderItem = useCallback(({ item }) => <ListItem item={item} />, []);

  const keyExtractor = useCallback((item) => `item-${item.id}`, []);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={100} // Required for FlashList
    />
  );
};
```

### Image Loading Pattern

```typescript
import { Image } from "expo-image";

const OptimizedImage = ({ uri, blurhash }) => (
  <Image
    source={{ uri }}
    placeholder={blurhash}
    contentFit="cover"
    transition={200}
    cachePolicy="memory-disk"
  />
);
```

---

## ❌ Error Handling

### Try-Catch Pattern

```typescript
const handleAction = useCallback(async () => {
  try {
    setLoading(true);
    await someAsyncOperation();
    triggerHaptic("success");
    showToast({ type: "success", message: "İşlem başarılı" });
  } catch (error) {
    triggerHaptic("error");
    showToast({ type: "error", message: getErrorMessage(error) });

    // Log error for monitoring
    console.error("Action failed:", error);
  } finally {
    setLoading(false);
  }
}, []);
```

### Error Boundary Pattern

```typescript
import { ErrorBoundary } from "@shared/components";

const Screen = () => (
  <ErrorBoundary
    fallback={<ErrorFallback />}
    onError={(error) => logError(error)}
  >
    <ScreenContent />
  </ErrorBoundary>
);
```

---

## 📋 Checklist: Yeni Component Oluşturma

```
□ types dosyası oluşturuldu
□ Component memo ile wrapped
□ displayName eklendi
□ TypeScript strict typing
□ StyleSheet.create kullanıldı
□ useTheme ile renkler alındı
□ Animation shared values kullanıldı
□ Gesture Handler entegre edildi (gerekirse)
□ Haptic feedback eklendi (gerekirse)
□ Accessibility props eklendi
□ testID prop eklendi
□ Test dosyası yazıldı
□ index.ts export eklendi
□ Shared components index güncellendi
```

---

## 🔄 Migration Checklist: Mevcut Component Güncelleme

```
□ Mevcut kullanımlar tespit edildi
□ Breaking change yok (props aynı)
□ Geriye uyumluluk korundu
□ Yeni özellikler opsiyonel
□ Mevcut testler geçiyor
□ Yeni testler eklendi
□ Dokümantasyon güncellendi
```

---

Bu rehberi takip ederek production-ready, tutarlı ve performanslı kod üretebilirsiniz.
