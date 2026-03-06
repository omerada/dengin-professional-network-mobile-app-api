// src/features/profile/types/profile.types.ts
// Backend API ile %100 uyumlu tipler
// Backend: UserResponse, UserProfileResponse, UpdateProfileRequest

import type { Sector } from '@shared/types/api.types';

/**
 * Profession bilgisi
 * Backend: ProfessionResponse
 */
export interface Profession {
  id: number;
  name: string;
  category: string;
  categoryDisplayName?: string;
  description?: string;
  requiresVerification: boolean;
  requiredDocuments?: string[];
}

/**
 * Kullanıcı statüsü
 * Backend: UserStatus enum
 */
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';

/**
 * Cinsiyet
 * Backend: Gender enum
 */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

/**
 * OAuth provider
 * Backend: OAuthProvider enum
 */
export type OAuthProvider = 'LOCAL' | 'GOOGLE' | 'APPLE';

/**
 * Profile istatistikleri
 * Backend: Social Context - FollowStats
 */
export interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

/**
 * Profile görüntüleme response
 * Backend: GET /api/users/{id} - UserProfileResponse
 */
export interface ProfileResponse {
  userId: number;
  email: string | null;
  name: string;
  surname: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;

  // Profession
  professionId: number | null;
  professionName: string | null;
  professionCategory: string | null;
  isProfessionVerified: boolean;
  professionVerifiedAt: string | null;

  // Status
  status: UserStatus;
  isProfileComplete: boolean;
  isEmailVerified: boolean;

  // Timestamps
  createdAt: string;
  lastLoginAt: string | null;
  lastActiveAt: string | null;

  // OAuth
  oauthProvider: OAuthProvider | null;

  // Social stats (optional - from follow service)
  stats?: ProfileStats;

  // Relationship with current user (optional)
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  isBlocked?: boolean;
}

/**
 * Kendi profil response
 * Backend: GET /api/users/me - UserResponse
 */
export interface MyProfileResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;

  // Profession & Sector
  profession: Profession | null;
  sector: Sector | null;
  isProfessionVerified: boolean;
  professionVerifiedAt: string | null;

  // Status
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  status: UserStatus;

  // Activity
  lastLoginAt: string | null;
  createdAt: string;

  // Stats
  stats?: ProfileStats;
}

/**
 * Profil güncelleme request
 * Backend: PUT /api/users/me - UpdateProfileRequest
 */
export interface UpdateProfileRequest {
  name?: string;
  surname?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: Gender;
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
  type: 'navigation' | 'toggle' | 'action' | 'danger';
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
