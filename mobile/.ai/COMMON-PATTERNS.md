# 🎨 Common Patterns

> **Production-Ready Code Examples** - Copy-paste hazır patterns

## 📋 İçindekiler

1. [Screen Patterns](#screen-patterns)
2. [Component Patterns](#component-patterns)
3. [Hook Patterns](#hook-patterns)
4. [Navigation Patterns](#navigation-patterns)
5. [Form Patterns](#form-patterns)
6. [List Patterns](#list-patterns)
7. [State Patterns](#state-patterns)

---

## 🖥️ Screen Patterns

### Basic Screen Template

```typescript
// features/feed/screens/FeedScreen.tsx

import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { useFeed } from '../hooks/useFeed';
import { PostCard } from '../components/PostCard';
import { LoadingSpinner } from '@shared/components';
import { ErrorView } from '@shared/components';
import { EmptyState } from '@shared/components';

export const FeedScreen: React.FC = () => {
  const colors = useColors();
  const {
    posts,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useFeed();

  // Render item (memoized)
  const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard post={item} />
  ), []);

  // Key extractor
  const keyExtractor = useCallback((item: Post) => item.id, []);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (isError) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  // Empty state
  if (posts.length === 0) {
    return <EmptyState message="No posts yet" />; // --> Hata mesajları her zaman anlamlı ve türkçe olmalı
  }

  // Main render
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <LoadingSpinner size="small" /> : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
});
```

### Screen with Tab Navigation

```typescript
// features/profile/screens/ProfileScreen.tsx

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ProfileHeader } from '../components/ProfileHeader';
import { TabBar } from '@shared/components';
import { PostsTab } from '../components/PostsTab';
import { MediaTab } from '../components/MediaTab';

type Tab = 'posts' | 'media';

export const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  return (
    <View style={styles.container}>
      <ScrollView>
        <ProfileHeader userId="me" />

        <TabBar
          tabs={[
            { id: 'posts', label: 'Posts' },
            { id: 'media', label: 'Media' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'posts' && <PostsTab />}
        {activeTab === 'media' && <MediaTab />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## 🧩 Component Patterns

### Card Component

```typescript
// shared/components/Card.tsx

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16
}) => {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.default,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### Button Component

```typescript
// shared/components/Button.tsx

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useColors } from '@contexts/ThemeContext';

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}) => {
  const colors = useColors();

  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    backgroundColor: variant === 'primary'
      ? colors.interactive.default
      : variant === 'outline'
      ? 'transparent'
      : colors.surface.elevated,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? colors.interactive.default : undefined,
    opacity: isDisabled ? 0.5 : 1,
    paddingVertical: size === 'small' ? 8 : size === 'large' ? 16 : 12,
    paddingHorizontal: size === 'small' ? 12 : size === 'large' ? 24 : 16,
  };

  const textStyle: TextStyle = {
    color: variant === 'primary'
      ? '#fff'
      : variant === 'outline'
      ? colors.interactive.default
      : colors.text.primary,
    fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : colors.interactive.default}
        />
      ) : (
        <Text style={[styles.text, textStyle]}>{children}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    fontWeight: '600',
  },
});
```

### Input Component

```typescript
// shared/components/Input.tsx

import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps
} from 'react-native';
import { useColors } from '@contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface.elevated,
            borderColor: error ? colors.status.error : colors.border.default,
          },
        ]}
      >
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            { color: colors.text.primary },
            style,
          ]}
          placeholderTextColor={colors.text.tertiary}
          {...props}
        />

        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.status.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
```

---

## 🪝 Hook Patterns

### Data Fetching Hook (Infinite Query)

```typescript
// features/feed/hooks/useFeed.ts

import { useInfiniteQuery } from '@tanstack/react-query';
import { feedApi } from '../services/feedApi';

export const useFeed = () => {
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
    getNextPageParam: lastPage => (lastPage.last ? undefined : lastPage.page + 1),
    staleTime: 5 * 60 * 1000,
  });

  const posts = data?.pages.flatMap(page => page.content) ?? [];

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

### Mutation Hook (Create/Update/Delete)

```typescript
// features/feed/hooks/useCreatePost.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedApi } from '../services/feedApi';
import { useToast } from '@contexts/ToastContext';

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: feedApi.createPost,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      showToast({
        type: 'success',
        message: 'Post created successfully!',
      });
    },

    onError: (error: any) => {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create post', // --> Hata mesajları her zaman anlamlı ve türkçe olmalı
      });
    },
  });
};
```

### Custom Utility Hook

```typescript
// shared/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => searchApi.search(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });

  return <Input value={searchTerm} onChangeText={setSearchTerm} />;
};
```

---

## 🧭 Navigation Patterns

### Navigate with Params

```typescript
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '@core/navigation/types';
import { NavigationProp } from '@react-navigation/native';

const FeedScreen = () => {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  return <PostCard onPress={handlePostPress} />;
};
```

### Go Back

```typescript
const PostDetailScreen = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return <BackButton onPress={handleBack} />;
};
```

### Reset Navigation (Logout)

```typescript
const logout = async () => {
  await authApi.logout();

  navigation.reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });
};
```

---

## 📝 Form Patterns

### Login Form (React Hook Form + Zod)

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { login, isLoading } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email"
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
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
          />
        )}
      />

      <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
        Login
      </Button>
    </View>
  );
};
```

---

## 📜 List Patterns

### Optimized FlatList

```typescript
const FeedList = ({ posts }: { posts: Post[] }) => {
  const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard post={item} />
  ), []);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};
```

### Pull to Refresh + Infinite Scroll

```typescript
const FeedScreen = () => {
  const {
    posts,
    refetch,
    fetchNextPage,
    hasNextPage,
    isRefreshing,
    isFetchingNextPage
  } = useFeed();

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      // Pull to refresh
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refetch}
        />
      }
      // Infinite scroll
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <LoadingSpinner size="small" /> : null
      }
    />
  );
};
```

---

## 🗄️ State Patterns

### Zustand Store

```typescript
// features/auth/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Usage
const ProfileScreen = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  return <ProfileHeader user={user} onLogout={logout} />;
};
```

---

## 🎯 Quick Reference

| Pattern             | Hook/Component           | Usage                 |
| ------------------- | ------------------------ | --------------------- |
| **Data Fetching**   | `useQuery`               | Fetch single resource |
| **Infinite Scroll** | `useInfiniteQuery`       | Paginated lists       |
| **Create/Update**   | `useMutation`            | Modify data           |
| **Local State**     | `useState`               | Component-level       |
| **Global State**    | `useAuthStore` (Zustand) | App-level             |
| **Navigation**      | `useNavigation`          | Navigate screens      |
| **Forms**           | `useForm` (RHF)          | Form handling         |
| **Debounce**        | `useDebounce`            | Delay input           |
| **Theme**           | `useColors`, `useTheme`  | Theming               |

---

**All patterns are production-ready, type-safe, and performance-optimized! 🚀**
