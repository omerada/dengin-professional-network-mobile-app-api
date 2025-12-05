// src/features/social/types/social.types.ts
// Backend FollowController ve BlockController ile %100 uyumlu tipler
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

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
 * Takipçi/Takip listesi response
 * NOT: Backend şu an List<UserFollowDto> döndürüyor, pagination wrapper YOK
 * Bu interface gelecekte backend pagination eklediğinde kullanılacak
 */
export interface FollowListResponse {
  users: FollowUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

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
