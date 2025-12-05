// src/features/profile/services/profileApi.ts
// Backend UserController, UserProfileController ile %100 uyumlu
// Oku: backend/src/main/java/com/meslektas/identity/api/UserController.java
// Oku: backend/src/main/java/com/meslektas/identity/api/UserProfileController.java

import { apiClient, API_ENDPOINTS } from '@core/api';
import type {
  MyProfileResponse,
  ProfileResponse,
  UpdateProfileRequest,
  AvatarUploadResponse,
  ChangeProfessionRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  ProfileStats,
} from '../types';

/**
 * API Response wrapper
 * Backend: ApiResponse<T>
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * Profile API Service
 *
 * Endpoints (Backend ile uyumlu):
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
   *
   * Backend: UserController.getCurrentUser()
   */
  getMyProfile: async (): Promise<MyProfileResponse> => {
    const response = await apiClient.get<ApiResponse<MyProfileResponse>>(API_ENDPOINTS.USER.ME);
    return response.data.data;
  },

  /**
   * GET /api/users/{id}
   * Kullanıcı profilini ID ile getir
   *
   * Backend: UserProfileController.getUserProfile()
   */
  getProfileById: async (userId: number): Promise<ProfileResponse> => {
    const response = await apiClient.get<ApiResponse<ProfileResponse>>(
      API_ENDPOINTS.USER.BY_ID(userId),
    );
    return response.data.data;
  },

  /**
   * PUT /api/users/me
   * Profil bilgilerini güncelle
   *
   * Backend: UserController.updateProfile()
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<MyProfileResponse> => {
    const response = await apiClient.put<ApiResponse<MyProfileResponse>>(
      API_ENDPOINTS.USER.UPDATE_PROFILE,
      data,
    );
    return response.data.data;
  },

  /**
   * POST /api/users/me/avatar
   * Avatar fotoğrafı yükle (multipart/form-data)
   *
   * Backend: UserController.uploadAvatar()
   * Note: Max 5MB, JPEG/PNG/WebP accepted
   */
  uploadAvatar: async (imageUri: string): Promise<AvatarUploadResponse> => {
    const formData = new FormData();

    // React Native'de dosya ekleme
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as unknown as Blob);

    const response = await apiClient.post<ApiResponse<AvatarUploadResponse>>(
      API_ENDPOINTS.USER.UPDATE_AVATAR,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data.data;
  },

  /**
   * DELETE /api/users/me/avatar
   * Avatar fotoğrafını sil
   */
  deleteAvatar: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USER.UPDATE_AVATAR);
  },

  /**
   * PUT /api/users/me/profession
   * Mesleği değiştir
   *
   * Backend: UserController.changeProfession()
   * Note: Verified professions cannot be changed (BR-003)
   */
  changeProfession: async (data: ChangeProfessionRequest): Promise<MyProfileResponse> => {
    const response = await apiClient.put<ApiResponse<MyProfileResponse>>(
      API_ENDPOINTS.USER.CHANGE_PROFESSION,
      data,
    );
    return response.data.data;
  },

  /**
   * POST /api/auth/change-password
   * Şifre değiştir (authenticated users only)
   *
   * Backend: AuthController.changePassword()
   *
   * Validation:
   * - Mevcut şifre doğru olmalı
   * - Yeni şifre mevcut şifreden farklı olmalı
   * - Yeni şifre en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword || data.newPassword,
    });
  },

  /**
   * DELETE /api/users/me
   * Hesabı sil (soft delete)
   *
   * Backend: UserController.deleteAccount()
   */
  deleteAccount: async (data: DeleteAccountRequest): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT, {
      data: {
        password: data.password,
        reason: data.reason,
      },
    });
  },

  /**
   * GET /api/users/{id}
   * Kullanıcı istatistiklerini getir
   *
   * NOT: Backend'de ayrı /stats endpoint'i yok!
   * Stats bilgisi kullanıcı response'unun içinde geliyor.
   * Bu fonksiyon kullanıcı bilgilerinden stats'ı çıkarıyor.
   *
   * Backend: UserController.getUserById() → UserResponse.stats
   */
  getProfileStats: async (userId: number): Promise<ProfileStats> => {
    // Backend'de ayrı stats endpoint'i yok, user response'dan al
    const response = await apiClient.get<ApiResponse<ProfileResponse>>(
      API_ENDPOINTS.USER.BY_ID(userId),
    );
    const user = response.data.data;

    // Stats yoksa default değerler döndür
    return (
      user.stats || {
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
      }
    );
  },
};

export default profileApi;
