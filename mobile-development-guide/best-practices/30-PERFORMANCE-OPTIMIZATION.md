# Performance Optimization

**Purpose:** 60 FPS rendering, fast app startup, efficient memory usage
**Complexity:** ⭐⭐⭐ (Medium)

---

## Overview

Bu doküman, React Native uygulamasında performans optimizasyonu için teknikleri açıklar.

---

## FlatList Optimization

### Basic Optimization

```typescript
// ✅ DO: Optimize FlatList props
<FlatList
  data={posts}
  renderItem={({ item }) => <PostCard post={item} />}
  keyExtractor={(item) => item.id}
  // Performance props
  initialNumToRender={10} // First render count
  maxToRenderPerBatch={10} // Items per scroll batch
  windowSize={5} // Render window multiplier
  removeClippedSubviews={true} // Unmount off-screen views
  // Fixed height optimization
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Memoized Items

```typescript
// ✅ DO: Memoize list items
const PostCard = React.memo(
  ({ post }: PostCardProps) => {
    return (
      <View style={styles.card}>
        <Text>{post.content}</Text>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.likesCount === nextProps.post.likesCount
    );
  }
);

// ❌ DON'T: Create new objects in render
<FlatList
  data={posts}
  renderItem={({ item }) => (
    <PostCard
      post={item}
      onPress={() => navigate("PostDetails", { id: item.id })} // ❌ New function
    />
  )}
/>;

// ✅ DO: Use useCallback
const handlePress = useCallback(
  (id: string) => {
    navigate("PostDetails", { id });
  },
  [navigate]
);

<FlatList
  data={posts}
  renderItem={({ item }) => <PostCard post={item} onPress={handlePress} />}
/>;
```

---

## Image Optimization

### Fast Image

```typescript
// ✅ DO: Use react-native-fast-image
import FastImage from "react-native-fast-image";

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  style={{ width: 300, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>;

// ✅ DO: Preload images
FastImage.preload([
  { uri: "https://...", priority: FastImage.priority.high },
  { uri: "https://...", priority: FastImage.priority.high },
]);
```

### Image Compression

```typescript
// ✅ DO: Compress before upload
import ImageResizer from "react-native-image-resizer";

const compressImage = async (uri: string) => {
  const resized = await ImageResizer.createResizedImage(
    uri,
    1920, // maxWidth
    1080, // maxHeight
    "JPEG", // format
    80, // quality (0-100)
    0, // rotation
    null, // outputPath
    false, // keepMeta
    {
      mode: "contain",
      onlyScaleDown: true,
    }
  );

  return resized.uri;
};
```

---

## React Performance

### useMemo

```typescript
// ✅ DO: Memoize expensive calculations
const sortedPosts = useMemo(() => {
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}, [posts]);

// ❌ DON'T: Calculate every render
const sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);

// ✅ DO: Memoize filtered lists
const activePosts = useMemo(() => {
  return posts.filter((post) => post.isActive);
}, [posts]);
```

### useCallback

```typescript
// ✅ DO: Memoize event handlers
const handlePress = useCallback(() => {
  navigation.navigate("Profile", { userId });
}, [userId, navigation]);

// ✅ DO: Memoize callbacks passed to children
const handleLike = useCallback(
  (postId: string) => {
    likePost.mutate(postId);
  },
  [likePost]
);

<PostCard onLike={handleLike} />;
```

### React.memo

```typescript
// ✅ DO: Memo pure components
const UserAvatar = React.memo(({ user }: { user: User }) => {
  return <Image source={{ uri: user.avatar }} />;
});

// ✅ DO: Custom comparison function
const PostCard = React.memo(
  ({ post }: PostCardProps) => {
    return <View>{/* ... */}</View>;
  },
  (prevProps, nextProps) => {
    // Only re-render if id or likes changed
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.likesCount === nextProps.post.likesCount
    );
  }
);
```

---

## Bundle Size Optimization

### Hermes Engine

```javascript
// android/app/build.gradle
project.ext.react = [
    enableHermes: true  // Enable Hermes
]

// iOS Podfile
use_react_native!(
  :hermes_enabled => true
)
```

**Benefits:**

- Faster app startup
- Lower memory usage
- Smaller bundle size

### Code Splitting

```typescript
// ✅ DO: Lazy load screens
const ProfileScreen = React.lazy(() => import("./ProfileScreen"));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ProfileScreen />
</Suspense>;
```

### Remove Console Logs

```javascript
// babel.config.js
module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [["transform-remove-console", { exclude: ["error", "warn"] }]],
};
```

---

## Network Performance

### Request Caching

```typescript
// ✅ DO: Cache API responses
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
```

### Request Batching

```typescript
// ✅ DO: Batch multiple requests
const [user, posts, notifications] = await Promise.all([
  userService.getUser(userId),
  feedService.getFeed(),
  notificationService.getNotifications(),
]);

// ❌ DON'T: Sequential requests
const user = await userService.getUser(userId);
const posts = await feedService.getFeed();
const notifications = await notificationService.getNotifications();
```

### Prefetching

```typescript
// ✅ DO: Prefetch next screen data
const handleNavigate = async () => {
  // Prefetch profile data
  queryClient.prefetchQuery({
    queryKey: ["profile", userId],
    queryFn: () => userService.getUser(userId),
  });

  // Navigate
  navigation.navigate("Profile", { userId });
};
```

---

## Animation Performance

### Reanimated (UI Thread)

```typescript
// ✅ DO: Use Reanimated for smooth animations
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const opacity = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => {
  return {
    opacity: withTiming(opacity.value, { duration: 300 }),
  };
});

// ❌ DON'T: Animated API (runs on JS thread)
import { Animated } from "react-native";
```

### Native Driver

```typescript
// ✅ DO: Use native driver when possible
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // GPU acceleration
}).start();

// ❌ DON'T: Without native driver
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: false, // JS thread, slow
}).start();
```

---

## State Management Performance

### Zustand Selectors

```typescript
// ✅ DO: Select only needed state
const userName = useAuthStore((state) => state.user?.name);

// ❌ DON'T: Select entire state
const state = useAuthStore();
const userName = state.user?.name; // Re-renders on any state change

// ✅ DO: Use shallow comparison
import { shallow } from "zustand/shallow";

const { user, isAuthenticated } = useAuthStore(
  (state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }),
  shallow
);
```

### React Query Optimization

```typescript
// ✅ DO: Use select to transform data
const userName = useQuery({
  queryKey: ["user", userId],
  queryFn: () => userService.getUser(userId),
  select: (data) => data.name, // Only re-render if name changes
});

// ✅ DO: Disable unnecessary refetches
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => userService.getUser(userId),
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});
```

---

## Memory Management

### Clean Up Effects

```typescript
// ✅ DO: Clean up subscriptions
useEffect(() => {
  const subscription = socketClient.on("message", handleMessage);

  return () => {
    subscription.off(); // Clean up
  };
}, []);

// ✅ DO: Cancel pending requests
useEffect(() => {
  const controller = new AbortController();

  fetchData(controller.signal);

  return () => {
    controller.abort(); // Cancel request
  };
}, []);
```

### Avoid Memory Leaks

```typescript
// ✅ DO: Check if component is mounted
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    const data = await api.get("/data");

    if (isMounted) {
      setData(data); // Only update if still mounted
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
```

---

## Debugging Performance

### Flipper

```bash
# Enable Flipper for performance profiling
# iOS: Already enabled by default
# Android: Already enabled by default

# Open Flipper app
# Connect device
# Use React DevTools, Network, Layout Inspector
```

### React DevTools Profiler

```typescript
// Wrap app in Profiler
import { Profiler } from "react";

const onRenderCallback = (
  id: string,
  phase: "mount" | "update",
  actualDuration: number
) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
};

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>;
```

### Performance Monitor

```typescript
// Enable performance monitor in dev
import { LogBox } from "react-native";

if (__DEV__) {
  // Show FPS meter
  const perf = require("react-native/Libraries/Performance/Systrace");
  perf.setEnabled(true);
}
```

---

## Performance Checklist

**Rendering:**

- [ ] FlatList optimized (initialNumToRender, windowSize)
- [ ] Components memoized (React.memo)
- [ ] Event handlers memoized (useCallback)
- [ ] Expensive calculations memoized (useMemo)

**Images:**

- [ ] Using react-native-fast-image
- [ ] Images compressed before upload
- [ ] Lazy loading enabled

**Animations:**

- [ ] Using Reanimated 3 (UI thread)
- [ ] Native driver enabled
- [ ] Avoid layout animations

**Network:**

- [ ] API responses cached
- [ ] Requests batched
- [ ] Prefetching enabled

**Bundle:**

- [ ] Hermes enabled
- [ ] Console logs removed (production)
- [ ] Unused dependencies removed

**Memory:**

- [ ] Effects cleaned up
- [ ] Subscriptions unsubscribed
- [ ] No memory leaks

---

## Performance Targets

**App Startup:**

- Cold start: <3s
- Warm start: <1s

**Rendering:**

- Feed scroll: 60 FPS
- Navigation transitions: 60 FPS
- Animations: 60 FPS

**Memory:**

- Idle: <100MB
- Active: <200MB
- Peak: <300MB

**Network:**

- API response: <1s
- Image load: <2s

**Bundle Size:**

- iOS: <20MB
- Android: <15MB

---

## Summary

✅ **Performance Optimizations:**

- FlatList optimization (getItemLayout, memoization)
- Image optimization (FastImage, compression)
- React optimization (memo, useMemo, useCallback)
- Bundle optimization (Hermes, code splitting)
- Network optimization (caching, batching, prefetching)
- Animation optimization (Reanimated, native driver)
- Memory management (cleanup, leak prevention)

**Result:** 60 FPS smooth app, fast startup, low memory usage
