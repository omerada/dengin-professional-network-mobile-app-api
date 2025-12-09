# 💻 Development Guide

> **Production-Ready Code Standards** - TypeScript, Components, Performance, Testing

## 🎯 Core Principles

```
✓ TypeScript Strict Mode     → No any, complete types
✓ Functional Components      → No class components
✓ Hooks-First               → No lifecycle methods
✓ Performance-Optimized     → Memoization mandatory
✓ Accessibility-Ready       → Screen reader support
```

---

## 📘 TypeScript Standards

### Rule #1: Strict Mode - NO EXCEPTIONS

```typescript
// ❌ ASLA YAPMA
const user: any = data;
function handlePress(item) { ... }
const result = apiCall() as any;

// ✅ HER ZAMAN YAP
const user: User | null = data;
const handlePress = (item: Post): void => { ... };
const result = await apiCall<ResponseType>();
```

### Typing Best Practices

```typescript
// ✅ Interface for objects
interface User {
  id: string;
  email: string;
  profile: UserProfile | null;
}

// ✅ Type for unions/primitives
type Status = 'idle' | 'loading' | 'success' | 'error';
type UserId = string;

// ✅ Generic types
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// ✅ Function types
type OnPressHandler = (postId: string) => void;
type AsyncHandler = () => Promise<void>;

// ✅ Component props
interface PostCardProps {
  post: Post;
  onPress: OnPressHandler;
  isLiked?: boolean; // Optional with ?
}
```

### Common Types Location

```typescript
// Feature-specific types
features / feed / types / feed.types.ts;

// Shared types
shared / types / common.types.ts;

// API response types
core / api / types / api.types.ts;
```

---

## 🧩 Component Patterns

### Standard Component Structure

```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { Post } from '@features/feed/types';

// 1️⃣ PROPS INTERFACE
interface PostCardProps {
  post: Post;
  onPress: (postId: string) => void;
  onLike?: (postId: string) => void;
}

// 2️⃣ COMPONENT
export const PostCard: React.FC<PostCardProps> = React.memo(({
  post,
  onPress,
  onLike
}) => {
  // 3️⃣ HOOKS (Order matters!)
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);

  // 4️⃣ EFFECTS
  useEffect(() => {
    setIsLiked(post.isLikedByCurrentUser);
  }, [post.isLikedByCurrentUser]);

  // 5️⃣ CALLBACKS (Memoized!)
  const handlePress = useCallback(() => {
    onPress(post.id);
  }, [post.id, onPress]);

  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    onLike?.(post.id);
  }, [post.id, onLike]);

  // 6️⃣ MEMOIZED VALUES
  const formattedDate = useMemo(() => {
    return formatDate(post.createdAt);
  }, [post.createdAt]);

  // 7️⃣ RENDER
  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Post by ${post.author.name}`}
    >
      <Text style={styles.content}>{post.content}</Text>
      <Text style={styles.date}>{formattedDate}</Text>

      <Pressable
        onPress={handleLike}
        accessibilityRole="button"
        accessibilityLabel={isLiked ? 'Unlike' : 'Like'}
      >
        <Text>{isLiked ? '❤️' : '🤍'} {post.likeCount}</Text>
      </Pressable>
    </Pressable>
  );
});

// 8️⃣ DISPLAY NAME (for debugging)
PostCard.displayName = 'PostCard';

// 9️⃣ STYLES (at the end)
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
```

### Component Checklist

- [ ] Props interface defined
- [ ] React.memo() for re-render optimization
- [ ] useCallback() for all handlers
- [ ] useMemo() for expensive calculations
- [ ] TypeScript strict types (no `any`)
- [ ] Accessibility props (accessibilityRole, accessibilityLabel)
- [ ] DisplayName for debugging
- [ ] StyleSheet at the end

---

## ⚡ Performance Rules

### Rule #1: Memoize Everything

```typescript
// ❌ BAD: New function every render
<Button onPress={() => navigate('Profile')} />

// ✅ GOOD: Memoized callback
const handlePress = useCallback(() => {
  navigate('Profile', { userId });
}, [userId, navigate]);

<Button onPress={handlePress} />
```

### Rule #2: Memoize Components

```typescript
// ❌ BAD: Re-renders on every parent update
export const PostCard = ({ post }: Props) => { ... };

// ✅ GOOD: Only re-renders when post changes
export const PostCard = React.memo(
  ({ post }: Props) => { ... },
  (prevProps, nextProps) => {
    return prevProps.post.id === nextProps.post.id &&
           prevProps.post.likeCount === nextProps.post.likeCount;
  }
);
```

### Rule #3: Optimize FlatList

```typescript
// ✅ COMPLETE FlatList Optimization
const renderItem = useCallback(({ item }: { item: Post }) => (
  <PostCard post={item} onPress={handlePostPress} />
), [handlePostPress]);

const keyExtractor = useCallback((item: Post) => item.id, []);

const getItemLayout = useCallback((data: any, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
}), []);

<FlatList
  data={posts}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout}
  // Performance props
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
  // Pull to refresh
  onRefresh={refetch}
  refreshing={isRefreshing}
  // Infinite scroll
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isLoadingMore ? <LoadingSpinner /> : null}
/>
```

### Rule #4: Optimize Images

```typescript
import { Image } from 'expo-image';

// ✅ BEST: Expo Image with optimization
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  placeholder={blurhash}  // Optional blurhash
  recyclingKey={post.id}  // For list optimization
/>
```

### Rule #5: Debounce User Input

```typescript
import { useDebounce } from '@shared/hooks';

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);  // 500ms delay

  // API call only when debouncedTerm changes
  const { data } = useQuery({
    queryKey: ['search', debouncedTerm],
    queryFn: () => searchApi.search(debouncedTerm),
    enabled: debouncedTerm.length > 2,
  });

  return (
    <Input
      value={searchTerm}
      onChangeText={setSearchTerm}
      placeholder="Search..."
    />
  );
};
```

---

## 🪝 Custom Hooks Pattern

### Hook Structure

```typescript
// features/feed/hooks/useFeed.ts

import { useInfiniteQuery } from '@tanstack/react-query';
import { feedApi } from '../services/feedApi';
import { Post } from '../types';

interface UseFeedReturn {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export const useFeed = (): UseFeedReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => feedApi.getFeed(pageParam),
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten pages into single array
  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  return {
    posts,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
};
```

### Hook Usage in Component

```typescript
export const FeedScreen = () => {
  const {
    posts,
    isLoading,
    refetch,
    fetchNextPage,
    isFetchingNextPage
  } = useFeed();

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
      onRefresh={refetch}
      refreshing={isLoading}
      onEndReached={fetchNextPage}
      ListFooterComponent={
        isFetchingNextPage ? <LoadingSpinner /> : null
      }
    />
  );
};
```

---

## 🎨 Styling Standards

### Theme System

```typescript
import { useColors, useTheme } from '@contexts/ThemeContext';

const MyComponent = () => {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.surface.default }
    ]}>
      <Text style={{ color: colors.text.primary }}>
        Hello
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
});
```

### Responsive Design

```typescript
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: width - 32, // Full width minus padding
    maxWidth: 600, // Max width for tablets
  },

  // Platform-specific
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
});
```

---

## 🔄 State Management Patterns

### Zustand - Local State

```typescript
// features/auth/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: user =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      setLoading: isLoading => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Usage in component
const user = useAuthStore(state => state.user);
const logout = useAuthStore(state => state.logout);
```

### React Query - Server State

```typescript
// features/feed/hooks/useCreatePost.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedApi } from '../services/feedApi';

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: feedApi.createPost,

    // Optimistic update
    onMutate: async newPost => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      const previousFeed = queryClient.getQueryData(['feed']);

      queryClient.setQueryData(['feed'], (old: any) => ({
        ...old,
        pages: old.pages.map((page: any, index: number) =>
          index === 0 ? { ...page, posts: [newPost, ...page.posts] } : page,
        ),
      }));

      return { previousFeed };
    },

    // Rollback on error
    onError: (err, newPost, context) => {
      queryClient.setQueryData(['feed'], context?.previousFeed);
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};
```

---

## 📝 Form Handling

### React Hook Form + Zod

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// 2. Component
export const LoginForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
          />
        )}
      />

      <Button
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Login
      </Button>
    </View>
  );
};
```

---

## ♿ Accessibility Standards

### Required Props

```typescript
// Button
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Like post"
  accessibilityHint="Double tap to like this post"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>Like</Text>
</Pressable>

// Input
<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email to login"
/>

// Image
<Image
  source={{ uri: avatarUrl }}
  accessibilityRole="image"
  accessibilityLabel={`${user.name}'s profile picture`}
/>
```

---

## 🧪 Testing Standards

### Component Test

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('should submit with valid credentials', async () => {
    const onSubmit = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <LoginForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(
      getByPlaceholderText('Email'),
      'test@example.com'
    );

    fireEvent.changeText(
      getByPlaceholderText('Password'),
      'password123'
    );

    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error for invalid email', async () => { // --> Hata mesajları her zaman anlamlı ve türkçe olmalı
    const { getByPlaceholderText, getByText } = render(
      <LoginForm />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid email')).toBeTruthy(); // --> Hata mesajları her zaman anlamlı ve türkçe olmalı
    });
  });
});
```

### Hook Test

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeed } from '../useFeed';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: any) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useFeed', () => {
  it('should fetch feed data', async () => {
    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toBeDefined();
    expect(result.current.posts.length).toBeGreaterThan(0);
  });
});
```

---

## 🚫 Common Mistakes

| ❌ Don't                                              | ✅ Do                                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `const user: any`                                     | `const user: User \| null`                                                         |
| `function Component() { }`                            | `const Component: React.FC = () => { }`                                            |
| `<Button onPress={() => ...} />`                      | `const handlePress = useCallback(() => ..., []); <Button onPress={handlePress} />` |
| `import Button from '../../shared/components/Button'` | `import { Button } from '@shared/components'`                                      |
| `const [loading, setLoading] = useState()`            | `const [loading, setLoading] = useState<boolean>(false)`                           |
| `useEffect(() => { fetchData() })`                    | `useEffect(() => { fetchData() }, [dependency])`                                   |

---

## 📋 Pre-Commit Checklist

- [ ] TypeScript strict mode - no `any`
- [ ] All handlers wrapped in `useCallback`
- [ ] Expensive calculations in `useMemo`
- [ ] Component wrapped in `React.memo`
- [ ] FlatList optimized (initialNumToRender, etc.)
- [ ] Accessibility props added
- [ ] Path aliases used (`@features`, `@core`, `@shared`)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Tests written (if applicable)

---

**Next:** [API-INTEGRATION.md](./API-INTEGRATION.md) - Backend API kullanımı
