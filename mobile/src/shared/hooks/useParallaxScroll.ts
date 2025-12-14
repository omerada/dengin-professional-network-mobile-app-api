// src/shared/hooks/useParallaxScroll.ts
// Production Parallax Scroll Hook
// Oku: mobile/UX-FLOW-IYILESTIRME-RAPORU.md Phase 3

import { useRef } from 'react';
import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import type { NativeScrollEvent } from 'react-native';

export interface UseParallaxScrollConfig {
  /** Parallax intensity (0 = no parallax, 1 = 1:1 movement) */
  intensity?: number;
  /** Invert parallax direction */
  inverted?: boolean;
}

export interface UseParallaxScrollReturn {
  /** Scroll Y position */
  scrollY: SharedValue<number>;
  /** Scroll handler for ScrollView/FlatList */
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  /** Get animated style for parallax element */
  getParallaxStyle: (config?: ParallaxStyleConfig) => ReturnType<typeof useAnimatedStyle>;
}

export interface ParallaxStyleConfig {
  /** Custom parallax intensity (overrides default) */
  intensity?: number;
  /** Input range for interpolation */
  inputRange?: [number, number];
  /** Output range for interpolation */
  outputRange?: [number, number];
  /** Apply to opacity instead of translateY */
  animateOpacity?: boolean;
}

/**
 * useParallaxScroll Hook
 *
 * Provides smooth parallax scroll effects for headers, images, and backgrounds.
 * Optimized for 60 FPS with Reanimated worklets.
 *
 * Features:
 * - Configurable parallax intensity
 * - Multiple parallax layers support
 * - Opacity interpolation support
 * - Custom input/output ranges
 * - Performance optimized (runs on UI thread)
 *
 * @example
 * ```tsx
 * function ProfileScreen() {
 *   const { scrollY, scrollHandler, getParallaxStyle } = useParallaxScroll({
 *     intensity: 0.5,
 *   });
 *
 *   const headerStyle = getParallaxStyle();
 *   const avatarStyle = getParallaxStyle({ intensity: 0.3 });
 *
 *   return (
 *     <>
 *       <Animated.View style={[styles.header, headerStyle]}>
 *         <Animated.Image style={[styles.avatar, avatarStyle]} />
 *       </Animated.View>
 *       <Animated.ScrollView onScroll={scrollHandler}>
 *         <Content />
 *       </Animated.ScrollView>
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Fade out header on scroll
 * function FeedScreen() {
 *   const { scrollHandler, getParallaxStyle } = useParallaxScroll();
 *
 *   const headerStyle = getParallaxStyle({
 *     animateOpacity: true,
 *     inputRange: [0, 100],
 *     outputRange: [1, 0],
 *   });
 *
 *   return (
 *     <>
 *       <Animated.View style={[styles.header, headerStyle]}>
 *         <Title />
 *       </Animated.View>
 *       <Animated.FlatList
 *         onScroll={scrollHandler}
 *         data={posts}
 *         renderItem={renderPost}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useParallaxScroll(config: UseParallaxScrollConfig = {}): UseParallaxScrollReturn {
  const { intensity = 0.5, inverted = false } = config;

  // Scroll position
  const scrollY = useSharedValue(0);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event: NativeScrollEvent) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Get parallax style factory
  const getParallaxStyle = (styleConfig: ParallaxStyleConfig = {}) => {
    const {
      intensity: customIntensity = intensity,
      inputRange = [0, 200],
      outputRange,
      animateOpacity = false,
    } = styleConfig;

    const computedOutputRange = outputRange || [
      0,
      (inputRange[1] - inputRange[0]) * customIntensity * (inverted ? -1 : 1),
    ];

    return useAnimatedStyle(() => {
      const value = interpolate(scrollY.value, inputRange, computedOutputRange, 'clamp');

      if (animateOpacity) {
        return {
          opacity: value,
        };
      }

      return {
        transform: [{ translateY: value }],
      };
    });
  };

  return {
    scrollY,
    scrollHandler,
    getParallaxStyle,
  };
}

/**
 * useHeaderCollapse Hook
 *
 * Specialized parallax hook for collapsing headers.
 * Header shrinks/hides on scroll down, expands on scroll up.
 *
 * @example
 * ```tsx
 * function MessagesScreen() {
 *   const { scrollHandler, headerStyle, titleStyle } = useHeaderCollapse({
 *     headerHeight: 60,
 *     collapseThreshold: 100,
 *   });
 *
 *   return (
 *     <>
 *       <Animated.View style={[styles.header, headerStyle]}>
 *         <Animated.Text style={[styles.title, titleStyle]}>
 *           Mesajlar
 *         </Animated.Text>
 *       </Animated.View>
 *       <Animated.FlatList
 *         onScroll={scrollHandler}
 *         data={messages}
 *         renderItem={renderMessage}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useHeaderCollapse(
  config: {
    headerHeight?: number;
    collapseThreshold?: number;
    enableCollapse?: boolean;
  } = {},
) {
  const { headerHeight = 60, collapseThreshold = 100, enableCollapse = true } = config;

  const scrollY = useSharedValue(0);
  const lastScrollY = useRef(0);
  const scrollDirection = useSharedValue<'up' | 'down'>('up');

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event: NativeScrollEvent) => {
      const currentY = event.contentOffset.y;
      scrollY.value = currentY;

      // Detect scroll direction
      if (currentY > lastScrollY.current) {
        scrollDirection.value = 'down';
      } else if (currentY < lastScrollY.current) {
        scrollDirection.value = 'up';
      }

      lastScrollY.current = currentY;
    },
  });

  // Header container style (collapse/expand)
  const headerStyle = useAnimatedStyle(() => {
    if (!enableCollapse) return { height: headerHeight };

    const translateY = interpolate(
      scrollY.value,
      [0, collapseThreshold],
      [0, -headerHeight],
      'clamp',
    );

    return {
      transform: [{ translateY }],
      height: headerHeight,
    };
  });

  // Title style (fade out on collapse)
  const titleStyle = useAnimatedStyle(() => {
    if (!enableCollapse) return { opacity: 1 };

    const opacity = interpolate(scrollY.value, [0, collapseThreshold / 2], [1, 0], 'clamp');

    return { opacity };
  });

  return {
    scrollY,
    scrollHandler,
    headerStyle,
    titleStyle,
    scrollDirection,
  };
}

/**
 * useListItemReveal Hook
 *
 * Staggered reveal animation for list items on scroll.
 * Items fade in and slide up as they enter viewport.
 *
 * @example
 * ```tsx
 * function PostList() {
 *   const { scrollHandler, getItemStyle } = useListItemReveal();
 *
 *   const renderPost = ({ item, index }: ListRenderItemInfo<Post>) => (
 *     <Animated.View style={getItemStyle(index)}>
 *       <PostCard post={item} />
 *     </Animated.View>
 *   );
 *
 *   return (
 *     <Animated.FlatList
 *       onScroll={scrollHandler}
 *       data={posts}
 *       renderItem={renderPost}
 *     />
 *   );
 * }
 * ```
 */
export function useListItemReveal(
  config: {
    itemHeight?: number;
  } = {},
) {
  const { itemHeight = 100 } = config;

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event: NativeScrollEvent) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const getItemStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const itemPosition = index * itemHeight;
      const scrollPosition = scrollY.value;
      const viewportHeight = 800; // Approximate screen height

      // Item is entering viewport
      const isVisible = itemPosition < scrollPosition + viewportHeight;
      const revealProgress = interpolate(
        scrollPosition,
        [itemPosition - viewportHeight, itemPosition - viewportHeight / 2],
        [0, 1],
        'clamp',
      );

      return {
        opacity: isVisible ? revealProgress : 0,
        transform: [
          {
            translateY: isVisible ? interpolate(revealProgress, [0, 1], [30, 0]) : 30,
          },
        ],
      };
    });
  };

  return {
    scrollY,
    scrollHandler,
    getItemStyle,
  };
}
