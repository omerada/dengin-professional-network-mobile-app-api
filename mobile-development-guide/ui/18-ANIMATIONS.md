# Animations with Reanimated

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐⭐ (High)

---

## 1. Overview

React Native Reanimated 3 ile performanslı animasyonlar, gestures ve transitions.

---

## 2. Basic Animations

**Fade In:**

```typescript
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

export const FadeIn: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
```

**Slide In:**

```typescript
export const SlideIn: React.FC<{
  children: React.ReactNode;
  direction?: "left" | "right" | "top" | "bottom";
}> = ({ children, direction = "left" }) => {
  const translateX = useSharedValue(
    direction === "left" ? -100 : direction === "right" ? 100 : 0
  );
  const translateY = useSharedValue(
    direction === "top" ? -100 : direction === "bottom" ? 100 : 0
  );

  useEffect(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
```

---

## 3. Gesture Animations

**Swipeable Card:**

```typescript
import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  scheduleOnRN,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) > swipeThreshold) {
        // Swipe completed
        if (event.translationX > 0 && onSwipeRight) {
          scheduleOnRN(onSwipeRight)();
        } else if (event.translationX < 0 && onSwipeLeft) {
          scheduleOnRN(onSwipeLeft)();
        }
      } else {
        // Reset position
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 10}deg` },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
});
```

---

## 4. Pull to Refresh

**Custom Pull to Refresh:**

```typescript
import React from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  scheduleOnRN,
} from "react-native-reanimated";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
}) => {
  const scrollY = useSharedValue(0);
  const refreshing = useSharedValue(false);
  const threshold = 80;

  const handleRefresh = async () => {
    refreshing.value = true;
    await onRefresh();
    refreshing.value = false;
    scrollY.value = withSpring(0);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onEndDrag: () => {
      if (scrollY.value < -threshold && !refreshing.value) {
        scheduleOnRN(handleRefresh)();
      }
    },
  });

  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: scrollY.value < -threshold ? 1 : scrollY.value / -threshold,
    transform: [{ translateY: Math.max(scrollY.value, -threshold) }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[
          { position: "absolute", top: 20, alignSelf: "center", zIndex: 1 },
          spinnerStyle,
        ]}
      >
        <ActivityIndicator />
      </Animated.View>
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {children}
      </Animated.ScrollView>
    </View>
  );
};
```

---

## 5. Modal Transitions

**Bottom Sheet Modal:**

```typescript
import React, { useEffect } from "react";
import { Modal, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20 });
      opacity.value = withTiming(1);
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT);
      opacity.value = withTiming(0);
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: 200,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
});
```

---

## 6. List Animations

**Animated List Item:**

```typescript
import React from "react";
import Animated, {
  Layout,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
}) => {
  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100)}
      exiting={SlideOutLeft}
      layout={Layout.springify()}
    >
      {children}
    </Animated.View>
  );
};

// Usage
const MyList = ({ items }: { items: any[] }) => {
  return (
    <FlatList
      data={items}
      renderItem={({ item, index }) => (
        <AnimatedListItem index={index}>
          <ItemCard item={item} />
        </AnimatedListItem>
      )}
    />
  );
};
```

---

## 7. Skeleton Loading

**Shimmer Effect:**

```typescript
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";

export const Skeleton: React.FC<{
  width: number;
  height: number;
  borderRadius?: number;
}> = ({ width, height, borderRadius = 4 }) => {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(animation.value, [0, 1], [-width, width]);

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.skeleton, { width, height, borderRadius }]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E1E9EE",
    overflow: "hidden",
  },
});
```

---

## 8. Tab Bar Animation

**Animated Tab Indicator:**

```typescript
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface AnimatedTabBarProps {
  tabs: string[];
  activeTab: number;
  onTabPress: (index: number) => void;
}

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const tabWidth = 100;
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withSpring(activeTab * tabWidth);
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.indicator, indicatorStyle, { width: tabWidth }]}
      />

      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.tab, { width: tabWidth }]}
          onPress={() => onTabPress(index)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === index && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    backgroundColor: "#007AFF",
  },
});
```

---

## 9. Summary

### Features:

- ✅ Basic animations (fade, slide)
- ✅ Gesture animations (swipe, pan)
- ✅ Pull to refresh
- ✅ Modal transitions (bottom sheet)
- ✅ List animations (enter/exit)
- ✅ Skeleton loading (shimmer)
- ✅ Tab bar animation
- ✅ Reanimated 3 (60 FPS)

**Result:** Smooth, performant animations using Reanimated 3.
