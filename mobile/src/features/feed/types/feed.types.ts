// src/features/feed/types/feed.types.ts
// Feed modülü tip tanımlamaları
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import type { PagedResponse } from '@shared/types';

/**
 * Post yazarı - Backend API uyumlu
 */
export interface PostAuthor {
  id: number;
  name: string;
  surname: string;
  avatarUrl?: string;
  isVerified: boolean;
  profession?: string;
}

/**
 * Post görsel
 */
export interface PostImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  blurhash?: string;
}

/**
 * Post istatistikleri - Backend API uyumlu
 */
export interface PostStats {
  likeCount: number;
  commentCount: number;
  viewCount: number;
}

/**
 * Kullanıcı etkileşimi - Backend API uyumlu
 */
export interface UserInteraction {
  isLiked: boolean;
  isSaved: boolean;
}

/**
 * Post - Backend FeedPostResponse uyumlu
 */
export interface Post {
  postId: number;
  author: PostAuthor;
  content: string;
  images: string[]; // Backend returns string[] for images
  stats: PostStats;
  userInteraction: UserInteraction;
  createdAt: string;
  updatedAt: string;
}

/**
 * Post özeti (liste için) - Backward compatibility
 */
export interface PostSummary {
  postId: number;
  content: string;
  previewImage: string | null;
  imageCount: number;
  author: PostAuthor;
  stats: PostStats;
  userInteraction: UserInteraction;
  createdAt: string;
}

/**
 * Yorum yazarı - Backend API uyumlu
 */
export interface CommentAuthor {
  id: number;
  name: string;
  surname: string;
  avatarUrl?: string;
}

/**
 * Yorum - Backend CommentResponse uyumlu
 */
export interface Comment {
  id: string;
  author: CommentAuthor;
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

/**
 * Yorum listesi yanıtı - Backend API uyumlu
 */
export interface CommentListResponse {
  comments: Comment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

/**
 * Feed sayfalama - Backend PagedResponse uyumlu
 * @deprecated PagedResponse<Post> kullanın
 */
export interface FeedPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Feed yanıtı - Backend PagedResponse<FeedPostResponse> ile %100 uyumlu
 * GET /api/feed response
 *
 * Backend artık PagedResponse wrapper döndürüyor
 */
export interface FeedResponse extends PagedResponse<Post> {
  /** Last post ID for cursor-based pagination */
  lastId?: number;
}

/**
 * Like yanıtı - Backend LikeResponse ile %100 uyumlu
 * POST/DELETE /api/posts/{postId}/like
 *
 * Backend response:
 * - postId: UUID (opsiyonel, client'ta kullanılmayabilir)
 * - liked: boolean - Beğeni durumu (NOT: isLiked değil!)
 * - likeCount: int - Toplam beğeni sayısı
 */
export interface LikeResponse {
  postId?: string;
  liked: boolean;
  likeCount: number;
}

/**
 * Comment Like yanıtı - Backend API uyumlu
 * POST/DELETE /api/posts/{postId}/comments/{commentId}/like
 */
export interface CommentLikeResponse {
  commentId: string;
  isLiked: boolean;
  likeCount: number;
}

/**
 * Post görsel DTO - Backend PostImageDto ile %100 uyumlu
 * POST /api/posts request body içinde kullanılır
 */
export interface PostImageDto {
  /** S3 URL veya CDN URL */
  url: string;
  /** Thumbnail URL (opsiyonel) */
  thumbnailUrl?: string;
  /** Görsel genişliği (pixel) */
  width?: number;
  /** Görsel yüksekliği (pixel) */
  height?: number;
  /** Blurhash placeholder (opsiyonel) */
  blurhash?: string;
}

/**
 * Post oluşturma isteği - Backend CreatePostRequest ile %100 uyumlu
 * POST /api/posts
 *
 * Backend validation kuralları:
 * - professionId: @NotNull - ZORUNLU! (Mobile'da optional değil)
 * - content: @Size(min=10, max=5000) - 10-5000 karakter arası
 * - images: @Size(max=5) - Maksimum 5 görsel, List<PostImageDto> formatında
 */
export interface CreatePostRequest {
  /** Meslek ID'si - ZORUNLU! Backend @NotNull validation */
  professionId: number;
  /** Post içeriği - 10-5000 karakter arası olmalı */
  content: string;
  /** Post görselleri - Maksimum 5 adet, PostImageDto formatında */
  images?: PostImageDto[];
}

/**
 * @deprecated Eski format - CreatePostRequest kullanın
 * Backend artık string[] yerine PostImageDto[] bekliyor
 */
export interface LegacyCreatePostRequest {
  content: string;
  images?: string[];
  professionId?: number;
}

/**
 * Post oluşturma DTO - Lokal kullanım
 */
export interface CreatePostDto {
  content: string;
  images: LocalImage[];
  professionId?: number;
}

/**
 * Lokal görsel
 */
export interface LocalImage {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  type: string;
}

/**
 * Yorum ekleme isteği - Backend API uyumlu
 * POST /api/posts/{postId}/comments
 */
export interface AddCommentRequest {
  content: string; // 1-500 chars
}

/**
 * Yorum oluşturma DTO - Lokal kullanım
 */
export interface CreateCommentDto {
  postId: number;
  content: string;
}

/**
 * Post güncelleme DTO
 */
export interface UpdatePostDto {
  content: string;
}

/**
 * Feed filtresi
 */
export type FeedFilter = 'all' | 'following' | 'popular' | 'nearby';

/**
 * Feed store state
 */
export interface FeedStoreState {
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;

  // Draft post
  draftContent: string;
  draftImages: LocalImage[];
  setDraftContent: (content: string) => void;
  addDraftImage: (image: LocalImage) => void;
  removeDraftImage: (index: number) => void;
  clearDraft: () => void;
}

/**
 * Image picker seçenekleri
 */
export interface ImagePickerOptions {
  mediaType: 'photo' | 'video' | 'mixed';
  selectionLimit: number;
  quality?: number;
}

/**
 * Upload progress
 */
export interface UploadProgress {
  imageIndex: number;
  progress: number;
  totalImages: number;
}

/**
 * Like animation type
 */
export type LikeAnimationType = 'bounce' | 'scale' | 'confetti';
