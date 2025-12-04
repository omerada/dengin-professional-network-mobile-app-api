// src/shared/types/api.types.ts
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { VerificationStatus, UserRole, BaseEntity } from './common.types';

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
  professionId?: number;
  professionName?: string;
  profession?: Profession;
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
 * Profession entity
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
 * Profession category enum
 */
export type ProfessionCategory =
  | 'MEDICAL'
  | 'LEGAL'
  | 'ENGINEERING'
  | 'EDUCATION'
  | 'FINANCE'
  | 'OTHER';

/**
 * Authentication tokens
 * Backend: LoginResponse format
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds (86400 = 24 hours)
  tokenType: 'Bearer';
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
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
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
 * Backend: POST /api/auth/register response
 */
export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  createdAt: string;
}

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
 * Backend: POST /api/v1/auth/oauth/* response
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
 * Submit verification request
 */
export interface SubmitVerificationRequest {
  professionId: number;
  documentUrl: string;
  selfieUrl: string;
}

/**
 * Post entity
 */
export interface Post {
  id: number;
  content: string;
  imageUrls: string[];
  author: User;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
}

/**
 * Post visibility enum
 */
export type PostVisibility = 'PUBLIC' | 'VERIFIED_ONLY' | 'FOLLOWERS_ONLY';

/**
 * Create post request
 */
export interface CreatePostRequest {
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
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  actionUrl?: string;
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
