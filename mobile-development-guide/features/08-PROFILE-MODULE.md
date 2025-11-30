# Profile Module

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐ (Low-Medium)

---

## 1. Overview

Profile modülü kullanıcı profil yönetimini sağlar: profil görüntüleme, düzenleme, fotoğraf yükleme, ayarlar ve hesap yönetimi.

---

## 2. Module Structure

```
src/features/profile/
├── screens/
│   ├── ProfileScreen.tsx                # Profil görüntüleme
│   ├── EditProfileScreen.tsx            # Profil düzenleme
│   └── SettingsScreen.tsx               # Ayarlar
├── components/
│   ├── ProfileHeader.tsx                # Profil başlık
│   ├── ProfileStats.tsx                 # İstatistikler
│   ├── ProfileInfo.tsx                  # Bilgiler
│   ├── EditProfileForm.tsx              # Düzenleme formu
│   └── SettingItem.tsx                  # Ayar item
├── hooks/
│   ├── useProfile.ts                    # Profile query
│   ├── useUpdateProfile.ts              # Update mutation
│   ├── useUploadProfileImage.ts         # Image upload
│   └── useDeleteAccount.ts              # Delete account
├── stores/
│   └── profileStore.ts                  # Zustand profile cache
├── services/
│   └── profileApi.ts                    # Profile API
├── types/
│   └── profile.types.ts                 # Type definitions
└── index.ts
```

---

## 3. Type Definitions

**src/features/profile/types/profile.types.ts:**

```typescript
export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  bio?: string;
  profession?: string;
  company?: string;
  location?: string;
  website?: string;
  profileImageUrl?: string;
  verificationStatus: VerificationStatus;
  stats: ProfileStats;
  createdAt: string;
}

export interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profession?: string;
  company?: string;
  location?: string;
  website?: string;
}

export interface Settings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  language: string;
  theme: "light" | "dark" | "auto";
}

export interface NotificationSettings {
  postLikes: boolean;
  postComments: boolean;
  newMessages: boolean;
  newFollowers: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private";
  showEmail: boolean;
  showPhone: boolean;
}
```

---

## 4. Services

**src/features/profile/services/profileApi.ts:**

```typescript
import { apiClient } from "@core/api/client";
import type {
  Profile,
  UpdateProfileRequest,
  Settings,
} from "../types/profile.types";

export const profileApi = {
  // Get profile
  getProfile: async (userId?: string): Promise<Profile> => {
    const url = userId ? `/users/${userId}` : "/users/me";
    const response = await apiClient.get(url);
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<Profile> => {
    const response = await apiClient.put("/users/me", data);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (
    imageUri: string
  ): Promise<{ profileImageUrl: string }> => {
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);

    const response = await apiClient.post("/users/me/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Get settings
  getSettings: async (): Promise<Settings> => {
    const response = await apiClient.get("/users/me/settings");
    return response.data;
  },

  // Update settings
  updateSettings: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await apiClient.put("/users/me/settings", settings);
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete("/users/me");
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await apiClient.post("/users/me/change-password", {
      currentPassword,
      newPassword,
    });
  },
};
```

---

## 5. Hooks

**src/features/profile/hooks/useProfile.ts:**

```typescript
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../services/profileApi";

export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["profile", userId || "me"],
    queryFn: () => profileApi.getProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**src/features/profile/hooks/useUpdateProfile.ts:**

```typescript
import { useMutation, useQueryClient } from "@tantml:react-query";
import { profileApi } from "../services/profileApi";
import { useAuthStore } from "@features/auth/stores/authStore";
import type { UpdateProfileRequest } from "../types/profile.types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),

    onSuccess: (data) => {
      // Update auth store
      updateUser(data);

      // Invalidate profile cache
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};
```

**src/features/profile/hooks/useUploadProfileImage.ts:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../services/profileApi";
import { useAuthStore } from "@features/auth/stores/authStore";

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (imageUri: string) => profileApi.uploadProfileImage(imageUri),

    onSuccess: (data) => {
      // Update auth store
      updateUser({ profileImageUrl: data.profileImageUrl });

      // Invalidate profile cache
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};
```

---

## 6. Components

**src/features/profile/components/ProfileHeader.tsx:**

```typescript
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text } from "@shared/components/Text";
import { Button } from "@shared/components/Button";
import type { Profile } from "../types/profile.types";

interface Props {
  profile: Profile;
  isOwnProfile: boolean;
  onEditPress?: () => void;
}

export const ProfileHeader: React.FC<Props> = ({
  profile,
  isOwnProfile,
  onEditPress,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: profile.profileImageUrl || "https://via.placeholder.com/150",
        }}
        style={styles.avatar}
      />

      <Text style={styles.name}>
        {profile.firstName} {profile.lastName}
      </Text>

      {profile.profession && (
        <Text style={styles.profession}>{profile.profession}</Text>
      )}

      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      {isOwnProfile && (
        <Button onPress={onEditPress} variant="outline">
          Profili Düzenle
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  profession: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
});
```

**src/features/profile/components/ProfileStats.tsx:**

```typescript
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components/Text";
import type { ProfileStats as Stats } from "../types/profile.types";

interface Props {
  stats: Stats;
}

export const ProfileStats: React.FC<Props> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.count}>{stats.postCount}</Text>
        <Text style={styles.label}>Gönderi</Text>
      </View>

      <View style={styles.stat}>
        <Text style={styles.count}>{stats.followerCount}</Text>
        <Text style={styles.label}>Takipçi</Text>
      </View>

      <View style={styles.stat}>
        <Text style={styles.count}>{stats.followingCount}</Text>
        <Text style={styles.label}>Takip</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  stat: {
    alignItems: "center",
  },
  count: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
});
```

---

## 7. Screens

**src/features/profile/screens/ProfileScreen.tsx:**

```typescript
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { useProfile } from "../hooks/useProfile";
import { useAuthStore } from "@features/auth/stores/authStore";
import { Loading } from "@shared/components/Loading";

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  const currentUser = useAuthStore((state) => state.user);
  const { data: profile, isLoading } = useProfile(userId);

  if (isLoading) {
    return <Loading />;
  }

  if (!profile) {
    return null;
  }

  const isOwnProfile = !userId || userId === currentUser?.id;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditPress={() => navigation.navigate("EditProfile")}
        />

        <ProfileStats stats={profile.stats} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
```

**src/features/profile/screens/EditProfileScreen.tsx:**

```typescript
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@shared/components/Input";
import { Button } from "@shared/components/Button";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useUploadProfileImage } from "../hooks/useUploadProfileImage";
import { ImagePicker } from "react-native-image-picker";

export const EditProfileScreen = () => {
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: uploadImage } = useUploadProfileImage();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      bio: profile?.bio || "",
      profession: profile?.profession || "",
      company: profile?.company || "",
      location: profile?.location || "",
    },
  });

  const onSubmit = (data: any) => {
    updateProfile(data);
  };

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.assets?.[0]?.uri) {
        uploadImage(response.assets[0].uri);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={handleImagePick}
          style={styles.avatarContainer}
        >
          <Image
            source={{
              uri:
                profile?.profileImageUrl || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value } }) => (
            <Input label="Ad" value={value} onChangeText={onChange} />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value } }) => (
            <Input label="Soyad" value={value} onChangeText={onChange} />
          )}
        />

        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Hakkında"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
            />
          )}
        />

        <Controller
          control={control}
          name="profession"
          render={({ field: { onChange, value } }) => (
            <Input label="Meslek" value={value} onChangeText={onChange} />
          )}
        />

        <Button onPress={handleSubmit(onSubmit)} loading={isPending}>
          Kaydet
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});
```

---

## 8. Summary

### Features:

- ✅ Profile viewing
- ✅ Profile editing
- ✅ Profile image upload
- ✅ Statistics display
- ✅ Settings management
- ✅ Account deletion
- ✅ Password change

**Result:** Complete profile management with image upload.
