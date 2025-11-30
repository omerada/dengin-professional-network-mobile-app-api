# Feed Module

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium)

---

## 1. Overview

Feed modülü sosyal paylaşım özelliklerini yönetir: post oluşturma, infinite scroll feed, beğeni, yorum, paylaşım ve real-time güncellemeler.

---

## 2. Module Structure

```
src/features/feed/
├── screens/
│   ├── FeedScreen.tsx                   # Ana feed ekranı
│   ├── PostDetailScreen.tsx             # Post detay + yorumlar
│   └── CreatePostScreen.tsx             # Yeni post oluşturma
├── components/
│   ├── PostCard.tsx                     # Post card component
│   ├── PostHeader.tsx                   # Post başlık (kullanıcı bilgisi)
│   ├── PostContent.tsx                  # Post içerik (text + image)
│   ├── PostActions.tsx                  # Like, comment, share buttons
│   ├── CommentList.tsx                  # Yorum listesi
│   ├── CommentItem.tsx                  # Tek yorum
│   ├── CommentInput.tsx                 # Yorum yazma
│   ├── CreatePostForm.tsx               # Post oluşturma formu
│   └── ImagePicker.tsx                  # Görsel seçici
├── hooks/
│   ├── useFeed.ts                       # Infinite query feed
│   ├── usePost.ts                       # Single post query
│   ├── useCreatePost.ts                 # Post oluşturma mutation
│   ├── useLikePost.ts                   # Like mutation
│   ├── useComments.ts                   # Comments query
│   ├── useCreateComment.ts              # Comment mutation
│   └── useSharePost.ts                  # Share mutation
├── stores/
│   └── feedStore.ts                     # Zustand feed cache
├── services/
│   └── feedApi.ts                       # Feed API calls
├── types/
│   └── feed.types.ts                    # Type definitions
└── index.ts
```

---

## 3. Type Definitions

**src/features/feed/types/feed.types.ts:**

```typescript
export interface Post {
  id: string;
  userId: string;
  author: Author;
  content: string;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  profession?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author: Author;
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
  image?: ImageData;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
}

export interface FeedResponse {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}
```

---

## 4. Services

**src/features/feed/services/feedApi.ts:**

```typescript
import { apiClient } from "@core/api/client";
import type {
  Post,
  Comment,
  CreatePostRequest,
  CreateCommentRequest,
  FeedResponse,
} from "../types/feed.types";

export const feedApi = {
  // Get feed
  getFeed: async (cursor?: string): Promise<FeedResponse> => {
    const response = await apiClient.get("/feed", {
      params: { cursor, limit: 20 },
    });
    return response.data;
  },

  // Get single post
  getPost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  // Create post
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const formData = new FormData();
    formData.append("content", data.content);

    if (data.image) {
      formData.append("image", {
        uri: data.image.uri,
        type: data.image.type,
        name: data.image.name,
      } as any);
    }

    const response = await apiClient.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Like post
  likePost: async (postId: string): Promise<void> => {
    await apiClient.post(`/posts/${postId}/like`);
  },

  // Unlike post
  unlikePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/like`);
  },

  // Get comments
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data;
  },

  // Create comment
  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post(`/posts/${data.postId}/comments`, {
      content: data.content,
    });
    return response.data;
  },

  // Delete post
  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },
};
```

---

## 5. Hooks

**src/features/feed/hooks/useFeed.ts:**

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { feedApi } from "../services/feedApi";

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => feedApi.getFeed(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**src/features/feed/hooks/useLikePost.ts:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { feedApi } from "../services/feedApi";

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? feedApi.unlikePost(postId) : feedApi.likePost(postId),

    onMutate: async ({ postId, isLiked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["feed"] });

      const previousFeed = queryClient.getQueryData(["feed"]);

      queryClient.setQueryData(["feed"], (old: any) => ({
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          posts: page.posts.map((post: Post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !isLiked,
                  likeCount: post.likeCount + (isLiked ? -1 : 1),
                }
              : post
          ),
        })),
      }));

      return { previousFeed };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
    },
  });
};
```

---

## 6. Components

**src/features/feed/components/PostCard.tsx:**

```typescript
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@shared/components/Text";
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import type { Post } from "../types/feed.types";

interface Props {
  post: Post;
}

export const PostCard = React.memo<Props>(({ post }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
      activeOpacity={0.95}
    >
      <PostHeader author={post.author} createdAt={post.createdAt} />

      <Text style={styles.content}>{post.content}</Text>

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )}

      <PostActions post={post} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 8,
    padding: 16,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    marginVertical: 12,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginTop: 8,
  },
});
```

---

## 7. Screens

**src/features/feed/screens/FeedScreen.tsx:**

```typescript
import React from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PostCard } from "../components/PostCard";
import { useFeed } from "../hooks/useFeed";
import { Loading } from "@shared/components/Loading";

export const FeedScreen = () => {
  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();

  if (isLoading) {
    return <Loading />;
  }

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <Loading /> : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
```

---

## 8. Summary

### Features:

- ✅ Infinite scroll feed with React Query
- ✅ Optimistic updates (like)
- ✅ Pull-to-refresh
- ✅ Image upload
- ✅ Comments
- ✅ Real-time updates (via WebSocket)

**Result:** High-performance social feed with optimistic UI updates.
