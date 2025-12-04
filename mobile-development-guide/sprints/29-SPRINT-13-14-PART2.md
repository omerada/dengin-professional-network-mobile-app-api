# Sprint 13-14: Part 2 - Profile Components

**Continues from:** 29-SPRINT-13-14-COMPLETION.md

---

## 📁 Day 2-3: Profile Components

### 1. ProfileHeader Component (`components/ProfileHeader.tsx`)

```typescript
// src/features/profile/components/ProfileHeader.tsx
// Profil başlık komponenti - Avatar, isim, meslek bilgisi

import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";
import type { ProfileResponse } from "../types";

interface ProfileHeaderProps {
  profile: ProfileResponse;
  isOwnProfile: boolean;
  onEditPress?: () => void;
  onAvatarPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = memo(
  ({ profile, isOwnProfile, onEditPress, onAvatarPress }) => {
    const { theme } = useTheme();

    const getInitials = useCallback(() => {
      const first = profile.name?.charAt(0) || "";
      const last = profile.surname?.charAt(0) || "";
      return (first + last).toUpperCase();
    }, [profile.name, profile.surname]);

    return (
      <View style={styles.container}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={isOwnProfile ? onAvatarPress : undefined}
          disabled={!isOwnProfile}
          accessibilityLabel="Profil fotoğrafı"
          accessibilityHint={
            isOwnProfile ? "Fotoğrafı değiştirmek için dokunun" : undefined
          }
        >
          {profile.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <Text
                style={[styles.initials, { color: theme.colors.primary[600] }]}
              >
                {getInitials()}
              </Text>
            </View>
          )}

          {isOwnProfile && (
            <View
              style={[
                styles.editBadge,
                { backgroundColor: theme.colors.primary[500] },
              ]}
            >
              <Icon name="camera" size={14} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.fullName, { color: theme.colors.text.primary }]}
            >
              {profile.fullName || `${profile.name} ${profile.surname}`}
            </Text>

            {profile.isProfessionVerified && (
              <Icon
                name="checkmark-circle"
                size={20}
                color={theme.colors.success.main}
                style={styles.verifiedIcon}
              />
            )}
          </View>

          {profile.profession && (
            <Text
              style={[
                styles.profession,
                { color: theme.colors.text.secondary },
              ]}
            >
              {profile.profession.name}
            </Text>
          )}

          {profile.bio && (
            <Text
              style={[styles.bio, { color: theme.colors.text.primary }]}
              numberOfLines={3}
            >
              {profile.bio}
            </Text>
          )}
        </View>

        {/* Edit Button (only for own profile) */}
        {isOwnProfile && onEditPress && (
          <TouchableOpacity
            style={[
              styles.editButton,
              { borderColor: theme.colors.border.medium },
            ]}
            onPress={onEditPress}
            accessibilityLabel="Profili düzenle"
          >
            <Text
              style={[
                styles.editButtonText,
                { color: theme.colors.text.primary },
              ]}
            >
              Profili Düzenle
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: 36,
    fontWeight: "600",
  },
  editBadge: {
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
  infoContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullName: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: "700",
  },
  verifiedIcon: {
    marginLeft: spacing.xs,
  },
  profession: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: typography.fontSize.base,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
  editButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
  },
});

ProfileHeader.displayName = "ProfileHeader";
```

---

### 2. ProfileStats Component (`components/ProfileStats.tsx`)

```typescript
// src/features/profile/components/ProfileStats.tsx
// Takipçi, takip edilen, gönderi sayısı

import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";
import type { ProfileStats as ProfileStatsType } from "../types";

interface ProfileStatsProps {
  stats: ProfileStatsType;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  onPostsPress?: () => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = memo(
  ({ stats, onFollowersPress, onFollowingPress, onPostsPress }) => {
    const { theme } = useTheme();

    const formatCount = (count: number): string => {
      if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
      }
      if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
      }
      return count.toString();
    };

    return (
      <View
        style={[styles.container, { borderColor: theme.colors.border.light }]}
      >
        <TouchableOpacity
          style={styles.statItem}
          onPress={onPostsPress}
          accessibilityLabel={`${stats.postCount} gönderi`}
        >
          <Text
            style={[styles.statValue, { color: theme.colors.text.primary }]}
          >
            {formatCount(stats.postCount)}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.text.secondary }]}
          >
            Gönderi
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.border.light },
          ]}
        />

        <TouchableOpacity
          style={styles.statItem}
          onPress={onFollowersPress}
          accessibilityLabel={`${stats.followerCount} takipçi`}
        >
          <Text
            style={[styles.statValue, { color: theme.colors.text.primary }]}
          >
            {formatCount(stats.followerCount)}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.text.secondary }]}
          >
            Takipçi
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.border.light },
          ]}
        />

        <TouchableOpacity
          style={styles.statItem}
          onPress={onFollowingPress}
          accessibilityLabel={`${stats.followingCount} takip edilen`}
        >
          <Text
            style={[styles.statValue, { color: theme.colors.text.primary }]}
          >
            {formatCount(stats.followingCount)}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.text.secondary }]}
          >
            Takip
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: 40,
  },
});

ProfileStats.displayName = "ProfileStats";
```

---

### 3. ProfileActions Component (`components/ProfileActions.tsx`)

```typescript
// src/features/profile/components/ProfileActions.tsx
// Takip et/Mesaj gönder butonları (başka kullanıcı profili için)

import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";

interface ProfileActionsProps {
  isFollowing: boolean;
  isFollowLoading: boolean;
  onFollowPress: () => void;
  onMessagePress: () => void;
  onMorePress?: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = memo(
  ({
    isFollowing,
    isFollowLoading,
    onFollowPress,
    onMessagePress,
    onMorePress,
  }) => {
    const { theme } = useTheme();

    return (
      <View style={styles.container}>
        {/* Follow/Unfollow Button */}
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing
              ? {
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: theme.colors.border.medium,
                  borderWidth: 1,
                }
              : { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={onFollowPress}
          disabled={isFollowLoading}
          accessibilityLabel={isFollowing ? "Takibi bırak" : "Takip et"}
        >
          {isFollowLoading ? (
            <ActivityIndicator
              size="small"
              color={isFollowing ? theme.colors.text.primary : "#FFFFFF"}
            />
          ) : (
            <>
              <Icon
                name={
                  isFollowing ? "person-remove-outline" : "person-add-outline"
                }
                size={18}
                color={isFollowing ? theme.colors.text.primary : "#FFFFFF"}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.followButtonText,
                  {
                    color: isFollowing ? theme.colors.text.primary : "#FFFFFF",
                  },
                ]}
              >
                {isFollowing ? "Takipten Çık" : "Takip Et"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Message Button */}
        <TouchableOpacity
          style={[
            styles.messageButton,
            { borderColor: theme.colors.border.medium },
          ]}
          onPress={onMessagePress}
          accessibilityLabel="Mesaj gönder"
        >
          <Icon
            name="chatbubble-outline"
            size={18}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>

        {/* More Button */}
        {onMorePress && (
          <TouchableOpacity
            style={[
              styles.moreButton,
              { borderColor: theme.colors.border.medium },
            ]}
            onPress={onMorePress}
            accessibilityLabel="Daha fazla seçenek"
          >
            <Icon
              name="ellipsis-horizontal"
              size={18}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  followButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minHeight: 44,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  followButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
  },
  messageButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  moreButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
});

ProfileActions.displayName = "ProfileActions";
```

---

### 4. AvatarPicker Component (`components/AvatarPicker.tsx`)

```typescript
// src/features/profile/components/AvatarPicker.tsx
// Avatar seçme/çekme modal

import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from "react-native-image-picker";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";

interface AvatarPickerProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = memo(
  ({ visible, onClose, onImageSelected }) => {
    const { theme } = useTheme();

    const handleResponse = useCallback(
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert("Hata", response.errorMessage || "Fotoğraf seçilemedi");
          return;
        }

        const asset = response.assets?.[0];
        if (asset?.uri) {
          onImageSelected(asset.uri);
          onClose();
        }
      },
      [onImageSelected, onClose]
    );

    const handleCamera = useCallback(async () => {
      const result = await launchCamera({
        mediaType: "photo",
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
        includeBase64: false,
      });
      handleResponse(result);
    }, [handleResponse]);

    const handleGallery = useCallback(async () => {
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
        includeBase64: false,
        selectionLimit: 1,
      });
      handleResponse(result);
    }, [handleResponse]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={[
              styles.container,
              { backgroundColor: theme.colors.background.primary },
            ]}
          >
            <View
              style={[
                styles.handle,
                { backgroundColor: theme.colors.border.medium },
              ]}
            />

            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Profil Fotoğrafı
            </Text>

            <TouchableOpacity
              style={styles.option}
              onPress={handleCamera}
              accessibilityLabel="Fotoğraf çek"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.primary[100] },
                ]}
              >
                <Icon
                  name="camera"
                  size={24}
                  color={theme.colors.primary[600]}
                />
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: theme.colors.text.primary },
                ]}
              >
                Fotoğraf Çek
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={handleGallery}
              accessibilityLabel="Galeriden seç"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.secondary[100] },
                ]}
              >
                <Icon
                  name="images"
                  size={24}
                  color={theme.colors.secondary[600]}
                />
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: theme.colors.text.primary },
                ]}
              >
                Galeriden Seç
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: theme.colors.background.secondary },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.cancelText,
                  { color: theme.colors.text.primary },
                ]}
              >
                İptal
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  optionText: {
    fontSize: typography.fontSize.md,
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
  },
});

AvatarPicker.displayName = "AvatarPicker";
```

---

### 5. SettingsItem & SettingsSection (`components/SettingsItem.tsx`)

```typescript
// src/features/profile/components/SettingsItem.tsx

import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "@contexts/ThemeContext";
import { spacing, typography } from "@theme";
import type { SettingsItemType, SettingsSectionType } from "../types";

// SettingsItem Component
interface SettingsItemProps {
  item: SettingsItemType;
}

export const SettingsItem: React.FC<SettingsItemProps> = memo(({ item }) => {
  const { theme } = useTheme();

  const getIconColor = () => {
    if (item.type === "danger") return theme.colors.error.main;
    return theme.colors.text.secondary;
  };

  const getTextColor = () => {
    if (item.type === "danger") return theme.colors.error.main;
    return theme.colors.text.primary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        { backgroundColor: theme.colors.background.primary },
      ]}
      onPress={item.type === "toggle" ? undefined : item.onPress}
      disabled={item.type === "toggle"}
      accessibilityLabel={item.title}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.background.secondary },
        ]}
      >
        <Icon name={item.icon} size={20} color={getIconColor()} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: getTextColor() }]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text
            style={[styles.subtitle, { color: theme.colors.text.tertiary }]}
          >
            {item.subtitle}
          </Text>
        )}
      </View>

      {item.type === "toggle" && item.onToggle ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{
            false: theme.colors.border.medium,
            true: theme.colors.primary[400],
          }}
          thumbColor={item.value ? theme.colors.primary[500] : "#f4f3f4"}
        />
      ) : item.type !== "action" && item.type !== "danger" ? (
        <Icon
          name="chevron-forward"
          size={20}
          color={theme.colors.text.tertiary}
        />
      ) : null}
    </TouchableOpacity>
  );
});

// SettingsSection Component
interface SettingsSectionProps {
  section: SettingsSectionType;
}

export const SettingsSection: React.FC<SettingsSectionProps> = memo(
  ({ section }) => {
    const { theme } = useTheme();

    return (
      <View style={styles.sectionContainer}>
        <Text
          style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}
        >
          {section.title}
        </Text>
        <View
          style={[
            styles.sectionContent,
            { backgroundColor: theme.colors.background.primary },
          ]}
        >
          {section.items.map((item, index) => (
            <React.Fragment key={item.id}>
              <SettingsItem item={item} />
              {index < section.items.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: theme.colors.border.light },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: "hidden",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginLeft: 60,
  },
});

SettingsItem.displayName = "SettingsItem";
SettingsSection.displayName = "SettingsSection";
```

---

### 6. Components Index (`components/index.ts`)

```typescript
// src/features/profile/components/index.ts

export { ProfileHeader } from "./ProfileHeader";
export { ProfileStats } from "./ProfileStats";
export { ProfileActions } from "./ProfileActions";
export { AvatarPicker } from "./AvatarPicker";
export { SettingsItem, SettingsSection } from "./SettingsItem";
```

---

## Devam eden dosyalar için Part 3'te Profile Screens implementasyonu olacak.

**Bu Part içerir:**

- ProfileHeader ✅
- ProfileStats ✅
- ProfileActions ✅
- AvatarPicker ✅
- SettingsItem & SettingsSection ✅

**Sonraki Part:** Profile Screens (ProfileScreen, EditProfileScreen, SettingsScreen)
