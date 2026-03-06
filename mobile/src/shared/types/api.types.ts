// src/shared/types/api.types.ts
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import type { VerificationStatus, UserRole, BaseEntity } from './common.types';

// Re-export for compatibility
export type { VerificationStatus, UserRole, BaseEntity };

// ============================================
// PAGINATION TYPES - Backend PagedResponse uyumlu
// ============================================

/**
 * Paginated response wrapper - Backend PagedResponse ile %100 uyumlu
 *
 * Offset-based pagination: page, totalPages, totalElements kullanır
 * Cursor-based pagination: lastId, hasNext kullanır
 *
 * @example
 * {
 *   content: [...],
 *   page: 0,
 *   size: 20,
 *   totalElements: 150,
 *   totalPages: 8,
 *   hasNext: true,
 *   hasPrevious: false,
 *   lastId: 12345
 * }
 */
export interface PagedResponse<T> {
  /** Content items for current page */
  content: T[];
  /** Current page number (0-indexed) */
  page?: number;
  /** Page size (number of items per page) */
  size: number;
  /** Total number of elements across all pages */
  totalElements?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Whether there are more pages after current */
  hasNext: boolean;
  /** Whether there are pages before current */
  hasPrevious?: boolean;
  /** Last item ID for cursor-based pagination */
  lastId?: number;
}

/**
 * Create an empty paged response
 */
export function emptyPagedResponse<T>(): PagedResponse<T> {
  return {
    content: [],
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  };
}

// ============================================
// USER TYPES
// ============================================

/**
 * User entity from API
 * Backend: LoginResponse.user format
 */
export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  verificationStatus: BackendVerificationStatus;

  // Legacy profession fields - backward compatibility
  professionId?: number;
  professionName?: string;
  profession?: Profession;

  // New sector fields (Sprint 1)
  /** User's primary sector ID */
  sectorId?: number;
  /** User's primary sector code */
  sectorCode?: SectorCode;
  /** User's primary sector name */
  sectorName?: string;
  /** Full sector object (if included) */
  sector?: Sector;

  stats?: UserStats;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend verification status enum
 */
export type BackendVerificationStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

/**
 * User stats
 */
export interface UserStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

/**
 * Legacy profession type - backward compatibility
 */
export interface Profession {
  id: number;
  name: string;
  category: ProfessionCategory;
  description?: string;
  requiresVerification: boolean;
  verificationDocuments?: string[];
}

/**
 * Legacy profession category - backward compatibility
 */
export type ProfessionCategory =
  | 'MEDICAL' // Sağlık
  | 'LEGAL' // Hukuk
  | 'ENGINEERING' // Mühendislik
  | 'EDUCATION' // Eğitim
  | 'SERVICE' // Hizmet Sektörü
  | 'CREATIVE' // Yaratıcı Sektör
  | 'BUSINESS' // İş Dünyası
  | 'OTHER'; // Diğer

// ============================================
// SECTOR TYPES (Sprint 1 - New Community Structure)
// ============================================

/**
 * Sector code type - Top-level professional category
 * Backend: Sector.code field
 * @since Sprint 1
 */
export type SectorCode =
  | 'MEDICAL' // Sağlık
  | 'LEGAL' // Hukuk
  | 'ENGINEERING' // Mühendislik
  | 'EDUCATION' // Eğitim
  | 'SERVICE' // Hizmet
  | 'CREATIVE' // Yaratıcı
  | 'BUSINESS' // İş Dünyası
  | 'OTHER'; // Diğer

/**
 * Sector entity - Top-level professional category
 * Backend: SectorResponse DTO
 * @since Sprint 1
 */
export interface Sector {
  /** Sector ID */
  id: number;

  /** Unique sector code (MEDICAL, LEGAL, etc.) */
  code: SectorCode;

  /** Display name in Turkish */
  name: string;

  /** Sector description */
  description?: string | null;

  /** Icon URL */
  iconUrl?: string | null;

  /** Display order in UI (lower = higher priority) */
  displayOrder: number;

  /** Whether sector is active */
  isActive: boolean;

  /** Number of users in this sector */
  memberCount: number;

  /** Legacy field - backward compatibility */
  userCount?: number;
}

/**
 * Profession Group - Specific profession within a sector
 * Backend: ProfessionGroupResponse DTO
 * @since Sprint 1
 */
export interface ProfessionGroup {
  /** Profession group ID */
  id: number;

  /** Parent sector ID */
  sectorId: number;

  /** Parent sector code */
  sectorCode: SectorCode;

  /** Parent sector name */
  sectorName: string;

  /** Profession group name (e.g., Doktor, Avukat) */
  name: string;

  /** Description */
  description?: string | null;

  /** Whether this profession requires verification */
  requiresVerification: boolean;

  /** Icon URL */
  iconUrl?: string | null;

  /** Display order within sector */
  displayOrder: number;

  /** Whether profession group is active */
  isActive: boolean;

  /** Number of verified members */
  memberCount: number;
}

/**
 * Sector statistics
 * Backend: SectorStatsResponse DTO
 * @since Sprint 1
 */
export interface SectorStats {
  /** Total number of sectors */
  totalSectors: number;

  /** Number of active sectors */
  activeSectors: number;
}

/**
 * Authentication tokens
 * Backend: LoginResponse format
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number; // seconds (86400 = 24 hours)
  tokenType?: 'Bearer';
}

/**
 * Login credentials
 * Backend: POST /api/auth/login request
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 * Backend: POST /api/auth/register request
 * Sprint 1: Added sectorId for sector-based community structure
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
  // Sprint 1: Sector-based community structure
  sectorId?: number | null;
  // Deprecated: Kept for backward compatibility
  professionId?: number | null;
  customProfession?: string;
}

/**
 * Auth response from API
 * Backend: POST /api/auth/login response
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

/**
 * Register response from API
 * Backend: POST /api/auth/register response - Now returns LoginResponse for auto-login
 */
export type RegisterResponse = AuthResponse;

/**
 * Refresh token response
 * Backend: POST /api/auth/refresh response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * OAuth2 response (Google/Apple)
 * Backend: POST /api/auth/oauth/* response
 */
export interface OAuth2AuthResponse {
  success: boolean;
  error?: string;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  isNewUser: boolean;
  user: User;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirm request
 */
export interface PasswordResetConfirmRequest {
  resetToken: string;
  newPassword: string;
}

/**
 * Verification entity
 * Backend: POST /api/verifications response
 */
export interface Verification {
  id: number;
  status: VerificationStatusType;
  profession: {
    id: number;
    name: string;
  };
  aiConfidenceScore?: number;
  rejectionReason?: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Verification status type
 */
export type VerificationStatusType =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'MANUAL_REVIEW';

/**
 * Submit verification request - Backend SubmitVerificationRequest.java ile %100 uyumlu
 * POST /api/verifications
 *
 * NOT: Backend URL değil, S3 key ve metadata bekliyor!
 * Dosyalar önce S3'e yüklenmeli, sonra bu request gönderilmeli.
 *
 * @see verification.types.ts for detailed documentation
 */
export interface SubmitVerificationRequest {
  /** Profession ID - ZORUNLU */
  professionId: number;
  /** S3'e yüklenmiş belge dosyasının key'i (URL değil!) */
  documentS3Key: string;
  /** Belge dosya adı */
  documentFileName: string;
  /** MIME type (image/jpeg, image/png, application/pdf) */
  documentContentType: string;
  /** Dosya boyutu (bytes) */
  documentFileSize: number;
  /** S3'e yüklenmiş selfie dosyasının key'i */
  selfieS3Key: string;
  /** Selfie dosya adı */
  selfieFileName: string;
  /** MIME type */
  selfieContentType: string;
  /** Dosya boyutu (bytes) */
  selfieFileSize: number;
}

/**
 * @deprecated Eski format - SubmitVerificationRequest kullanın
 * Backend artık S3 key + metadata bekliyor, URL değil
 */
export interface LegacySubmitVerificationRequest {
  professionId: number;
  documentUrl: string;
  selfieUrl: string;
}

/**
 * Post visibility enum
 */
export type PostVisibility = 'PUBLIC' | 'VERIFIED_ONLY' | 'FOLLOWERS_ONLY';

/**
 * Post image DTO - Backend PostImageDto.java ile %100 uyumlu
 * @see backend/src/main/java/com/dengin/social/application/dto/PostImageDto.java
 */
export interface PostImageDto {
  /** S3 key - ZORUNLU! Backend @NotBlank validation */
  s3Key: string;
  /** S3 URL veya CDN URL - ZORUNLU! Backend @NotBlank validation */
  url: string;
  /** Görsel genişliği (pixel) */
  width?: number;
  /** Görsel yüksekliği (pixel) */
  height?: number;
  /** Dosya boyutu (bytes) */
  fileSize?: number;
}

/**
 * Create post request - Backend CreatePostRequest.java ile %100 uyumlu
 * POST /api/posts
 *
 * Backend validation kuralları:
 * - professionId: @NotNull - ZORUNLU!
 * - content: @Size(min=10, max=5000) - 10-5000 karakter arası
 * - images: @Size(max=5) - Maksimum 5 görsel, List<PostImageDto> formatında
 *
 * @see feed.types.ts CreatePostRequest for the canonical definition
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
 * Backend artık images: PostImageDto[] bekliyor, imageUrls: string[] değil
 */
export interface LegacyCreatePostRequest {
  content: string;
  imageUrls?: string[];
  visibility?: PostVisibility;
}

/**
 * Comment entity
 */
export interface Comment {
  id: number;
  content: string;
  author: User;
  postId: number;
  parentId?: number;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Conversation entity
 */
export interface Conversation {
  id: number;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Message entity
 */
export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Message type enum
 */
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

/**
 * Message status enum
 */
export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

/**
 * Attachment entity
 */
export interface Attachment {
  id: string;
  type: 'IMAGE' | 'FILE';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Notification entity
 */
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

/**
 * Notification type enum
 */
export type NotificationType =
  | 'MESSAGE'
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'VERIFICATION'
  | 'SYSTEM';

/**
 * Verification document entity
 */
export interface VerificationDocument {
  id: string;
  type: DocumentType;
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieImageUrl?: string;
  status: BackendVerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

/**
 * Document type enum
 */
export type DocumentType = 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE' | 'PROFESSIONAL_LICENSE';

/**
 * Upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Paginated response from backend
 */
export interface PaginatedApiResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}

/**
 * API Success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}
