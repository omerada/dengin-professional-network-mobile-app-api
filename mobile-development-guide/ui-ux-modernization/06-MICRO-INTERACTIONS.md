# 🎭 Mikro Etkileşimler

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Kullanıcı deneyimini zenginleştiren mikro animasyonlar

---

## 📑 İçindekiler

1. [Mikro Etkileşim Felsefesi](#mikro-etkileşim-felsefesi)
2. [Like Animasyonu](#like-animasyonu)
3. [Double-tap Like](#double-tap-like)
4. [Pull to Refresh](#pull-to-refresh)
5. [Swipe Actions](#swipe-actions)
6. [Button Interactions](#button-interactions)
7. [Input Focus States](#input-focus-states)
8. [Toggle Switches](#toggle-switches)
9. [Tab Bar Animations](#tab-bar-animations)
10. [Notification Badge](#notification-badge)

---

## 🎯 Mikro Etkileşim Felsefesi

### Prensipler

```
1. SUBTLE: Dikkat çekici ama overwhelming değil
2. PURPOSEFUL: Her animasyonun bir amacı var
3. RESPONSIVE: Anında geri bildirim (<16ms)
4. CONSISTENT: Tüm uygulamada tutarlı
5. HAPTIC: Dokunsal geri bildirimle desteklenmeli
```

### Timing Guidelines

```typescript
// src/theme/animation.tokens.ts

export const MicroInteractionDurations = {
  // Çok hızlı - buton press feedback
  instant: 50,

  // Hızlı - hover/focus states
  fast: 100,

  // Normal - state transitions
  normal: 200,

  // Orta - element appearances
  medium: 300,

  // Yavaş - complex animations
  slow: 400,

  // En yavaş - page transitions
  slower: 500,
} as const;
```

---

## ❤️ Like Animasyonu

### HeartAnimation Component

```typescript
// src/shared/components/animations/HeartAnimation/HeartAnimation.tsx

import React, {
  memo,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { useHaptic } from "@hooks/useHaptic";
import { useTheme } from "@theme";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export interface HeartAnimationRef {
  trigger: () => void;
  reset: () => void;
}

export interface HeartAnimationProps {
  isLiked: boolean;
  onLike: (liked: boolean) => void;
  size?: number;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Instagram-style heart like animation
 *
 * Features:
 * - Scale bounce on press
 * - Color fill animation
 * - Particle effects (optional)
 * - Haptic feedback
 */
export const HeartAnimation = memo(
  forwardRef<HeartAnimationRef, HeartAnimationProps>(
    ({ isLiked, onLike, size = 28, style, testID }, ref) => {
      const { colors } = useTheme();
      const { trigger: triggerHaptic } = useHaptic();

      // Animation values
      const scale = useSharedValue(1);
      const fill = useSharedValue(isLiked ? 1 : 0);
      const rotation = useSharedValue(0);

      // Particle values (6 particles)
      const particleScale = useSharedValue(0);
      const particleOpacity = useSharedValue(0);

      // Trigger animation
      const triggerLike = useCallback(() => {
        "worklet";

        // Scale bounce sequence
        scale.value = withSequence(
          withSpring(0.8, { damping: 15, stiffness: 500 }),
          withSpring(1.2, { damping: 10, stiffness: 400 }),
          withSpring(1, { damping: 15, stiffness: 400 })
        );

        // Slight rotation for organic feel
        rotation.value = withSequence(
          withSpring(-5, { damping: 20 }),
          withSpring(5, { damping: 20 }),
          withSpring(0, { damping: 15 })
        );

        // Fill animation
        fill.value = withSpring(1, { damping: 15, stiffness: 400 });

        // Particles
        particleScale.value = withSequence(
          withSpring(1.5, { damping: 12 }),
          withTiming(2, { duration: 300 })
        );
        particleOpacity.value = withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 400 })
        );
      }, []);

      const triggerUnlike = useCallback(() => {
        "worklet";

        scale.value = withSequence(
          withSpring(0.9, { damping: 15 }),
          withSpring(1, { damping: 15 })
        );

        fill.value = withSpring(0, { damping: 15, stiffness: 400 });
      }, []);

      // Handle press
      const handlePress = useCallback(() => {
        const newLiked = !isLiked;

        if (newLiked) {
          triggerHaptic("impactMedium");
        } else {
          triggerHaptic("selection");
        }

        onLike(newLiked);
      }, [isLiked, onLike, triggerHaptic]);

      // Gesture
      const gesture = Gesture.Tap()
        .onBegin(() => {
          scale.value = withSpring(0.9, { damping: 15, stiffness: 500 });
        })
        .onFinalize((_, success) => {
          if (success) {
            if (!isLiked) {
              triggerLike();
            } else {
              triggerUnlike();
            }
            runOnJS(handlePress)();
          } else {
            scale.value = withSpring(1);
          }
        });

      // Imperative handle
      useImperativeHandle(
        ref,
        () => ({
          trigger: () => {
            if (!isLiked) {
              triggerLike();
              handlePress();
            }
          },
          reset: () => {
            scale.value = withSpring(1);
            fill.value = withSpring(0);
          },
        }),
        [isLiked, triggerLike, handlePress]
      );

      // Animated styles
      const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
      }));

      const fillColor = useAnimatedStyle(() => {
        const color = interpolate(fill.value, [0, 1], [0, 1]);
        return { opacity: color };
      });

      // Particle style generator
      const createParticleStyle = (angle: number) =>
        useAnimatedStyle(() => {
          const x =
            Math.cos((angle * Math.PI) / 180) * particleScale.value * 20;
          const y =
            Math.sin((angle * Math.PI) / 180) * particleScale.value * 20;

          return {
            transform: [
              { translateX: x },
              { translateY: y },
              { scale: 1 - particleScale.value / 2 },
            ],
            opacity: particleOpacity.value,
          };
        });

      // Heart SVG path
      const heartPath =
        "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

      return (
        <GestureDetector gesture={gesture}>
          <Animated.View
            testID={testID}
            style={[
              styles.container,
              { width: size, height: size },
              heartStyle,
              style,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isLiked ? "Beğeniyi kaldır" : "Beğen"}
            accessibilityState={{ checked: isLiked }}
          >
            {/* Particles */}
            {[0, 60, 120, 180, 240, 300].map((angle, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  { backgroundColor: colors.semantic.error },
                  createParticleStyle(angle),
                ]}
              />
            ))}

            {/* Heart outline */}
            <AnimatedSvg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              style={StyleSheet.absoluteFill}
            >
              <Path
                d={heartPath}
                fill="transparent"
                stroke={isLiked ? colors.semantic.error : colors.text.secondary}
                strokeWidth={1.5}
              />
            </AnimatedSvg>

            {/* Heart fill */}
            <AnimatedSvg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              style={[StyleSheet.absoluteFill, fillColor]}
            >
              <Path d={heartPath} fill={colors.semantic.error} />
            </AnimatedSvg>
          </Animated.View>
        </GestureDetector>
      );
    }
  )
);

HeartAnimation.displayName = "HeartAnimation";

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
```

---

## 👆 Double-tap Like

### DoubleTapLike Component

```typescript
// src/shared/components/animations/DoubleTapLike/DoubleTapLike.tsx

import React, { memo, useState, useCallback } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { useHaptic } from "@hooks/useHaptic";
import { useTheme } from "@theme";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface DoubleTapLikeProps {
  children: React.ReactNode;
  isLiked: boolean;
  onDoubleTap: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Instagram-style double-tap to like
 *
 * Shows large heart animation in center of tapped position
 */
export const DoubleTapLike = memo<DoubleTapLikeProps>(
  ({ children, isLiked, onDoubleTap, disabled = false, testID }) => {
    const { colors } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();

    // Heart animation values
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);
    const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });

    const showHeart = useCallback(
      (x: number, y: number) => {
        setHeartPosition({ x, y });

        // Scale animation
        heartScale.value = withSequence(
          withSpring(1, { damping: 10, stiffness: 300 }),
          withDelay(300, withSpring(1.2, { damping: 15 })),
          withSpring(0, { damping: 15 })
        );

        // Opacity animation
        heartOpacity.value = withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(500, withTiming(0, { duration: 300 }))
        );

        triggerHaptic("impactHeavy");

        if (!isLiked) {
          onDoubleTap();
        }
      },
      [isLiked, onDoubleTap, triggerHaptic]
    );

    // Double tap gesture
    const doubleTap = Gesture.Tap()
      .enabled(!disabled)
      .numberOfTaps(2)
      .maxDuration(250)
      .onEnd((event) => {
        runOnJS(showHeart)(event.x, event.y);
      });

    // Single tap for child interactions (passthrough)
    const singleTap = Gesture.Tap().enabled(!disabled).maxDuration(200);

    const gesture = Gesture.Exclusive(doubleTap, singleTap);

    // Heart animated style
    const heartAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: heartScale.value }],
      opacity: heartOpacity.value,
    }));

    const heartPath =
      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

    const heartSize = 100;

    return (
      <GestureDetector gesture={gesture}>
        <View testID={testID} style={styles.container}>
          {children}

          {/* Large heart overlay */}
          <Animated.View
            style={[
              styles.heartContainer,
              {
                left: heartPosition.x - heartSize / 2,
                top: heartPosition.y - heartSize / 2,
              },
              heartAnimatedStyle,
            ]}
            pointerEvents="none"
          >
            <AnimatedSvg
              width={heartSize}
              height={heartSize}
              viewBox="0 0 24 24"
            >
              <Path d={heartPath} fill={colors.semantic.error} />
            </AnimatedSvg>
          </Animated.View>
        </View>
      </GestureDetector>
    );
  }
);

DoubleTapLike.displayName = "DoubleTapLike";

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  heartContainer: {
    position: "absolute",
    zIndex: 100,
    elevation: 100,
  },
});
```

---

## 🔄 Pull to Refresh

### CustomRefreshControl Component

```typescript
// src/shared/components/animations/CustomRefreshControl/CustomRefreshControl.tsx

import React, { memo, useCallback, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
  cancelAnimation,
} from "react-native-reanimated";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";
import LottieView from "lottie-react-native";

export interface CustomRefreshControlProps {
  isRefreshing: boolean;
  pullProgress: Animated.SharedValue<number>;
  onRefresh: () => void;
}

/**
 * Custom pull-to-refresh with Lottie animation
 */
export const CustomRefreshControl = memo<CustomRefreshControlProps>(
  ({ isRefreshing, pullProgress, onRefresh }) => {
    const { colors, isDark } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();

    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    // Start spinning when refreshing
    useEffect(() => {
      if (isRefreshing) {
        rotation.value = withRepeat(
          withTiming(360, { duration: 1000 }),
          -1,
          false
        );
        scale.value = withSequence(
          withSpring(1.1, { damping: 10 }),
          withSpring(1, { damping: 15 })
        );
      } else {
        cancelAnimation(rotation);
        rotation.value = withSpring(0);
        scale.value = withSpring(1);
      }
    }, [isRefreshing]);

    // Haptic when threshold reached
    useEffect(() => {
      const unsubscribe = pullProgress.addListener((value) => {
        if (value >= 1 && !isRefreshing) {
          triggerHaptic("impactMedium");
        }
      });
      return () => unsubscribe?.remove();
    }, [isRefreshing, triggerHaptic]);

    // Container style based on pull progress
    const containerStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        pullProgress.value,
        [0, 1, 2],
        [-60, 0, 20],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        pullProgress.value,
        [0, 0.5, 1],
        [0, 0.5, 1],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ translateY }],
        opacity,
      };
    });

    // Indicator style
    const indicatorStyle = useAnimatedStyle(() => {
      const pullRotation = interpolate(
        pullProgress.value,
        [0, 1],
        [0, 180],
        Extrapolate.CLAMP
      );

      return {
        transform: [
          {
            rotate: isRefreshing
              ? `${rotation.value}deg`
              : `${pullRotation}deg`,
          },
          { scale: scale.value },
        ],
      };
    });

    // Arrow direction
    const arrowStyle = useAnimatedStyle(() => {
      const arrowRotation = interpolate(
        pullProgress.value,
        [0.8, 1],
        [0, 180],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ rotate: `${arrowRotation}deg` }],
      };
    });

    return (
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View style={[styles.indicator, indicatorStyle]}>
          {isRefreshing ? (
            <LottieView
              source={require("@assets/animations/loading-spinner.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
          ) : (
            <Animated.View style={arrowStyle}>
              <View
                style={[styles.arrow, { borderColor: colors.primary.main }]}
              />
            </Animated.View>
          )}
        </Animated.View>

        <Text style={[styles.text, { color: colors.text.secondary }]}>
          {isRefreshing
            ? "Yenileniyor..."
            : pullProgress.value >= 1
            ? "Bırakarak yenile"
            : "Yenilemek için çek"}
        </Text>
      </Animated.View>
    );
  }
);

CustomRefreshControl.displayName = "CustomRefreshControl";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  indicator: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 32,
    height: 32,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  text: {
    fontSize: 12,
    marginTop: 4,
  },
});
```

---

## 👈 Swipe Actions

### SwipeableRow Component

```typescript
// src/shared/components/animations/SwipeableRow/SwipeableRow.tsx

import React, { memo, useCallback } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

export interface SwipeAction {
  id: string;
  icon: React.ReactNode;
  backgroundColor: string;
  onPress: () => void;
}

export interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeComplete?: (direction: "left" | "right") => void;
  testID?: string;
}

/**
 * Swipeable row with action buttons
 *
 * Similar to iOS Mail app swipe actions
 */
export const SwipeableRow = memo<SwipeableRowProps>(
  ({
    children,
    leftActions = [],
    rightActions = [],
    onSwipeComplete,
    testID,
  }) => {
    const { colors } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();

    const translateX = useSharedValue(0);
    const contextX = useSharedValue(0);
    const isSwipeActive = useSharedValue(false);

    const leftActionsWidth = leftActions.length * ACTION_WIDTH;
    const rightActionsWidth = rightActions.length * ACTION_WIDTH;

    // Handle action press
    const handleActionPress = useCallback(
      (action: SwipeAction) => {
        translateX.value = withSpring(0);
        action.onPress();
        triggerHaptic("impactLight");
      },
      [triggerHaptic]
    );

    // Pan gesture
    const panGesture = Gesture.Pan()
      .activeOffsetX([-15, 15])
      .failOffsetY([-15, 15])
      .onStart(() => {
        contextX.value = translateX.value;
        isSwipeActive.value = true;
      })
      .onUpdate((event) => {
        let newX = contextX.value + event.translationX;

        // Apply resistance at boundaries
        if (newX > leftActionsWidth) {
          newX = leftActionsWidth + (newX - leftActionsWidth) * 0.2;
        } else if (newX < -rightActionsWidth) {
          newX = -rightActionsWidth + (newX + rightActionsWidth) * 0.2;
        }

        translateX.value = newX;

        // Haptic feedback at thresholds
        if (
          Math.abs(newX) >= SWIPE_THRESHOLD &&
          Math.abs(contextX.value) < SWIPE_THRESHOLD
        ) {
          runOnJS(triggerHaptic)("impactLight");
        }
      })
      .onEnd((event) => {
        isSwipeActive.value = false;

        // Determine final position
        const velocity = event.velocityX;
        const shouldSnapToLeft =
          translateX.value > SWIPE_THRESHOLD || velocity > 500;
        const shouldSnapToRight =
          translateX.value < -SWIPE_THRESHOLD || velocity < -500;

        if (shouldSnapToLeft && leftActions.length > 0) {
          translateX.value = withSpring(leftActionsWidth, { damping: 20 });
          if (onSwipeComplete) runOnJS(onSwipeComplete)("left");
        } else if (shouldSnapToRight && rightActions.length > 0) {
          translateX.value = withSpring(-rightActionsWidth, { damping: 20 });
          if (onSwipeComplete) runOnJS(onSwipeComplete)("right");
        } else {
          translateX.value = withSpring(0, { damping: 20 });
        }
      });

    // Animated styles
    const rowStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    // Left actions container style
    const leftActionsStyle = useAnimatedStyle(() => ({
      width: Math.max(0, translateX.value),
      opacity: interpolate(
        translateX.value,
        [0, 40],
        [0, 1],
        Extrapolate.CLAMP
      ),
    }));

    // Right actions container style
    const rightActionsStyle = useAnimatedStyle(() => ({
      width: Math.max(0, -translateX.value),
      opacity: interpolate(
        translateX.value,
        [0, -40],
        [0, 1],
        Extrapolate.CLAMP
      ),
    }));

    // Individual action item animation
    const createActionStyle = (
      index: number,
      total: number,
      direction: "left" | "right"
    ) => {
      return useAnimatedStyle(() => {
        const absX = Math.abs(translateX.value);
        const threshold = (index + 1) * ACTION_WIDTH;

        const scale = interpolate(
          absX,
          [threshold - 20, threshold, threshold + 20],
          [0.8, 1, 1],
          Extrapolate.CLAMP
        );

        return {
          transform: [{ scale }],
        };
      });
    };

    return (
      <View testID={testID} style={styles.container}>
        {/* Left actions */}
        <Animated.View
          style={[
            styles.actionsContainer,
            styles.leftActions,
            leftActionsStyle,
          ]}
        >
          {leftActions.map((action, index) => (
            <Animated.View
              key={action.id}
              style={[
                styles.action,
                { backgroundColor: action.backgroundColor },
                createActionStyle(index, leftActions.length, "left"),
              ]}
            >
              <GestureDetector
                gesture={Gesture.Tap().onEnd(() =>
                  runOnJS(handleActionPress)(action)
                )}
              >
                <Animated.View style={styles.actionContent}>
                  {action.icon}
                </Animated.View>
              </GestureDetector>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Right actions */}
        <Animated.View
          style={[
            styles.actionsContainer,
            styles.rightActions,
            rightActionsStyle,
          ]}
        >
          {rightActions.map((action, index) => (
            <Animated.View
              key={action.id}
              style={[
                styles.action,
                { backgroundColor: action.backgroundColor },
                createActionStyle(index, rightActions.length, "right"),
              ]}
            >
              <GestureDetector
                gesture={Gesture.Tap().onEnd(() =>
                  runOnJS(handleActionPress)(action)
                )}
              >
                <Animated.View style={styles.actionContent}>
                  {action.icon}
                </Animated.View>
              </GestureDetector>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Main content */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.row, rowStyle]}>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

SwipeableRow.displayName = "SwipeableRow";

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  row: {
    backgroundColor: "white",
  },
  actionsContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    flexDirection: "row",
    overflow: "hidden",
  },
  leftActions: {
    left: 0,
    justifyContent: "flex-start",
  },
  rightActions: {
    right: 0,
    justifyContent: "flex-end",
  },
  action: {
    width: ACTION_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

---

## 🔘 Button Interactions

### PressableScale Component

```typescript
// src/shared/components/core/PressableScale/PressableScale.tsx

import React, { memo, useCallback } from "react";
import { StyleSheet, ViewStyle, AccessibilityRole } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useHaptic } from "@hooks/useHaptic";

export interface PressableScaleProps {
  children: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  scale?: number;
  haptic?:
    | "selection"
    | "impactLight"
    | "impactMedium"
    | "impactHeavy"
    | "none";
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
}

/**
 * Pressable with spring scale animation and haptic feedback
 */
export const PressableScale = memo<PressableScaleProps>(
  ({
    children,
    onPress,
    onLongPress,
    disabled = false,
    scale: scaleValue = 0.97,
    haptic = "selection",
    style,
    accessibilityLabel,
    accessibilityRole = "button",
    testID,
  }) => {
    const { trigger: triggerHaptic } = useHaptic();

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handlePress = useCallback(() => {
      if (haptic !== "none") {
        triggerHaptic(haptic);
      }
      onPress();
    }, [haptic, triggerHaptic, onPress]);

    const handleLongPress = useCallback(() => {
      if (onLongPress) {
        triggerHaptic("impactHeavy");
        onLongPress();
      }
    }, [onLongPress, triggerHaptic]);

    // Tap gesture
    const tapGesture = Gesture.Tap()
      .enabled(!disabled)
      .onBegin(() => {
        scale.value = withSpring(scaleValue, {
          damping: 15,
          stiffness: 400,
        });
        opacity.value = withSpring(0.9);
      })
      .onFinalize((_, success) => {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 400,
        });
        opacity.value = withSpring(1);

        if (success) {
          runOnJS(handlePress)();
        }
      });

    // Long press gesture
    const longPressGesture = Gesture.LongPress()
      .enabled(!disabled && !!onLongPress)
      .minDuration(500)
      .onStart(() => {
        runOnJS(handleLongPress)();
      });

    const gesture = Gesture.Race(tapGesture, longPressGesture);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.5 : opacity.value,
    }));

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          testID={testID}
          style={[styles.container, style, animatedStyle]}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole={accessibilityRole}
          accessibilityState={{ disabled }}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    );
  }
);

PressableScale.displayName = "PressableScale";

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },
});
```

---

## 📝 Input Focus States

### AnimatedInput Component

```typescript
// Bakınız: 04-COMPONENT-LIBRARY.md - ModernInput
```

---

## 🔀 Toggle Switches

### AnimatedSwitch Component

```typescript
// src/shared/components/core/AnimatedSwitch/AnimatedSwitch.tsx

import React, { memo, useCallback, useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

export interface AnimatedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  testID?: string;
}

const SIZES = {
  small: { track: { width: 40, height: 24 }, thumb: 18 },
  medium: { track: { width: 52, height: 32 }, thumb: 26 },
  large: { track: { width: 64, height: 38 }, thumb: 32 },
} as const;

/**
 * Animated toggle switch with spring physics
 */
export const AnimatedSwitch = memo<AnimatedSwitchProps>(
  ({
    value,
    onValueChange,
    disabled = false,
    size = "medium",
    style,
    testID,
  }) => {
    const { colors } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();

    const sizeConfig = SIZES[size];
    const thumbTravel = sizeConfig.track.width - sizeConfig.thumb - 6; // 6 = padding

    const progress = useSharedValue(value ? 1 : 0);
    const scale = useSharedValue(1);

    // Sync with value prop
    useEffect(() => {
      progress.value = withSpring(value ? 1 : 0, {
        damping: 15,
        stiffness: 300,
      });
    }, [value]);

    const handleToggle = useCallback(() => {
      triggerHaptic("impactLight");
      onValueChange(!value);
    }, [value, onValueChange, triggerHaptic]);

    // Tap gesture
    const tapGesture = Gesture.Tap()
      .enabled(!disabled)
      .onBegin(() => {
        scale.value = withSpring(0.95);
      })
      .onFinalize((_, success) => {
        scale.value = withSpring(1);
        if (success) {
          runOnJS(handleToggle)();
        }
      });

    // Track style
    const trackStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        progress.value,
        [0, 1],
        [colors.surface.secondary, colors.primary.main]
      );

      return {
        backgroundColor,
        transform: [{ scale: scale.value }],
      };
    });

    // Thumb style
    const thumbStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        progress.value,
        [0, 1],
        [3, thumbTravel + 3]
      );

      // Slight scale bounce when moving
      const thumbScale = interpolate(progress.value, [0, 0.5, 1], [1, 1.1, 1]);

      return {
        transform: [{ translateX }, { scale: thumbScale }],
      };
    });

    return (
      <GestureDetector gesture={tapGesture}>
        <Animated.View
          testID={testID}
          style={[
            styles.track,
            {
              width: sizeConfig.track.width,
              height: sizeConfig.track.height,
              borderRadius: sizeConfig.track.height / 2,
              opacity: disabled ? 0.5 : 1,
            },
            trackStyle,
            style,
          ]}
          accessibilityRole="switch"
          accessibilityState={{ checked: value, disabled }}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                width: sizeConfig.thumb,
                height: sizeConfig.thumb,
                borderRadius: sizeConfig.thumb / 2,
              },
              thumbStyle,
            ]}
          />
        </Animated.View>
      </GestureDetector>
    );
  }
);

AnimatedSwitch.displayName = "AnimatedSwitch";

const styles = StyleSheet.create({
  track: {
    justifyContent: "center",
  },
  thumb: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
```

---

## 📱 Tab Bar Animations

### AnimatedTabBar Component

```typescript
// src/navigation/components/AnimatedTabBar/AnimatedTabBar.tsx

import React, { memo, useCallback } from "react";
import { StyleSheet, View, Text, Dimensions, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface TabItem {
  key: string;
  icon: (props: { focused: boolean; color: string }) => React.ReactNode;
  label: string;
  badge?: number;
}

export interface AnimatedTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

/**
 * Animated tab bar with:
 * - Sliding indicator
 * - Icon scale animation
 * - Badge animations
 */
export const AnimatedTabBar = memo<AnimatedTabBarProps>(
  ({ tabs, activeTab, onTabPress }) => {
    const { colors } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();
    const insets = useSafeAreaInsets();

    const tabWidth = SCREEN_WIDTH / tabs.length;
    const activeIndex = tabs.findIndex((t) => t.key === activeTab);

    const indicatorPosition = useSharedValue(activeIndex * tabWidth);

    // Update indicator position when active tab changes
    React.useEffect(() => {
      indicatorPosition.value = withSpring(activeIndex * tabWidth, {
        damping: 20,
        stiffness: 300,
      });
    }, [activeIndex, tabWidth]);

    // Indicator style
    const indicatorStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: indicatorPosition.value + tabWidth / 2 - 20 }],
    }));

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface.primary,
            paddingBottom: insets.bottom,
            borderTopColor: colors.border.light,
          },
        ]}
      >
        {/* Animated indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: colors.primary.main },
            indicatorStyle,
          ]}
        />

        {/* Tab items */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <TabItem
              key={tab.key}
              tab={tab}
              isActive={tab.key === activeTab}
              onPress={() => {
                triggerHaptic("selection");
                onTabPress(tab.key);
              }}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  }
);

// Individual tab item component
interface TabItemComponentProps {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}

const TabItem = memo<TabItemComponentProps>(
  ({ tab, isActive, onPress, colors }) => {
    const scale = useSharedValue(1);

    const gesture = Gesture.Tap()
      .onBegin(() => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
      })
      .onFinalize((_, success) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        if (success) {
          runOnJS(onPress)();
        }
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Badge animation
    const badgeScale = useSharedValue(tab.badge ? 1 : 0);

    React.useEffect(() => {
      badgeScale.value = withSpring(tab.badge ? 1 : 0, {
        damping: 12,
        stiffness: 400,
      });
    }, [tab.badge]);

    const badgeStyle = useAnimatedStyle(() => ({
      transform: [{ scale: badgeScale.value }],
    }));

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.tabItem, animatedStyle]}>
          <View style={styles.iconContainer}>
            {tab.icon({
              focused: isActive,
              color: isActive ? colors.primary.main : colors.text.secondary,
            })}

            {/* Badge */}
            {tab.badge && tab.badge > 0 && (
              <Animated.View
                style={[
                  styles.badge,
                  { backgroundColor: colors.semantic.error },
                  badgeStyle,
                ]}
              >
                <Text style={styles.badgeText}>
                  {tab.badge > 99 ? "99+" : tab.badge}
                </Text>
              </Animated.View>
            )}
          </View>

          <Text
            style={[
              styles.label,
              { color: isActive ? colors.primary.main : colors.text.secondary },
            ]}
          >
            {tab.label}
          </Text>
        </Animated.View>
      </GestureDetector>
    );
  }
);

AnimatedTabBar.displayName = "AnimatedTabBar";

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 40,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    height: 50,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
```

---

## 🔔 Notification Badge

### AnimatedBadge Component

```typescript
// src/shared/components/core/AnimatedBadge/AnimatedBadge.tsx

import React, { memo, useEffect } from "react";
import { StyleSheet, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { useTheme } from "@theme";

export interface AnimatedBadgeProps {
  count: number;
  maxCount?: number;
  color?: string;
  textColor?: string;
  size?: "small" | "medium" | "large";
  animate?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const SIZES = {
  small: { minWidth: 14, height: 14, fontSize: 9, paddingH: 3 },
  medium: { minWidth: 18, height: 18, fontSize: 11, paddingH: 4 },
  large: { minWidth: 22, height: 22, fontSize: 13, paddingH: 5 },
} as const;

/**
 * Animated notification badge
 *
 * Features:
 * - Scale bounce on count change
 * - Smooth appear/disappear
 * - Configurable max count display (99+)
 */
export const AnimatedBadge = memo<AnimatedBadgeProps>(
  ({
    count,
    maxCount = 99,
    color,
    textColor = "#FFFFFF",
    size = "medium",
    animate = true,
    style,
    testID,
  }) => {
    const { colors } = useTheme();

    const scale = useSharedValue(count > 0 ? 1 : 0);
    const prevCount = React.useRef(count);

    const sizeConfig = SIZES[size];

    useEffect(() => {
      if (count > 0 && prevCount.current === 0) {
        // Appearing
        scale.value = withSequence(
          withSpring(1.2, { damping: 10, stiffness: 400 }),
          withSpring(1, { damping: 15, stiffness: 400 })
        );
      } else if (count === 0 && prevCount.current > 0) {
        // Disappearing
        scale.value = withSpring(0, { damping: 15 });
      } else if (count > prevCount.current && animate) {
        // Count increased - bounce
        scale.value = withSequence(
          withSpring(1.2, { damping: 10, stiffness: 500 }),
          withSpring(1, { damping: 15, stiffness: 400 })
        );
      }

      prevCount.current = count;
    }, [count, animate]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    if (count === 0) return null;

    const displayText = count > maxCount ? `${maxCount}+` : `${count}`;

    return (
      <Animated.View
        testID={testID}
        style={[
          styles.badge,
          {
            minWidth: sizeConfig.minWidth,
            height: sizeConfig.height,
            borderRadius: sizeConfig.height / 2,
            paddingHorizontal: sizeConfig.paddingH,
            backgroundColor: color || colors.semantic.error,
          },
          animatedStyle,
          style,
        ]}
        accessibilityLabel={`${count} bildirim`}
      >
        <Text
          style={[
            styles.text,
            { fontSize: sizeConfig.fontSize, color: textColor },
          ]}
        >
          {displayText}
        </Text>
      </Animated.View>
    );
  }
);

AnimatedBadge.displayName = "AnimatedBadge";

const styles = StyleSheet.create({
  badge: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
});
```

---

## ✅ Acceptance Criteria

### Her Mikro Etkileşim İçin

```
□ Spring physics kullanılıyor (timing değil)
□ Haptic feedback entegre edilmiş
□ 60 FPS performans sağlanıyor
□ Gesture handlers worklet'te çalışıyor
□ Accessibility destekleniyor
□ Dark mode uyumlu
□ Test edilebilir (testID)
□ TypeScript strict mode
```

---

Bu mikro etkileşimler, kullanıcı deneyimini Instagram/Happen seviyesine çıkaracak detaylı animasyonlar sağlar.
