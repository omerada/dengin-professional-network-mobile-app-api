// src/features/feed/services/feedService.ts
// Feed API servisi
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  Post,
  FeedResponse,
  CommentListResponse,
  Comment,
  CreatePostRequest,
  CreatePostDto,
  CreateCommentDto,
  AddCommentRequest,
  UpdatePostDto,
  FeedFilter,
  LikeResponse,
} from '../types';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Feed API servisi
 */
export const feedService = {
  /**
   * Personalized feed getir
   * GET /api/feed?limit=20&professionFilter={professionId}
   */
  async getFeed(page = 0, limit = 20, professionFilter?: number): Promise<FeedResponse> {
    const response = await apiClient.get<ApiResponse<FeedResponse>>(
      API_ENDPOINTS.FEED.PERSONALIZED,
      {
        params: { page, limit, professionFilter },
      },
    );
    return response.data.data;
  },

  /**
   * Trending postları getir
   * GET /api/feed/trending?limit=20
   */
  async getTrendingFeed(limit = 20): Promise<FeedResponse> {
    const response = await apiClient.get<ApiResponse<FeedResponse>>(API_ENDPOINTS.FEED.TRENDING, {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Post detay getir
   * GET /api/posts/{postId}
   */
  async getPost(postId: number): Promise<Post> {
    const response = await apiClient.get<ApiResponse<Post>>(API_ENDPOINTS.FEED.POST_BY_ID(postId));
    return response.data.data;
  },

  /**
   * Post oluştur
   * POST /api/posts
   */
  async createPost(data: CreatePostRequest): Promise<Post> {
    const response = await apiClient.post<ApiResponse<Post>>(API_ENDPOINTS.FEED.CREATE_POST, data);
    return response.data.data;
  },

  /**
   * Post güncelle
   */
  async updatePost(postId: number, dto: UpdatePostDto): Promise<Post> {
    const response = await apiClient.put<ApiResponse<Post>>(
      API_ENDPOINTS.FEED.UPDATE_POST(postId),
      dto,
    );
    return response.data.data;
  },

  /**
   * Post sil
   * DELETE /api/posts/{postId}
   */
  async deletePost(postId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.FEED.DELETE_POST(postId));
  },

  /**
   * Post beğen
   * POST /api/posts/{postId}/like
   */
  async likePost(postId: number): Promise<LikeResponse> {
    const response = await apiClient.post<ApiResponse<LikeResponse>>(
      API_ENDPOINTS.FEED.LIKE_POST(postId),
    );
    return response.data.data;
  },

  /**
   * Post beğenmekten vazgeç
   * DELETE /api/posts/{postId}/like
   */
  async unlikePost(postId: number): Promise<LikeResponse> {
    const response = await apiClient.delete<ApiResponse<LikeResponse>>(
      API_ENDPOINTS.FEED.UNLIKE_POST(postId),
    );
    return response.data.data;
  },

  /**
   * Post kaydet
   * POST /api/posts/{postId}/save
   */
  async savePost(postId: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.FEED.SAVE_POST(postId));
  },

  /**
   * Post kaydı kaldır
   * DELETE /api/posts/{postId}/save
   */
  async unsavePost(postId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.FEED.UNSAVE_POST(postId));
  },

  /**
   * Post raporla
   */
  async reportPost(postId: number, reason: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.FEED.REPORT_POST(postId), { reason });
  },

  /**
   * Yorumları getir
   * GET /api/posts/{postId}/comments?page=0&size=20
   */
  async getComments(postId: number, page = 0, size = 20): Promise<CommentListResponse> {
    const response = await apiClient.get<ApiResponse<CommentListResponse>>(
      API_ENDPOINTS.COMMENTS.BY_POST(postId),
      { params: { page, size } },
    );
    return response.data.data;
  },

  /**
   * Yorum ekle
   * POST /api/posts/{postId}/comments
   */
  async addComment(postId: number, data: AddCommentRequest): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>(
      API_ENDPOINTS.COMMENTS.CREATE(postId),
      data,
    );
    return response.data.data;
  },

  /**
   * Yorum sil
   * DELETE /api/posts/{postId}/comments/{commentId}
   */
  async deleteComment(postId: number, commentId: string): Promise<void> {
    await apiClient.delete(`/api/posts/${postId}/comments/${commentId}`);
  },

  /**
   * Yorum beğen
   * POST /api/posts/{postId}/comments/{commentId}/like
   */
  async likeComment(postId: number, commentId: string): Promise<void> {
    await apiClient.post(`/api/posts/${postId}/comments/${commentId}/like`);
  },

  /**
   * Yorum beğenmekten vazgeç
   * DELETE /api/posts/{postId}/comments/{commentId}/like
   */
  async unlikeComment(postId: number, commentId: string): Promise<void> {
    await apiClient.delete(`/api/posts/${postId}/comments/${commentId}/like`);
  },

  /**
   * Kayıtlı postları getir
   * GET /api/posts/saved
   */
  async getSavedPosts(page = 0, limit = 20): Promise<FeedResponse> {
    const response = await apiClient.get<ApiResponse<FeedResponse>>(API_ENDPOINTS.FEED.SAVED, {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Kullanıcının postlarını getir
   */
  async getUserPosts(userId: number, page = 0, limit = 20): Promise<FeedResponse> {
    const response = await apiClient.get<ApiResponse<FeedResponse>>(
      API_ENDPOINTS.FEED.USER_POSTS(userId),
      { params: { page, limit } },
    );
    return response.data.data;
  },

  /**
   * Post paylaş
   */
  async sharePost(postId: number): Promise<{ sharesCount: number }> {
    const response = await apiClient.post<ApiResponse<{ sharesCount: number }>>(
      API_ENDPOINTS.FEED.SHARE_POST(postId),
    );
    return response.data.data;
  },
};

export default feedService;
