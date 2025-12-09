# 🎯 Quick Reference - AI Agent Cheat Sheet

> **Ultra-compact reference** - En sık kullanılan patterns

## 📦 Imports

```typescript
// Navigation
import { useNavigation } from '@react-navigation/native';

// State
import { useAuthStore } from '@features/auth/stores/authStore';
import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';

// Components
import { Button, Input, Card } from '@shared/components';

// Hooks
import { useColors, useTheme } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';

// API
import { apiClient } from '@core/api';
```

## 🧩 Component Template

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  userId: string;
  onPress: (id: string) => void;
}

export const Component: React.FC<Props> = React.memo(({ userId, onPress }) => {
  // 1. Hooks
  const colors = useColors();
  const [loading, setLoading] = useState(false);

  // 2. Queries
  const { data } = useQuery({ queryKey: ['user', userId], queryFn: ... });

  // 3. Callbacks
  const handlePress = useCallback(() => {
    onPress(userId);
  }, [userId, onPress]);

  // 4. Render
  return <View style={styles.container}>...</View>;
});

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

## 🪝 Common Hooks

```typescript
// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: () => api.getPosts(),
});

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam = 0 }) => api.getFeed(pageParam),
  getNextPageParam: lastPage => lastPage.nextCursor,
});

// Create/Update
const { mutate, isPending } = useMutation({
  mutationFn: api.createPost,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
});

// Zustand
const user = useAuthStore(state => state.user);
const logout = useAuthStore(state => state.logout);

// Navigation
const navigation = useNavigation();
navigation.navigate('Screen', { id: '123' });
navigation.goBack();
```

## 📝 Form

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

const Form = () => {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => { ... };

  return (
    <Controller
      control={control}
      name="email"
      render={({ field: { onChange, value } }) => (
        <Input value={value} onChangeText={onChange} />
      )}
    />
  );
};
```

## 📜 FlatList

```typescript
const renderItem = useCallback(({ item }) => (
  <ItemCard item={item} />
), []);

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  onEndReached={loadMore}
  refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
/>
```

## 🔌 API

```typescript
// GET
const { data } = await apiClient.get<User>('/api/users/me');

// POST
const { data } = await apiClient.post<Post>('/api/posts', { content: '...' });

// PATCH
const { data } = await apiClient.patch<User>('/api/users/me', updates);

// DELETE
await apiClient.delete(`/api/posts/${postId}`);
```

## 🎨 Styling

```typescript
const MyComponent = () => {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.default }]}>
      <Text style={{ color: colors.text.primary }}>Hello</Text>
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

## 🚫 Never Do

```typescript
// ❌ any
const user: any = data;

// ❌ Inline functions
<Button onPress={() => navigate('Screen')} />

// ❌ Relative imports
import { Button } from '../../shared/components/Button';

// ❌ No types
const [loading, setLoading] = useState();

// ❌ Missing dependencies
useEffect(() => { fetchData() }, []);
```

## ✅ Always Do

```typescript
// ✅ Strict types
const user: User | null = data;

// ✅ useCallback
const handlePress = useCallback(() => navigate('Screen'), []);

// ✅ Path aliases
import { Button } from '@shared/components';

// ✅ Type everything
const [loading, setLoading] = useState<boolean>(false);

// ✅ Correct dependencies
useEffect(() => {
  fetchData();
}, [userId]);
```

---

**Tam detaylar için:** [README.md](./README.md)
