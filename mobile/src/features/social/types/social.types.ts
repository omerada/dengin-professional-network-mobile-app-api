// src/features/social/types/social.types.ts
// Backend FollowController ile uyumlu tipler
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

/**
 * Takipçi/Takip edilen kullanıcı
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
 */
export interface FollowListResponse {
  users: FollowUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Follow/Unfollow response
 */
export interface FollowResponse {
  success: boolean;
  isFollowing: boolean;
  followerCount: number;
}

/**
 * Block response
 */
export interface BlockResponse {
  success: boolean;
  isBlocked: boolean;
}
