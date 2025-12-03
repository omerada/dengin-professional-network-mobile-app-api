// src/features/feed/services/feedService.ts
// Feed API servisi
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  Post,
  FeedResponse,
  CommentsResponse,
  Comment,
  CreatePostDto,
  CreateCommentDto,
  UpdatePostDto,
  FeedFilter,
} from '../types';

/**
 * Feed API servisi
 */
export const feedService = {
  /**
   * Feed getir (cursor pagination)
   */
  async getFeed(cursor?: string, filter: FeedFilter = 'all', limit = 20): Promise<FeedResponse> {
    const response = await apiClient.get<{ data: FeedResponse }>(API_ENDPOINTS.FEED.LIST, {
      params: { cursor, filter, limit },
    });
    return response.data.data;
  },

  /**
   * Post detay getir
   */
  async getPost(postId: string): Promise<Post> {
    const response = await apiClient.get<{ data: Post }>(
      API_ENDPOINTS.FEED.POST_BY_ID(postId)
    );
    return response.data.data;
  },

  /**
   * Post oluştur
   */
  async createPost(dto: CreatePostDto, imageUrls: string[]): Promise<Post> {
    const response = await apiClient.post<{ data: Post }>(API_ENDPOINTS.FEED.CREATE_POST, {
      content: dto.content,
      imageUrls,
    });
    return response.data.data;
  },

  /**
   * Post güncelle
   */
  async updatePost(postId: string, dto: UpdatePostDto): Promise<Post> {
    const response = await apiClient.put<{ data: Post }>(
      API_ENDPOINTS.FEED.UPDATE_POST(postId),
      dto
    );
    return response.data.data;
  },

  /**
   * Post sil
   */
  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.FEED.DELETE_POST(postId));
  },

  /**
   * Post beğen
   */
  async likePost(postId: string): Promise<{ likesCount: number }> {
    const response = await apiClient.post<{ data: { likesCount: number } }>(
      API_ENDPOINTS.FEED.LIKE_POST(postId)
    );
    return response.data.data;
  },

  /**
   * Post beğenmekten vazgeç
   */
  async unlikePost(postId: string): Promise<{ likesCount: number }> {
    const response = await apiClient.delete<{ data: { likesCount: number } }>(
      API_ENDPOINTS.FEED.UNLIKE_POST(postId)
    );
    return response.data.data;
  },

  /**
   * Post kaydet
   */
  async bookmarkPost(postId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.FEED.BOOKMARK_POST(postId));
  },

  /**
   * Post raporla
   */
  async reportPost(postId: string, reason: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.FEED.REPORT_POST(postId), { reason });
  },

  /**
   * Yorumları getir
   */
  async getComments(postId: string, cursor?: string, limit = 20): Promise<CommentsResponse> {
    const response = await apiClient.get<{ data: CommentsResponse }>(
      API_ENDPOINTS.COMMENTS.BY_POST(postId),
      { params: { cursor, limit } }
    );
    return response.data.data;
  },

  /**
   * Yorum ekle
   */
  async addComment(dto: CreateCommentDto): Promise<Comment> {
    const response = await apiClient.post<{ data: Comment }>(
      API_ENDPOINTS.COMMENTS.CREATE(dto.postId),
      { content: dto.content, parentId: dto.parentId }
    );
    return response.data.data;
  },

  /**
   * Yorum sil
   */
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));
  },

  /**
   * Yorum beğen
   */
  async likeComment(commentId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.COMMENTS.LIKE(commentId));
  },

  /**
   * Yorum beğenmekten vazgeç
   */
  async unlikeComment(commentId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COMMENTS.UNLIKE(commentId));
  },

  /**
   * Kayıtlı postları getir
   */
  async getBookmarkedPosts(cursor?: string, limit = 20): Promise<FeedResponse> {
    const response = await apiClient.get<{ data: FeedResponse }>(
      API_ENDPOINTS.FEED.BOOKMARKED,
      { params: { cursor, limit } }
    );
    return response.data.data;
  },

  /**
   * Kullanıcının postlarını getir
   */
  async getUserPosts(userId: string, cursor?: string, limit = 20): Promise<FeedResponse> {
    const response = await apiClient.get<{ data: FeedResponse }>(
      API_ENDPOINTS.FEED.USER_POSTS(userId),
      { params: { cursor, limit } }
    );
    return response.data.data;
  },

  /**
   * Post paylaş
   */
  async sharePost(postId: string): Promise<{ sharesCount: number }> {
    const response = await apiClient.post<{ data: { sharesCount: number } }>(
      API_ENDPOINTS.FEED.SHARE_POST(postId)
    );
    return response.data.data;
  },
};

export default feedService;
