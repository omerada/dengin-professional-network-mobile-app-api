// src/features/social/types/social.types.ts
// Backend FollowController ve BlockController ile %100 uyumlu tipler
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import type { PagedResponse } from '@shared/types';

/**
 * Takipçi/Takip edilen kullanıcı
 * Backend: UserFollowDto
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
 * Takipçi/Takip listesi response - Backend PagedResponse<UserFollowDto> ile %100 uyumlu
 * GET /api/users/{userId}/followers ve GET /api/users/{userId}/following
 *
 * Backend artık PagedResponse wrapper döndürüyor:
 * - page: Mevcut sayfa (0-indexed)
 * - size: Sayfa boyutu
 * - totalElements: Toplam eleman sayısı
 * - totalPages: Toplam sayfa sayısı
 * - hasNext: Sonraki sayfa var mı
 * - hasPrevious: Önceki sayfa var mı
 */
export type FollowListResponse = PagedResponse<FollowUser>;

/**
 * Follow/Unfollow response - Backend FollowResponse record ile %100 uyumlu
 * POST/DELETE /api/users/{userId}/follow
 *
 * Backend response:
 * - userId: Long - Takip edilen kullanıcı ID'si
 * - following: boolean - Takip durumu (NOT: isFollowing değil!)
 * - followerCount: long - Takipçi sayısı
 * - followingCount: long - Takip edilen sayısı
 */
export interface FollowResponse {
  userId: number;
  following: boolean;
  followerCount: number;
  followingCount: number;
}

/**
 * Block response - Backend BlockResponse record ile %100 uyumlu
 * POST/DELETE /api/users/{userId}/block
 *
 * Backend response:
 * - userId: Long - Engellenen kullanıcı ID'si
 * - blocked: boolean - Engel durumu (NOT: isBlocked değil!)
 * - message: String - İşlem mesajı
 */
export interface BlockResponse {
  userId: number;
  blocked: boolean;
  message: string;
}

/**
 * Blocked user DTO - Backend BlockedUserDto ile uyumlu
 * GET /api/users/me/blocked
 */
export interface BlockedUserDto {
  userId: number;
  fullName: string;
  avatarUrl?: string;
  profession?: string;
  blockedAt: string;
}
