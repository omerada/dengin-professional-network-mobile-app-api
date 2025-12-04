# Sprint 13-14: Eksik Modüllerin Tamamlanması

**Duration:** 2 weeks
**Focus:** Profile modülü, Shared components, Social features, OAuth2
**Complexity:** ⭐⭐⭐ (Medium-High)

---

## 📋 Sprint Özeti

Bu sprint, önceki analizde tespit edilen eksik modülleri tamamlamayı hedefler:

1. **Profile Modülü** - %40 → %100
2. **Shared Components** - %60 → %100
3. **Social Features** (Follow/Unfollow) - %0 → %100
4. **OAuth2 Login** (Google/Apple) - %0 → %100
5. **BiometricSetupScreen** - %0 → %100
6. **Report/Block Features** - %0 → %100

---

## 🎯 Sprint Goals

### Week 1: Profile & Shared Components

- [ ] Profile modülü tam implementasyonu
- [ ] Eksik shared components
- [ ] Social features (Follow/Unfollow)

### Week 2: OAuth2, Biometric & Moderation

- [ ] OAuth2 (Google/Apple Sign-In)
- [ ] BiometricSetupScreen
- [ ] Report/Block UI

---

## 📁 Week 1 - Day 1-2: Profile Modülü Yapısı

### Hedef Dosya Yapısı

```
src/features/profile/
├── components/
│   ├── index.ts
│   ├── ProfileHeader.tsx
│   ├── ProfileStats.tsx
│   ├── ProfileBio.tsx
│   ├── ProfileActions.tsx
│   ├── EditProfileForm.tsx
│   ├── AvatarPicker.tsx
│   ├── SettingsItem.tsx
│   └── SettingsSection.tsx
├── hooks/
│   ├── index.ts
│   ├── useProfile.ts
│   ├── useUpdateProfile.ts
│   ├── useUploadAvatar.ts
│   └── useDeleteAccount.ts
├── screens/
│   ├── index.ts
│   ├── ProfileScreen.tsx
│   ├── EditProfileScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── ChangePasswordScreen.tsx
│   └── AccountDeletionScreen.tsx
├── services/
│   ├── index.ts
│   └── profileApi.ts
├── stores/
│   ├── index.ts
│   └── profileStore.ts
├── types/
│   ├── index.ts
│   └── profile.types.ts
└── index.ts
```

---

### 1. Profile Types (`types/profile.types.ts`)

```typescript
// src/features/profile/types/profile.types.ts
// Backend API ile %100 uyumlu tipler

import type { User, Profession } from "@shared/types";

/**
 * Profile görüntüleme response
 * Backend: GET /api/users/{id} veya GET /api/users/me
 */
export interface ProfileResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  profession: Profession | null;
  isProfessionVerified: boolean;
  professionVerifiedAt: string | null;
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
  lastLoginAt: string | null;
  createdAt: string;
  stats: ProfileStats;
}

/**
 * Profil istatistikleri
 */
export interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

/**
 * Profil güncelleme request
 * Backend: PUT /api/users/me
 */
export interface UpdateProfileRequest {
  name?: string;
  surname?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

/**
 * Avatar yükleme response
 * Backend: POST /api/users/me/avatar
 */
export interface AvatarUploadResponse {
  avatarUrl: string;
  message: string;
}

/**
 * Meslek değiştirme request
 * Backend: PUT /api/users/me/profession
 */
export interface ChangeProfessionRequest {
  professionId: number;
}

/**
 * Şifre değiştirme request
 * Backend: POST /api/auth/change-password
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Hesap silme request
 * Backend: DELETE /api/users/me
 */
export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}

/**
 * Profile store state
 */
export interface ProfileStoreState {
  // Viewed profile (not current user)
  viewedProfile: ProfileResponse | null;
  isLoadingProfile: boolean;

  // Actions
  setViewedProfile: (profile: ProfileResponse | null) => void;
  setLoadingProfile: (loading: boolean) => void;
  clearViewedProfile: () => void;
}

/**
 * Settings item type
 */
export interface SettingsItemType {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: "navigation" | "toggle" | "action" | "danger";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

/**
 * Settings section type
 */
export interface SettingsSectionType {
  title: string;
  items: SettingsItemType[];
}
```

---

### 2. Profile API Service (`services/profileApi.ts`)

```typescript
// src/features/profile/services/profileApi.ts
// Backend UserController, UserProfileController ile %100 uyumlu

import { apiClient, API_ENDPOINTS } from "@core/api";
import type {
  ProfileResponse,
  UpdateProfileRequest,
  AvatarUploadResponse,
  ChangeProfessionRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
} from "../types";

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Profile API Service
 *
 * Endpoints:
 * - GET /api/users/me - Mevcut kullanıcı profili
 * - GET /api/users/{id} - Kullanıcı profili by ID
 * - PUT /api/users/me - Profil güncelle
 * - POST /api/users/me/avatar - Avatar yükle
 * - PUT /api/users/me/profession - Meslek değiştir
 * - DELETE /api/users/me - Hesap sil
 * - POST /api/auth/change-password - Şifre değiştir
 */
export const profileApi = {
  /**
   * GET /api/users/me
   * Mevcut kullanıcının profilini getir
   */
  getMyProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ApiResponse<ProfileResponse>>(
      API_ENDPOINTS.USER.ME
    );
    return response.data.data;
  },

  /**
   * GET /api/users/{id}
   * Kullanıcı profilini ID ile getir
   */
  getProfileById: async (userId: number): Promise<ProfileResponse> => {
    const response = await apiClient.get<ApiResponse<ProfileResponse>>(
      API_ENDPOINTS.USER.BY_ID(userId)
    );
    return response.data.data;
  },

  /**
   * PUT /api/users/me
   * Profil bilgilerini güncelle
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ProfileResponse> => {
    const response = await apiClient.put<ApiResponse<ProfileResponse>>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      data
    );
    return response.data.data;
  },

  /**
   * POST /api/users/me/avatar
   * Avatar fotoğrafı yükle (multipart/form-data)
   */
  uploadAvatar: async (imageUri: string): Promise<AvatarUploadResponse> => {
    const formData = new FormData();

    // React Native'de dosya ekleme
    const filename = imageUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await apiClient.post<ApiResponse<AvatarUploadResponse>>(
      API_ENDPOINTS.USER.UPDATE_AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  /**
   * PUT /api/users/me/profession
   * Mesleği değiştir (yeniden doğrulama gerektirebilir)
   */
  changeProfession: async (
    data: ChangeProfessionRequest
  ): Promise<ProfileResponse> => {
    const response = await apiClient.put<ApiResponse<ProfileResponse>>(
      API_ENDPOINTS.USER.CHANGE_PROFESSION,
      data
    );
    return response.data.data;
  },

  /**
   * POST /api/auth/change-password
   * Şifre değiştir
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  },

  /**
   * DELETE /api/users/me
   * Hesabı sil (soft delete)
   */
  deleteAccount: async (data: DeleteAccountRequest): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT, {
      data: {
        password: data.password,
        reason: data.reason,
      },
    });
  },
};

export default profileApi;
```

---

### 3. Profile Store (`stores/profileStore.ts`)

```typescript
// src/features/profile/stores/profileStore.ts
// Zustand store for profile state management

import { create } from "zustand";
import type { ProfileStoreState, ProfileResponse } from "../types";

/**
 * Profile Store
 * Görüntülenen profil state'ini yönetir (current user değil)
 */
export const useProfileStore = create<ProfileStoreState>((set) => ({
  // State
  viewedProfile: null,
  isLoadingProfile: false,

  // Actions
  setViewedProfile: (profile: ProfileResponse | null) => {
    set({ viewedProfile: profile });
  },

  setLoadingProfile: (loading: boolean) => {
    set({ isLoadingProfile: loading });
  },

  clearViewedProfile: () => {
    set({ viewedProfile: null, isLoadingProfile: false });
  },
}));

// Selectors
export const selectViewedProfile = (state: ProfileStoreState) =>
  state.viewedProfile;
export const selectIsLoadingProfile = (state: ProfileStoreState) =>
  state.isLoadingProfile;

export default useProfileStore;
```

---

### 4. Profile Hooks (`hooks/useProfile.ts`)

```typescript
// src/features/profile/hooks/useProfile.ts
// React Query hook for fetching profile

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../services";
import type { ProfileResponse } from "../types";

/**
 * Query keys
 */
export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  detail: (id: number) => [...profileKeys.all, "detail", id] as const,
};

/**
 * Hook: Mevcut kullanıcı profili
 */
export function useMyProfile() {
  return useQuery<ProfileResponse, Error>({
    queryKey: profileKeys.me(),
    queryFn: profileApi.getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

/**
 * Hook: Kullanıcı profili by ID
 */
export function useProfile(userId: number | undefined) {
  return useQuery<ProfileResponse, Error>({
    queryKey: profileKeys.detail(userId!),
    queryFn: () => profileApi.getProfileById(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
}
```

---

### 5. Update Profile Hook (`hooks/useUpdateProfile.ts`)

```typescript
// src/features/profile/hooks/useUpdateProfile.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../services";
import { profileKeys } from "./useProfile";
import { useAuthStore } from "@features/auth/stores";
import type { UpdateProfileRequest, ProfileResponse } from "../types";

/**
 * Hook: Profil güncelleme
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<ProfileResponse, Error, UpdateProfileRequest>({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      // Cache'i güncelle
      queryClient.setQueryData(profileKeys.me(), data);

      // Auth store'daki user'ı güncelle
      updateUser({
        name: data.name,
        surname: data.surname,
        bio: data.bio,
      });
    },
  });
}

/**
 * Hook: Avatar yükleme
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<{ avatarUrl: string }, Error, string>({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: (data) => {
      // Auth store'daki user'ı güncelle
      updateUser({ avatarUrl: data.avatarUrl });

      // Profile cache'ini invalidate et
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

/**
 * Hook: Şifre değiştirme
 */
export function useChangePassword() {
  return useMutation<
    void,
    Error,
    { currentPassword: string; newPassword: string; confirmPassword: string }
  >({
    mutationFn: profileApi.changePassword,
  });
}

/**
 * Hook: Hesap silme
 */
export function useDeleteAccount() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation<void, Error, { password: string; reason?: string }>({
    mutationFn: profileApi.deleteAccount,
    onSuccess: () => {
      // Kullanıcıyı çıkış yaptır
      logout();
    },
  });
}
```

---

### 6. Profile Hooks Index (`hooks/index.ts`)

```typescript
// src/features/profile/hooks/index.ts

export { useMyProfile, useProfile, profileKeys } from "./useProfile";
export {
  useUpdateProfile,
  useUploadAvatar,
  useChangePassword,
  useDeleteAccount,
} from "./useUpdateProfile";
```

---

## Devam eden dosyalar için bir sonraki mesajda Part 2'yi oluşturacağım.

Bu dosya şunları içerir:

- Profile Types ✅
- Profile API Service ✅
- Profile Store ✅
- Profile Hooks ✅

**Sonraki Part:** Profile Components (ProfileHeader, ProfileStats, EditProfileForm, vb.)
