# 📳 Haptic Feedback Sistemi

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Premium Dokunsal Geri Bildirim Deneyimi

---

## 📑 İçindekiler

1. [Haptic Feedback Felsefesi](#haptic-feedback-felsefesi)
2. [Haptic Service](#haptic-service)
3. [useHaptic Hook](#usehaptic-hook)
4. [Component Entegrasyonu](#component-entegrasyonu)
5. [Platform Spesifik](#platform-spesifik)
6. [Best Practices](#best-practices)

---

## 🎯 Haptic Feedback Felsefesi

### Ne Zaman Kullanılır?

| Aksiyon         | Haptic Tipi   | Örnek               |
| --------------- | ------------- | ------------------- |
| Buton Press     | Light         | Tab seçimi, kaydet  |
| Toggle Switch   | Medium        | Ayar değişimi       |
| Like/Heart      | Heavy         | Post beğeni         |
| Error           | Error/Warning | Hatalı input        |
| Success         | Success       | İşlem tamamlandı    |
| Pull-to-Refresh | Selection     | Yenileme tetiklendi |
| Long Press      | Impact Medium | Context menu açma   |
| Slider Tick     | Selection     | Her adımda tik      |
| Message Send    | Light         | Mesaj gönderildi    |
| Notification    | Notification  | Yeni bildirim       |

### Instagram/Happen Benchmark

```
✅ Her buton basışında hafif feedback
✅ Like aksiyonunda güçlü feedback
✅ Pull-to-refresh threshold'da selection
✅ Error durumlarında warning feedback
✅ Toggle'larda medium impact
✅ Slider'larda her adımda selection
```

---

## 🔧 Haptic Service

```typescript
// 📁 src/shared/services/HapticService.ts
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";

// Storage for haptic preferences
const storage = new MMKV({ id: "haptic-storage" });

export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error"
  | "selection"
  | "rigid"
  | "soft";

interface HapticOptions {
  enabled?: boolean;
  intensity?: number;
}

class HapticService {
  private _isEnabled: boolean;

  constructor() {
    this._isEnabled = storage.getBoolean("hapticEnabled") ?? true;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  set isEnabled(value: boolean) {
    this._isEnabled = value;
    storage.set("hapticEnabled", value);
  }

  /**
   * Trigger haptic feedback
   */
  trigger(type: HapticType = "light", options: HapticOptions = {}) {
    // Skip if disabled or not iOS/Android
    if (!this._isEnabled && options.enabled !== true) return;
    if (Platform.OS === "web") return;

    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "warning":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "selection":
        Haptics.selectionAsync();
        break;
      case "rigid":
        if (Platform.OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        break;
      case "soft":
        if (Platform.OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;
    }
  }

  /**
   * Button press haptic
   */
  buttonPress() {
    this.trigger("light");
  }

  /**
   * Toggle switch haptic
   */
  toggleSwitch() {
    this.trigger("medium");
  }

  /**
   * Like action haptic (Instagram-like)
   */
  like() {
    this.trigger("heavy");
  }

  /**
   * Success haptic
   */
  success() {
    this.trigger("success");
  }

  /**
   * Error haptic
   */
  error() {
    this.trigger("error");
  }

  /**
   * Selection change haptic (sliders, pickers)
   */
  selection() {
    this.trigger("selection");
  }

  /**
   * Pull-to-refresh threshold reached
   */
  pullToRefresh() {
    this.trigger("selection");
  }

  /**
   * Long press haptic
   */
  longPress() {
    this.trigger("medium");
  }

  /**
   * Send message haptic
   */
  messageSent() {
    this.trigger("light");
  }

  /**
   * Notification received haptic
   */
  notification() {
    this.trigger("success");
  }

  /**
   * Warning haptic
   */
  warning() {
    this.trigger("warning");
  }

  /**
   * Custom pattern (iOS only - pattern vibration)
   */
  pattern(pattern: number[]) {
    if (Platform.OS === "ios") {
      pattern.forEach((duration, index) => {
        if (index % 2 === 0) {
          setTimeout(() => this.trigger("medium"), duration);
        }
      });
    }
  }
}

export const hapticService = new HapticService();
```

---

## 🪝 useHaptic Hook

```typescript
// 📁 src/shared/hooks/useHaptic.ts
import { useCallback } from "react";
import { hapticService, HapticType } from "@/shared/services/HapticService";

export function useHaptic() {
  const trigger = useCallback((type: HapticType = "light") => {
    hapticService.trigger(type);
  }, []);

  const buttonPress = useCallback(() => {
    hapticService.buttonPress();
  }, []);

  const toggleSwitch = useCallback(() => {
    hapticService.toggleSwitch();
  }, []);

  const like = useCallback(() => {
    hapticService.like();
  }, []);

  const success = useCallback(() => {
    hapticService.success();
  }, []);

  const error = useCallback(() => {
    hapticService.error();
  }, []);

  const selection = useCallback(() => {
    hapticService.selection();
  }, []);

  const pullToRefresh = useCallback(() => {
    hapticService.pullToRefresh();
  }, []);

  const longPress = useCallback(() => {
    hapticService.longPress();
  }, []);

  const messageSent = useCallback(() => {
    hapticService.messageSent();
  }, []);

  const notification = useCallback(() => {
    hapticService.notification();
  }, []);

  const warning = useCallback(() => {
    hapticService.warning();
  }, []);

  return {
    trigger,
    buttonPress,
    toggleSwitch,
    like,
    success,
    error,
    selection,
    pullToRefresh,
    longPress,
    messageSent,
    notification,
    warning,
    isEnabled: hapticService.isEnabled,
    setEnabled: (value: boolean) => {
      hapticService.isEnabled = value;
    },
  };
}
```

---

## 🧩 Component Entegrasyonu

### Haptic Button

```typescript
// 📁 src/shared/components/buttons/HapticButton.tsx
import React, { useCallback, memo } from "react";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useTheme } from "@/theme";

interface HapticButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "small" | "medium" | "large";
  hapticType?: "light" | "medium" | "none";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const HapticButton: React.FC<HapticButtonProps> = memo(
  ({
    title,
    variant = "primary",
    size = "medium",
    hapticType = "light",
    onPress,
    disabled,
    ...props
  }) => {
    const { colors } = useTheme();
    const { buttonPress, trigger } = useHaptic();
    const scale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
      "worklet";
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    }, []);

    const handlePressOut = useCallback(() => {
      "worklet";
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, []);

    const handlePress = useCallback(
      (event: any) => {
        if (hapticType !== "none") {
          trigger(hapticType);
        }
        onPress?.(event);
      },
      [hapticType, trigger, onPress]
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        style={[
          styles.button,
          styles[variant],
          styles[size],
          animatedStyle,
          disabled && styles.disabled,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        {...props}
      >
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      </AnimatedPressable>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#007AFF",
  },
  secondary: {
    backgroundColor: "#E5E5EA",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#000000",
  },
  ghostText: {
    color: "#007AFF",
  },
});
```

### Haptic Toggle Switch

```typescript
// 📁 src/shared/components/inputs/HapticSwitch.tsx
import React, { useCallback, memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useTheme } from "@/theme";

interface HapticSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const HapticSwitch: React.FC<HapticSwitchProps> = memo(
  ({ value, onValueChange, disabled = false }) => {
    const { colors } = useTheme();
    const { toggleSwitch } = useHaptic();
    const progress = useSharedValue(value ? 1 : 0);

    const handlePress = useCallback(() => {
      toggleSwitch(); // Haptic feedback

      progress.value = withSpring(value ? 0 : 1, {
        damping: 15,
        stiffness: 200,
      });

      onValueChange(!value);
    }, [value, onValueChange, toggleSwitch]);

    const trackStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.neutral[300], colors.primary[500]]
      ),
    }));

    const thumbStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: progress.value * 20 },
        { scale: withSpring(1, { damping: 15 }) },
      ],
    }));

    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[styles.container, disabled && styles.disabled]}
      >
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </Animated.View>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  track: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: "center",
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

### Haptic Slider

```typescript
// 📁 src/shared/components/inputs/HapticSlider.tsx
import React, { useCallback, memo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useTheme } from "@/theme";

interface HapticSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  width?: number;
}

export const HapticSlider: React.FC<HapticSliderProps> = memo(
  ({ value, min = 0, max = 100, step = 1, onValueChange, width = 300 }) => {
    const { colors } = useTheme();
    const { selection } = useHaptic();
    const lastStepValue = useRef(value);

    const progress = useSharedValue((value - min) / (max - min));

    const triggerStepHaptic = useCallback(
      (newValue: number) => {
        const currentStep = Math.round(newValue / step) * step;
        const lastStep = Math.round(lastStepValue.current / step) * step;

        if (currentStep !== lastStep) {
          selection(); // Haptic feedback on step change
          lastStepValue.current = currentStep;
        }
      },
      [step, selection]
    );

    const gesture = Gesture.Pan().onUpdate((event) => {
      const newProgress = Math.max(0, Math.min(1, event.x / width));
      progress.value = newProgress;

      const newValue = min + newProgress * (max - min);
      const steppedValue = Math.round(newValue / step) * step;

      runOnJS(triggerStepHaptic)(steppedValue);
      runOnJS(onValueChange)(steppedValue);
    });

    const fillStyle = useAnimatedStyle(() => ({
      width: `${progress.value * 100}%`,
    }));

    const thumbStyle = useAnimatedStyle(() => ({
      left: progress.value * (width - 24),
    }));

    return (
      <View style={[styles.container, { width }]}>
        <GestureDetector gesture={gesture}>
          <View style={styles.track}>
            <Animated.View
              style={[
                styles.fill,
                { backgroundColor: colors.primary[500] },
                fillStyle,
              ]}
            />
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </View>
        </GestureDetector>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    top: -9,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
```

### Double Tap Like with Haptic

```typescript
// 📁 src/features/feed/components/DoubleTapLike.tsx
import React, { useCallback, memo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useHaptic } from "@/shared/hooks/useHaptic";
import HeartIcon from "@/assets/icons/heart-filled.svg";

interface DoubleTapLikeProps {
  children: React.ReactNode;
  onLike: () => void;
  isLiked: boolean;
}

export const DoubleTapLike: React.FC<DoubleTapLikeProps> = memo(
  ({ children, onLike, isLiked }) => {
    const { like } = useHaptic();
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);
    const lastTap = useRef(0);

    const handleDoubleTap = useCallback(() => {
      // Heavy haptic for like
      like();

      // Animate heart
      heartScale.value = 0;
      heartOpacity.value = 1;

      heartScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 15 })
      );

      heartOpacity.value = withDelay(800, withSpring(0, { damping: 20 }));

      if (!isLiked) {
        onLike();
      }
    }, [like, isLiked, onLike]);

    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        runOnJS(handleDoubleTap)();
      });

    const heartStyle = useAnimatedStyle(() => ({
      transform: [{ scale: heartScale.value }],
      opacity: heartOpacity.value,
    }));

    return (
      <GestureDetector gesture={doubleTapGesture}>
        <View style={styles.container}>
          {children}
          <Animated.View style={[styles.heartContainer, heartStyle]}>
            <HeartIcon width={80} height={80} fill="#FFFFFF" />
          </Animated.View>
        </View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  heartContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
});
```

---

## 📱 Platform Spesifik

### iOS Specific Haptics

```typescript
// 📁 src/shared/utils/iosHaptics.ts
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export const iosHaptics = {
  /**
   * iOS specific rigid impact
   */
  rigid: () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }
  },

  /**
   * iOS specific soft impact
   */
  soft: () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
  },

  /**
   * iOS peek and pop style haptic
   */
  peekAndPop: () => {
    if (Platform.OS === "ios") {
      // Soft then medium
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 100);
    }
  },
};
```

### Android Specific Haptics

```typescript
// 📁 src/shared/utils/androidHaptics.ts
import { Platform, Vibration } from "react-native";
import * as Haptics from "expo-haptics";

export const androidHaptics = {
  /**
   * Android vibration pattern
   */
  pattern: (pattern: number[]) => {
    if (Platform.OS === "android") {
      Vibration.vibrate(pattern);
    }
  },

  /**
   * Short vibration
   */
  short: () => {
    if (Platform.OS === "android") {
      Vibration.vibrate(10);
    }
  },

  /**
   * Android click effect
   */
  click: () => {
    if (Platform.OS === "android") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
};
```

---

## ✅ Best Practices

### Do's ✓

```
✓ Her buton tıklamasında light haptic
✓ Toggle değişimlerinde medium haptic
✓ Önemli aksiyonlarda (like, send) heavy haptic
✓ Hatalarda error haptic
✓ Başarılı işlemlerde success haptic
✓ Slider adımlarında selection haptic
✓ Kullanıcıya haptic kapatma seçeneği sun
```

### Don'ts ✗

```
✗ Scroll sırasında haptic kullanma
✗ Art arda çok fazla haptic tetikleme
✗ Aynı aksiyon için farklı haptic tipleri kullanma
✗ Haptic'i animation ile senkronize etmeyi unutma
✗ Çok güçlü haptic'leri sık kullanma
```

### Haptic Hierarchy

```
Selection:    En hafif (slider, picker)
Light:        Hafif (buton, tap)
Medium:       Orta (toggle, long press)
Heavy/Rigid:  Güçlü (like, önemli aksiyon)
Notification: Sistem (success, error, warning)
```

---

Bu haptic feedback sistemi uygulandığında:

- ✅ Instagram kalitesinde dokunsal geri bildirim
- ✅ Platform-native his
- ✅ Kullanıcı tercihi desteği
- ✅ Tutarlı UX deneyimi
- ✅ Accessibility uyumu
