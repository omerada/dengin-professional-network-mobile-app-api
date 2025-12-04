// src/features/feed/types/feed.types.ts
// Feed modülü tip tanımlamaları
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

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
 * Feed sayfalama - Backend PaginatedResponse uyumlu
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
 * Feed yanıtı - Backend API uyumlu
 * GET /api/feed response
 */
export interface FeedResponse {
  content: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Like yanıtı - Backend API uyumlu
 */
export interface LikeResponse {
  isLiked: boolean;
  likeCount: number;
}

/**
 * Post oluşturma isteği - Backend API uyumlu
 * POST /api/posts
 */
export interface CreatePostRequest {
  content: string; // 1-1000 chars
  images?: string[]; // Max 5 S3 URLs
  professionId?: number; // Optional profession tag
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
