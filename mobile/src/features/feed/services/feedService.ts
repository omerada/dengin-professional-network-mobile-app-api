// src/features/feed/services/feedService.ts
// Feed API servisi - Backend FeedController, PostController, CommentController ile %100 uyumlu
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  Post,
  FeedResponse,
  CommentListResponse,
  Comment,
  CreatePostRequest,
  AddCommentRequest,
  UpdatePostDto,
  LikeResponse,
  CommentLikeResponse,
} from '../types';

/**
 * API Response wrapper - Backend ApiResponse<T> formatı
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Backend FeedPostResponse - AuthorDto nested object içerir
 */
interface BackendFeedPostResponse {
  id: number;
  postId: string; // UUID format
  author: {
    userId: number;
    fullName: string;
    profileImageUrl: string | null;
    professionId: number | null;
    professionName: string | null;
    verified: boolean;
  };
  content: string;
  images: Array<{
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
  }>;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  relevanceScore?: number;
  createdAt: string;
}

/**
 * Backend response'u Post'a dönüştür
 * NOT: Backend FeedPostResponse, Mobile Post tipinden farklı yapıda
 */
function mapToPost(response: BackendFeedPostResponse): Post {
  return {
    postId: response.id,
    author: {
      id: response.author.userId,
      name: response.author.fullName.split(' ')[0] || '',
      surname: response.author.fullName.split(' ').slice(1).join(' ') || '',
      avatarUrl: response.author.profileImageUrl || undefined,
      isVerified: response.author.verified,
      profession: response.author.professionName || undefined,
    },
    content: response.content,
    images: response.images.map(img => img.url),
    stats: {
      likeCount: response.likeCount,
      commentCount: response.commentCount,
      viewCount: 0, // Backend'den gelmiyor
    },
    userInteraction: {
      isLiked: response.liked,
      isSaved: false, // Backend'den ayrı endpoint'ten alınmalı
    },
    createdAt: response.createdAt,
    updatedAt: response.createdAt, // Backend'den gelmiyor
  };
}

/**
 * Backend PagedResponse<FeedPostResponse> yapısı
 * ÖNEMLİ: Backend artık PagedResponse döndürüyor!
 */
interface BackendPagedFeedResponse {
  content: BackendFeedPostResponse[];
  page?: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
  hasNext: boolean;
  hasPrevious?: boolean;
  lastId?: number;
}

/**
 * Feed list response - Mobile tarafında kullanılan response
 */
interface FeedListResponse {
  posts: Post[];
  hasMore: boolean;
  lastId?: number;
}

/**
 * Feed API servisi
 *
 * Backend Controllers:
 * - FeedController: /api/feed/* (personalized, trending)
 * - PostController: /api/posts/* (CRUD, like/unlike)
 * - CommentController: /api/posts/{postId}/comments/* (CRUD)
 *
 * Cursor-based pagination desteklenir:
 * - beforeId: Son post ID'sinden önceki postları getir
 *
 * ÖNEMLİ: Backend PagedResponse<FeedPostResponse> döndürüyor!
 */
export const feedService = {
  /**
   * Personalized feed getir
   * GET /api/feed?limit=20&professionFilter={professionId}&beforeId={lastPostId}
   *
   * Backend: FeedController.getFeed()
   * - limit: Max results (max 50, default 20)
   * - professionFilter: Optional profession ID filter
   * - beforeId: Optional cursor for pagination (get posts before this ID)
   *
   * Backend PagedResponse<FeedPostResponse> döndürüyor
   */
  async getFeed(
    limit = 20,
    professionFilter?: number,
    beforeId?: number,
  ): Promise<FeedListResponse> {
    const response = await apiClient.get<ApiResponse<BackendPagedFeedResponse>>(
      API_ENDPOINTS.FEED.PERSONALIZED,
      {
        params: {
          limit: Math.min(limit, 50),
          professionFilter,
          beforeId,
        },
      },
    );
    const pagedData = response.data.data;
    const posts = pagedData.content.map(mapToPost);
    return {
      posts,
      hasMore: pagedData.hasNext,
      lastId: pagedData.lastId,
    };
  },

  /**
   * Trending postları getir
   * GET /api/feed/trending?limit=20
   *
   * Backend: FeedController.getTrendingPosts()
   * - limit: Max results (max 50, default 20)
   *
   * Trending Score = (likes × 2) + (comments × 5)
   * Son 7 günlük postlar dahil edilir.
   * Backend PagedResponse<FeedPostResponse> döndürüyor
   */
  async getTrendingFeed(limit = 20): Promise<FeedListResponse> {
    const response = await apiClient.get<ApiResponse<BackendPagedFeedResponse>>(
      API_ENDPOINTS.FEED.TRENDING,
      { params: { limit: Math.min(limit, 50) } },
    );
    const pagedData = response.data.data;
    const posts = pagedData.content.map(mapToPost);
    return {
      posts,
      hasMore: pagedData.hasNext,
      lastId: pagedData.lastId,
    };
  },

  /**
   * Post detay getir
   * GET /api/posts/{postId}
   */
  async getPost(postId: number): Promise<Post> {
    const response = await apiClient.get<ApiResponse<BackendFeedPostResponse>>(
      API_ENDPOINTS.FEED.POST_BY_ID(postId),
    );
    return mapToPost(response.data.data);
  },

  /**
   * Post oluştur
   * POST /api/posts
   *
   * Backend beklentisi (CreatePostRequest.java):
   * - professionId: Long (ZORUNLU! @NotNull)
   * - content: String (10-5000 karakter, @Size(min=10, max=5000))
   * - images: List<PostImageDto> (max 5, @Size(max=5))
   */
  async createPost(data: CreatePostRequest): Promise<Post> {
    const response = await apiClient.post<ApiResponse<BackendFeedPostResponse>>(
      API_ENDPOINTS.FEED.CREATE_POST,
      data,
    );
    return mapToPost(response.data.data);
  },

  /**
   * Post güncelle
   */
  async updatePost(postId: number, dto: UpdatePostDto): Promise<Post> {
    const response = await apiClient.put<ApiResponse<BackendFeedPostResponse>>(
      API_ENDPOINTS.FEED.UPDATE_POST(postId),
      dto,
    );
    return mapToPost(response.data.data);
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
   *
   * Backend: CommentController.deleteComment()
   * - Sadece yorum sahibi veya post sahibi silebilir
   * - Soft delete uygulanır
   */
  async deleteComment(postId: number, commentId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COMMENTS.DELETE(postId, commentId));
  },

  /**
   * Yorum beğen
   * POST /api/posts/{postId}/comments/{commentId}/like
   *
   * Backend: CommentController.likeComment()
   * - Bir kullanıcı aynı yorumu sadece bir kez beğenebilir
   * - Zaten beğenilmişse 400 hatası döner
   *
   * @returns CommentLikeResponse - Updated like status and count
   */
  async likeComment(postId: number, commentId: string): Promise<CommentLikeResponse> {
    const response = await apiClient.post<ApiResponse<CommentLikeResponse>>(
      API_ENDPOINTS.COMMENTS.LIKE(postId, commentId),
    );
    return response.data.data;
  },

  /**
   * Yorum beğenmekten vazgeç
   * DELETE /api/posts/{postId}/comments/{commentId}/like
   *
   * Backend: CommentController.unlikeComment()
   * - Sadece önceden beğenilmiş yorumlar için geçerli
   * - Beğenilmemişse 400 hatası döner
   *
   * @returns CommentLikeResponse - Updated like status and count
   */
  async unlikeComment(postId: number, commentId: string): Promise<CommentLikeResponse> {
    const response = await apiClient.delete<ApiResponse<CommentLikeResponse>>(
      API_ENDPOINTS.COMMENTS.UNLIKE(postId, commentId),
    );
    return response.data.data;
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
