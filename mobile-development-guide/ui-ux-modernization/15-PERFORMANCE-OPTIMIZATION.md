# 🔋 Performans Optimizasyonu

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Instagram/Happen Seviyesinde Performans

---

## 📑 İçindekiler

1. [Performans Hedefleri](#performans-hedefleri)
2. [FlashList Optimizasyonu](#flashlist-optimizasyonu)
3. [Image Caching](#image-caching)
4. [Animation Performance](#animation-performance)
5. [Memory Management](#memory-management)
6. [Bundle Optimization](#bundle-optimization)
7. [Network Performance](#network-performance)

---

## 🎯 Performans Hedefleri

### Metrikler

```
Cold Start Time:     < 3 saniye
Screen Transition:   < 300ms
List Scroll:         60 FPS
Animation:           60 FPS
Memory Usage:        < 200MB average
Bundle Size:         < 50MB
First Contentful:    < 1.5s
Time to Interactive: < 3s
```

### Mevcut vs Hedef

```
Metrik              Mevcut    Hedef     Fark
─────────────────────────────────────────────
Cold Start          4-5s      <3s       ⚠️
List Scroll         45-55 FPS 60 FPS    ⚠️
Memory              250MB     <200MB    ⚠️
Bundle Size         65MB      <50MB     ⚠️
Animation           50 FPS    60 FPS    ⚠️
```

---

## 📋 FlashList Optimizasyonu

### FlatList → FlashList Migration

```typescript
// 📁 src/shared/components/lists/OptimizedList.tsx
import { FlashList, ContentStyle, ListRenderItem } from "@shopify/flash-list";
import React, { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  estimatedItemSize: number;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: ContentStyle;
  showsVerticalScrollIndicator?: boolean;
  onScroll?: (scrollY: number) => void;
}

export function OptimizedList<T>({
  data,
  renderItem,
  estimatedItemSize,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  onScroll,
}: OptimizedListProps<T>) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      if (onScroll) {
        scheduleOnRN(onScroll)(event.contentOffset.y);
      }
    },
  });

  // Memoize render function
  const memoizedRenderItem = useCallback(renderItem, [renderItem]);

  // Memoize key extractor
  const memoizedKeyExtractor = useCallback(keyExtractor, [keyExtractor]);

  return (
    <AnimatedFlashList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      estimatedItemSize={estimatedItemSize}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      // Performance optimizations
      drawDistance={200}
      overrideItemLayout={undefined}
      getItemType={undefined}
    />
  );
}
```

### Feed List Implementation

```typescript
// 📁 src/features/feed/components/FeedList.tsx
import React, { useCallback, memo } from "react";
import { OptimizedList } from "@/shared/components/lists/OptimizedList";
import { PostCard } from "./PostCard";
import { FeedSkeleton } from "./FeedSkeleton";
import { FeedEmpty } from "./FeedEmpty";
import { Post } from "@/types";

interface FeedListProps {
  posts: Post[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

// Memoized PostCard wrapper
const MemoizedPostCard = memo(PostCard, (prevProps, nextProps) => {
  // Custom equality check
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likesCount === nextProps.post.likesCount &&
    prevProps.post.isLiked === nextProps.post.isLiked &&
    prevProps.post.commentsCount === nextProps.post.commentsCount
  );
});

export const FeedList: React.FC<FeedListProps> = memo(
  ({ posts, isLoading, isRefreshing, onRefresh, onLoadMore, hasMore }) => {
    // Render item - memoized
    const renderItem = useCallback(
      ({ item, index }: { item: Post; index: number }) => {
        return <MemoizedPostCard post={item} index={index} />;
      },
      []
    );

    // Key extractor
    const keyExtractor = useCallback((item: Post) => item.id, []);

    // Loading footer
    const ListFooterComponent = useCallback(() => {
      if (!hasMore) return null;
      return <FeedSkeleton count={2} />;
    }, [hasMore]);

    if (isLoading && posts.length === 0) {
      return <FeedSkeleton count={5} />;
    }

    return (
      <OptimizedList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={450} // Average post card height
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={<FeedEmpty />}
        ListFooterComponent={<ListFooterComponent />}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    );
  }
);
```

### Chat Message List

```typescript
// 📁 src/features/messaging/components/MessageList.tsx
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useRef, memo } from "react";
import { View, StyleSheet } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const MessageList: React.FC<MessageListProps> = memo(
  ({ messages, currentUserId, onLoadMore, hasMore }) => {
    const listRef = useRef<FlashList<Message>>(null);

    // Inverted list for chat
    const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

    const renderItem = useCallback(
      ({ item, index }: { item: Message; index: number }) => {
        const isOwn = item.senderId === currentUserId;
        const prevMessage = invertedMessages[index + 1];
        const nextMessage = invertedMessages[index - 1];

        const showAvatar =
          !isOwn && (!nextMessage || nextMessage.senderId !== item.senderId);

        const showTimestamp =
          !prevMessage ||
          new Date(item.createdAt).getTime() -
            new Date(prevMessage.createdAt).getTime() >
            60000;

        return (
          <MessageBubble
            message={item}
            isOwn={isOwn}
            showAvatar={showAvatar}
            showTimestamp={showTimestamp}
          />
        );
      },
      [currentUserId, invertedMessages]
    );

    const keyExtractor = useCallback((item: Message) => item.id, []);

    // Optimized item type for better performance
    const getItemType = useCallback(
      (item: Message) => {
        if (item.senderId === currentUserId) return "own";
        return "other";
      },
      [currentUserId]
    );

    return (
      <FlashList
        ref={listRef}
        data={invertedMessages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={80}
        inverted
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        getItemType={getItemType}
        // Performance
        drawDistance={300}
        showsVerticalScrollIndicator={false}
      />
    );
  }
);
```

---

## 🖼️ Image Caching

### expo-image ile Optimized Image

```typescript
// 📁 src/shared/components/images/CachedImage.tsx
import { Image, ImageProps, ImageSource } from "expo-image";
import React, { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";

interface CachedImageProps extends Omit<ImageProps, "source"> {
  uri: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  blurhash?: string;
  priority?: "low" | "normal" | "high";
  cachePolicy?: "none" | "disk" | "memory" | "memory-disk";
}

// Blurhash placeholder for professional loading
const DEFAULT_BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

export const CachedImage: React.FC<CachedImageProps> = memo(
  ({
    uri,
    width,
    height,
    aspectRatio,
    blurhash = DEFAULT_BLURHASH,
    priority = "normal",
    cachePolicy = "memory-disk",
    style,
    ...props
  }) => {
    const { colors } = useTheme();

    const source = useMemo<ImageSource>(
      () => ({
        uri,
        cacheKey: uri, // Use URI as cache key
      }),
      [uri]
    );

    const containerStyle = useMemo(
      () => [
        styles.container,
        { backgroundColor: colors.background.secondary },
        width && { width },
        height && { height },
        aspectRatio && { aspectRatio },
        style,
      ],
      [colors, width, height, aspectRatio, style]
    );

    return (
      <Image
        source={source}
        style={containerStyle}
        placeholder={blurhash}
        contentFit="cover"
        transition={300}
        priority={priority}
        cachePolicy={cachePolicy}
        recyclingKey={uri}
        {...props}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
```

### Progressive Image Loading

```typescript
// 📁 src/shared/components/images/ProgressiveImage.tsx
import { Image, ImageLoadEventData } from "expo-image";
import React, { memo, useState, useCallback } from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";

interface ProgressiveImageProps {
  uri: string;
  thumbnailUri?: string;
  blurhash?: string;
  width: number;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = memo(
  ({ uri, thumbnailUri, blurhash, width, height, borderRadius = 0, style }) => {
    const opacity = useSharedValue(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const onLoad = useCallback(() => {
      "worklet";
      opacity.value = withTiming(1, { duration: 300 });
      setIsLoaded(true);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    return (
      <View style={[styles.container, { width, height, borderRadius }, style]}>
        {/* Placeholder layer */}
        <Image
          source={{ uri: thumbnailUri || uri }}
          placeholder={blurhash}
          style={[styles.image, { borderRadius }]}
          contentFit="cover"
          blurRadius={isLoaded ? 0 : 20}
          cachePolicy="memory"
          priority="low"
        />

        {/* Full resolution layer */}
        <Animated.View style={[styles.overlay, animatedStyle]}>
          <Image
            source={{ uri }}
            style={[styles.image, { borderRadius }]}
            contentFit="cover"
            onLoad={onLoad}
            cachePolicy="memory-disk"
            priority="high"
          />
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
```

### Image Prefetching

```typescript
// 📁 src/shared/utils/imagePrefetch.ts
import { Image } from "expo-image";

interface PrefetchOptions {
  priority?: "low" | "normal" | "high";
}

/**
 * Prefetch a single image
 */
export const prefetchImage = async (
  uri: string,
  options: PrefetchOptions = {}
): Promise<boolean> => {
  const { priority = "normal" } = options;

  try {
    await Image.prefetch(uri, { cachePolicy: "memory-disk" });
    return true;
  } catch (error) {
    console.warn("Image prefetch failed:", uri, error);
    return false;
  }
};

/**
 * Prefetch multiple images in batch
 */
export const prefetchImages = async (
  uris: string[],
  options: PrefetchOptions = {}
): Promise<boolean[]> => {
  const results = await Promise.allSettled(
    uris.map((uri) => prefetchImage(uri, options))
  );

  return results.map((result) => result.status === "fulfilled" && result.value);
};

/**
 * Prefetch images for feed posts
 */
export const prefetchFeedImages = async (
  posts: Array<{ imageUrl?: string; authorAvatarUrl?: string }>
) => {
  const imageUris = posts
    .flatMap((post) => [post.imageUrl, post.authorAvatarUrl])
    .filter((uri): uri is string => !!uri);

  // Prefetch in background
  prefetchImages(imageUris, { priority: "low" });
};

/**
 * Clear image cache
 */
export const clearImageCache = async (): Promise<void> => {
  await Image.clearDiskCache();
  await Image.clearMemoryCache();
};

/**
 * Get cache size info
 */
export const getImageCacheSize = async (): Promise<number> => {
  // This would need native module implementation
  // Return estimated size based on cached count
  return 0;
};
```

---

## 🎬 Animation Performance

### Animation Configuration

```typescript
// 📁 src/shared/config/animation.config.ts
import { Platform } from "react-native";

// Frame budget: 16.67ms for 60 FPS
export const FRAME_BUDGET_MS = 16.67;

// Enable native driver for better performance
export const USE_NATIVE_DRIVER = true;

// Reduce animations on low-end devices
export const getAnimationConfig = () => {
  // Detect low-end device (simplified)
  const isLowEndDevice =
    Platform.OS === "android" && (Platform.Version < 26 || __DEV__);

  return {
    enableAnimations: true,
    useNativeDriver: true,
    reducedMotion: isLowEndDevice,
    springConfig: isLowEndDevice
      ? { damping: 20, stiffness: 200 } // Faster, simpler
      : { damping: 15, stiffness: 150 }, // Smooth, bouncy
  };
};

// Animation quality levels
export const AnimationQuality = {
  HIGH: {
    duration: 400,
    useSpring: true,
    useHaptics: true,
  },
  MEDIUM: {
    duration: 300,
    useSpring: true,
    useHaptics: false,
  },
  LOW: {
    duration: 200,
    useSpring: false,
    useHaptics: false,
  },
};
```

### Optimized Shared Values

```typescript
// 📁 src/shared/hooks/useOptimizedAnimation.ts
import { useCallback, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  cancelAnimation,
  SharedValue,
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";

interface UseOptimizedAnimationOptions {
  defaultValue?: number;
  springConfig?: WithSpringConfig;
  timingConfig?: WithTimingConfig;
}

export function useOptimizedAnimation(
  options: UseOptimizedAnimationOptions = {}
) {
  const {
    defaultValue = 0,
    springConfig = { damping: 15, stiffness: 150 },
    timingConfig = { duration: 300 },
  } = options;

  const value = useSharedValue(defaultValue);
  const isAnimating = useRef(false);

  const animateToWithSpring = useCallback(
    (toValue: number, callback?: () => void) => {
      "worklet";
      cancelAnimation(value);
      value.value = withSpring(toValue, springConfig, (finished) => {
        if (finished && callback) {
          scheduleOnRN(callback)();
        }
      });
    },
    [springConfig]
  );

  const animateToWithTiming = useCallback(
    (toValue: number, callback?: () => void) => {
      "worklet";
      cancelAnimation(value);
      value.value = withTiming(toValue, timingConfig, (finished) => {
        if (finished && callback) {
          scheduleOnRN(callback)();
        }
      });
    },
    [timingConfig]
  );

  const reset = useCallback(() => {
    "worklet";
    cancelAnimation(value);
    value.value = defaultValue;
  }, [defaultValue]);

  return {
    value,
    animateToWithSpring,
    animateToWithTiming,
    reset,
  };
}
```

### Batch Animation Updates

```typescript
// 📁 src/shared/utils/animationBatcher.ts
import { runOnUI } from "react-native-reanimated";

type AnimationCallback = () => void;

class AnimationBatcher {
  private queue: AnimationCallback[] = [];
  private isProcessing = false;
  private frameId: number | null = null;

  add(callback: AnimationCallback) {
    this.queue.push(callback);
    this.scheduleProcessing();
  }

  private scheduleProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.frameId = requestAnimationFrame(() => {
      this.processQueue();
    });
  }

  private processQueue() {
    const callbacks = [...this.queue];
    this.queue = [];
    this.isProcessing = false;

    // Run all animations in single UI thread update
    runOnUI(() => {
      "worklet";
      callbacks.forEach((cb) => cb());
    })();
  }

  clear() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    this.queue = [];
    this.isProcessing = false;
  }
}

export const animationBatcher = new AnimationBatcher();
```

---

## 🧠 Memory Management

### Memory Monitoring Hook

```typescript
// 📁 src/shared/hooks/useMemoryWarning.ts
import { useEffect } from "react";
import {
  AppState,
  AppStateStatus,
  NativeModules,
  Platform,
} from "react-native";

interface MemoryInfo {
  usedJSHeap: number;
  totalJSHeap: number;
  usagePercentage: number;
}

export function useMemoryWarning(
  onMemoryWarning: () => void,
  thresholdPercentage: number = 80
) {
  useEffect(() => {
    // Listen for app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkMemory();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Check memory periodically
    const interval = setInterval(checkMemory, 30000); // Every 30 seconds

    function checkMemory() {
      // On iOS, we can use performance API
      if (Platform.OS === "ios" && typeof performance !== "undefined") {
        const memory = (performance as any).memory;
        if (memory) {
          const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
          if (usage > thresholdPercentage) {
            onMemoryWarning();
          }
        }
      }
    }

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [onMemoryWarning, thresholdPercentage]);
}
```

### Component Cleanup

```typescript
// 📁 src/shared/hooks/useCleanup.ts
import { useEffect, useRef, useCallback } from "react";

type CleanupFunction = () => void;

export function useCleanup() {
  const cleanupFunctions = useRef<Set<CleanupFunction>>(new Set());

  const registerCleanup = useCallback((cleanup: CleanupFunction) => {
    cleanupFunctions.current.add(cleanup);
    return () => {
      cleanupFunctions.current.delete(cleanup);
    };
  }, []);

  const runCleanup = useCallback(() => {
    cleanupFunctions.current.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("Cleanup error:", error);
      }
    });
    cleanupFunctions.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      runCleanup();
    };
  }, [runCleanup]);

  return { registerCleanup, runCleanup };
}
```

### Image Memory Management

```typescript
// 📁 src/shared/utils/imageMemoryManager.ts
import { Image } from "expo-image";

const MAX_CACHED_IMAGES = 100;
const CACHE_SIZE_MB = 100;

class ImageMemoryManager {
  private loadedImages = new Set<string>();

  async checkAndCleanup() {
    if (this.loadedImages.size > MAX_CACHED_IMAGES) {
      await this.clearOldCache();
    }
  }

  trackImage(uri: string) {
    this.loadedImages.add(uri);
    this.checkAndCleanup();
  }

  untrackImage(uri: string) {
    this.loadedImages.delete(uri);
  }

  async clearOldCache() {
    // Clear memory cache first (faster)
    await Image.clearMemoryCache();

    // Clear half of tracked images
    const toRemove = Array.from(this.loadedImages).slice(
      0,
      Math.floor(this.loadedImages.size / 2)
    );
    toRemove.forEach((uri) => this.loadedImages.delete(uri));
  }

  async clearAllCache() {
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
    this.loadedImages.clear();
  }
}

export const imageMemoryManager = new ImageMemoryManager();
```

---

## 📦 Bundle Optimization

### Lazy Loading Screens

```typescript
// 📁 src/navigation/LazyScreens.tsx
import React, { lazy, Suspense } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Loading fallback
const ScreenLoader = () => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" />
  </View>
);

// Lazy load heavy screens
export const LazyFeedScreen = lazy(
  () => import("@/features/feed/screens/FeedScreen")
);

export const LazyProfileScreen = lazy(
  () => import("@/features/profile/screens/ProfileScreen")
);

export const LazyChatScreen = lazy(
  () => import("@/features/messaging/screens/ChatScreen")
);

export const LazySettingsScreen = lazy(
  () => import("@/features/settings/screens/SettingsScreen")
);

// Wrapper with suspense
export function withLazyLoading<P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>
) {
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

### Tree Shaking Configuration

```javascript
// 📁 babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["module:@react-native/babel-preset"],
    plugins: [
      // Enable tree shaking for lodash
      ["lodash", { id: ["lodash", "lodash-es"] }],

      // Reanimated plugin (must be last)
      "react-native-reanimated/plugin",
    ],
    env: {
      production: {
        plugins: [
          // Remove console.log in production
          "transform-remove-console",
        ],
      },
    },
  };
};
```

### Bundle Analysis

```bash
# Package.json scripts
{
  "scripts": {
    "analyze:ios": "react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ./bundle-ios.js --sourcemap-output ./bundle-ios.js.map && source-map-explorer bundle-ios.js bundle-ios.js.map",
    "analyze:android": "react-native bundle --platform android --dev false --entry-file index.js --bundle-output ./bundle-android.js --sourcemap-output ./bundle-android.js.map && source-map-explorer bundle-android.js bundle-android.js.map"
  }
}
```

---

## 🌐 Network Performance

### API Response Caching

```typescript
// 📁 src/shared/api/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 5 minutes
      gcTime: 1000 * 60 * 5,
      // Stale time: 30 seconds
      staleTime: 1000 * 30,
      // Retry on network failure
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on reconnect
      refetchOnReconnect: "always",
      // Don't refetch on window focus (mobile)
      refetchOnWindowFocus: false,
    },
  },
});

// Persist queries to AsyncStorage
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "REACT_QUERY_CACHE",
  throttleTime: 1000, // Throttle writes
});
```

### Request Deduplication

```typescript
// 📁 src/shared/api/requestDeduplicator.ts
type PendingRequest = Promise<any>;

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();

  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Create new request
    const request = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  clear() {
    this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Usage
// const user = await requestDeduplicator.dedupe(
//   `user:${userId}`,
//   () => api.getUser(userId)
// );
```

### Optimistic Updates

```typescript
// 📁 src/features/feed/hooks/useLikePost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "@/api/posts";
import { Post } from "@/types";

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? unlikePost(postId) : likePost(postId),

    // Optimistic update
    onMutate: async ({ postId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update
      queryClient.setQueryData(
        ["posts"],
        (old: { pages: Post[][] } | undefined) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !isLiked,
                      likesCount: isLiked
                        ? post.likesCount - 1
                        : post.likesCount + 1,
                    }
                  : post
              )
            ),
          };
        }
      );

      return { previousPosts };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },

    // Always refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
```

---

## 📊 Performance Monitoring

### Performance Metrics Hook

```typescript
// 📁 src/shared/hooks/usePerformanceMetrics.ts
import { useEffect, useRef } from "react";
import { InteractionManager, Platform } from "react-native";

interface PerformanceMetrics {
  mountTime: number;
  interactionTime: number;
  renderCount: number;
}

export function usePerformanceMetrics(componentName: string) {
  const metrics = useRef<PerformanceMetrics>({
    mountTime: 0,
    interactionTime: 0,
    renderCount: 0,
  });
  const startTime = useRef(Date.now());

  useEffect(() => {
    const mountEnd = Date.now();
    metrics.current.mountTime = mountEnd - startTime.current;

    // Wait for interactions to complete
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      metrics.current.interactionTime = Date.now() - startTime.current;

      // Log metrics in development
      if (__DEV__) {
        console.log(`[Performance] ${componentName}:`, {
          mountTime: `${metrics.current.mountTime}ms`,
          interactionTime: `${metrics.current.interactionTime}ms`,
        });
      }
    });

    return () => {
      interactionHandle.cancel();
    };
  }, [componentName]);

  // Track renders
  metrics.current.renderCount++;

  return metrics.current;
}
```

---

Bu performans optimizasyonları uygulandığında:

- ✅ 60 FPS scroll ve animasyonlar
- ✅ <3 saniye cold start
- ✅ <200MB memory usage
- ✅ Optimized image loading
- ✅ Efficient network requests
