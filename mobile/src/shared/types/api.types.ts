// src/shared/types/api.types.ts
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { VerificationStatus, UserRole, BaseEntity } from './common.types';

/**
 * User entity from API
 */
export interface User extends BaseEntity {
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  profession?: string;
  workplace?: string;
  bio?: string;
  verificationStatus: VerificationStatus;
  role: UserRole;
  isActive: boolean;
  lastSeenAt?: string;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  deviceToken?: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profession?: string;
}

/**
 * Auth response from API
 */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Post entity
 */
export interface Post extends BaseEntity {
  content: string;
  imageUrls: string[];
  author: User;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

/**
 * Comment entity
 */
export interface Comment extends BaseEntity {
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  likeCount: number;
  isLiked: boolean;
  replies?: Comment[];
}

/**
 * Conversation entity
 */
export interface Conversation extends BaseEntity {
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
}

/**
 * Message entity
 */
export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments?: Attachment[];
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
export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
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
  status: VerificationStatus;
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
