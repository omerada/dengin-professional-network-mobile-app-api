# 📭 Empty States Tasarımı

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Engaging Empty State Deneyimleri

---

## 📑 İçindekiler

1. [Empty State Felsefesi](#empty-state-felsefesi)
2. [Empty State Components](#empty-state-components)
3. [Context-Specific Empty States](#context-specific-empty-states)
4. [Call-to-Action Patterns](#call-to-action-patterns)
5. [Animated Empty States](#animated-empty-states)
6. [Search Empty States](#search-empty-states)

---

## 🎯 Empty State Felsefesi

### Temel İlkeler

```
1. Açıklayıcı: Neden boş olduğunu açıkla
2. Yönlendirici: Bir sonraki adımı göster
3. Motive Edici: Kullanıcıyı aksiyon almaya teşvik et
4. Görsel: Illustration ile daha çekici yap
```

### Empty State Template

```
[Illustration] + [Başlık] + [Açıklama] + [Call-to-Action]

Örnek:
🎨 + "Henüz paylaşım yok" + "İlk paylaşımını yaparak başla!" + [Paylaş Butonu]
```

---

## 🧩 Empty State Components

### Base Empty State

```typescript
// 📁 src/shared/components/empty/EmptyState.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { ModernButton } from "@/shared/components/buttons/ModernButton";
import { useTheme } from "@/theme";

export type EmptyStateType =
  | "feed"
  | "messages"
  | "notifications"
  | "search"
  | "followers"
  | "following"
  | "posts"
  | "saved"
  | "generic";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: any;
  showAnimation?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

const EMPTY_CONFIG: Record<
  EmptyStateType,
  {
    animation: any;
    defaultTitle: string;
    defaultDescription: string;
    defaultAction?: string;
  }
> = {
  feed: {
    animation: require("@/assets/animations/empty-feed.json"),
    defaultTitle: "Feed'iniz Boş",
    defaultDescription: "İlgili kişileri takip ederek güncellemelerini görün.",
    defaultAction: "Keşfet",
  },
  messages: {
    animation: require("@/assets/animations/empty-messages.json"),
    defaultTitle: "Henüz Mesaj Yok",
    defaultDescription: "Meslektaşlarınızla iletişime geçin.",
    defaultAction: "Sohbet Başlat",
  },
  notifications: {
    animation: require("@/assets/animations/empty-notifications.json"),
    defaultTitle: "Bildirim Yok",
    defaultDescription: "Yeni bildirimler burada görünecek.",
  },
  search: {
    animation: require("@/assets/animations/empty-search.json"),
    defaultTitle: "Sonuç Bulunamadı",
    defaultDescription: "Farklı anahtar kelimeler deneyebilirsiniz.",
  },
  followers: {
    animation: require("@/assets/animations/empty-followers.json"),
    defaultTitle: "Henüz Takipçi Yok",
    defaultDescription: "Profilinizi paylaşarak takipçi kazanın.",
    defaultAction: "Profili Paylaş",
  },
  following: {
    animation: require("@/assets/animations/empty-following.json"),
    defaultTitle: "Kimseyi Takip Etmiyorsunuz",
    defaultDescription: "Meslektaşlarınızı bulun ve takip edin.",
    defaultAction: "Kişi Bul",
  },
  posts: {
    animation: require("@/assets/animations/empty-posts.json"),
    defaultTitle: "Henüz Paylaşım Yok",
    defaultDescription: "İlk paylaşımınızı yapın!",
    defaultAction: "Paylaş",
  },
  saved: {
    animation: require("@/assets/animations/empty-saved.json"),
    defaultTitle: "Kaydedilen İçerik Yok",
    defaultDescription: "Beğendiğiniz içerikleri kaydedin.",
  },
  generic: {
    animation: require("@/assets/animations/empty-generic.json"),
    defaultTitle: "Burada Hiçbir Şey Yok",
    defaultDescription: "Henüz gösterilecek içerik bulunmuyor.",
  },
};

export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({
    type = "generic",
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    illustration,
    showAnimation = true,
    compact = false,
    style,
  }) => {
    const { colors } = useTheme();
    const config = EMPTY_CONFIG[type];

    const displayTitle = title || config.defaultTitle;
    const displayDescription = description || config.defaultDescription;
    const displayAction = actionLabel || config.defaultAction;

    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.container, compact && styles.compact, style]}
      >
        {showAnimation && (
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <LottieView
              source={illustration || config.animation}
              autoPlay
              loop
              style={compact ? styles.animationCompact : styles.animation}
            />
          </Animated.View>
        )}

        <Animated.Text
          entering={FadeInUp.delay(200).duration(400)}
          style={[
            styles.title,
            compact && styles.titleCompact,
            { color: colors.text.primary },
          ]}
        >
          {displayTitle}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={[
            styles.description,
            compact && styles.descriptionCompact,
            { color: colors.text.secondary },
          ]}
        >
          {displayDescription}
        </Animated.Text>

        {displayAction && onAction && (
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <ModernButton
              title={displayAction}
              onPress={onAction}
              variant="primary"
              style={styles.button}
            />
          </Animated.View>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <Animated.View entering={FadeInUp.delay(500).duration(400)}>
            <ModernButton
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="ghost"
              style={styles.secondaryButton}
            />
          </Animated.View>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  compact: {
    padding: 24,
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  animationCompact: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  titleCompact: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 280,
  },
  descriptionCompact: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    minWidth: 160,
  },
  secondaryButton: {
    marginTop: 12,
  },
});
```

### Inline Empty State

```typescript
// 📁 src/shared/components/empty/InlineEmptyState.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/theme";
import PlusIcon from "@/assets/icons/plus.svg";

interface InlineEmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const InlineEmptyState: React.FC<InlineEmptyStateProps> = memo(
  ({ icon, message, actionLabel, onAction }) => {
    const { colors } = useTheme();

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.container,
          { backgroundColor: colors.background.secondary },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}

        <Text style={[styles.message, { color: colors.text.secondary }]}>
          {message}
        </Text>

        {actionLabel && onAction && (
          <Pressable
            onPress={onAction}
            style={[styles.action, { backgroundColor: colors.primary[500] }]}
          >
            <PlusIcon width={16} height={16} fill="#FFFFFF" />
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  icon: {
    opacity: 0.5,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
```

---

## 📍 Context-Specific Empty States

### Feed Empty State

```typescript
// 📁 src/features/feed/components/FeedEmptyState.tsx
import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { EmptyState } from "@/shared/components/empty/EmptyState";
import { useNavigation } from "@react-navigation/native";

export const FeedEmptyState: React.FC = memo(() => {
  const navigation = useNavigation();

  return (
    <EmptyState
      type="feed"
      title="Feed'iniz Boş"
      description="Meslektaşlarınızı takip ederek paylaşımlarını görün ve profesyonel ağınızı genişletin."
      actionLabel="Kişileri Keşfet"
      onAction={() => navigation.navigate("Discover")}
      secondaryActionLabel="İlk Paylaşımı Yap"
      onSecondaryAction={() => navigation.navigate("CreatePost")}
    />
  );
});
```

### Messages Empty State

```typescript
// 📁 src/features/messaging/components/MessagesEmptyState.tsx
import React, { memo } from "react";
import { EmptyState } from "@/shared/components/empty/EmptyState";
import { useNavigation } from "@react-navigation/native";

export const MessagesEmptyState: React.FC = memo(() => {
  const navigation = useNavigation();

  return (
    <EmptyState
      type="messages"
      title="Mesaj Kutunuz Boş"
      description="Meslektaşlarınızla iletişime geçerek işbirliği yapın."
      actionLabel="Yeni Sohbet"
      onAction={() => navigation.navigate("NewChat")}
    />
  );
});
```

### Notifications Empty State

```typescript
// 📁 src/features/notifications/components/NotificationsEmptyState.tsx
import React, { memo } from "react";
import { EmptyState } from "@/shared/components/empty/EmptyState";

export const NotificationsEmptyState: React.FC = memo(() => {
  return (
    <EmptyState
      type="notifications"
      title="Tüm Bildirimler Okundu"
      description="Yeni bir şey olduğunda burada göreceksiniz."
    />
  );
});
```

### Profile Posts Empty State

```typescript
// 📁 src/features/profile/components/ProfilePostsEmptyState.tsx
import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { EmptyState } from "@/shared/components/empty/EmptyState";
import { useNavigation } from "@react-navigation/native";

interface ProfilePostsEmptyStateProps {
  isOwnProfile: boolean;
}

export const ProfilePostsEmptyState: React.FC<ProfilePostsEmptyStateProps> =
  memo(({ isOwnProfile }) => {
    const navigation = useNavigation();

    if (isOwnProfile) {
      return (
        <EmptyState
          type="posts"
          title="Henüz Paylaşım Yapmadınız"
          description="İlk paylaşımınızı yaparak profilinizi zenginleştirin."
          actionLabel="İlk Paylaşımı Yap"
          onAction={() => navigation.navigate("CreatePost")}
          compact
        />
      );
    }

    return (
      <EmptyState
        type="posts"
        title="Henüz Paylaşım Yok"
        description="Bu kullanıcı henüz paylaşım yapmamış."
        compact
      />
    );
  });

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
});
```

### Saved Items Empty State

```typescript
// 📁 src/features/profile/components/SavedEmptyState.tsx
import React, { memo } from "react";
import { EmptyState } from "@/shared/components/empty/EmptyState";
import { useNavigation } from "@react-navigation/native";

export const SavedEmptyState: React.FC = memo(() => {
  const navigation = useNavigation();

  return (
    <EmptyState
      type="saved"
      title="Kaydedilen İçerik Yok"
      description="İlginizi çeken paylaşımları kaydetmek için yer işareti simgesine dokunun."
      actionLabel="Feed'e Git"
      onAction={() => navigation.navigate("Feed")}
      compact
    />
  );
});
```

### Followers/Following Empty State

```typescript
// 📁 src/features/profile/components/ConnectionsEmptyState.tsx
import React, { memo } from "react";
import { EmptyState } from "@/shared/components/empty/EmptyState";
import { useNavigation } from "@react-navigation/native";

interface ConnectionsEmptyStateProps {
  type: "followers" | "following";
  isOwnProfile: boolean;
  username?: string;
}

export const ConnectionsEmptyState: React.FC<ConnectionsEmptyStateProps> = memo(
  ({ type, isOwnProfile, username }) => {
    const navigation = useNavigation();

    if (type === "followers") {
      return (
        <EmptyState
          type="followers"
          title={
            isOwnProfile
              ? "Henüz Takipçiniz Yok"
              : `${username} henüz takipçi kazanmamış`
          }
          description={
            isOwnProfile
              ? "Aktif olarak paylaşım yaparak ve diğerleriyle etkileşime geçerek takipçi kazanın."
              : "Bu kullanıcının henüz takipçisi bulunmuyor."
          }
          actionLabel={isOwnProfile ? "Keşfet" : undefined}
          onAction={
            isOwnProfile ? () => navigation.navigate("Discover") : undefined
          }
          compact
        />
      );
    }

    return (
      <EmptyState
        type="following"
        title={
          isOwnProfile
            ? "Kimseyi Takip Etmiyorsunuz"
            : `${username} kimseyi takip etmiyor`
        }
        description={
          isOwnProfile
            ? "Meslektaşlarınızı bulun ve takip edin."
            : "Bu kullanıcı henüz kimseyi takip etmiyor."
        }
        actionLabel={isOwnProfile ? "Kişi Bul" : undefined}
        onAction={
          isOwnProfile ? () => navigation.navigate("Discover") : undefined
        }
        compact
      />
    );
  }
);
```

---

## 🔍 Search Empty States

### No Results Empty State

```typescript
// 📁 src/features/search/components/SearchNoResults.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { useTheme } from "@/theme";

interface SearchNoResultsProps {
  query: string;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
}

export const SearchNoResults: React.FC<SearchNoResultsProps> = memo(
  ({ query, suggestions = [], onSuggestionPress }) => {
    const { colors } = useTheme();

    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <LottieView
          source={require("@/assets/animations/empty-search.json")}
          autoPlay
          loop
          style={styles.animation}
        />

        <Text style={[styles.title, { color: colors.text.primary }]}>
          "{query}" için sonuç bulunamadı
        </Text>

        <Text style={[styles.description, { color: colors.text.secondary }]}>
          Yazımı kontrol edin veya farklı anahtar kelimeler deneyin.
        </Text>

        {suggestions.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(200).duration(300)}
            style={styles.suggestions}
          >
            <Text
              style={[
                styles.suggestionsTitle,
                { color: colors.text.secondary },
              ]}
            >
              Bunları denemek ister misiniz?
            </Text>

            <View style={styles.suggestionsList}>
              {suggestions.map((suggestion) => (
                <Animated.View key={suggestion} entering={FadeInUp.delay(300)}>
                  <Text
                    onPress={() => onSuggestionPress?.(suggestion)}
                    style={[styles.suggestion, { color: colors.primary[500] }]}
                  >
                    {suggestion}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  suggestions: {
    marginTop: 32,
    alignItems: "center",
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  suggestion: {
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
```

### Initial Search State

```typescript
// 📁 src/features/search/components/SearchInitialState.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme } from "@/theme";
import SearchIcon from "@/assets/icons/search.svg";
import TrendingIcon from "@/assets/icons/trending.svg";

interface SearchInitialStateProps {
  recentSearches: string[];
  trendingTopics: string[];
  onSearchPress: (query: string) => void;
  onClearRecent: () => void;
}

export const SearchInitialState: React.FC<SearchInitialStateProps> = memo(
  ({ recentSearches, trendingTopics, onSearchPress, onClearRecent }) => {
    const { colors } = useTheme();

    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.text.primary }]}
              >
                Son Aramalar
              </Text>
              <Pressable onPress={onClearRecent}>
                <Text
                  style={[styles.clearButton, { color: colors.primary[500] }]}
                >
                  Temizle
                </Text>
              </Pressable>
            </View>

            <View style={styles.items}>
              {recentSearches.map((search) => (
                <Pressable
                  key={search}
                  onPress={() => onSearchPress(search)}
                  style={[
                    styles.item,
                    { backgroundColor: colors.background.secondary },
                  ]}
                >
                  <SearchIcon
                    width={16}
                    height={16}
                    fill={colors.text.tertiary}
                  />
                  <Text
                    style={[styles.itemText, { color: colors.text.primary }]}
                  >
                    {search}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Trending Topics */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingIcon width={18} height={18} fill={colors.primary[500]} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Trend Konular
            </Text>
          </View>

          <View style={styles.items}>
            {trendingTopics.map((topic, index) => (
              <Animated.View
                key={topic}
                entering={FadeInUp.delay(300 + index * 50)}
              >
                <Pressable
                  onPress={() => onSearchPress(topic)}
                  style={[
                    styles.trendingItem,
                    { backgroundColor: colors.primary[50] },
                  ]}
                >
                  <Text
                    style={[
                      styles.trendingText,
                      { color: colors.primary[600] },
                    ]}
                  >
                    #{topic}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: "500",
  },
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  itemText: {
    fontSize: 14,
  },
  trendingItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  trendingText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
```

---

## ✨ Animated Empty States

### Animated Illustration Component

```typescript
// 📁 src/shared/components/empty/AnimatedIllustration.tsx
import React, { memo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, Path, G } from "react-native-svg";
import { useTheme } from "@/theme";

interface AnimatedIllustrationProps {
  type: "empty-box" | "no-data" | "search";
  size?: number;
}

export const AnimatedIllustration: React.FC<AnimatedIllustrationProps> = memo(
  ({ type, size = 200 }) => {
    const { colors, isDark } = useTheme();
    const floatY = useSharedValue(0);
    const rotation = useSharedValue(0);

    useEffect(() => {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-10, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      rotation.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: floatY.value },
        { rotate: `${rotation.value}deg` },
      ],
    }));

    const baseColor = isDark ? colors.neutral[600] : colors.neutral[200];
    const accentColor = colors.primary[500];

    return (
      <Animated.View
        style={[styles.container, { width: size, height: size }, animatedStyle]}
      >
        <Svg width={size} height={size} viewBox="0 0 200 200">
          {type === "empty-box" && (
            <G>
              <Path
                d="M100 30 L160 70 L160 140 L100 180 L40 140 L40 70 Z"
                fill={baseColor}
                stroke={accentColor}
                strokeWidth="2"
              />
              <Path
                d="M100 30 L100 100 L160 70"
                fill="none"
                stroke={accentColor}
                strokeWidth="2"
              />
              <Path
                d="M100 100 L100 180"
                fill="none"
                stroke={accentColor}
                strokeWidth="2"
              />
              <Path
                d="M40 70 L100 100"
                fill="none"
                stroke={accentColor}
                strokeWidth="2"
              />
              <Circle cx="100" cy="100" r="8" fill={accentColor} />
            </G>
          )}
          {/* Add more illustration types as needed */}
        </Svg>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
```

### Breathing Animation Empty State

```typescript
// 📁 src/shared/components/empty/BreathingEmptyState.tsx
import React, { memo, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

interface BreathingEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const BreathingEmptyState: React.FC<BreathingEmptyStateProps> = memo(
  ({ icon, title, description }) => {
    const { colors } = useTheme();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    useEffect(() => {
      scale.value = withRepeat(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          {icon}
        </Animated.View>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          {title}
        </Text>

        <Text style={[styles.description, { color: colors.text.secondary }]}>
          {description}
        </Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
```

---

## 🎯 Empty State Hook

```typescript
// 📁 src/shared/hooks/useEmptyState.ts
import { useMemo } from "react";

interface EmptyStateContent {
  title: string;
  description: string;
  actionLabel?: string;
  illustration?: any;
}

interface UseEmptyStateOptions {
  isLoading: boolean;
  hasData: boolean;
  hasError: boolean;
  isEmpty: boolean;
}

export function useEmptyState(
  type: string,
  options: UseEmptyStateOptions
): EmptyStateContent | null {
  const { isLoading, hasData, hasError, isEmpty } = options;

  return useMemo(() => {
    if (isLoading || hasData || hasError) {
      return null;
    }

    if (!isEmpty) {
      return null;
    }

    // Return appropriate empty state based on type
    switch (type) {
      case "feed":
        return {
          title: "Feed'iniz Boş",
          description: "Meslektaşlarınızı takip edin.",
          actionLabel: "Keşfet",
        };
      case "messages":
        return {
          title: "Henüz Mesaj Yok",
          description: "Sohbet başlatın.",
          actionLabel: "Yeni Sohbet",
        };
      default:
        return {
          title: "İçerik Yok",
          description: "Henüz gösterilecek içerik bulunmuyor.",
        };
    }
  }, [type, isLoading, hasData, hasError, isEmpty]);
}
```

---

Bu empty states sistemi uygulandığında:

- ✅ Context-aware empty states
- ✅ Animated illustrations
- ✅ Clear call-to-actions
- ✅ Search-specific states
- ✅ Kullanıcıyı yönlendiren UX
- ✅ Marka tutarlılığı
