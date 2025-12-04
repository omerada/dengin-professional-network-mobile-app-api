# Sprint 13-14: Part 3 - Profile Screens

**Continues from:** 29-SPRINT-13-14-PART2.md

---

## 📁 Day 3-4: Profile Screens

### 1. ProfileScreen - Tam Implementasyon

```typescript
// src/features/profile/screens/ProfileScreen.tsx
// Profil görüntüleme ekranı - Kendi profili ve başka kullanıcı profili

import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useTheme } from "@contexts/ThemeContext";
import { useAuthStore } from "@features/auth/stores";
import { Loading, ErrorFallback } from "@shared/components";
import { spacing } from "@theme";
import {
  ProfileHeader,
  ProfileStats,
  ProfileActions,
  AvatarPicker,
} from "../components";
import { useMyProfile, useProfile, useUploadAvatar } from "../hooks";
import { useFollow, useUnfollow } from "@features/social/hooks";
import type { ProfileStackParamList } from "@shared/types/navigation.types";

type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  "Profile"
>;
type ProfileRouteProp = RouteProp<ProfileStackParamList, "Profile">;

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProfileRouteProp>();

  const currentUser = useAuthStore((state) => state.user);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Route'dan userId al (yoksa kendi profili)
  const userId = route.params?.userId;
  const isOwnProfile = !userId || userId === currentUser?.id?.toString();

  // Query: Profil verisi
  const {
    data: myProfile,
    isLoading: isLoadingMyProfile,
    error: myProfileError,
    refetch: refetchMyProfile,
    isRefetching: isRefetchingMyProfile,
  } = useMyProfile();

  const {
    data: otherProfile,
    isLoading: isLoadingOtherProfile,
    error: otherProfileError,
    refetch: refetchOtherProfile,
    isRefetching: isRefetchingOtherProfile,
  } = useProfile(isOwnProfile ? undefined : Number(userId));

  // Aktif profil verisi
  const profile = isOwnProfile ? myProfile : otherProfile;
  const isLoading = isOwnProfile ? isLoadingMyProfile : isLoadingOtherProfile;
  const error = isOwnProfile ? myProfileError : otherProfileError;
  const isRefetching = isOwnProfile
    ? isRefetchingMyProfile
    : isRefetchingOtherProfile;
  const refetch = isOwnProfile ? refetchMyProfile : refetchOtherProfile;

  // Mutations
  const uploadAvatar = useUploadAvatar();
  const follow = useFollow();
  const unfollow = useUnfollow();

  // Follow durumu (başka profil için)
  const isFollowing = useMemo(() => {
    if (isOwnProfile || !otherProfile) return false;
    // Backend'den gelen isFollowing bilgisi
    return (otherProfile as any).isFollowing || false;
  }, [isOwnProfile, otherProfile]);

  // Handlers
  const handleEditPress = useCallback(() => {
    navigation.navigate("EditProfile");
  }, [navigation]);

  const handleAvatarPress = useCallback(() => {
    setShowAvatarPicker(true);
  }, []);

  const handleAvatarSelected = useCallback(
    async (uri: string) => {
      try {
        await uploadAvatar.mutateAsync(uri);
        Alert.alert("Başarılı", "Profil fotoğrafınız güncellendi");
      } catch (error) {
        Alert.alert("Hata", "Fotoğraf yüklenirken bir hata oluştu");
      }
    },
    [uploadAvatar]
  );

  const handleFollowPress = useCallback(async () => {
    if (!userId) return;

    try {
      if (isFollowing) {
        await unfollow.mutateAsync(Number(userId));
      } else {
        await follow.mutateAsync(Number(userId));
      }
    } catch (error) {
      Alert.alert("Hata", "İşlem gerçekleştirilemedi");
    }
  }, [userId, isFollowing, follow, unfollow]);

  const handleMessagePress = useCallback(() => {
    if (!userId || !profile) return;

    // Mesajlaşma ekranına git
    navigation.navigate("Chat" as any, {
      recipientId: userId,
      recipientName: profile.fullName,
    });
  }, [userId, profile, navigation]);

  const handleMorePress = useCallback(() => {
    Alert.alert("Seçenekler", undefined, [
      { text: "Engelle", style: "destructive", onPress: () => handleBlock() },
      { text: "Şikayet Et", onPress: () => handleReport() },
      { text: "İptal", style: "cancel" },
    ]);
  }, []);

  const handleBlock = useCallback(() => {
    // Block işlemi
    Alert.alert(
      "Engelle",
      "Bu kullanıcıyı engellemek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Engelle",
          style: "destructive",
          onPress: () => {
            // Block API call
          },
        },
      ]
    );
  }, []);

  const handleReport = useCallback(() => {
    // Report ekranına git
    navigation.navigate("Report" as any, { userId });
  }, [navigation, userId]);

  const handleFollowersPress = useCallback(() => {
    navigation.navigate("FollowersList" as any, {
      userId: userId || currentUser?.id,
    });
  }, [navigation, userId, currentUser]);

  const handleFollowingPress = useCallback(() => {
    navigation.navigate("FollowingList" as any, {
      userId: userId || currentUser?.id,
    });
  }, [navigation, userId, currentUser]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <Loading message="Profil yükleniyor..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        <ErrorFallback
          error={error || new Error("Profil bulunamadı")}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditPress={handleEditPress}
          onAvatarPress={handleAvatarPress}
        />

        {/* Profile Stats */}
        <ProfileStats
          stats={profile.stats}
          onFollowersPress={handleFollowersPress}
          onFollowingPress={handleFollowingPress}
        />

        {/* Actions (for other profiles) */}
        {!isOwnProfile && (
          <ProfileActions
            isFollowing={isFollowing}
            isFollowLoading={follow.isPending || unfollow.isPending}
            onFollowPress={handleFollowPress}
            onMessagePress={handleMessagePress}
            onMorePress={handleMorePress}
          />
        )}

        {/* User's Posts would go here */}
        {/* TODO: Add UserPostsList component */}
      </ScrollView>

      {/* Avatar Picker Modal */}
      <AvatarPicker
        visible={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onImageSelected={handleAvatarSelected}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
```

---

### 2. EditProfileScreen

```typescript
// src/features/profile/screens/EditProfileScreen.tsx
// Profil düzenleme ekranı

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "@contexts/ThemeContext";
import { Input, Button, Loading } from "@shared/components";
import { spacing, typography } from "@theme";
import { useMyProfile, useUpdateProfile, useUploadAvatar } from "../hooks";
import { ProfileHeader, AvatarPicker } from "../components";
import type { UpdateProfileRequest } from "../types";

// Validation schema
const editProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalı")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  surname: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalı")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  bio: z
    .string()
    .max(300, "Biyografi en fazla 300 karakter olabilir")
    .optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "",
      surname: "",
      bio: "",
      gender: undefined,
    },
  });

  // Form'u profil verisiyle doldur
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        surname: profile.surname,
        bio: profile.bio || "",
        gender: profile.gender || undefined,
      });
    }
  }, [profile, reset]);

  const onSubmit = useCallback(
    async (data: EditProfileFormData) => {
      try {
        await updateProfile.mutateAsync(data as UpdateProfileRequest);
        Alert.alert("Başarılı", "Profiliniz güncellendi", [
          { text: "Tamam", onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        Alert.alert("Hata", "Profil güncellenirken bir hata oluştu");
      }
    },
    [updateProfile, navigation]
  );

  const handleAvatarSelected = useCallback(
    async (uri: string) => {
      try {
        await uploadAvatar.mutateAsync(uri);
        Alert.alert("Başarılı", "Profil fotoğrafınız güncellendi");
      } catch (error) {
        Alert.alert("Hata", "Fotoğraf yüklenirken bir hata oluştu");
      }
    },
    [uploadAvatar]
  );

  const handleCancel = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        "Değişiklikleri Kaydet",
        "Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinizden emin misiniz?",
        [
          { text: "Kal", style: "cancel" },
          {
            text: "Çık",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [isDirty, navigation]);

  if (isLoadingProfile) {
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
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border.light },
        ]}
      >
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Icon name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: theme.colors.text.primary }]}
        >
          Profili Düzenle
        </Text>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={!isDirty || updateProfile.isPending}
          style={styles.headerButton}
        >
          <Text
            style={[
              styles.saveButton,
              {
                color: isDirty
                  ? theme.colors.primary[500]
                  : theme.colors.text.tertiary,
              },
            ]}
          >
            Kaydet
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <TouchableOpacity
            style={styles.avatarSection}
            onPress={() => setShowAvatarPicker(true)}
          >
            {profile && (
              <ProfileHeader
                profile={profile}
                isOwnProfile={true}
                onAvatarPress={() => setShowAvatarPicker(true)}
              />
            )}
            <Text
              style={[
                styles.changePhotoText,
                { color: theme.colors.primary[500] },
              ]}
            >
              Fotoğrafı Değiştir
            </Text>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Ad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  placeholder="Adınız"
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="surname"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Soyad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.surname?.message}
                  placeholder="Soyadınız"
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Biyografi"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.bio?.message}
                  placeholder="Kendinizi kısaca tanıtın"
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                />
              )}
            />

            {/* Gender Selection */}
            <View style={styles.genderSection}>
              <Text
                style={[styles.label, { color: theme.colors.text.primary }]}
              >
                Cinsiyet
              </Text>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.genderOptions}>
                    {(["MALE", "FEMALE", "OTHER"] as const).map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        style={[
                          styles.genderOption,
                          {
                            backgroundColor:
                              value === gender
                                ? theme.colors.primary[500]
                                : theme.colors.background.secondary,
                            borderColor:
                              value === gender
                                ? theme.colors.primary[500]
                                : theme.colors.border.medium,
                          },
                        ]}
                        onPress={() => onChange(gender)}
                      >
                        <Text
                          style={{
                            color:
                              value === gender
                                ? "#FFFFFF"
                                : theme.colors.text.primary,
                            fontWeight: "500",
                          }}
                        >
                          {gender === "MALE"
                            ? "Erkek"
                            : gender === "FEMALE"
                            ? "Kadın"
                            : "Diğer"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Avatar Picker */}
      <AvatarPicker
        visible={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onImageSelected={handleAvatarSelected}
      />

      {/* Loading Overlay */}
      {(updateProfile.isPending || uploadAvatar.isPending) && (
        <View style={styles.loadingOverlay}>
          <Loading message="Kaydediliyor..." />
        </View>
      )}
    </SafeAreaView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
  },
  saveButton: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing["3xl"],
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  changePhotoText: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  form: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  genderSection: {
    marginTop: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  genderOptions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  genderOption: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
```

---

### 3. SettingsScreen

```typescript
// src/features/profile/screens/SettingsScreen.tsx
// Ayarlar ekranı

import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@contexts/ThemeContext";
import { useAuthStore } from "@features/auth/stores";
import { useLogout } from "@features/auth/hooks";
import { spacing } from "@theme";
import { SettingsSection } from "../components";
import type { SettingsSectionType } from "../types";

export const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const navigation = useNavigation();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useAuthStore(
    (state) => state.setBiometricEnabled
  );

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Çıkış Yap", style: "destructive", onPress: logout },
      ]
    );
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    navigation.navigate("AccountDeletion" as never);
  }, [navigation]);

  const sections: SettingsSectionType[] = useMemo(
    () => [
      {
        title: "Hesap",
        items: [
          {
            id: "change-password",
            title: "Şifre Değiştir",
            icon: "lock-closed-outline",
            type: "navigation",
            onPress: () => navigation.navigate("ChangePassword" as never),
          },
          {
            id: "biometric",
            title: "Biyometrik Giriş",
            subtitle: "Face ID veya parmak izi ile giriş",
            icon: "finger-print-outline",
            type: "toggle",
            value: biometricEnabled,
            onToggle: setBiometricEnabled,
          },
        ],
      },
      {
        title: "Bildirimler",
        items: [
          {
            id: "notification-settings",
            title: "Bildirim Ayarları",
            icon: "notifications-outline",
            type: "navigation",
            onPress: () => navigation.navigate("NotificationSettings" as never),
          },
        ],
      },
      {
        title: "Görünüm",
        items: [
          {
            id: "dark-mode",
            title: "Karanlık Mod",
            icon: "moon-outline",
            type: "toggle",
            value: isDark,
            onToggle: toggleTheme,
          },
        ],
      },
      {
        title: "Gizlilik",
        items: [
          {
            id: "blocked-users",
            title: "Engellenen Kullanıcılar",
            icon: "ban-outline",
            type: "navigation",
            onPress: () => navigation.navigate("BlockedUsers" as never),
          },
          {
            id: "privacy-policy",
            title: "Gizlilik Politikası",
            icon: "shield-checkmark-outline",
            type: "navigation",
            onPress: () => navigation.navigate("PrivacyPolicy" as never),
          },
        ],
      },
      {
        title: "Hakkında",
        items: [
          {
            id: "about",
            title: "Hakkında",
            subtitle: "Versiyon 1.0.0",
            icon: "information-circle-outline",
            type: "navigation",
            onPress: () => navigation.navigate("About" as never),
          },
          {
            id: "help",
            title: "Yardım ve Destek",
            icon: "help-circle-outline",
            type: "navigation",
            onPress: () => navigation.navigate("Help" as never),
          },
        ],
      },
      {
        title: "Hesap İşlemleri",
        items: [
          {
            id: "logout",
            title: "Çıkış Yap",
            icon: "log-out-outline",
            type: "action",
            onPress: handleLogout,
          },
          {
            id: "delete-account",
            title: "Hesabı Sil",
            icon: "trash-outline",
            type: "danger",
            onPress: handleDeleteAccount,
          },
        ],
      },
    ],
    [biometricEnabled, isDark, navigation, handleLogout, handleDeleteAccount]
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.secondary },
      ]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => (
          <SettingsSection key={index} section={section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing["3xl"],
  },
});
```

---

### 4. Screens Index

```typescript
// src/features/profile/screens/index.ts

export { ProfileScreen } from "./ProfileScreen";
export { EditProfileScreen } from "./EditProfileScreen";
export { SettingsScreen } from "./SettingsScreen";
export { ChangePasswordScreen } from "./ChangePasswordScreen";
export { AccountDeletionScreen } from "./AccountDeletionScreen";
```

---

### 5. Profile Module Index

```typescript
// src/features/profile/index.ts

// Screens
export * from "./screens";

// Components
export * from "./components";

// Hooks
export * from "./hooks";

// Stores
export { useProfileStore } from "./stores";

// Services
export { profileApi } from "./services";

// Types
export * from "./types";
```

---

**Bu Part içerir:**

- ProfileScreen (tam implementasyon) ✅
- EditProfileScreen ✅
- SettingsScreen ✅
- Screens Index ✅
- Profile Module Index ✅

**Sonraki Part:** Shared Components (Card, Avatar, Badge, Modal, Toast, EmptyState, Skeleton)
