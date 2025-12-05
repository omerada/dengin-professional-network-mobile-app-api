# 🎯 Feed Deneyimi Modernizasyonu

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Referans:** Instagram, Twitter, LinkedIn

---

## 📑 İçindekiler

1. [Feed Vizyonu](#feed-vizyonu)
2. [Post Card Tasarımı](#post-card-tasarımı)
3. [Feed Liste Optimizasyonu](#feed-liste-optimizasyonu)
4. [Etkileşim Animasyonları](#etkileşim-animasyonları)
5. [Pull to Refresh](#pull-to-refresh)
6. [Infinite Scroll](#infinite-scroll)
7. [Feed Header](#feed-header)
8. [Create Post](#create-post)

---

## 🌟 Feed Vizyonu

### Hedef Deneyim

```
"Kullanıcı feed'i açtığında anında içerik görmeli,
scroll akıcı olmalı, her etkileşim tatmin edici olmalı."
```

### Karşılaştırma

| Özellik        | Mevcut  | Instagram Level | Aksiyon          |
| -------------- | ------- | --------------- | ---------------- |
| Initial Load   | 2-3s    | <1s             | Skeleton + cache |
| Scroll FPS     | ~50     | 60              | FlashList        |
| Like Animation | None    | Heart burst     | Lottie + haptic  |
| Image Load     | Spinner | Blurhash        | expo-image       |
| Pull Refresh   | Basic   | Custom anim     | Custom spring    |

---

## 📱 Post Card Tasarımı

### Yeni PostCard Implementasyonu

```typescript
// src/features/feed/components/PostCard/PostCard.tsx

import React, { memo, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  Layout,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";
import { Avatar, Badge } from "@shared/components";
import { PostActions } from "./PostActions";
import { PostImages } from "./PostImages";
import type { Post } from "../../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;

interface PostCardProps {
  post: Post;
  index?: number;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onShare: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onMenuPress: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = memo(
  ({
    post,
    index = 0,
    onLike,
    onComment,
    onShare,
    onBookmark,
    onMenuPress,
  }) => {
    const { theme, colors } = useTheme();
    const { triggerHaptic } = useHaptic();
    const navigation = useNavigation();

    // Animation values
    const scale = useSharedValue(1);
    const heartScale = useSharedValue(0);
    const heartOpacity = useSharedValue(0);

    // Animated styles
    const cardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const heartAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: heartScale.value }],
      opacity: heartOpacity.value,
    }));

    // Double tap to like
    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        "worklet";
        if (!post.userInteraction.isLiked) {
          // Heart animation
          heartScale.value = withSpring(1, { damping: 10, stiffness: 300 });
          heartOpacity.value = 1;

          // Hide after delay
          heartScale.value = withDelay(600, withSpring(0, { damping: 15 }));
          heartOpacity.value = withDelay(600, withSpring(0));

          runOnJS(handleDoubleTapLike)();
        }
      });

    const handleDoubleTapLike = useCallback(() => {
      triggerHaptic("medium");
      onLike(post.postId);
    }, [post.postId, onLike, triggerHaptic]);

    // Navigation
    const handleAuthorPress = useCallback(() => {
      triggerHaptic("light");
      navigation.navigate(
        "UserProfile" as never,
        { userId: post.author.id } as never
      );
    }, [post.author.id, navigation, triggerHaptic]);

    const handlePostPress = useCallback(() => {
      triggerHaptic("light");
      navigation.navigate(
        "PostDetail" as never,
        { postId: post.postId } as never
      );
    }, [post.postId, navigation, triggerHaptic]);

    // Formatted time
    const timeAgo = useMemo(() => {
      return formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: tr,
      });
    }, [post.createdAt]);

    return (
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(300)}
        layout={Layout.springify()}
        style={[styles.container, cardAnimatedStyle]}
      >
        <GestureDetector gesture={doubleTapGesture}>
          <Pressable onPress={handlePostPress}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                onPress={handleAuthorPress}
                style={styles.authorSection}
              >
                <Avatar
                  uri={post.author.avatarUrl}
                  name={post.author.displayName}
                  size="md"
                  isVerified={post.author.isVerified}
                  isPremium={post.author.isPremium}
                />
                <View style={styles.authorInfo}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.authorName,
                        { color: colors.text.primary },
                      ]}
                    >
                      {post.author.displayName}
                    </Text>
                    {post.author.isVerified && (
                      <Badge variant="verified" size="sm" />
                    )}
                  </View>
                  <Text
                    style={[styles.metadata, { color: colors.text.tertiary }]}
                  >
                    {post.author.profession} • {timeAgo}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => onMenuPress(post.postId)}
                hitSlop={8}
                style={styles.menuButton}
              >
                <Icon
                  name="ellipsis-horizontal"
                  size={20}
                  color={colors.text.secondary}
                />
              </Pressable>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text
                style={[styles.contentText, { color: colors.text.primary }]}
                numberOfLines={5}
              >
                {post.content}
              </Text>
            </View>

            {/* Images */}
            {post.images.length > 0 && (
              <PostImages images={post.images} postId={post.postId} />
            )}

            {/* Double tap heart overlay */}
            <Animated.View
              style={[styles.heartOverlay, heartAnimatedStyle]}
              pointerEvents="none"
            >
              <Icon name="heart" size={80} color="#FFFFFF" />
            </Animated.View>
          </Pressable>
        </GestureDetector>

        {/* Actions */}
        <PostActions
          postId={post.postId}
          stats={post.stats}
          userInteraction={post.userInteraction}
          onLike={() => onLike(post.postId)}
          onComment={() => onComment(post.postId)}
          onShare={() => onShare(post.postId)}
          onBookmark={() => onBookmark(post.postId)}
        />
      </Animated.View>
    );
  }
);

PostCard.displayName = "PostCard";

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
  },
  metadata: {
    fontSize: 13,
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});
```

### PostActions Component

```typescript
// src/features/feed/components/PostCard/PostActions.tsx

import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

interface PostActionsProps {
  postId: number;
  stats: {
    likeCount: number;
    commentCount: number;
    viewCount: number;
  };
  userInteraction: {
    isLiked: boolean;
    isSaved: boolean;
  };
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
}

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export const PostActions: React.FC<PostActionsProps> = memo(
  ({ stats, userInteraction, onLike, onComment, onShare, onBookmark }) => {
    const { colors } = useTheme();
    const { triggerHaptic } = useHaptic();

    // Animation values
    const likeScale = useSharedValue(1);
    const bookmarkScale = useSharedValue(1);
    const shareScale = useSharedValue(1);

    // Like animation
    const likeAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: likeScale.value }],
    }));

    const handleLike = useCallback(() => {
      triggerHaptic("medium");
      likeScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      onLike();
    }, [onLike, triggerHaptic]);

    // Bookmark animation
    const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: bookmarkScale.value }],
    }));

    const handleBookmark = useCallback(() => {
      triggerHaptic("light");
      bookmarkScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      onBookmark();
    }, [onBookmark, triggerHaptic]);

    // Share animation
    const shareAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: shareScale.value }],
    }));

    const handleShare = useCallback(() => {
      triggerHaptic("light");
      shareScale.value = withSequence(
        withSpring(1.15, { damping: 12, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      onShare();
    }, [onShare, triggerHaptic]);

    const formatCount = (count: number): string => {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
      return count.toString();
    };

    return (
      <View style={styles.container}>
        <View style={styles.leftActions}>
          {/* Like */}
          <Pressable onPress={handleLike} style={styles.action} hitSlop={8}>
            <Animated.View style={likeAnimatedStyle}>
              <Icon
                name={userInteraction.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={
                  userInteraction.isLiked
                    ? colors.status.error
                    : colors.text.secondary
                }
              />
            </Animated.View>
            {stats.likeCount > 0 && (
              <Text style={[styles.count, { color: colors.text.secondary }]}>
                {formatCount(stats.likeCount)}
              </Text>
            )}
          </Pressable>

          {/* Comment */}
          <Pressable onPress={onComment} style={styles.action} hitSlop={8}>
            <Icon
              name="chatbubble-outline"
              size={22}
              color={colors.text.secondary}
            />
            {stats.commentCount > 0 && (
              <Text style={[styles.count, { color: colors.text.secondary }]}>
                {formatCount(stats.commentCount)}
              </Text>
            )}
          </Pressable>

          {/* Share */}
          <Pressable onPress={handleShare} style={styles.action} hitSlop={8}>
            <Animated.View style={shareAnimatedStyle}>
              <Icon
                name="paper-plane-outline"
                size={22}
                color={colors.text.secondary}
              />
            </Animated.View>
          </Pressable>
        </View>

        {/* Bookmark */}
        <Pressable onPress={handleBookmark} hitSlop={8}>
          <Animated.View style={bookmarkAnimatedStyle}>
            <Icon
              name={userInteraction.isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={
                userInteraction.isSaved
                  ? colors.special.premium
                  : colors.text.secondary
              }
            />
          </Animated.View>
        </Pressable>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: {
    fontSize: 14,
    fontWeight: "500",
  },
});
```

---

## 📋 Feed Liste Optimizasyonu

### FlashList Migration

```typescript
// src/features/feed/screens/FeedScreen.tsx

import React, { useCallback, useMemo, useState, useRef } from "react";
import { View, StyleSheet, RefreshControl, Dimensions } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@theme";
import { useFeedPosts, useLikePost, useBookmarkPost } from "../hooks";
import { PostCard, FeedHeader, EmptyFeed, SkeletonFeed } from "../components";
import { CustomRefreshControl } from "@shared/components";
import type { Post } from "../types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 56;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export const FeedScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlashList<Post>>(null);

  // Scroll animation
  const scrollY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);

  // Data
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFeedPosts();

  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT],
      "clamp"
    );
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT / 2],
      [1, 0],
      "clamp"
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Handlers
  const handleRefresh = useCallback(async () => {
    isRefreshing.value = true;
    await refetch();
    isRefreshing.value = false;
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = useCallback(
    (postId: number) => {
      const post = posts.find((p) => p.postId === postId);
      if (post) {
        likePost.mutate({ postId, isLiked: post.userInteraction.isLiked });
      }
    },
    [posts, likePost]
  );

  const handleBookmark = useCallback(
    (postId: number) => {
      const post = posts.find((p) => p.postId === postId);
      if (post) {
        bookmarkPost.mutate({ postId, isSaved: post.userInteraction.isSaved });
      }
    },
    [posts, bookmarkPost]
  );

  // Render item
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Post>) => (
      <PostCard
        post={item}
        index={index}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onBookmark={handleBookmark}
        onMenuPress={handleMenuPress}
      />
    ),
    [handleLike, handleBookmark]
  );

  const keyExtractor = useCallback((item: Post) => `post-${item.postId}`, []);

  // Estimated item size for FlashList optimization
  const estimatedItemSize = useMemo(() => {
    // Average post card height
    return 400;
  }, []);

  // Loading state
  if (isLoading && posts.length === 0) {
    return <SkeletonFeed />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      {/* Animated Header */}
      <Animated.View
        style={[styles.header, { paddingTop: insets.top }, headerAnimatedStyle]}
      >
        <FeedHeader onCreatePress={handleCreatePress} />
      </Animated.View>

      {/* Feed List */}
      <AnimatedFlashList
        ref={listRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={estimatedItemSize}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top,
          paddingBottom: insets.bottom + 80,
        }}
        refreshControl={
          <CustomRefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            progressViewOffset={HEADER_HEIGHT + insets.top}
          />
        }
        ListEmptyComponent={<EmptyFeed onCreatePress={handleCreatePress} />}
        ListFooterComponent={isFetchingNextPage ? <LoadingFooter /> : null}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      {/* Scroll to top FAB */}
      <ScrollToTopFab
        scrollY={scrollY}
        onPress={() =>
          listRef.current?.scrollToOffset({ offset: 0, animated: true })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 100,
  },
});
```

### Custom Refresh Control

```typescript
// src/shared/components/CustomRefreshControl.tsx

import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { useTheme } from "@theme";

interface CustomRefreshControlProps {
  refreshing: boolean;
  pullProgress: Animated.SharedValue<number>;
}

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = memo(
  ({ refreshing, pullProgress }) => {
    const { colors } = useTheme();
    const rotation = useSharedValue(0);

    React.useEffect(() => {
      if (refreshing) {
        rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1);
      } else {
        rotation.value = withSpring(0);
      }
    }, [refreshing]);

    const containerStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        pullProgress.value,
        [0, 100],
        [-60, 0],
        Extrapolate.CLAMP
      );
      const scale = interpolate(
        pullProgress.value,
        [0, 60, 100],
        [0.5, 0.8, 1],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        pullProgress.value,
        [0, 40],
        [0, 1],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ translateY }, { scale }],
        opacity,
      };
    });

    const iconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
      <Animated.View style={[styles.container, containerStyle]}>
        {refreshing ? (
          <LottieView
            source={require("@assets/animations/loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        ) : (
          <Animated.View style={iconStyle}>
            <Icon
              name="arrow-down"
              size={24}
              color={colors.interactive.default}
            />
          </Animated.View>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: 40,
    height: 40,
  },
});
```

---

## 🖼️ Post Images

```typescript
// src/features/feed/components/PostCard/PostImages.tsx

import React, { memo, useCallback } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useHaptic } from "@hooks/useHaptic";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_GAP = 2;

interface PostImagesProps {
  images: Array<{ id: string; url: string; blurhash?: string }>;
  postId: number;
}

export const PostImages: React.FC<PostImagesProps> = memo(
  ({ images, postId }) => {
    const navigation = useNavigation();
    const { triggerHaptic } = useHaptic();

    const handleImagePress = useCallback(
      (index: number) => {
        triggerHaptic("light");
        navigation.navigate(
          "ImageViewer" as never,
          {
            images,
            initialIndex: index,
            postId,
          } as never
        );
      },
      [images, postId, navigation, triggerHaptic]
    );

    const renderSingleImage = () => (
      <Pressable onPress={() => handleImagePress(0)}>
        <Image
          source={{ uri: images[0].url }}
          placeholder={images[0].blurhash}
          style={styles.singleImage}
          contentFit="cover"
          transition={200}
        />
      </Pressable>
    );

    const renderTwoImages = () => (
      <View style={styles.twoContainer}>
        {images.slice(0, 2).map((image, index) => (
          <Pressable
            key={image.id}
            onPress={() => handleImagePress(index)}
            style={styles.halfImage}
          >
            <Image
              source={{ uri: image.url }}
              placeholder={image.blurhash}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
        ))}
      </View>
    );

    const renderThreeImages = () => (
      <View style={styles.threeContainer}>
        <Pressable
          onPress={() => handleImagePress(0)}
          style={styles.largeImage}
        >
          <Image
            source={{ uri: images[0].url }}
            placeholder={images[0].blurhash}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        </Pressable>
        <View style={styles.smallImagesColumn}>
          {images.slice(1, 3).map((image, index) => (
            <Pressable
              key={image.id}
              onPress={() => handleImagePress(index + 1)}
              style={styles.smallImage}
            >
              <Image
                source={{ uri: image.url }}
                placeholder={image.blurhash}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          ))}
        </View>
      </View>
    );

    const renderFourPlusImages = () => (
      <View style={styles.gridContainer}>
        {images.slice(0, 4).map((image, index) => (
          <Pressable
            key={image.id}
            onPress={() => handleImagePress(index)}
            style={styles.gridImage}
          >
            <Image
              source={{ uri: image.url }}
              placeholder={image.blurhash}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
            {index === 3 && images.length > 4 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{images.length - 4}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    );

    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
        {images.length === 1 && renderSingleImage()}
        {images.length === 2 && renderTwoImages()}
        {images.length === 3 && renderThreeImages()}
        {images.length >= 4 && renderFourPlusImages()}
      </Animated.View>
    );
  }
);

const imageHeight = (SCREEN_WIDTH - 32) * 0.75;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  singleImage: {
    width: "100%",
    height: imageHeight,
    borderRadius: 12,
  },
  twoContainer: {
    flexDirection: "row",
    gap: IMAGE_GAP,
    height: imageHeight * 0.8,
  },
  halfImage: {
    flex: 1,
  },
  threeContainer: {
    flexDirection: "row",
    gap: IMAGE_GAP,
    height: imageHeight,
  },
  largeImage: {
    flex: 2,
  },
  smallImagesColumn: {
    flex: 1,
    gap: IMAGE_GAP,
  },
  smallImage: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IMAGE_GAP,
    height: imageHeight,
  },
  gridImage: {
    width: (SCREEN_WIDTH - 32 - IMAGE_GAP) / 2,
    height: (imageHeight - IMAGE_GAP) / 2,
  },
  image: {
    flex: 1,
    borderRadius: 8,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  moreText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
});
```

---

## 📋 Skeleton Loading

```typescript
// src/features/feed/components/SkeletonFeed.tsx

import React, { memo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Skeleton, SkeletonPost } from "@shared/components";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const SkeletonFeed: React.FC = memo(() => (
  <View style={styles.container}>
    {/* Header skeleton */}
    <View style={styles.header}>
      <Skeleton width={120} height={28} />
      <Skeleton variant="circular" width={36} height={36} />
    </View>

    {/* Post skeletons */}
    {[1, 2, 3].map((index) => (
      <SkeletonPost key={index} />
    ))}
  </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
```

---

## 📋 Sonraki Adım

Feed deneyimi tanımlandıktan sonra [09-MESSAGING-EXPERIENCE.md](./09-MESSAGING-EXPERIENCE.md) dokümanında mesajlaşma deneyimi modernizasyonu detaylandırılacaktır.
