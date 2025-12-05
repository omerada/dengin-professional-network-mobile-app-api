// src/features/social/services/socialApi.ts
// Backend FollowController ile %100 uyumlu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import { apiClient, API_ENDPOINTS } from '@core/api';
import type { FollowListResponse, FollowResponse, BlockResponse, BlockedUserDto } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Social API Service
 *
 * Endpoints:
 * - POST /api/users/{userId}/follow - Takip et
 * - DELETE /api/users/{userId}/follow - Takipten çık
 * - GET /api/users/{userId}/followers - Takipçileri getir
 * - GET /api/users/{userId}/following - Takip edilenleri getir
 * - POST /api/users/{userId}/block - Engelle
 * - DELETE /api/users/{userId}/block - Engeli kaldır
 */
export const socialApi = {
  /**
   * POST /api/users/{userId}/follow
   * Kullanıcıyı takip et
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
   * Takipçileri getir
   */
  getFollowers: async (userId: number, page = 0, size = 20): Promise<FollowListResponse> => {
    const response = await apiClient.get<ApiResponse<FollowListResponse>>(
      API_ENDPOINTS.SOCIAL.FOLLOWERS(userId),
      { params: { page, size } },
    );
    return response.data.data;
  },

  /**
   * GET /api/users/{userId}/following
   * Takip edilenleri getir
   */
  getFollowing: async (userId: number, page = 0, size = 20): Promise<FollowListResponse> => {
    const response = await apiClient.get<ApiResponse<FollowListResponse>>(
      API_ENDPOINTS.SOCIAL.FOLLOWING(userId),
      { params: { page, size } },
    );
    return response.data.data;
  },

  /**
   * Kullanıcıyı engelle
   * POST /api/users/{userId}/block
   *
   * Backend: BlockController.blockUser()
   * - Kendini engelleyemezsin
   * - Engelleme varolan takip ilişkilerini kaldırır
   * - Engellenen kullanıcı mesaj gönderemez
   *
   * @returns BlockResponse - Güncel engel durumu
   */
  block: async (userId: number, reason?: string): Promise<BlockResponse> => {
    const response = await apiClient.post<ApiResponse<BlockResponse>>(
      API_ENDPOINTS.SOCIAL.BLOCK(userId),
      { reason },
    );
    return response.data.data;
  },

  /**
   * Engeli kaldır
   * DELETE /api/users/{userId}/block
   *
   * Backend: BlockController.unblockUser()
   * - Sadece kendi engellediğin kullanıcıların engelini kaldırabilirsin
   *
   * @returns BlockResponse - Güncel engel durumu
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
   *
   * @returns BlockedUserDto[] - Engellenen kullanıcı listesi
   */
  getBlockedUsers: async (): Promise<BlockedUserDto[]> => {
    const response = await apiClient.get<ApiResponse<BlockedUserDto[]>>('/api/users/me/blocked');
    return response.data.data;
  },
};

export default socialApi;
