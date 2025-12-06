// src/features/profile/hooks/useUpdateProfile.ts
// React Query mutation hooks for profile updates
// Oku: mobile-development-guide/state/15-REACT-QUERY.md

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../services';
import { profileKeys } from './useProfile';
import { useAuthStore } from '@features/auth/stores';
import type {
  UpdateProfileRequest,
  MyProfileResponse,
  AvatarUploadResponse,
  ChangePasswordRequest,
  DeleteAccountRequest,
  ChangeProfessionRequest,
} from '../types';

/**
 * Hook: Profil güncelleme
 *
 * Backend: PUT /api/users/me
 *
 * @returns Mutation for updating profile
 *
 * @example
 * ```tsx
 * const { mutate: updateProfile, isPending } = useUpdateProfile();
 *
 * updateProfile({
 *   name: 'Yeni İsim',
 *   bio: 'Yeni bio',
 * }, {
 *   onSuccess: () => console.log('Profil güncellendi'),
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore(state => state.updateUser);

  return useMutation<MyProfileResponse, Error, UpdateProfileRequest>({
    mutationFn: profileApi.updateProfile,
    onSuccess: data => {
      // React Query cache'i güncelle
      queryClient.setQueryData(profileKeys.me(), data);

      // Auth store'daki user'ı güncelle
      updateUser({
        name: data.name,
        surname: data.surname,
        bio: data.bio ?? undefined,
      });
    },
    onError: error => {
      console.error('[useUpdateProfile] Error:', error);
    },
  });
}

/**
 * Hook: Avatar yükleme (DEPRECATED - multipart upload)
 *
 * @deprecated Use useUploadAvatarWithPresignedUrl() instead
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore(state => state.updateUser);

  return useMutation<AvatarUploadResponse, Error, string>({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: data => {
      // Auth store'daki user'ı güncelle
      updateUser({ avatarUrl: data.avatarUrl });

      // Profile cache'ini invalidate et
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
    onError: error => {
      console.error('[useUploadAvatar] Error:', error);
    },
  });
}

/**
 * Hook: Avatar yükleme (Presigned URL Pattern) - Production-Ready
 *
 * Backend:
 * - POST /api/users/me/avatar/presigned-url (Step 1)
 * - POST /api/users/me/avatar/confirm (Step 2)
 *
 * Flow:
 * 1. Request presigned URL from backend
 * 2. Upload image directly to S3 using presigned URL
 * 3. Confirm upload with backend (validates S3 upload)
 * 4. Backend returns updated user profile with CloudFront URL
 *
 * @returns Mutation for uploading avatar with progress tracking
 *
 * @example
 * ```tsx
 * const { mutate: uploadAvatar, isPending, progress } = useUploadAvatarWithPresignedUrl();
 *
 * uploadAvatar(imageUri, {
 *   onSuccess: (data) => console.log('Avatar URL:', data.avatarUrl),
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export function useUploadAvatarWithPresignedUrl() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore(state => state.updateUser);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const mutation = useMutation<
    MyProfileResponse,
    Error,
    { imageUri: string; onProgress?: (progress: number) => void }
  >({
    mutationFn: async ({ imageUri, onProgress }) => {
      const internalProgress = (progress: number) => {
        setUploadProgress(progress);
        onProgress?.(progress);
      };

      return profileApi.uploadAvatarWithPresignedUrl(imageUri, internalProgress);
    },
    onSuccess: data => {
      // Auth store'daki user'ı güncelle
      updateUser({ avatarUrl: data.avatarUrl ?? undefined });

      // Profile cache'ini güncelle
      queryClient.setQueryData(profileKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });

      // Progress'i sıfırla
      setUploadProgress(0);
    },
    onError: error => {
      console.error('[useUploadAvatarWithPresignedUrl] Error:', error);
      setUploadProgress(0);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
}

/**
 * Hook: Avatar silme
 *
 * Backend: DELETE /api/users/me/avatar
 *
 * @returns Mutation for deleting avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore(state => state.updateUser);

  return useMutation<void, Error, void>({
    mutationFn: profileApi.deleteAvatar,
    onSuccess: () => {
      // Auth store'daki avatarUrl'i temizle
      updateUser({ avatarUrl: undefined });

      // Profile cache'ini invalidate et
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
    onError: error => {
      console.error('[useDeleteAvatar] Error:', error);
    },
  });
}

/**
 * Hook: Meslek değiştirme
 *
 * Backend: PUT /api/users/me/profession
 * Note: Verified professions cannot be changed (BR-003)
 *
 * @returns Mutation for changing profession
 */
export function useChangeProfession() {
  const queryClient = useQueryClient();

  return useMutation<MyProfileResponse, Error, ChangeProfessionRequest>({
    mutationFn: profileApi.changeProfession,
    onSuccess: data => {
      // Cache'i güncelle
      queryClient.setQueryData(profileKeys.me(), data);
    },
    onError: error => {
      console.error('[useChangeProfession] Error:', error);
    },
  });
}

/**
 * Hook: Şifre değiştirme
 *
 * Backend: POST /api/auth/change-password
 *
 * @returns Mutation for changing password
 *
 * @example
 * ```tsx
 * const { mutate: changePassword, isPending, isSuccess } = useChangePassword();
 *
 * changePassword({
 *   currentPassword: 'old123',
 *   newPassword: 'new456',
 *   confirmPassword: 'new456',
 * });
 * ```
 */
export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: profileApi.changePassword,
    onError: error => {
      console.error('[useChangePassword] Error:', error);
    },
  });
}

/**
 * Hook: Hesap silme
 *
 * Backend: DELETE /api/users/me
 *
 * @returns Mutation for deleting account
 *
 * @example
 * ```tsx
 * const { mutate: deleteAccount, isPending } = useDeleteAccount();
 *
 * deleteAccount({
 *   password: 'user123',
 *   reason: 'Artık kullanmıyorum',
 * });
 * ```
 */
export function useDeleteAccount() {
  const logout = useAuthStore(state => state.logout);

  return useMutation<void, Error, DeleteAccountRequest>({
    mutationFn: profileApi.deleteAccount,
    onSuccess: () => {
      // Kullanıcıyı çıkış yaptır
      logout();
    },
    onError: error => {
      console.error('[useDeleteAccount] Error:', error);
    },
  });
}
