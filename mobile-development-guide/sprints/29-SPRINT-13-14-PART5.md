# Sprint 13-14: Part 5 - Social Features & Moderation

**Continues from:** 29-SPRINT-13-14-PART4.md

---

## 📁 Day 5-6: Social Features (Follow/Unfollow)

### Hedef Dosya Yapısı

```
src/features/social/
├── hooks/
│   ├── index.ts
│   ├── useFollow.ts
│   ├── useFollowers.ts
│   └── useFollowing.ts
├── screens/
│   ├── index.ts
│   ├── FollowersListScreen.tsx
│   └── FollowingListScreen.tsx
├── components/
│   ├── index.ts
│   ├── UserListItem.tsx
│   └── FollowButton.tsx
├── services/
│   ├── index.ts
│   └── socialApi.ts
├── types/
│   ├── index.ts
│   └── social.types.ts
└── index.ts
```

---

### 1. Social Types (`types/social.types.ts`)

```typescript
// src/features/social/types/social.types.ts
// Backend FollowController ile uyumlu tipler

/**
 * Takipçi/Takip edilen kullanıcı
 */
export interface FollowUser {
  id: number;
  name: string;
  surname: string;
  fullName: string;
  avatarUrl: string | null;
  profession: {
    id: number;
    name: string;
  } | null;
  isProfessionVerified: boolean;
  isFollowing: boolean; // Mevcut kullanıcı takip ediyor mu
  isFollowedBy: boolean; // Bu kullanıcı bizi takip ediyor mu
}

/**
 * Takipçi/Takip listesi response
 */
export interface FollowListResponse {
  users: FollowUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Follow/Unfollow response
 */
export interface FollowResponse {
  success: boolean;
  isFollowing: boolean;
  followerCount: number;
}

/**
 * Block response
 */
export interface BlockResponse {
  success: boolean;
  isBlocked: boolean;
}
```

---

### 2. Social API Service (`services/socialApi.ts`)

```typescript
// src/features/social/services/socialApi.ts
// Backend FollowController ile %100 uyumlu

import { apiClient, API_ENDPOINTS } from "@core/api";
import type {
  FollowListResponse,
  FollowResponse,
  BlockResponse,
} from "../types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Social API Service
 *
 * Endpoints:
 * - POST /api/users/{userId}/follow - Takip et
 * - DELETE /api/users/{userId}/follow - Takipten çık
 * - GET /api/users/{userId}/followers - Takipçileri getir
 * - GET /api/users/{userId}/following - Takip edilenleri getir
 * - POST /api/users/{userId}/block - Engelle
 * - DELETE /api/users/{userId}/block - Engeli kaldır
 */
export const socialApi = {
  /**
   * POST /api/users/{userId}/follow
   * Kullanıcıyı takip et
   */
  follow: async (userId: number): Promise<FollowResponse> => {
    const response = await apiClient.post<ApiResponse<FollowResponse>>(
      API_ENDPOINTS.SOCIAL.FOLLOW(userId)
    );
    return response.data.data;
  },

  /**
   * DELETE /api/users/{userId}/follow
   * Takipten çık
   */
  unfollow: async (userId: number): Promise<FollowResponse> => {
    const response = await apiClient.delete<ApiResponse<FollowResponse>>(
      API_ENDPOINTS.SOCIAL.UNFOLLOW(userId)
    );
    return response.data.data;
  },

  /**
   * GET /api/users/{userId}/followers
   * Takipçileri getir
   */
  getFollowers: async (
    userId: number,
    page = 0,
    size = 20
  ): Promise<FollowListResponse> => {
    const response = await apiClient.get<ApiResponse<FollowListResponse>>(
      API_ENDPOINTS.SOCIAL.FOLLOWERS(userId),
      { params: { page, size } }
    );
    return response.data.data;
  },

  /**
   * GET /api/users/{userId}/following
   * Takip edilenleri getir
   */
  getFollowing: async (
    userId: number,
    page = 0,
    size = 20
  ): Promise<FollowListResponse> => {
    const response = await apiClient.get<ApiResponse<FollowListResponse>>(
      API_ENDPOINTS.SOCIAL.FOLLOWING(userId),
      { params: { page, size } }
    );
    return response.data.data;
  },

  /**
   * POST /api/users/{userId}/block
   * Kullanıcıyı engelle
   */
  block: async (userId: number): Promise<BlockResponse> => {
    const response = await apiClient.post<ApiResponse<BlockResponse>>(
      API_ENDPOINTS.SOCIAL.BLOCK(userId)
    );
    return response.data.data;
  },

  /**
   * DELETE /api/users/{userId}/block
   * Engeli kaldır
   */
  unblock: async (userId: number): Promise<BlockResponse> => {
    const response = await apiClient.delete<ApiResponse<BlockResponse>>(
      API_ENDPOINTS.SOCIAL.UNBLOCK(userId)
    );
    return response.data.data;
  },
};

export default socialApi;
```

---

### 3. Social Hooks (`hooks/useFollow.ts`)

```typescript
// src/features/social/hooks/useFollow.ts
// Follow/Unfollow mutations

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi } from "../services";
import { profileKeys } from "@features/profile/hooks";
import type { FollowResponse } from "../types";

/**
 * Hook: Takip et
 */
export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation<FollowResponse, Error, number>({
    mutationFn: socialApi.follow,
    onSuccess: (data, userId) => {
      // İlgili profil cache'ini invalidate et
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });

      // Optimistic update for followers list
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

/**
 * Hook: Takipten çık
 */
export function useUnfollow() {
  const queryClient = useQueryClient();

  return useMutation<FollowResponse, Error, number>({
    mutationFn: socialApi.unfollow,
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

/**
 * Hook: Engelle
 */
export function useBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: socialApi.block,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    },
  });
}

/**
 * Hook: Engeli kaldır
 */
export function useUnblock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: socialApi.unblock,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    },
  });
}
```

---

### 4. Followers/Following Hooks (`hooks/useFollowers.ts`)

```typescript
// src/features/social/hooks/useFollowers.ts

import { useInfiniteQuery } from "@tanstack/react-query";
import { socialApi } from "../services";
import type { FollowListResponse } from "../types";

/**
 * Hook: Takipçi listesi
 */
export function useFollowers(userId: number) {
  return useInfiniteQuery<FollowListResponse, Error>({
    queryKey: ["followers", userId],
    queryFn: ({ pageParam = 0 }) =>
      socialApi.getFollowers(userId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    enabled: !!userId,
  });
}

/**
 * Hook: Takip edilen listesi
 */
export function useFollowing(userId: number) {
  return useInfiniteQuery<FollowListResponse, Error>({
    queryKey: ["following", userId],
    queryFn: ({ pageParam = 0 }) =>
      socialApi.getFollowing(userId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    enabled: !!userId,
  });
}
```

---

### 5. UserListItem Component (`components/UserListItem.tsx`)

```typescript
// src/features/social/components/UserListItem.tsx

import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@contexts/ThemeContext";
import { Avatar, Badge } from "@shared/components";
import { spacing, typography } from "@theme";
import { FollowButton } from "./FollowButton";
import type { FollowUser } from "../types";

interface UserListItemProps {
  user: FollowUser;
  showFollowButton?: boolean;
  onFollowChange?: (userId: number, isFollowing: boolean) => void;
}

export const UserListItem: React.FC<UserListItemProps> = memo(
  ({ user, showFollowButton = true, onFollowChange }) => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const handlePress = useCallback(() => {
      navigation.navigate(
        "Profile" as never,
        { userId: user.id.toString() } as never
      );
    }, [navigation, user.id]);

    return (
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Avatar
          uri={user.avatarUrl}
          name={user.fullName}
          size="lg"
          showBadge={user.isProfessionVerified}
          badgeColor={theme.colors.success.main}
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.name, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {user.fullName}
            </Text>
            {user.isProfessionVerified && (
              <Badge
                variant="success"
                dot
                size="sm"
                style={styles.verifiedBadge}
              />
            )}
          </View>

          {user.profession && (
            <Text
              style={[
                styles.profession,
                { color: theme.colors.text.secondary },
              ]}
              numberOfLines={1}
            >
              {user.profession.name}
            </Text>
          )}

          {user.isFollowedBy && !user.isFollowing && (
            <Text
              style={[styles.followsYou, { color: theme.colors.text.tertiary }]}
            >
              Seni takip ediyor
            </Text>
          )}
        </View>

        {showFollowButton && (
          <FollowButton
            userId={user.id}
            isFollowing={user.isFollowing}
            onFollowChange={onFollowChange}
            size="sm"
          />
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
  },
  verifiedBadge: {
    marginLeft: spacing.xs,
  },
  profession: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  followsYou: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
});

UserListItem.displayName = "UserListItem";
```

---

### 6. FollowButton Component (`components/FollowButton.tsx`)

```typescript
// src/features/social/components/FollowButton.tsx

import React, { memo, useCallback } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";
import { useFollow, useUnfollow } from "../hooks";

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  onFollowChange?: (userId: number, isFollowing: boolean) => void;
  size?: "sm" | "md";
}

export const FollowButton: React.FC<FollowButtonProps> = memo(
  ({ userId, isFollowing, onFollowChange, size = "md" }) => {
    const { theme } = useTheme();
    const follow = useFollow();
    const unfollow = useUnfollow();

    const isLoading = follow.isPending || unfollow.isPending;

    const handlePress = useCallback(async () => {
      try {
        if (isFollowing) {
          await unfollow.mutateAsync(userId);
          onFollowChange?.(userId, false);
        } else {
          await follow.mutateAsync(userId);
          onFollowChange?.(userId, true);
        }
      } catch (error) {
        // Error handling
      }
    }, [userId, isFollowing, follow, unfollow, onFollowChange]);

    const buttonStyle = [
      styles.button,
      size === "sm" ? styles.buttonSm : styles.buttonMd,
      isFollowing
        ? {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.medium,
            borderWidth: 1,
          }
        : { backgroundColor: theme.colors.primary[500] },
    ];

    const textStyle = [
      styles.text,
      size === "sm" ? styles.textSm : styles.textMd,
      { color: isFollowing ? theme.colors.text.primary : "#FFFFFF" },
    ];

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isFollowing ? theme.colors.text.primary : "#FFFFFF"}
          />
        ) : (
          <Text style={textStyle}>
            {isFollowing ? "Takipten Çık" : "Takip Et"}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  buttonSm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 90,
  },
  buttonMd: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minWidth: 110,
  },
  text: {
    fontWeight: "600",
  },
  textSm: {
    fontSize: typography.fontSize.sm,
  },
  textMd: {
    fontSize: typography.fontSize.base,
  },
});

FollowButton.displayName = "FollowButton";
```

---

### 7. FollowersListScreen (`screens/FollowersListScreen.tsx`)

```typescript
// src/features/social/screens/FollowersListScreen.tsx

import React, { useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "@contexts/ThemeContext";
import { EmptyState, Loading } from "@shared/components";
import { spacing } from "@theme";
import { UserListItem } from "../components";
import { useFollowers } from "../hooks";
import type { FollowUser } from "../types";

export const FollowersListScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const { userId } = route.params as { userId: number };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFollowers(userId);

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) || [];
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: FollowUser }) => (
      <UserListItem user={item} showFollowButton />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: FollowUser) => item.id.toString(),
    []
  );

  const ListFooterComponent = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={theme.colors.primary[500]} />
      </View>
    );
  }, [isFetchingNextPage, theme]);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="people-outline"
        title="Henüz takipçi yok"
        message="Bu kullanıcının henüz takipçisi bulunmuyor"
      />
    );
  }, [isLoading]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <Loading message="Yükleniyor..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
      edges={["bottom"]}
    >
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary[500]}
          />
        }
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.separator,
              { backgroundColor: theme.colors.border.light },
            ]}
          />
        )}
        contentContainerStyle={users.length === 0 && styles.emptyContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
  footer: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyContent: {
    flex: 1,
  },
});
```

---

## 📁 Day 6-7: Report & Block Features

### Report Types & API

```typescript
// src/features/moderation/types/moderation.types.ts

/**
 * Rapor tipi
 */
export type ReportType = "USER" | "POST" | "COMMENT" | "MESSAGE";

/**
 * Rapor nedeni
 */
export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "VIOLENCE"
  | "NUDITY"
  | "FALSE_INFORMATION"
  | "IMPERSONATION"
  | "INTELLECTUAL_PROPERTY"
  | "OTHER";

/**
 * Rapor oluşturma request
 */
export interface CreateReportRequest {
  type: ReportType;
  targetId: number | string;
  reason: ReportReason;
  description?: string;
}

/**
 * Rapor response
 */
export interface ReportResponse {
  id: number;
  type: ReportType;
  targetId: string;
  reason: ReportReason;
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

/**
 * Engellenen kullanıcı
 */
export interface BlockedUser {
  id: number;
  name: string;
  surname: string;
  fullName: string;
  avatarUrl: string | null;
  blockedAt: string;
}
```

---

### Report API Service

```typescript
// src/features/moderation/services/moderationApi.ts

import { apiClient } from "@core/api";
import type {
  CreateReportRequest,
  ReportResponse,
  BlockedUser,
} from "../types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const moderationApi = {
  /**
   * POST /api/reports
   * Şikayet oluştur
   */
  createReport: async (data: CreateReportRequest): Promise<ReportResponse> => {
    const response = await apiClient.post<ApiResponse<ReportResponse>>(
      "/api/reports",
      data
    );
    return response.data.data;
  },

  /**
   * GET /api/reports
   * Kullanıcının raporlarını getir
   */
  getMyReports: async (): Promise<ReportResponse[]> => {
    const response = await apiClient.get<ApiResponse<ReportResponse[]>>(
      "/api/reports"
    );
    return response.data.data;
  },

  /**
   * GET /api/users/blocked
   * Engellenen kullanıcıları getir
   */
  getBlockedUsers: async (): Promise<BlockedUser[]> => {
    const response = await apiClient.get<ApiResponse<BlockedUser[]>>(
      "/api/users/blocked"
    );
    return response.data.data;
  },
};

export default moderationApi;
```

---

### Report Screen

```typescript
// src/features/moderation/screens/ReportScreen.tsx

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@contexts/ThemeContext";
import { Button, Input } from "@shared/components";
import { spacing, typography } from "@theme";
import { useCreateReport } from "../hooks";
import type { ReportReason, ReportType } from "../types";

const REPORT_REASONS: { value: ReportReason; label: string; icon: string }[] = [
  { value: "SPAM", label: "Spam", icon: "alert-circle-outline" },
  {
    value: "HARASSMENT",
    label: "Taciz veya Zorbalık",
    icon: "person-remove-outline",
  },
  { value: "HATE_SPEECH", label: "Nefret Söylemi", icon: "warning-outline" },
  { value: "VIOLENCE", label: "Şiddet", icon: "flash-outline" },
  { value: "NUDITY", label: "Uygunsuz İçerik", icon: "eye-off-outline" },
  {
    value: "FALSE_INFORMATION",
    label: "Yanlış Bilgi",
    icon: "newspaper-outline",
  },
  { value: "IMPERSONATION", label: "Kimliğe Bürünme", icon: "person-outline" },
  { value: "OTHER", label: "Diğer", icon: "ellipsis-horizontal-outline" },
];

export const ReportScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const { type, targetId } = route.params as {
    type: ReportType;
    targetId: string | number;
  };

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null
  );
  const [description, setDescription] = useState("");

  const createReport = useCreateReport();

  const handleSubmit = useCallback(async () => {
    if (!selectedReason) {
      Alert.alert("Hata", "Lütfen bir neden seçin");
      return;
    }

    try {
      await createReport.mutateAsync({
        type,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      Alert.alert(
        "Teşekkürler",
        "Şikayetiniz alındı. Ekibimiz en kısa sürede inceleyecektir.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Hata", "Şikayet gönderilirken bir hata oluştu");
    }
  }, [selectedReason, description, type, targetId, createReport, navigation]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Neden şikayet ediyorsunuz?
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Size en uygun olan nedeni seçin
        </Text>

        <View style={styles.reasons}>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={[
                styles.reasonItem,
                {
                  backgroundColor:
                    selectedReason === reason.value
                      ? theme.colors.primary[50]
                      : theme.colors.background.secondary,
                  borderColor:
                    selectedReason === reason.value
                      ? theme.colors.primary[500]
                      : theme.colors.border.light,
                },
              ]}
              onPress={() => setSelectedReason(reason.value)}
            >
              <Icon
                name={reason.icon}
                size={24}
                color={
                  selectedReason === reason.value
                    ? theme.colors.primary[500]
                    : theme.colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.reasonText,
                  {
                    color:
                      selectedReason === reason.value
                        ? theme.colors.primary[500]
                        : theme.colors.text.primary,
                  },
                ]}
              >
                {reason.label}
              </Text>
              {selectedReason === reason.value && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary[500]}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedReason === "OTHER" && (
          <View style={styles.descriptionSection}>
            <Input
              label="Açıklama (Opsiyonel)"
              value={description}
              onChangeText={setDescription}
              placeholder="Daha fazla bilgi verin..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        )}
      </ScrollView>

      <View
        style={[styles.footer, { borderTopColor: theme.colors.border.light }]}
      >
        <Button
          title="Şikayet Gönder"
          onPress={handleSubmit}
          loading={createReport.isPending}
          disabled={!selectedReason}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  reasons: {
    gap: spacing.sm,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: "500",
    marginLeft: spacing.md,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  descriptionSection: {
    marginTop: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});
```

---

### Moderation Hooks Index

```typescript
// src/features/moderation/hooks/index.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moderationApi } from "../services";
import type { CreateReportRequest } from "../types";

export function useCreateReport() {
  return useMutation({
    mutationFn: (data: CreateReportRequest) => moderationApi.createReport(data),
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: ["my-reports"],
    queryFn: moderationApi.getMyReports,
  });
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ["blocked-users"],
    queryFn: moderationApi.getBlockedUsers,
  });
}
```

---

**Bu Part içerir:**

- Social Types ✅
- Social API Service ✅
- Follow/Unfollow Hooks ✅
- Followers/Following Hooks ✅
- UserListItem Component ✅
- FollowButton Component ✅
- FollowersListScreen ✅
- Report Types & API ✅
- ReportScreen ✅
- Moderation Hooks ✅

**Sonraki Part:** OAuth2 (Google/Apple Sign-In), BiometricSetupScreen
