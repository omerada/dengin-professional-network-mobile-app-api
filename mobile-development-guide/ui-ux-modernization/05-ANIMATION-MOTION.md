# 🎬 Animasyon ve Hareket Sistemi

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Referans:** react-native-reanimated, moti

---

## 📑 İçindekiler

1. [Animasyon Felsefesi](#animasyon-felsefesi)
2. [Reanimated Altyapısı](#reanimated-altyapısı)
3. [Spring Animations](#spring-animations)
4. [Layout Animations](#layout-animations)
5. [Gesture Animations](#gesture-animations)
6. [Shared Element Transitions](#shared-element-transitions)
7. [Micro-interactions](#micro-interactions)
8. [Performance Guidelines](#performance-guidelines)

---

## 🎯 Animasyon Felsefesi

### Temel Prensipler

```
1. NATURAL MOTION
   - Spring physics > linear timing
   - Easing curves that mimic reality
   - Interruptible animations

2. PURPOSEFUL
   - Guide user attention
   - Provide feedback
   - Create hierarchy

3. PERFORMANT
   - Run on UI thread
   - 60 FPS minimum
   - No JS bridge blocking

4. CONSISTENT
   - Same patterns across app
   - Predictable behavior
   - Brand identity in motion
```

### Motion Personality

| Özellik | Meslektaş Style |
|---------|-----------------|
| Speed | Quick but not rushed |
| Character | Professional, confident |
| Energy | Calm, focused |
| Feel | Premium, polished |

---

## ⚡ Reanimated Altyapısı

### Temel Setup

```typescript
// src/shared/animations/index.ts

import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
  runOnJS,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';

// Re-export for consistent usage
export {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
  runOnJS,
  cancelAnimation,
};

export type { SharedValue };
```

### Animation Hook Pattern

```typescript
// src/shared/hooks/useAnimatedValue.ts

import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { spring } from '@theme/tokens/animations';

interface AnimatedValueConfig {
  initialValue: number;
  springConfig?: keyof typeof spring;
}

export const useAnimatedValue = ({
  initialValue,
  springConfig = 'gentle',
}: AnimatedValueConfig) => {
  const value = useSharedValue(initialValue);
  
  const animateTo = (target: number) => {
    value.value = withSpring(target, spring[springConfig]);
  };
  
  const animateToImmediate = (target: number) => {
    value.value = target;
  };
  
  return {
    value,
    animateTo,
    animateToImmediate,
  };
};
```

---

## 🌊 Spring Animations

### Spring Configurations

```typescript
// src/theme/tokens/animations.ts

export const springConfigs = {
  // UI Response - Quick feedback
  responsive: {
    damping: 20,
    stiffness: 400,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  
  // Button Press - Snappy feel
  press: {
    damping: 15,
    stiffness: 500,
    mass: 0.5,
  },
  
  // Card Transition - Smooth movement
  smooth: {
    damping: 18,
    stiffness: 200,
    mass: 1,
  },
  
  // Bounce Effect - Playful
  bouncy: {
    damping: 8,
    stiffness: 180,
    mass: 0.6,
  },
  
  // Modal Entry - Elegant
  modal: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  
  // List Items - Subtle
  list: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  // Pull to Refresh - Elastic
  elastic: {
    damping: 10,
    stiffness: 100,
    mass: 1,
  },
};
```

### Spring Animation Examples

```typescript
// Button Press Animation
const useButtonAnimation = () => {
  const scale = useSharedValue(1);
  
  const onPressIn = () => {
    scale.value = withSpring(0.96, springConfigs.press);
  };
  
  const onPressOut = () => {
    scale.value = withSpring(1, springConfigs.press);
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return { animatedStyle, onPressIn, onPressOut };
};

// Card Hover Animation
const useCardHover = () => {
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.1);
  
  const onHoverIn = () => {
    translateY.value = withSpring(-4, springConfigs.smooth);
    shadowOpacity.value = withSpring(0.2, springConfigs.smooth);
  };
  
  const onHoverOut = () => {
    translateY.value = withSpring(0, springConfigs.smooth);
    shadowOpacity.value = withSpring(0.1, springConfigs.smooth);
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    shadowOpacity: shadowOpacity.value,
  }));
  
  return { animatedStyle, onHoverIn, onHoverOut };
};

// Like Heart Animation
const useLikeAnimation = () => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const triggerLike = () => {
    scale.value = withSequence(
      withSpring(1.3, springConfigs.bouncy),
      withSpring(1, springConfigs.bouncy)
    );
    rotation.value = withSequence(
      withSpring(-10, springConfigs.bouncy),
      withSpring(10, springConfigs.bouncy),
      withSpring(0, springConfigs.bouncy)
    );
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  
  return { animatedStyle, triggerLike };
};
```

---

## 📐 Layout Animations

### Entering Animations

```typescript
// src/shared/animations/entering.ts

import {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  SlideInDown,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  BounceIn,
  FlipInXDown,
  LightSpeedInLeft,
} from 'react-native-reanimated';

// Presets for common use cases
export const enteringAnimations = {
  // List Items
  listItem: FadeInDown.duration(300).springify().damping(15),
  
  // Staggered list
  listItemStagger: (index: number) => 
    FadeInDown
      .delay(index * 50)
      .duration(300)
      .springify()
      .damping(15),
  
  // Cards
  card: FadeInUp.duration(400).springify().damping(18),
  
  // Modals
  modal: SlideInDown.springify().damping(20),
  
  // Toasts
  toast: SlideInDown.springify().damping(15),
  
  // Dropdowns
  dropdown: FadeIn.duration(200),
  
  // Avatars
  avatar: ZoomIn.duration(300).springify(),
  
  // Badges
  badge: BounceIn.duration(400),
  
  // Image reveal
  image: FadeIn.duration(300),
  
  // Tab content
  tabContent: FadeInRight.duration(250),
};

// Usage example
const ListItem: React.FC<{ index: number }> = ({ index, children }) => (
  <Animated.View entering={enteringAnimations.listItemStagger(index)}>
    {children}
  </Animated.View>
);
```

### Exiting Animations

```typescript
// src/shared/animations/exiting.ts

import {
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  FadeOutLeft,
  FadeOutRight,
  SlideOutDown,
  SlideOutUp,
  ZoomOut,
} from 'react-native-reanimated';

export const exitingAnimations = {
  // List Items
  listItem: FadeOutLeft.duration(200),
  
  // Cards
  card: FadeOutDown.duration(300),
  
  // Modals
  modal: SlideOutDown.springify().damping(20),
  
  // Toasts
  toast: SlideOutDown.duration(200),
  
  // Dropdowns
  dropdown: FadeOut.duration(150),
  
  // Delete animation
  delete: FadeOutLeft.duration(300).springify(),
  
  // Tab content
  tabContent: FadeOutLeft.duration(200),
};
```

### Layout Transition

```typescript
// src/shared/animations/layout.ts

import { Layout, LinearTransition, SequencedTransition } from 'react-native-reanimated';

export const layoutTransitions = {
  // Standard list reorder
  list: Layout.springify().damping(15),
  
  // Card resize
  card: Layout.duration(300).easing(Easing.inOut(Easing.ease)),
  
  // Smooth content change
  content: LinearTransition.springify().damping(18),
  
  // Accordion expand
  accordion: SequencedTransition.duration(400),
};

// Usage in component
const AnimatedList: React.FC = ({ items }) => (
  <FlatList
    data={items}
    renderItem={({ item, index }) => (
      <Animated.View
        entering={enteringAnimations.listItemStagger(index)}
        exiting={exitingAnimations.listItem}
        layout={layoutTransitions.list}
      >
        <ListItem item={item} />
      </Animated.View>
    )}
  />
);
```

---

## 👆 Gesture Animations

### Gesture Handler Integration

```typescript
// src/shared/hooks/useSwipeGesture.ts

import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { springConfigs } from '@theme/tokens/animations';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  maxTranslate?: number;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  maxTranslate = 150,
}: SwipeConfig) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(
        -maxTranslate,
        Math.min(maxTranslate, event.translationX)
      );
    })
    .onEnd((event) => {
      if (event.translationX < -threshold && onSwipeLeft) {
        translateX.value = withSpring(-maxTranslate, springConfigs.smooth);
        opacity.value = withSpring(0, springConfigs.smooth);
        runOnJS(onSwipeLeft)();
      } else if (event.translationX > threshold && onSwipeRight) {
        translateX.value = withSpring(maxTranslate, springConfigs.smooth);
        opacity.value = withSpring(0, springConfigs.smooth);
        runOnJS(onSwipeRight)();
      } else {
        translateX.value = withSpring(0, springConfigs.elastic);
      }
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));
  
  return { gesture, animatedStyle };
};
```

### Pull to Refresh Animation

```typescript
// src/shared/hooks/usePullToRefresh.ts

import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
}: PullToRefreshConfig) => {
  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const rotation = useSharedValue(0);
  
  const gesture = Gesture.Pan()
    .enabled(!isRefreshing.value)
    .onUpdate((event) => {
      if (event.translationY > 0) {
        // Rubber band effect
        translateY.value = Math.pow(event.translationY, 0.7);
        rotation.value = event.translationY * 2;
      }
    })
    .onEnd(async (event) => {
      if (event.translationY > threshold) {
        isRefreshing.value = true;
        translateY.value = withSpring(threshold, { damping: 15 });
        
        // Start spinner rotation
        rotation.value = withRepeat(
          withTiming(rotation.value + 360, { duration: 1000 }),
          -1
        );
        
        await runOnJS(onRefresh)();
        
        isRefreshing.value = false;
        translateY.value = withSpring(0, { damping: 18 });
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, threshold], [0, 1]),
    transform: [
      { translateY: translateY.value - 50 },
      { rotate: `${rotation.value}deg` },
      { scale: interpolate(translateY.value, [0, threshold], [0.5, 1]) },
    ],
  }));
  
  return { gesture, containerStyle, spinnerStyle };
};
```

### Pinch to Zoom

```typescript
// src/shared/hooks/usePinchZoom.ts

import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export const usePinchZoom = () => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  
  const gesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 15 });
        savedScale.value = 1;
      } else if (scale.value > 4) {
        scale.value = withSpring(4, { damping: 15 });
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
    ],
  }));
  
  return { gesture, animatedStyle };
};
```

---

## 🔄 Shared Element Transitions

### Image to Full Screen

```typescript
// src/shared/hooks/useSharedTransition.ts

import { useNavigation } from '@react-navigation/native';
import {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  measure,
  useAnimatedRef,
} from 'react-native-reanimated';

interface SharedTransitionConfig {
  id: string;
}

export const useSharedTransition = ({ id }: SharedTransitionConfig) => {
  const ref = useAnimatedRef();
  const isTransitioning = useSharedValue(false);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const originWidth = useSharedValue(0);
  const originHeight = useSharedValue(0);
  
  const prepareTransition = () => {
    const measurement = measure(ref);
    if (measurement) {
      originX.value = measurement.pageX;
      originY.value = measurement.pageY;
      originWidth.value = measurement.width;
      originHeight.value = measurement.height;
      isTransitioning.value = true;
    }
  };
  
  return {
    ref,
    prepareTransition,
    origin: {
      x: originX,
      y: originY,
      width: originWidth,
      height: originHeight,
    },
    isTransitioning,
  };
};

// Full screen component
export const SharedTransitionTarget: React.FC<{
  origin: {
    x: SharedValue<number>;
    y: SharedValue<number>;
    width: SharedValue<number>;
    height: SharedValue<number>;
  };
  targetWidth: number;
  targetHeight: number;
}> = ({ origin, targetWidth, targetHeight, children }) => {
  const progress = useSharedValue(0);
  
  React.useEffect(() => {
    progress.value = withSpring(1, { damping: 18 });
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    const x = interpolate(progress.value, [0, 1], [origin.x.value, 0]);
    const y = interpolate(progress.value, [0, 1], [origin.y.value, 0]);
    const width = interpolate(progress.value, [0, 1], [origin.width.value, targetWidth]);
    const height = interpolate(progress.value, [0, 1], [origin.height.value, targetHeight]);
    
    return {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
    };
  });
  
  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};
```

---

## ✨ Micro-interactions

### Like Button Animation

```typescript
// src/features/feed/components/LikeButton.tsx

import React, { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@theme';
import { useHaptic } from '@hooks/useHaptic';

interface LikeButtonProps {
  isLiked: boolean;
  onToggle: () => void;
  size?: number;
}

export const LikeButton: React.FC<LikeButtonProps> = memo(({
  isLiked,
  onToggle,
  size = 24,
}) => {
  const { colors } = useTheme();
  const { triggerHaptic } = useHaptic();
  const scale = useSharedValue(1);
  const lottieRef = React.useRef<LottieView>(null);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePress = useCallback(() => {
    // Haptic feedback
    triggerHaptic('medium');
    
    // Scale animation
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    
    // Trigger like
    onToggle();
    
    // Play Lottie if liking
    if (!isLiked) {
      lottieRef.current?.play(0, 50);
    }
  }, [isLiked, onToggle, triggerHaptic]);
  
  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View style={animatedStyle}>
        {isLiked ? (
          <LottieView
            ref={lottieRef}
            source={require('@assets/animations/heart-burst.json')}
            style={{ width: size * 1.5, height: size * 1.5 }}
            autoPlay={false}
            loop={false}
          />
        ) : (
          <Icon
            name="heart-outline"
            size={size}
            color={colors.text.secondary}
          />
        )}
      </Animated.View>
    </Pressable>
  );
});
```

### Bookmark Animation

```typescript
// src/features/feed/components/BookmarkButton.tsx

export const BookmarkButton: React.FC<BookmarkButtonProps> = memo(({
  isBookmarked,
  onToggle,
  size = 24,
}) => {
  const { colors } = useTheme();
  const { triggerHaptic } = useHaptic();
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  
  const handlePress = useCallback(() => {
    triggerHaptic('light');
    
    // Drop and bounce animation
    translateY.value = withSequence(
      withSpring(-8, { damping: 8 }),
      withSpring(4, { damping: 8 }),
      withSpring(0, { damping: 15 })
    );
    
    // Slight rotation
    rotation.value = withSequence(
      withSpring(-5, { damping: 8 }),
      withSpring(5, { damping: 8 }),
      withSpring(0, { damping: 15 })
    );
    
    onToggle();
  }, [onToggle, triggerHaptic]);
  
  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View style={animatedStyle}>
        <Icon
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={size}
          color={isBookmarked ? colors.special.premium : colors.text.secondary}
        />
      </Animated.View>
    </Pressable>
  );
});
```

### Double Tap to Like

```typescript
// src/features/feed/hooks/useDoubleTapLike.ts

import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

export const useDoubleTapLike = (onLike: () => void) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  const showHeart = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    opacity.value = withSpring(1);
    
    // Hide after delay
    scale.value = withDelay(600, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(600, withSpring(0));
  };
  
  const gesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(onLike)();
      showHeart();
    });
  
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  return { gesture, heartStyle };
};
```

---

## ⚡ Performance Guidelines

### Do's and Don'ts

```typescript
// ❌ WRONG: Running on JS thread
const BadComponent = () => {
  const [scale, setScale] = useState(1);
  
  const handlePress = () => {
    // This causes JS bridge communication
    setScale(0.95);
    setTimeout(() => setScale(1), 100);
  };
  
  return (
    <View style={{ transform: [{ scale }] }}>
      {/* Content */}
    </View>
  );
};

// ✅ CORRECT: Running on UI thread
const GoodComponent = () => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePress = () => {
    // Runs entirely on UI thread
    scale.value = withSpring(0.95);
    scale.value = withDelay(100, withSpring(1));
  };
  
  return (
    <Animated.View style={animatedStyle}>
      {/* Content */}
    </Animated.View>
  );
};
```

### Performance Checklist

```
✅ Use worklets for animation logic
✅ Avoid runOnJS when possible
✅ Use shared values instead of state
✅ Memoize gesture handlers
✅ Use Animated components (Animated.View, etc.)
✅ Cancel animations on unmount
✅ Use layout animations sparingly in lists
✅ Profile with Flipper/React DevTools
```

### Memory Management

```typescript
// Clean up animations on unmount
const AnimatedComponent = () => {
  const animation = useSharedValue(0);
  
  useEffect(() => {
    // Start animation
    animation.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
    
    // Cleanup
    return () => {
      cancelAnimation(animation);
    };
  }, []);
  
  return <Animated.View />;
};
```

---

## 📋 Sonraki Adım

Animasyon sistemi tanımlandıktan sonra [06-MICRO-INTERACTIONS.md](./06-MICRO-INTERACTIONS.md) dokümanında detaylı mikro-etkileşimler anlatılacaktır.
