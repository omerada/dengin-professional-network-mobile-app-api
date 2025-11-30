# React Query Patterns

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium)

---

## 1. Overview

React Query (TanStack Query) patterns for server state management, caching, optimistic updates ve infinite queries.

---

## 2. Query Client Setup

**src/config/queryClient.ts:**

```typescript
import { QueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        Alert.alert("Hata", error.message || "Bir hata oluştu");
      },
    },
  },
});
```

**src/App.tsx:**

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@config/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

---

## 3. Basic Query Pattern

**useProfile hook:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@core/api/client";
import type { User } from "@features/profile/types";

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data as User;
    },
    enabled: !!userId, // Only run if userId exists
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Usage in component
const ProfileScreen = ({ userId }: { userId: string }) => {
  const { data: user, isLoading, error, refetch } = useProfile(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;
  if (!user) return null;

  return <ProfileCard user={user} />;
};
```

---

## 4. Mutation Pattern

**useUpdateProfile hook:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@core/api/client";
import type { User, UpdateProfileDto } from "@features/profile/types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileDto) => {
      const response = await apiClient.patch("/users/me", data);
      return response.data as User;
    },
    onSuccess: (updatedUser) => {
      // Update cache
      queryClient.setQueryData(["profile", updatedUser.id], updatedUser);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Usage in component
const EditProfileScreen = () => {
  const updateProfile = useUpdateProfile();

  const handleSubmit = async (data: UpdateProfileDto) => {
    try {
      await updateProfile.mutateAsync(data);
      Alert.alert("Başarılı", "Profil güncellendi");
      navigation.goBack();
    } catch (error) {
      // Error handled by queryClient default onError
    }
  };

  return (
    <ProfileForm onSubmit={handleSubmit} isLoading={updateProfile.isPending} />
  );
};
```

---

## 5. Infinite Query Pattern

**useFeed hook:**

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@core/api/client";
import type { Post, CursorPaginatedResponse } from "@features/feed/types";

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.get<CursorPaginatedResponse<Post>>(
        "/posts",
        {
          params: {
            cursor: pageParam,
            limit: 20,
          },
        }
      );
      return response.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
  });
};

// Usage in component
const FeedScreen = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useFeed();

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      refreshing={isLoading}
      onRefresh={refetch}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
    />
  );
};
```

---

## 6. Optimistic Updates

**useLikePost hook:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@core/api/client";
import type { Post } from "@features/feed/types";

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await apiClient.post(`/posts/${postId}/like`);
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feed"] });

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData(["feed"]);

      // Optimistically update
      queryClient.setQueriesData({ queryKey: ["feed"] }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: Post) =>
              post.id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likesCount: post.isLiked
                      ? post.likesCount - 1
                      : post.likesCount + 1,
                  }
                : post
            ),
          })),
        };
      });

      // Return context with snapshot
      return { previousFeed };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
    },
    onSettled: () => {
      // Refetch to ensure data is consistent
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};

// Usage
const PostCard = ({ post }: { post: Post }) => {
  const likePost = useLikePost();

  return (
    <TouchableOpacity
      onPress={() => likePost.mutate(post.id)}
      disabled={likePost.isPending}
    >
      <Icon
        name={post.isLiked ? "heart" : "heart-outline"}
        color={post.isLiked ? "red" : "gray"}
      />
      <Text>{post.likesCount}</Text>
    </TouchableOpacity>
  );
};
```

---

## 7. Dependent Queries

**useUserWithPosts hook:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@core/api/client";

export const useUserWithPosts = (userId: string) => {
  // First query: Get user
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    },
  });

  // Second query: Get user's posts (dependent on user data)
  const postsQuery = useQuery({
    queryKey: ["posts", userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}/posts`);
      return response.data;
    },
    enabled: !!userQuery.data, // Only run when user data is available
  });

  return {
    user: userQuery.data,
    posts: postsQuery.data,
    isLoading: userQuery.isLoading || postsQuery.isLoading,
    error: userQuery.error || postsQuery.error,
  };
};
```

---

## 8. Prefetching

**Prefetch on navigation:**

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@core/api/client";

const FeedScreen = () => {
  const queryClient = useQueryClient();

  const handlePostPress = (postId: string) => {
    // Prefetch post details before navigation
    queryClient.prefetchQuery({
      queryKey: ["post", postId],
      queryFn: async () => {
        const response = await apiClient.get(`/posts/${postId}`);
        return response.data;
      },
    });

    navigation.navigate("PostDetails", { postId });
  };

  return <PostList onPostPress={handlePostPress} />;
};
```

---

## 9. Query Invalidation

**Selective invalidation:**

```typescript
import { useQueryClient } from "@tanstack/react-query";

const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateFeed: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },

    invalidateProfile: (userId?: string) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },

    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
};
```

---

## 10. Cache Management

**Manual cache updates:**

```typescript
import { useQueryClient } from "@tanstack/react-query";

const useCacheManager = () => {
  const queryClient = useQueryClient();

  return {
    // Get cache data
    getPost: (postId: string) => {
      return queryClient.getQueryData(["post", postId]);
    },

    // Set cache data
    setPost: (postId: string, data: Post) => {
      queryClient.setQueryData(["post", postId], data);
    },

    // Remove from cache
    removePost: (postId: string) => {
      queryClient.removeQueries({ queryKey: ["post", postId] });
    },

    // Clear all cache
    clearCache: () => {
      queryClient.clear();
    },
  };
};
```

---

## 11. Background Refetch

**Auto refetch on interval:**

```typescript
export const useRealtimeNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await apiClient.get("/notifications");
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: false, // Don't refetch when app is in background
  });
};
```

---

## 12. Error Handling

**Custom error handling:**

```typescript
import { useQuery } from "@tanstack/react-query";

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await apiClient.get(`/posts/${postId}`);
      return response.data;
    },
    throwOnError: false, // Don't throw errors (handle manually)
    retry: (failureCount, error: any) => {
      // Don't retry on 404
      if (error.response?.status === 404) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });
};

// Component with error handling
const PostDetailsScreen = ({ postId }: { postId: string }) => {
  const { data, error, refetch } = usePost(postId);

  if (error) {
    if (error.response?.status === 404) {
      return <NotFoundView />;
    }
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return <PostDetails post={data} />;
};
```

---

## 13. Summary

### Features:

- ✅ Query client configuration
- ✅ Basic queries with caching
- ✅ Mutations with cache updates
- ✅ Infinite queries (pagination)
- ✅ Optimistic updates with rollback
- ✅ Dependent queries
- ✅ Prefetching
- ✅ Query invalidation
- ✅ Manual cache management
- ✅ Background refetch
- ✅ Custom error handling

**Result:** Powerful server state management with automatic caching and synchronization.
