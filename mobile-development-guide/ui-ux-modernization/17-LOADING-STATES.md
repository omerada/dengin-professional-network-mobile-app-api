# ⏳ Loading States Tasarımı

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Premium Loading Deneyimi

---

## 📑 İçindekiler

1. [Loading Felsefesi](#loading-felsefesi)
2. [Skeleton Components](#skeleton-components)
3. [Shimmer Effect](#shimmer-effect)
4. [Loading Indicators](#loading-indicators)
5. [Pull-to-Refresh](#pull-to-refresh)
6. [Button Loading States](#button-loading-states)
7. [Screen Loading States](#screen-loading-states)

---

## 🎯 Loading Felsefesi

### Temel İlkeler

```
1. Perceived Performance: Kullanıcı beklemediğini hissetmeli
2. Content Layout Preservation: Layout shift olmamalı
3. Progressive Loading: İçerik kademeli yüklenmeli
4. Meaningful Feedback: Kullanıcı ne olduğunu anlamalı
```

### Loading Hierarchy

```
< 100ms:    Hiç gösterme
100-300ms:  Sadece spinner
300-1000ms: Skeleton
> 1000ms:   Skeleton + Progress indicator
```

---

## 🦴 Skeleton Components

### Base Skeleton

```typescript
// 📁 src/shared/components/loading/Skeleton.tsx
import React, { memo, useEffect } from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = memo(
  ({ width = "100%", height = 20, borderRadius = 4, style }) => {
    const { colors, isDark } = useTheme();
    const shimmerPosition = useSharedValue(-1);

    useEffect(() => {
      shimmerPosition.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.linear,
        }),
        -1, // Infinite
        false
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(shimmerPosition.value, [-1, 1], [-200, 200]),
        },
      ],
    }));

    const baseColor = isDark ? colors.neutral[700] : colors.neutral[200];
    const shimmerColor = isDark ? colors.neutral[600] : colors.neutral[100];

    return (
      <View
        style={[
          styles.container,
          {
            width,
            height,
            borderRadius,
            backgroundColor: baseColor,
          },
          style,
        ]}
      >
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={["transparent", shimmerColor, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 200,
  },
  gradient: {
    flex: 1,
  },
});
```

### Skeleton Variants

```typescript
// 📁 src/shared/components/loading/SkeletonVariants.tsx
import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "./Skeleton";
import { useTheme } from "@/theme";

// Avatar Skeleton
interface AvatarSkeletonProps {
  size?: number;
}

export const AvatarSkeleton: React.FC<AvatarSkeletonProps> = memo(
  ({ size = 48 }) => (
    <Skeleton width={size} height={size} borderRadius={size / 2} />
  )
);

// Text Skeleton
interface TextSkeletonProps {
  width?: number | string;
  lines?: number;
  lineHeight?: number;
  spacing?: number;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = memo(
  ({ width = "100%", lines = 1, lineHeight = 16, spacing = 8 }) => (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 && lines > 1 ? "60%" : width}
          height={lineHeight}
          borderRadius={4}
          style={index > 0 ? { marginTop: spacing } : undefined}
        />
      ))}
    </View>
  )
);

// Card Skeleton
export const CardSkeleton: React.FC = memo(() => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.background.primary }]}>
      <View style={styles.cardHeader}>
        <AvatarSkeleton size={40} />
        <View style={styles.cardHeaderText}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={12} style={styles.mt4} />
        </View>
      </View>
      <Skeleton
        width="100%"
        height={200}
        borderRadius={12}
        style={styles.mt12}
      />
      <View style={styles.cardFooter}>
        <Skeleton width={60} height={12} />
        <Skeleton width={40} height={12} />
      </View>
    </View>
  );
});

// Image Skeleton
interface ImageSkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = memo(
  ({ width, height, borderRadius = 8 }) => (
    <Skeleton width={width} height={height} borderRadius={borderRadius} />
  )
);

// List Item Skeleton
export const ListItemSkeleton: React.FC = memo(() => (
  <View style={styles.listItem}>
    <AvatarSkeleton size={50} />
    <View style={styles.listItemContent}>
      <Skeleton width="70%" height={16} />
      <Skeleton width="50%" height={14} style={styles.mt6} />
    </View>
  </View>
));

// Button Skeleton
interface ButtonSkeletonProps {
  width?: number | string;
}

export const ButtonSkeleton: React.FC<ButtonSkeletonProps> = memo(
  ({ width = 120 }) => <Skeleton width={width} height={44} borderRadius={22} />
);

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  mt4: {
    marginTop: 4,
  },
  mt6: {
    marginTop: 6,
  },
  mt12: {
    marginTop: 12,
  },
});
```

---

## ✨ Shimmer Effect

### Advanced Shimmer

```typescript
// 📁 src/shared/components/loading/Shimmer.tsx
import React, { memo, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Canvas, Rect, LinearGradient, vec } from "@shopify/react-native-skia";
import MaskedView from "@react-native-masked-view/masked-view";
import { useTheme } from "@/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ShimmerProps {
  children: React.ReactNode;
  isLoading: boolean;
  duration?: number;
}

export const Shimmer: React.FC<ShimmerProps> = memo(
  ({ children, isLoading, duration = 1500 }) => {
    const { colors, isDark } = useTheme();
    const translateX = useSharedValue(-SCREEN_WIDTH);

    useEffect(() => {
      if (isLoading) {
        translateX.value = withRepeat(
          withTiming(SCREEN_WIDTH, {
            duration,
            easing: Easing.linear,
          }),
          -1,
          false
        );
      } else {
        translateX.value = -SCREEN_WIDTH;
      }
    }, [isLoading, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    if (!isLoading) {
      return <>{children}</>;
    }

    const baseColor = isDark ? colors.neutral[700] : colors.neutral[200];
    const shimmerColor = isDark ? colors.neutral[500] : colors.neutral[50];

    return (
      <MaskedView
        style={styles.container}
        maskElement={<View style={styles.mask}>{children}</View>}
      >
        <View style={[styles.background, { backgroundColor: baseColor }]} />
        <Animated.View style={[styles.shimmerOverlay, animatedStyle]}>
          <Canvas style={styles.canvas}>
            <Rect x={0} y={0} width={SCREEN_WIDTH} height={500}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(SCREEN_WIDTH, 0)}
                colors={["transparent", shimmerColor, "transparent"]}
              />
            </Rect>
          </Canvas>
        </Animated.View>
      </MaskedView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mask: {
    backgroundColor: "transparent",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    flex: 1,
  },
});
```

---

## 🔄 Loading Indicators

### Spinner Component

```typescript
// 📁 src/shared/components/loading/Spinner.tsx
import React, { memo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/theme";

interface SpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Spinner: React.FC<SpinnerProps> = memo(
  ({ size = 24, color, strokeWidth = 2 }) => {
    const { colors } = useTheme();
    const rotation = useSharedValue(0);
    const spinnerColor = color || colors.primary[500];

    useEffect(() => {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    return (
      <Animated.View
        style={[styles.container, { width: size, height: size }, animatedStyle]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={spinnerColor}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.2}
          />
          {/* Animated arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={spinnerColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
```

### Dots Loading

```typescript
// 📁 src/shared/components/loading/DotsLoading.tsx
import React, { memo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

interface DotsLoadingProps {
  size?: number;
  color?: string;
  count?: number;
}

export const DotsLoading: React.FC<DotsLoadingProps> = memo(
  ({ size = 8, color, count = 3 }) => {
    const { colors } = useTheme();
    const dotColor = color || colors.primary[500];

    return (
      <View style={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <AnimatedDot
            key={index}
            size={size}
            color={dotColor}
            delay={index * 150}
          />
        ))}
      </View>
    );
  }
);

interface AnimatedDotProps {
  size: number;
  color: string;
  delay: number;
}

const AnimatedDot: React.FC<AnimatedDotProps> = memo(
  ({ size, color, delay }) => {
    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
      scale.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.5, { duration: 400 })
          ),
          -1,
          true
        )
      );

      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1,
          true
        )
      );
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {},
});
```

### Progress Bar

```typescript
// 📁 src/shared/components/loading/ProgressBar.tsx
import React, { memo, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = memo(
  ({
    progress,
    height = 4,
    showPercentage = false,
    color,
    backgroundColor,
    animated = true,
  }) => {
    const { colors } = useTheme();
    const progressValue = useSharedValue(0);

    const barColor = color || colors.primary[500];
    const bgColor = backgroundColor || colors.neutral[200];

    useEffect(() => {
      if (animated) {
        progressValue.value = withTiming(progress, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        progressValue.value = progress;
      }
    }, [progress, animated]);

    const animatedStyle = useAnimatedStyle(() => ({
      width: `${progressValue.value}%`,
    }));

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.track,
            { height, backgroundColor: bgColor, borderRadius: height / 2 },
          ]}
        >
          <Animated.View
            style={[
              styles.fill,
              { backgroundColor: barColor, borderRadius: height / 2 },
              animatedStyle,
            ]}
          />
        </View>
        {showPercentage && (
          <Text style={[styles.percentage, { color: colors.text.primary }]}>
            {Math.round(progress)}%
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  track: {
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  percentage: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "right",
  },
});
```

---

## 🔄 Pull-to-Refresh

### Custom Refresh Control

```typescript
// 📁 src/shared/components/loading/CustomRefreshControl.tsx
import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { useTheme } from "@/theme";

interface CustomRefreshControlProps {
  refreshing: boolean;
  pullProgress: number; // 0-1
}

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = memo(
  ({ refreshing, pullProgress }) => {
    const { colors } = useTheme();
    const progress = useSharedValue(pullProgress);

    progress.value = pullProgress;

    const containerStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        progress.value,
        [0, 1],
        [-60, 0],
        Extrapolate.CLAMP
      );

      const scale = interpolate(
        progress.value,
        [0, 0.5, 1],
        [0.5, 0.8, 1],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        progress.value,
        [0, 0.5, 1],
        [0, 0.5, 1],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ translateY }, { scale }],
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.container, containerStyle]}>
        <LottieView
          source={require("@/assets/animations/loading-dots.json")}
          autoPlay={refreshing}
          loop={refreshing}
          style={styles.lottie}
          progress={refreshing ? undefined : pullProgress}
        />
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 50,
    height: 50,
  },
});
```

---

## 🔘 Button Loading States

### Loading Button

```typescript
// 📁 src/shared/components/buttons/LoadingButton.tsx
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Spinner } from "../loading/Spinner";
import { useTheme } from "@/theme";

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  loadingText?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const LoadingButton: React.FC<LoadingButtonProps> = memo(
  ({
    title,
    onPress,
    isLoading = false,
    disabled = false,
    variant = "primary",
    loadingText,
  }) => {
    const { colors } = useTheme();
    const scale = useSharedValue(1);

    const handlePressIn = () => {
      if (!isLoading && !disabled) {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      }
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const isDisabled = disabled || isLoading;
    const backgroundColor =
      variant === "primary" ? colors.primary[500] : colors.neutral[200];
    const textColor = variant === "primary" ? "#FFFFFF" : colors.text.primary;

    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          { backgroundColor },
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {isLoading ? (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.loadingContent}
          >
            <Spinner size={20} color={textColor} />
            {loadingText && (
              <Text style={[styles.text, { color: textColor, marginLeft: 8 }]}>
                {loadingText}
              </Text>
            )}
          </Animated.View>
        ) : (
          <Animated.Text
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[styles.text, { color: textColor }]}
          >
            {title}
          </Animated.Text>
        )}
      </AnimatedPressable>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
```

---

## 📱 Screen Loading States

### Feed Loading

```typescript
// 📁 src/features/feed/components/FeedSkeleton.tsx
import React, { memo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { CardSkeleton } from "@/shared/components/loading/SkeletonVariants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FeedSkeletonProps {
  count?: number;
}

export const FeedSkeleton: React.FC<FeedSkeletonProps> = memo(
  ({ count = 3 }) => (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  )
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

### Chat List Loading

```typescript
// 📁 src/features/messaging/components/ChatListSkeleton.tsx
import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { ListItemSkeleton } from "@/shared/components/loading/SkeletonVariants";

interface ChatListSkeletonProps {
  count?: number;
}

export const ChatListSkeleton: React.FC<ChatListSkeletonProps> = memo(
  ({ count = 8 }) => (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <ListItemSkeleton key={index} />
      ))}
    </View>
  )
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});
```

### Profile Loading

```typescript
// 📁 src/features/profile/components/ProfileSkeleton.tsx
import React, { memo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  Skeleton,
  AvatarSkeleton,
  TextSkeleton,
} from "@/shared/components/loading/SkeletonVariants";
import { useTheme } from "@/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 4) / 3;

export const ProfileSkeleton: React.FC = memo(() => {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <AvatarSkeleton size={90} />
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Skeleton width={40} height={20} />
            <Skeleton width={50} height={14} style={styles.mt4} />
          </View>
          <View style={styles.statItem}>
            <Skeleton width={40} height={20} />
            <Skeleton width={50} height={14} style={styles.mt4} />
          </View>
          <View style={styles.statItem}>
            <Skeleton width={40} height={20} />
            <Skeleton width={50} height={14} style={styles.mt4} />
          </View>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bio}>
        <Skeleton width={150} height={18} />
        <Skeleton width="80%" height={14} style={styles.mt6} />
        <Skeleton width="60%" height={14} style={styles.mt4} />
      </View>

      {/* Action Button */}
      <Skeleton
        width="100%"
        height={44}
        borderRadius={22}
        style={styles.mt12}
      />

      {/* Grid */}
      <View style={styles.grid}>
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton
            key={index}
            width={GRID_ITEM_SIZE}
            height={GRID_ITEM_SIZE}
            borderRadius={0}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  stats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: 16,
  },
  statItem: {
    alignItems: "center",
  },
  bio: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 2,
  },
  mt4: {
    marginTop: 4,
  },
  mt6: {
    marginTop: 6,
  },
  mt12: {
    marginTop: 12,
    marginHorizontal: 16,
  },
});
```

---

## 🎯 Loading State Manager

```typescript
// 📁 src/shared/hooks/useLoadingState.ts
import { useState, useCallback } from "react";

type LoadingState = "idle" | "loading" | "success" | "error";

interface UseLoadingStateOptions {
  minLoadingTime?: number; // Minimum loading time to prevent flash
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { minLoadingTime = 300 } = options;
  const [state, setState] = useState<LoadingState>("idle");
  const [error, setError] = useState<Error | null>(null);

  const startLoading = useCallback(() => {
    setState("loading");
    setError(null);
    return Date.now();
  }, []);

  const setSuccess = useCallback(
    (startTime: number) => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        setState("success");
      }, remaining);
    },
    [minLoadingTime]
  );

  const setErrorState = useCallback(
    (err: Error, startTime: number) => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        setState("error");
        setError(err);
      }, remaining);
    },
    [minLoadingTime]
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return {
    state,
    error,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    startLoading,
    setSuccess,
    setError: setErrorState,
    reset,
  };
}
```

---

Bu loading states sistemi uygulandığında:

- ✅ Profesyonel skeleton loading
- ✅ Smooth shimmer animasyonları
- ✅ Custom refresh indicators
- ✅ Loading button states
- ✅ Screen-specific skeletons
- ✅ Perceived performance artışı
