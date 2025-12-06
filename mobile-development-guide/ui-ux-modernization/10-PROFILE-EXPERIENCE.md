# 👤 Profil Deneyimi

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Instagram/LinkedIn kalitesinde profil UI/UX

---

## 📑 İçindekiler

1. [Mevcut Durum Analizi](#mevcut-durum-analizi)
2. [Hedef Deneyim](#hedef-deneyim)
3. [Profile Header](#profile-header)
4. [Stats Animation](#stats-animation)
5. [Content Tabs](#content-tabs)
6. [Post Grid](#post-grid)
7. [Edit Profile](#edit-profile)
8. [Settings Integration](#settings-integration)

---

## 📊 Mevcut Durum Analizi

### ProfileScreen.tsx Özellikleri

```
✓ Temel profil bilgileri
✓ Avatar görüntüleme
✓ Post sayısı gösterimi
✗ Parallax header yok
✗ Stats animasyonu yok
✗ Tab bar animasyonu yok
✗ Grid/List toggle yok
✗ Pull-to-refresh animasyonu zayıf
✗ Edit mode transitions yok
```

---

## 🎯 Hedef Deneyim

### Instagram/LinkedIn Özellikleri

```
1. Parallax header with blur
2. Animated stats counters
3. Sticky tab bar
4. Grid/List view toggle
5. Post grid with masonry option
6. Pull-to-refresh with custom indicator
7. Smooth edit mode transitions
8. Verification badge animations
9. Action buttons with spring animation
10. Collapsible bio section
```

---

## 🖼️ Profile Header

### ParallaxProfileHeader Component

```typescript
// src/features/profile/components/ParallaxProfileHeader/ParallaxProfileHeader.tsx

import React, { memo, useCallback } from "react";
import { StyleSheet, View, Text, Dimensions, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  interpolateColor,
  Extrapolate,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import {
  ModernAvatar,
  ModernButton,
  VerificationBadge,
  PressableScale,
} from "@shared/components";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  profession: string;
  isVerified: boolean;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
}

interface ParallaxProfileHeaderProps {
  user: User;
  scrollY: Animated.SharedValue<number>;
  onFollowPress: () => void;
  onEditPress: () => void;
  onSettingsPress: () => void;
}

export const ParallaxProfileHeader = memo<ParallaxProfileHeaderProps>(
  ({ user, scrollY, onFollowPress, onEditPress, onSettingsPress }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    // Cover image style with parallax
    const coverStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollY.value,
        [0, HEADER_SCROLL_DISTANCE],
        [0, -HEADER_SCROLL_DISTANCE * 0.5],
        Extrapolate.CLAMP
      );

      const scale = interpolate(
        scrollY.value,
        [-100, 0],
        [1.5, 1],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ translateY }, { scale }],
      };
    });

    // Header container style
    const headerStyle = useAnimatedStyle(() => {
      const height = interpolate(
        scrollY.value,
        [0, HEADER_SCROLL_DISTANCE],
        [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        Extrapolate.CLAMP
      );

      return { height };
    });

    // Blur intensity based on scroll
    const blurStyle = useAnimatedStyle(() => {
      const intensity = interpolate(
        scrollY.value,
        [0, HEADER_SCROLL_DISTANCE],
        [0, 90],
        Extrapolate.CLAMP
      );

      return { opacity: intensity / 90 };
    });

    // Avatar style
    const avatarStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollY.value,
        [0, HEADER_SCROLL_DISTANCE],
        [0, -50],
        Extrapolate.CLAMP
      );

      const scale = interpolate(
        scrollY.value,
        [0, HEADER_SCROLL_DISTANCE],
        [1, 0.6],
        Extrapolate.CLAMP
      );

      const translateX = interpolate(
        scrollY.value,
        [0, HEADER_SCROLL_DISTANCE],
        [0, -80],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ translateY }, { scale }, { translateX }],
      };
    });

    // Name style for sticky header
    const nameStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollY.value,
        [HEADER_SCROLL_DISTANCE - 50, HEADER_SCROLL_DISTANCE],
        [0, 1],
        Extrapolate.CLAMP
      );

      return { opacity };
    });

    // Profile info opacity
    const infoStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollY.value,
        [0, HEADER_SCROLL_DISTANCE * 0.5],
        [1, 0],
        Extrapolate.CLAMP
      );

      return { opacity };
    });

    return (
      <Animated.View style={[styles.header, headerStyle]}>
        {/* Cover Image */}
        <Animated.View style={[styles.coverContainer, coverStyle]}>
          {user.coverImage ? (
            <Image
              source={{ uri: user.coverImage }}
              style={styles.coverImage}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={[colors.primary.main, colors.primary.dark]}
              style={styles.coverImage}
            />
          )}

          {/* Gradient overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)"]}
            style={styles.coverOverlay}
          />
        </Animated.View>

        {/* Blur overlay for sticky */}
        <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
          <BlurView
            intensity={90}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Top bar with settings */}
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <Animated.Text
            style={[
              styles.stickyName,
              { color: colors.text.primary },
              nameStyle,
            ]}
          >
            {user.name}
          </Animated.Text>

          <PressableScale onPress={onSettingsPress}>
            <SettingsIcon size={24} color={colors.text.primary} />
          </PressableScale>
        </View>

        {/* Avatar */}
        <Animated.View style={[styles.avatarContainer, avatarStyle]}>
          <ModernAvatar
            source={{ uri: user.avatar }}
            name={user.name}
            size={100}
            borderWidth={4}
            borderColor={colors.surface.primary}
          />
          {user.isVerified && (
            <VerificationBadge size={28} style={styles.verificationBadge} />
          )}
        </Animated.View>

        {/* Profile info */}
        <Animated.View style={[styles.profileInfo, infoStyle]}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text.primary }]}>
              {user.name}
            </Text>
            {user.isVerified && <VerificationBadge size={20} />}
          </View>

          <Text style={[styles.username, { color: colors.text.secondary }]}>
            @{user.username}
          </Text>

          <Text style={[styles.profession, { color: colors.primary.main }]}>
            {user.profession}
          </Text>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            {user.isOwnProfile ? (
              <ModernButton
                title="Profili Düzenle"
                variant="outlined"
                size="medium"
                onPress={onEditPress}
                style={styles.actionButton}
              />
            ) : (
              <>
                <ModernButton
                  title={user.isFollowing ? "Takip Ediliyor" : "Takip Et"}
                  variant={user.isFollowing ? "outlined" : "primary"}
                  size="medium"
                  onPress={onFollowPress}
                  style={styles.actionButton}
                />
                <ModernButton
                  title="Mesaj"
                  variant="outlined"
                  size="medium"
                  leftIcon="chatbubble-outline"
                  onPress={() => {}}
                  style={styles.actionButton}
                />
              </>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    );
  }
);

ParallaxProfileHeader.displayName = "ParallaxProfileHeader";

const styles = StyleSheet.create({
  header: {
    overflow: "hidden",
  },
  coverContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT * 0.6,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 44,
  },
  stickyName: {
    position: "absolute",
    left: 80,
    fontSize: 18,
    fontWeight: "600",
  },
  avatarContainer: {
    position: "absolute",
    top: HEADER_MAX_HEIGHT * 0.35,
    alignSelf: "center",
  },
  verificationBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  profileInfo: {
    marginTop: HEADER_MAX_HEIGHT * 0.55,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginRight: 8,
  },
  username: {
    fontSize: 15,
    marginTop: 2,
  },
  profession: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  actionButton: {
    marginHorizontal: 6,
    minWidth: 120,
  },
});
```

---

## 📊 Stats Animation

### AnimatedStats Component

```typescript
// src/features/profile/components/AnimatedStats/AnimatedStats.tsx

import React, { memo, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  scheduleOnRN,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@theme";
import { PressableScale } from "@shared/components";
import { formatNumber } from "@utils/number";

interface Stats {
  posts: number;
  followers: number;
  following: number;
}

interface AnimatedStatsProps {
  stats: Stats;
  onPostsPress: () => void;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
}

export const AnimatedStats = memo<AnimatedStatsProps>(
  ({ stats, onPostsPress, onFollowersPress, onFollowingPress }) => {
    const { colors } = useTheme();

    return (
      <View style={[styles.container, { borderColor: colors.border.light }]}>
        <AnimatedStatItem
          value={stats.posts}
          label="Gönderi"
          delay={0}
          onPress={onPostsPress}
        />
        <View
          style={[styles.divider, { backgroundColor: colors.border.light }]}
        />
        <AnimatedStatItem
          value={stats.followers}
          label="Takipçi"
          delay={100}
          onPress={onFollowersPress}
        />
        <View
          style={[styles.divider, { backgroundColor: colors.border.light }]}
        />
        <AnimatedStatItem
          value={stats.following}
          label="Takip"
          delay={200}
          onPress={onFollowingPress}
        />
      </View>
    );
  }
);

// Individual stat item with counting animation
interface AnimatedStatItemProps {
  value: number;
  label: string;
  delay: number;
  onPress: () => void;
}

const AnimatedStatItem = memo<AnimatedStatItemProps>(
  ({ value, label, delay, onPress }) => {
    const { colors } = useTheme();

    const displayValue = useSharedValue(0);
    const scale = useSharedValue(0);
    const [currentValue, setCurrentValue] = React.useState(0);

    useEffect(() => {
      // Entry animation
      scale.value = withDelay(delay, withSpring(1, { damping: 15 }));

      // Counting animation
      displayValue.value = withDelay(
        delay,
        withTiming(
          value,
          {
            duration: 1500,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            scheduleOnRN(setCurrentValue)(value);
          }
        )
      );
    }, [value, delay]);

    // Update display during animation
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentValue(Math.floor(displayValue.value));
      }, 50);

      return () => clearInterval(interval);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: scale.value,
    }));

    return (
      <PressableScale onPress={onPress} style={styles.statItem}>
        <Animated.View style={animatedStyle}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>
            {formatNumber(currentValue)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
            {label}
          </Text>
        </Animated.View>
      </PressableScale>
    );
  }
);

AnimatedStats.displayName = "AnimatedStats";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 32,
  },
});
```

---

## 📑 Content Tabs

### ProfileTabBar Component

```typescript
// src/features/profile/components/ProfileTabBar/ProfileTabBar.tsx

import React, { memo, useCallback } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TabType = "grid" | "list" | "tagged";

interface Tab {
  key: TabType;
  icon: (color: string) => React.ReactNode;
}

interface ProfileTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isSticky?: boolean;
}

const tabs: Tab[] = [
  { key: "grid", icon: (color) => <GridIcon size={24} color={color} /> },
  { key: "list", icon: (color) => <ListIcon size={24} color={color} /> },
  { key: "tagged", icon: (color) => <TagIcon size={24} color={color} /> },
];

export const ProfileTabBar = memo<ProfileTabBarProps>(
  ({ activeTab, onTabChange, isSticky = false }) => {
    const { colors } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();

    const activeIndex = tabs.findIndex((t) => t.key === activeTab);
    const indicatorPosition = useSharedValue(activeIndex * (SCREEN_WIDTH / 3));

    // Update indicator on tab change
    React.useEffect(() => {
      indicatorPosition.value = withSpring(activeIndex * (SCREEN_WIDTH / 3), {
        damping: 20,
        stiffness: 300,
      });
    }, [activeIndex]);

    const handleTabPress = useCallback(
      (tab: TabType) => {
        triggerHaptic("selection");
        onTabChange(tab);
      },
      [onTabChange, triggerHaptic]
    );

    // Indicator animated style
    const indicatorStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: indicatorPosition.value }],
    }));

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.surface.primary },
          isSticky && styles.sticky,
          isSticky && { borderBottomColor: colors.border.light },
        ]}
      >
        {/* Tabs */}
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.key}
            tab={tab}
            isActive={tab.key === activeTab}
            onPress={() => handleTabPress(tab.key)}
            colors={colors}
          />
        ))}

        {/* Animated indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: colors.primary.main },
            indicatorStyle,
          ]}
        />
      </View>
    );
  }
);

// Tab item component
interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}

const TabItem = memo<TabItemProps>(({ tab, isActive, onPress, colors }) => {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.9);
    })
    .onFinalize((_, success) => {
      scale.value = withSpring(1);
      if (success) {
        scheduleOnRN(onPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.tabItem, animatedStyle]}>
        {tab.icon(isActive ? colors.primary.main : colors.text.tertiary)}
      </Animated.View>
    </GestureDetector>
  );
});

ProfileTabBar.displayName = "ProfileTabBar";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 48,
  },
  sticky: {
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: SCREEN_WIDTH / 3,
  },
});
```

---

## 📷 Post Grid

### ProfilePostGrid Component

```typescript
// src/features/profile/components/ProfilePostGrid/ProfilePostGrid.tsx

import React, { memo, useCallback, useMemo } from "react";
import { StyleSheet, View, Text, Dimensions, Pressable } from "react-native";
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useTheme } from "@theme";
import { useHaptic } from "@hooks/useHaptic";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 2;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

interface Post {
  id: string;
  imageUrl: string;
  type: "image" | "video" | "carousel";
  likesCount: number;
  commentsCount: number;
}

interface ProfilePostGridProps {
  posts: Post[];
  onPostPress: (postId: string) => void;
  ListHeaderComponent?: React.ReactElement;
}

export const ProfilePostGrid = memo<ProfilePostGridProps>(
  ({ posts, onPostPress, ListHeaderComponent }) => {
    const { colors } = useTheme();
    const { trigger: triggerHaptic } = useHaptic();

    // Convert to grid rows (3 items per row)
    const gridData = useMemo(() => {
      const rows = [];
      for (let i = 0; i < posts.length; i += 3) {
        rows.push(posts.slice(i, i + 3));
      }
      return rows;
    }, [posts]);

    const renderRow = useCallback(
      ({ item: row, index }: { item: Post[]; index: number }) => (
        <Animated.View
          entering={FadeIn.delay(index * 50).duration(300)}
          layout={Layout.springify()}
          style={styles.row}
        >
          {row.map((post, postIndex) => (
            <GridItem
              key={post.id}
              post={post}
              index={index * 3 + postIndex}
              onPress={() => {
                triggerHaptic("selection");
                onPostPress(post.id);
              }}
            />
          ))}
          {/* Fill empty cells */}
          {row.length < 3 &&
            Array(3 - row.length)
              .fill(null)
              .map((_, i) => (
                <View key={`empty-${i}`} style={styles.emptyCell} />
              ))}
        </Animated.View>
      ),
      [onPostPress, triggerHaptic]
    );

    return (
      <FlashList
        data={gridData}
        renderItem={renderRow}
        keyExtractor={(_, index) => `row-${index}`}
        estimatedItemSize={ITEM_SIZE}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
      />
    );
  }
);

// Individual grid item
interface GridItemProps {
  post: Post;
  index: number;
  onPress: () => void;
}

const GridItem = memo<GridItemProps>(({ post, index, onPress }) => {
  const { colors } = useTheme();

  const scale = useSharedValue(1);
  const [showOverlay, setShowOverlay] = React.useState(false);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, []);

  const handleLongPress = useCallback(() => {
    setShowOverlay(true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={300}
    >
      <Animated.View style={[styles.gridItem, animatedStyle]}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.gridImage}
          contentFit="cover"
          transition={200}
          placeholder={require("@assets/images/placeholder.png")}
        />

        {/* Type indicator */}
        {post.type !== "image" && (
          <View style={styles.typeIndicator}>
            {post.type === "video" ? (
              <VideoIcon size={16} color="#FFFFFF" />
            ) : (
              <CarouselIcon size={16} color="#FFFFFF" />
            )}
          </View>
        )}

        {/* Hover overlay with stats */}
        {showOverlay && (
          <Animated.View
            entering={FadeIn.duration(150)}
            style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          >
            <View style={styles.overlayStats}>
              <HeartIcon size={20} color="#FFFFFF" />
              <Text style={styles.overlayText}>{post.likesCount}</Text>
            </View>
            <View style={styles.overlayStats}>
              <CommentIcon size={20} color="#FFFFFF" />
              <Text style={styles.overlayText}>{post.commentsCount}</Text>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
});

ProfilePostGrid.displayName = "ProfilePostGrid";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: GRID_GAP / 2,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  emptyCell: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: GRID_GAP / 2,
  },
  typeIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayStats: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  overlayText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
});
```

---

## ✏️ Edit Profile

### EditProfileScreen Component

```typescript
// src/features/profile/screens/EditProfileScreen.tsx

import React, { memo, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import {
  ModernAvatar,
  ModernInput,
  ModernButton,
  PressableScale,
} from "@shared/components";
import { useHaptic } from "@hooks/useHaptic";
import * as ImagePicker from "expo-image-picker";

interface EditProfileScreenProps {
  navigation: any;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { trigger: triggerHaptic } = useHaptic();

  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    website: "",
    profession: "",
  });

  // Handle avatar change
  const handleChangeAvatar = useCallback(async () => {
    triggerHaptic("selection");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      triggerHaptic("impactLight");
    }
  }, [triggerHaptic]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    triggerHaptic("impactMedium");

    try {
      // Save logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      triggerHaptic("notificationSuccess");
      navigation.goBack();
    } catch (error) {
      triggerHaptic("notificationError");
    } finally {
      setIsLoading(false);
    }
  }, [formData, avatar, navigation, triggerHaptic]);

  // Input change handler
  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface.primary }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <Animated.View
        entering={FadeIn}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <PressableScale onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButton, { color: colors.text.secondary }]}>
            İptal
          </Text>
        </PressableScale>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Profili Düzenle
        </Text>
        <PressableScale onPress={handleSave} disabled={isLoading}>
          <Text
            style={[
              styles.headerButton,
              { color: colors.primary.main },
              isLoading && { opacity: 0.5 },
            ]}
          >
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </Text>
        </PressableScale>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar section */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.avatarSection}
        >
          <PressableScale onPress={handleChangeAvatar}>
            <ModernAvatar
              source={avatar ? { uri: avatar } : undefined}
              name={formData.name || "User"}
              size={100}
            />
            <View
              style={[
                styles.changeAvatarBadge,
                { backgroundColor: colors.primary.main },
              ]}
            >
              <CameraIcon size={16} color="#FFFFFF" />
            </View>
          </PressableScale>
          <Text
            style={[styles.changeAvatarText, { color: colors.primary.main }]}
          >
            Fotoğrafı Değiştir
          </Text>
        </Animated.View>

        {/* Form fields */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          layout={Layout.springify()}
          style={styles.formSection}
        >
          <ModernInput
            label="Ad Soyad"
            value={formData.name}
            onChangeText={(v) => handleInputChange("name", v)}
            placeholder="Adınız Soyadınız"
            maxLength={50}
          />

          <ModernInput
            label="Kullanıcı Adı"
            value={formData.username}
            onChangeText={(v) => handleInputChange("username", v)}
            placeholder="kullanici_adi"
            autoCapitalize="none"
            maxLength={30}
            style={styles.inputSpacing}
          />

          <ModernInput
            label="Meslek"
            value={formData.profession}
            onChangeText={(v) => handleInputChange("profession", v)}
            placeholder="Mesleğiniz"
            maxLength={50}
            style={styles.inputSpacing}
          />

          <ModernInput
            label="Biyografi"
            value={formData.bio}
            onChangeText={(v) => handleInputChange("bio", v)}
            placeholder="Kendinizden bahsedin..."
            multiline
            numberOfLines={4}
            maxLength={150}
            style={styles.inputSpacing}
          />

          <ModernInput
            label="Web Sitesi"
            value={formData.website}
            onChangeText={(v) => handleInputChange("website", v)}
            placeholder="https://example.com"
            keyboardType="url"
            autoCapitalize="none"
            style={styles.inputSpacing}
          />
        </Animated.View>

        {/* Character count for bio */}
        <Animated.Text
          entering={FadeInDown.delay(300)}
          style={[styles.charCount, { color: colors.text.tertiary }]}
        >
          {formData.bio.length}/150
        </Animated.Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  changeAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 12,
  },
  formSection: {
    marginTop: 8,
  },
  inputSpacing: {
    marginTop: 20,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
});
```

---

## 🔗 Complete ProfileScreen

```typescript
// src/features/profile/screens/ProfileScreen.tsx

import React, { memo, useCallback, useState, useRef } from "react";
import { StyleSheet, View, RefreshControl } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@theme";
import {
  ParallaxProfileHeader,
  AnimatedStats,
  ProfileTabBar,
  ProfilePostGrid,
  CollapsibleBio,
} from "../components";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

interface ProfileScreenProps {
  route: {
    params?: {
      userId?: string;
    };
  };
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  route,
  navigation,
}) => {
  const userId = route.params?.userId;
  const isOwnProfile = !userId;

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const [activeTab, setActiveTab] = useState<"grid" | "list" | "tagged">(
    "grid"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock user data
  const user = {
    id: "1",
    name: "Ahmet Yılmaz",
    username: "ahmetyilmaz",
    avatar: "https://example.com/avatar.jpg",
    bio: "Senior Software Developer | React Native | TypeScript | Coffee Lover ☕",
    profession: "Yazılım Mühendisi",
    isVerified: true,
    isOwnProfile,
    isFollowing: false,
    stats: {
      posts: 127,
      followers: 12500,
      following: 456,
    },
  };

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Refresh logic
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  }, []);

  // Header component
  const ListHeader = useCallback(
    () => (
      <View>
        <ParallaxProfileHeader
          user={user}
          scrollY={scrollY}
          onFollowPress={() => {}}
          onEditPress={() => navigation.navigate("EditProfile")}
          onSettingsPress={() => navigation.navigate("Settings")}
        />

        <CollapsibleBio bio={user.bio} maxLines={2} />

        <AnimatedStats
          stats={user.stats}
          onPostsPress={() => {}}
          onFollowersPress={() =>
            navigation.navigate("Followers", { userId: user.id })
          }
          onFollowingPress={() =>
            navigation.navigate("Following", { userId: user.id })
          }
        />

        <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    ),
    [user, activeTab, scrollY, navigation]
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface.primary }]}
    >
      <ProfilePostGrid
        posts={[]} // Fetch posts
        onPostPress={(postId) => navigation.navigate("PostDetail", { postId })}
        ListHeaderComponent={<ListHeader />}
      />
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

## ✅ Acceptance Criteria

### Profil Deneyimi İçin

```
□ Parallax header 60 FPS
□ Stats counting animation smooth
□ Tab indicator spring animation
□ Post grid loading <16ms per item
□ Pull-to-refresh custom indicator
□ Edit mode transitions smooth
□ Avatar change with preview
□ Bio collapsible with animation
□ Verification badge animated
□ Dark mode fully supported
□ Accessibility complete
□ Safe area insets handled
```

---

Bu dokümantasyon, Instagram/LinkedIn kalitesinde profil deneyimi sağlayacak tüm komponentleri içerir.
