// src/features/feed/types/feed.types.ts
// Feed modülü tip tanımlamaları
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

/**
 * Post yazarı
 */
export interface PostAuthor {
  id: string;
  name: string;
  profession: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

/**
 * Post görsel
 */
export interface PostImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  blurhash?: string;
}

/**
 * Post
 */
export interface Post {
  id: string;
  content: string;
  images: PostImage[];
  author: PostAuthor;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Post özeti (liste için)
 */
export interface PostSummary {
  id: string;
  content: string;
  previewImage: PostImage | null;
  imageCount: number;
  author: PostAuthor;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

/**
 * Yorum yazarı
 */
export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  profession?: string;
  isVerified: boolean;
}

/**
 * Yorum
 */
export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: CommentAuthor;
  likesCount: number;
  isLiked: boolean;
  repliesCount: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Feed sayfalama
 */
export interface FeedPagination {
  cursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Feed yanıtı
 */
export interface FeedResponse {
  data: Post[];
  pagination: FeedPagination;
  nextCursor: string | null;
}

/**
 * Comments yanıtı
 */
export interface CommentsResponse {
  data: Comment[];
  pagination: FeedPagination;
  nextCursor: string | null;
}

/**
 * Post oluşturma DTO
 */
export interface CreatePostDto {
  content: string;
  images: LocalImage[];
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
 * Yorum oluşturma DTO
 */
export interface CreateCommentDto {
  postId: string;
  content: string;
  parentId?: string;
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
