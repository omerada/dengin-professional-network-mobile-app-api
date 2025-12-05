// src/features/social/services/socialApi.ts
// Backend FollowController ve BlockController ile %100 uyumlu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import { apiClient, API_ENDPOINTS } from '@core/api';
import type {
  FollowUser,
  FollowResponse,
  BlockResponse,
  BlockedUserDto,
  FollowListResponse,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Backend UserFollowDto - PagedResponse<UserFollowDto> içinde döner
 */
interface BackendUserFollowDto {
  userId: number;
  fullName: string;
  profileImageUrl: string | null;
  professionId: number | null;
  professionName: string | null;
  verified: boolean;
  followerCount: number;
  followingCount: number;
}

/**
 * Backend PagedResponse<UserFollowDto>
 */
interface BackendFollowListResponse {
  content: BackendUserFollowDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Backend response'u FollowUser'a dönüştür
 */
function mapToFollowUser(dto: BackendUserFollowDto): FollowUser {
  return {
    id: dto.userId,
    name: dto.fullName.split(' ')[0] || '',
    surname: dto.fullName.split(' ').slice(1).join(' ') || '',
    fullName: dto.fullName,
    avatarUrl: dto.profileImageUrl,
    profession: dto.professionId
      ? {
          id: dto.professionId,
          name: dto.professionName || '',
        }
      : null,
    isProfessionVerified: dto.verified,
    isFollowing: false, // Backend'den gelmiyor, ayrı endpoint'ten kontrol edilmeli
    isFollowedBy: false, // Backend'den gelmiyor
  };
}

/**
 * Backend PagedResponse'u FollowListResponse'a dönüştür
 */
function mapToFollowListResponse(response: BackendFollowListResponse): FollowListResponse {
  return {
    content: response.content.map(mapToFollowUser),
    page: response.page,
    size: response.size,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    hasNext: response.hasNext,
    hasPrevious: response.hasPrevious,
  };
}

/**
 * Social API Service
 *
 * Endpoints:
 * - POST /api/users/{userId}/follow - Takip et
 * - DELETE /api/users/{userId}/follow - Takipten çık
 * - GET /api/users/{userId}/followers - Takipçileri getir (PagedResponse döner)
 * - GET /api/users/{userId}/following - Takip edilenleri getir (PagedResponse döner)
 * - POST /api/users/{userId}/block - Engelle
 * - DELETE /api/users/{userId}/block - Engeli kaldır
 */
export const socialApi = {
  /**
   * POST /api/users/{userId}/follow
   * Kullanıcıyı takip et
   *
   * Backend Response: FollowResponse record
   * - userId: Long
   * - following: boolean (NOT: isFollowing!)
   * - followerCount: long
   * - followingCount: long
   */
  follow: async (userId: number): Promise<FollowResponse> => {
    const response = await apiClient.post<ApiResponse<FollowResponse>>(
      API_ENDPOINTS.SOCIAL.FOLLOW(userId),
    );
    return response.data.data;
  },

  /**
   * DELETE /api/users/{userId}/follow
   * Takipten çık
   */
  unfollow: async (userId: number): Promise<FollowResponse> => {
    const response = await apiClient.delete<ApiResponse<FollowResponse>>(
      API_ENDPOINTS.SOCIAL.UNFOLLOW(userId),
    );
    return response.data.data;
  },

  /**
   * GET /api/users/{userId}/followers
   * Takipçileri getir - PagedResponse döner
   *
   * @param userId Kullanıcı ID
   * @param page Sayfa numarası (0-indexed)
   * @param size Sayfa boyutu (max 50)
   * @returns PagedResponse<FollowUser>
   */
  getFollowers: async (userId: number, page = 0, size = 20): Promise<FollowListResponse> => {
    const response = await apiClient.get<ApiResponse<BackendFollowListResponse>>(
      API_ENDPOINTS.SOCIAL.FOLLOWERS(userId),
      { params: { page, size } },
    );
    return mapToFollowListResponse(response.data.data);
  },

  /**
   * GET /api/users/{userId}/following
   * Takip edilenleri getir - PagedResponse döner
   *
   * @param userId Kullanıcı ID
   * @param page Sayfa numarası (0-indexed)
   * @param size Sayfa boyutu (max 50)
   * @returns PagedResponse<FollowUser>
   */
  getFollowing: async (userId: number, page = 0, size = 20): Promise<FollowListResponse> => {
    const response = await apiClient.get<ApiResponse<BackendFollowListResponse>>(
      API_ENDPOINTS.SOCIAL.FOLLOWING(userId),
      { params: { page, size } },
    );
    return mapToFollowListResponse(response.data.data);
  },

  /**
   * Kullanıcıyı engelle
   * POST /api/users/{userId}/block
   *
   * Backend: BlockController.blockUser()
   * Response: BlockResponse record
   * - userId: Long
   * - blocked: boolean (NOT: isBlocked!)
   * - message: String
   */
  block: async (userId: number, reason?: string): Promise<BlockResponse> => {
    const response = await apiClient.post<ApiResponse<BlockResponse>>(
      API_ENDPOINTS.SOCIAL.BLOCK(userId),
      reason ? { reason } : undefined,
    );
    return response.data.data;
  },

  /**
   * Engeli kaldır
   * DELETE /api/users/{userId}/block
   */
  unblock: async (userId: number): Promise<BlockResponse> => {
    const response = await apiClient.delete<ApiResponse<BlockResponse>>(
      API_ENDPOINTS.SOCIAL.UNBLOCK(userId),
    );
    return response.data.data;
  },

  /**
   * Engellenen kullanıcıları getir
   * GET /api/users/me/blocked
   *
   * Backend: BlockController.getBlockedUsers()
   */
  getBlockedUsers: async (): Promise<BlockedUserDto[]> => {
    const response = await apiClient.get<ApiResponse<BlockedUserDto[]>>('/api/users/me/blocked');
    return response.data.data;
  },
};

export default socialApi;
