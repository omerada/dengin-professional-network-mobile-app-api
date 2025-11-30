# Sprint 5-6: Social Feed & Posts

**Duration:** 2 weeks
**Focus:** Feed display, post creation, interactions (like/comment)
**Complexity:** ⭐⭐⭐ (Medium)

---

## Sprint Goals

- ✅ Infinite scroll feed
- ✅ Post creation with images
- ✅ Like/unlike posts (optimistic updates)
- ✅ Comments functionality
- ✅ Pull-to-refresh

---

## Week 1: Feed Display

### Day 1-2: Feed API Integration

**Tasks:**

- Create feed service with cursor pagination
- Setup React Query infinite query
- Implement feed data types
- Add API error handling

**Code:**

```typescript
// feedService.ts
export const feedService = {
  async getFeed(cursor?: string) {
    const response = await apiClient.get("/posts", {
      params: { cursor, limit: 20 },
    });
    return response.data;
  },
};

// useFeed.ts
export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => feedService.getFeed(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
```

**Validation:**

- [ ] Feed loads first page
- [ ] Pagination works correctly
- [ ] Loading states display
- [ ] Error handling works

---

### Day 3-4: Feed UI

**Tasks:**

- Create PostCard component
- Implement FlatList with infinite scroll
- Add pull-to-refresh
- Optimize list performance

**Files:**

```
src/features/feed/
├── components/
│   ├── PostCard.tsx
│   ├── PostHeader.tsx
│   ├── PostContent.tsx
│   └── PostActions.tsx
└── screens/
    └── FeedScreen.tsx
```

**Code:**

```typescript
// FeedScreen.tsx
export const FeedScreen: React.FC = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useFeed();

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      refreshing={false}
      onRefresh={refetch}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
    />
  );
};
```

**Validation:**

- [ ] Posts render correctly
- [ ] Infinite scroll works
- [ ] Pull-to-refresh updates feed
- [ ] List performance smooth (60 FPS)

---

### Day 5: Post Interactions

**Tasks:**

- Implement like button
- Add optimistic updates
- Create comment count display
- Handle navigation to post details

**Code:**

```typescript
// useLikePost.ts
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiClient.post(`/posts/${postId}/like`),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });

      const previousFeed = queryClient.getQueryData(["feed"]);

      queryClient.setQueriesData({ queryKey: ["feed"] }, (old: any) => ({
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
      }));

      return { previousFeed };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["feed"], context?.previousFeed);
    },
  });
};
```

**Validation:**

- [ ] Like button updates instantly
- [ ] Count increments/decrements
- [ ] Optimistic update rollback works
- [ ] Network request succeeds

---

## Week 2: Post Creation

### Day 1-2: Post Creation UI

**Tasks:**

- Create post creation screen
- Add text input with character limit
- Implement image picker
- Show image preview

**Files:**

```
src/features/feed/
├── screens/
│   └── CreatePostScreen.tsx
└── components/
    ├── PostTextInput.tsx
    └── ImagePreview.tsx
```

**Code:**

```typescript
// CreatePostScreen.tsx
export const CreatePostScreen: React.FC = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<MediaAsset[]>([]);

  const handleImagePick = async () => {
    const result = await imagePickerService.pickFromGallery({
      mediaType: "photo",
      selectionLimit: 5,
    });
    setImages(result);
  };

  return (
    <View>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Ne düşünüyorsunuz?"
        multiline
        maxLength={500}
      />
      <Text>{content.length}/500</Text>

      <Button title="Görsel Ekle" onPress={handleImagePick} />

      {images.map((img, i) => (
        <Image key={i} source={{ uri: img.uri }} />
      ))}
    </View>
  );
};
```

**Validation:**

- [ ] Text input works
- [ ] Character limit enforced
- [ ] Image picker opens
- [ ] Multiple images display

---

### Day 3-4: Post Upload

**Tasks:**

- Create post mutation
- Upload images to CDN
- Show upload progress
- Handle upload errors

**Code:**

```typescript
// useCreatePost.ts
export const useCreatePost = () => {
  return useMutation({
    mutationFn: async (data: CreatePostDto) => {
      // Upload images first
      const imageUrls = await Promise.all(
        data.images.map((img) => mediaUploader.uploadImage(img))
      );

      // Create post
      const response = await apiClient.post("/posts", {
        content: data.content,
        imageUrls,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      navigation.goBack();
    },
  });
};
```

**Validation:**

- [ ] Images upload successfully
- [ ] Progress shows for each image
- [ ] Post creates correctly
- [ ] Feed refreshes with new post

---

### Day 5: Comments

**Tasks:**

- Create comments screen
- Add comment list
- Implement add comment form
- Show comment count

**Files:**

```
src/features/feed/
├── screens/
│   └── CommentsScreen.tsx
└── components/
    ├── CommentCard.tsx
    └── AddCommentForm.tsx
```

**Validation:**

- [ ] Comments load correctly
- [ ] Add comment works
- [ ] Comment count updates
- [ ] Optimistic updates work

---

## Testing Checklist

**Unit Tests:**

- [ ] feedService.getFeed()
- [ ] useFeed pagination
- [ ] useLikePost optimistic update
- [ ] useCreatePost image upload

**Component Tests:**

- [ ] PostCard renders
- [ ] Like button toggles
- [ ] Comment count displays
- [ ] CreatePostScreen validation

**E2E Tests:**

- [ ] Scroll feed and load more
- [ ] Like/unlike post
- [ ] Create post with images
- [ ] Add comment to post

---

## Performance Checklist

- [ ] Feed renders 60 FPS
- [ ] Image loading lazy
- [ ] List virtualization enabled
- [ ] Memory usage <150MB

---

## Sprint Review

**Demo:**

1. Scroll through feed
2. Like/unlike posts
3. Create new post with images
4. Add comment to post
5. Pull to refresh

**Metrics:**

- Lines of code: ~2,800
- Files created: ~18
- Test coverage: >70%
- Feed load time: <2s

---

## Sprint Retrospective

**What went well:**

- Infinite scroll smooth
- Optimistic updates work great
- Image upload reliable

**What to improve:**

- Add image caching
- Better error messages
- Improve comment UX

**Action items:**

- Add post sharing
- Implement hashtags
- Add mentions (@user)

---

## Next Sprint Preview (Sprint 7-8)

Focus: Real-time messaging

- Socket.IO integration
- Chat interface
- Typing indicators
- Message status (sent/delivered/read)
