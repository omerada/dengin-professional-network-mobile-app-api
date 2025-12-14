// src/features/profile/services/profileApi.ts
// Backend UserController, UserProfileController ile %100 uyumlu
// Oku: backend/src/main/java/com/dengin/identity/api/UserController.java
// Oku: backend/src/main/java/com/dengin/identity/api/UserProfileController.java

import { apiClient, API_ENDPOINTS } from '@core/api';
import { imageOptimizationService, IMAGE_OPTIMIZATION_PRESETS } from '@shared/services/imageOptimizationService';
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
   * POST /api/users/me/avatar (DEPRECATED - multipart upload)
   *
   * @deprecated Use uploadAvatarWithPresignedUrl() instead (presigned URL pattern)
   * This method will be removed in future versions.
   */
  uploadAvatar: async (imageUri: string): Promise<AvatarUploadResponse> => {
    console.warn(
      'DEPRECATED: uploadAvatar with multipart. Use uploadAvatarWithPresignedUrl instead.',
    );

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
   * Upload avatar using presigned URL pattern (Production-Ready)
   *
   * Flow:
   * 1. Request presigned URL from backend
   * 2. Upload image directly to S3 using presigned URL
   * 3. Confirm upload with backend (validates S3 upload)
   * 4. Backend returns updated user profile with CloudFront URL
   *
   * Benefits:
   * - No file passing through backend (bandwidth optimization)
   * - Direct S3 upload (faster)
   * - CloudFront CDN for image serving
   * - Production-ready security (IAM roles, presigned URLs)
   *
   * Backend: ProfileImageController
   * - POST /api/users/me/avatar/presigned-url
   * - POST /api/users/me/avatar/confirm
   *
   * @param imageUri Local image URI from camera/gallery
   * @param onProgress Progress callback (0-100)
   * @returns Updated user profile with CloudFront avatar URL
   */
  uploadAvatarWithPresignedUrl: async (
    imageUri: string,
    onProgress?: (progress: number) => void,
  ): Promise<MyProfileResponse> => {
    try {Optimize image (reduce file size, improve upload speed)
      console.log('[profileApi] Optimizing avatar image...');
      onProgress?.(5);

      const optimizationResult = await imageOptimizationService.optimizeImage(
        imageUri,
        IMAGE_OPTIMIZATION_PRESETS.AVATAR,
      );

      console.log('[profileApi] Image optimized:', {
        reduction: `${optimizationResult.reductionPercentage}%`,
        originalSize: imageOptimizationService.formatBytes(optimizationResult.originalSize),
        optimizedSize: imageOptimizationService.formatBytes(optimizationResult.optimizedSize),
      });

      // Use optimized image URI
      const optimizedUri = optimizationResult.uri;

      // Step 2: Determine content type (always JPEG after optimization)
      const contentType = 'image/jpeg';

      onProgress?.(15);

      // Step 3: Request presigned URL from backend
      const presignedResponse = await apiClient.post<
        ApiResponse<{
          url: string;
          key: string;
          expiresIn:5);

      // Step 5: Upload directly to S3 via presigned URL (PUT request)
      console.log('[profileApi] Uploading optimized image
      >('/api/users/me/avatar/presigned-url', { contentType });

      const { url: presignedUrl, key: s3Key } = presignedResponse.data.data;

      onProgress?.(35);

      // Step 4: Read optimized image file as blob
      const response = await fetch(optimized
      const response = await fetch(imageUri);
      const blob = await response.blob();

      onProgress?.(50);

      // Step 4: Upload directly to S3 via presigned URL (PUT request)
      console.log('[profileApi] Uploading to S3:', {
        url: presignedUrl,
        contentType,
        blobSize: blob.size,
      });

      // Upload with retry mechanism (network failures are common)
      let uploadResponse: Response | null = null;
      let lastError: Error | null = null;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[profileApi] Upload attempt ${attempt}/${maxRetries}`);

          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': contentType,
              'Content-Length': blob.size.toString(),
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log('[profileApi] S3 Upload response:', {
            attempt,
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
          });

          if (uploadResponse.ok) {
            break; // Success
          }

          // If not successful and not last attempt, retry
          if (attempt < maxRetries) {
            const errorText = await uploadResponse.text();
            console.warn(
              `[profileApi] Upload attempt ${attempt} failed (${uploadResponse.status}): ${errorText}`,
            );
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            continue;
          }

          // Last attempt failed
          const errorText = await uploadResponse.text();
          console.error('[profileApi] S3 Upload failed after all retries:', errorText);
          throw new Error(
            `S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
          );
        } catch (error: any) {
          lastError = error;
          console.warn(`[profileApi] Upload attempt ${attempt} error:`, error.message);

          if (attempt === maxRetries) {
            // All retries exhausted
            throw lastError;
          }

          // Network error, retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      if (!uploadResponse || !uploadResponse.ok) {
        throw lastError || new Error('Upload failed after all retries');
      }

      onProgress?.(80);

      // Step 5: Confirm upload with backend (validates S3 upload)
      const confirmResponse = await apiClient.post<ApiResponse<MyProfileResponse>>(
        '/api/users/me/avatar/confirm',
        { key: s3Key },
      );

      onProgress?.(100);

      console.log('[profileApi] Avatar upload completed successfully');
      return confirmResponse.data.data;
    } catch (error: any) {
      console.error('[profileApi.uploadAvatarWithPresignedUrl] Error:', error);

      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error('Yükleme zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.');
      }

      if (error.message?.includes('Network request failed')) {
        throw new Error('Ağ bağlantısı hatası. LocalStack erişilebilir olduğundan emin olun.');
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Avatar yükleme başarısız. Lütfen tekrar deneyin.',
      );
    }
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
