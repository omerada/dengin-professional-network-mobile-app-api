// src/features/messaging/types/messaging.types.ts
// Messaging modülü tip tanımlamaları - Backend DTO'larına %100 uyumlu
// Backend: com.meslektas.messaging.api.dto.*
// WebSocket: com.meslektas.messaging.infrastructure.websocket.dto.*

import { type UUID, isValidUUID, toUUID } from '@shared/types/common.types';

// Re-export UUID utilities for convenience
export { type UUID, isValidUUID, toUUID };

// =============================================================================
// ENUMS - Backend ile uyumlu
// =============================================================================

/**
 * Mesaj durumu - Backend MessageStatus enum ile uyumlu
 */
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

/**
 * Client-side mesaj durumu (optimistic UI için)
 */
export type ClientMessageStatus = MessageStatus | 'SENDING' | 'FAILED';

// =============================================================================
// USER SUMMARY - Kullanıcı arama sonuçları için
// =============================================================================

/**
 * Kullanıcı özet bilgisi - Yeni konuşma başlatma için
 */
export interface UserSummary {
  /** Kullanıcı UUID */
  id: string;
  /** Görünen ad (fullName) */
  displayName: string;
  /** Profil resmi URL */
  avatarUrl: string | null;
  /** Meslek/Unvan (opsiyonel) */
  profession?: string;
  /** Doğrulanmış mı */
  verified?: boolean;
}

// =============================================================================
// BACKEND DTOs - REST API Response Types
// =============================================================================

/**
 * Katılımcı bilgisi - Backend ParticipantDto ile uyumlu
 * @see ConversationDto.participant
 */
export interface Participant {
  /** UUID format */
  userId: string;
  /** Tam ad (firstName + lastName) */
  fullName: string;
  /** Meslek/Unvan */
  profession: string;
  /** Profil resmi URL */
  profileImageUrl: string | null;
  /** Doğrulanmış meslek belgesi */
  verified: boolean;
  /** Çevrimiçi durumu */
  online: boolean;
  /** Son görülme zamanı - ISO 8601 */
  lastSeenAt: string | null;
}

/**
 * Mesaj eki - Backend MessageAttachmentDto ile uyumlu
 */
export interface MessageAttachment {
  /** Dosya URL (S3 presigned veya CDN) */
  url: string;
  /** MIME type (image/jpeg, application/pdf, etc.) */
  contentType: string;
  /** Dosya boyutu (bytes) */
  fileSize: number;
  /** Dosya adı */
  fileName: string;
}

/**
 * Son mesaj özeti - Backend LastMessageDto ile uyumlu
 * @see ConversationDto.lastMessage
 */
export interface LastMessage {
  /** Mesaj içeriği (truncated) */
  content: string;
  /** Ek var mı? */
  hasAttachment: boolean;
  /** Benim gönderdiğim mi? */
  sentByMe: boolean;
  /** Okundu mu? */
  read: boolean;
  /** Gönderim zamanı - ISO 8601 */
  sentAt: string;
}

/**
 * Konuşma - Backend ConversationDto ile uyumlu
 */
export interface Conversation {
  /** Konuşma UUID */
  conversationId: string;
  /** Karşı taraf bilgisi */
  participant: Participant;
  /** Son mesaj özeti */
  lastMessage: LastMessage | null;
  /** Okunmamış mesaj sayısı */
  unreadCount: number;
  /** Son güncelleme zamanı - ISO 8601 */
  updatedAt: string;
  /** Oluşturulma zamanı - ISO 8601 */
  createdAt: string;
}

/**
 * Konuşma özeti - UI için genişletilmiş versiyon
 */
export interface ConversationSummary extends Conversation {
  /** Konuşma adı (katılımcı adından türetilir) */
  name: string;
  /** Sabitlenmiş mi */
  isPinned?: boolean;
  /** Sessiz mi */
  isMuted?: boolean;
}

/**
 * Mesaj - Backend MessageDto ile uyumlu
 */
export interface Message {
  /** Mesaj UUID */
  messageId: string;
  /** Konuşma UUID */
  conversationId: string;
  /** Gönderen UUID */
  senderId: string;
  /** Gönderen adı */
  senderName: string;
  /** Mesaj içeriği */
  content: string;
  /** Mesaj eki */
  attachment: MessageAttachment | null;
  /** Mesaj durumu */
  status: MessageStatus;
  /** Okundu mu? */
  read: boolean;
  /** Benim gönderdiğim mi? */
  sentByMe: boolean;
  /** Gönderim zamanı - ISO 8601 */
  sentAt: string;
  /** Okunma zamanı - ISO 8601 */
  readAt: string | null;
}

/**
 * Client-side mesaj (optimistic updates için)
 */
export interface ClientMessage extends Omit<Message, 'status'> {
  /** Client-side status (SENDING, FAILED dahil) */
  status: ClientMessageStatus;
  /** Geçici client ID (mesaj gönderilene kadar) */
  tempId?: string;
}

// =============================================================================
// PAGINATION - Backend ile uyumlu page-based pagination
// =============================================================================

/**
 * Konuşma listesi yanıtı - Backend ConversationListResponse ile uyumlu
 */
export interface ConversationListResponse {
  /** Konuşma listesi */
  conversations: Conversation[];
  /** Mevcut sayfa numarası (0-based) */
  pageNumber: number;
  /** Sayfa boyutu */
  pageSize: number;
  /** Toplam sayfa sayısı */
  totalPages: number;
  /** Toplam kayıt sayısı */
  totalElements: number;
  /** Sonraki sayfa var mı? */
  hasMore: boolean;
}

/**
 * Mesaj listesi yanıtı - Backend MessageListResponse ile uyumlu
 */
export interface MessageListResponse {
  /** Mesaj listesi (en yeniden eskiye) */
  messages: Message[];
  /** Mevcut sayfa numarası (0-based) */
  pageNumber: number;
  /** Sayfa boyutu */
  pageSize: number;
  /** Sonraki sayfa var mı? */
  hasMore: boolean;
  /** Toplam mesaj sayısı */
  totalMessages: number;
}

// =============================================================================
// REQUEST DTOs - Backend ile uyumlu
// =============================================================================

/**
 * Mesaj gönderme isteği - Backend SendMessageRequest ile uyumlu
 *
 * Backend beklentisi:
 * - recipientId: UUID format (required)
 * - content: String, max 2000 karakter
 * - attachment: AttachmentDto (optional)
 *
 * NOT: recipientId mutlaka UUID formatında olmalı!
 * Validasyon için isValidUUID() veya toUUID() kullanın.
 *
 * @example
 * const request: SendMessageRequest = {
 *   recipientId: toUUID('550e8400-e29b-41d4-a716-446655440000'),
 *   content: 'Merhaba!',
 * };
 */
export interface SendMessageRequest {
  /** Alıcı UUID - Backend UUID tipi bekler */
  recipientId: UUID;
  /** Mesaj içeriği (max 2000 karakter) */
  content: string;
  /** Opsiyonel ek */
  attachment?: SendMessageAttachment;
}

/**
 * Mesaj eki gönderme tipi - Backend AttachmentDto ile uyumlu
 *
 * NOT: Backend s3Key alanı da bekler (upload sonrası)
 */
export interface SendMessageAttachment {
  /** S3 key (upload sonrası alınır) */
  s3Key: string;
  /** Dosya URL */
  url: string;
  /** MIME type */
  contentType: string;
  /** Dosya boyutu (bytes) */
  fileSize: number;
  /** Dosya adı */
  fileName: string;
}

/**
 * Presigned URL isteği
 */
export interface PresignedUrlRequest {
  /** Dosya adı */
  fileName: string;
  /** MIME type */
  contentType: string;
  /** Dosya boyutu */
  fileSize: number;
}

/**
 * Presigned URL yanıtı
 */
export interface PresignedUrlResponse {
  /** Upload URL */
  uploadUrl: string;
  /** Dosya URL (upload sonrası) */
  fileUrl: string;
  /** URL geçerlilik süresi (saniye) */
  expiresIn: number;
}

// =============================================================================
// WEBSOCKET DTOs - STOMP ile uyumlu
// =============================================================================

/**
 * WebSocket mesaj gönderme isteği - Backend WsSendMessageRequest ile uyumlu
 * Destination: /app/chat.send
 *
 * NOT: recipientId mutlaka UUID formatında olmalı!
 */
export interface WsSendMessageRequest {
  /** Alıcı UUID - Backend UUID tipi bekler */
  recipientId: UUID;
  /** Mesaj içeriği */
  content: string;
  /** Opsiyonel ek */
  attachment?: SendMessageAttachment;
}

/**
 * WebSocket mesaj yanıtı - Backend WsMessageResponse ile uyumlu
 * Subscription: /user/queue/messages
 */
export interface WsMessageResponse {
  /** Mesaj UUID */
  messageId: string;
  /** Konuşma UUID */
  conversationId: string;
  /** Gönderen UUID */
  senderId: string;
  /** Alıcı UUID */
  recipientId: string;
  /** Mesaj içeriği */
  content: string;
  /** Mesaj eki */
  attachment: MessageAttachment | null;
  /** Mesaj durumu */
  status: MessageStatus;
  /** Gönderim zamanı - ISO 8601 */
  sentAt: string;
}

/**
 * WebSocket yazıyor bildirimi - Backend WsTypingNotification ile uyumlu
 * Destination: /app/chat.typing
 * Subscription: /user/queue/typing
 */
export interface WsTypingNotification {
  /** Konuşma UUID */
  conversationId: string;
  /** Yazıyor bildirimi gönderilen kullanıcı UUID */
  recipientId: string;
  /** Yazıyor mu? */
  isTyping: boolean;
}

/**
 * WebSocket okundu bildirimi - Backend WsReadReceipt ile uyumlu
 * Destination: /app/chat.read
 * Subscription: /user/queue/read
 */
export interface WsReadReceipt {
  /** Konuşma UUID */
  conversationId: string;
  /** Okuyan kullanıcı UUID */
  readByUserId: string;
  /** Son okunan mesaj UUID */
  lastReadMessageId: string;
  /** Okunan mesaj sayısı */
  messagesRead: number;
  /** Okunma zamanı - ISO 8601 */
  readAt: string;
}

// =============================================================================
// STOMP CONFIGURATION
// =============================================================================

/**
 * STOMP bağlantı durumu
 */
export type StompConnectionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

/**
 * STOMP endpoint sabitleri
 */
export const STOMP_ENDPOINTS = {
  /** WebSocket bağlantı URL */
  WS_URL: '/ws',

  /** Mesaj gönderme */
  SEND_MESSAGE: '/app/chat.send',
  /** Yazıyor bildirimi */
  SEND_TYPING: '/app/chat.typing',
  /** Okundu bildirimi */
  SEND_READ: '/app/chat.read',

  /** Yeni mesaj dinleme */
  SUBSCRIBE_MESSAGES: '/user/queue/messages',
  /** Yazıyor bildirimi dinleme */
  SUBSCRIBE_TYPING: '/user/queue/typing',
  /** Okundu bildirimi dinleme */
  SUBSCRIBE_READ: '/user/queue/read',
} as const;

// =============================================================================
// CLIENT STATE - Zustand Store
// =============================================================================

/**
 * Kuyruğa alınmış mesaj (offline support)
 */
export interface QueuedMessage {
  /** Geçici client ID */
  tempId: string;
  /** Alıcı UUID */
  recipientId: string;
  /** Mesaj içeriği */
  content: string;
  /** Opsiyonel ek */
  attachment?: MessageAttachment;
  /** Oluşturulma zamanı */
  createdAt: string;
  /** Deneme sayısı */
  retryCount: number;
}

/**
 * Messaging store state
 */
export interface MessagingStoreState {
  // STOMP bağlantı durumu
  connectionState: StompConnectionState;
  setConnectionState: (state: StompConnectionState) => void;

  // Active conversation
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;

  // Typing users per conversation (userId listesi)
  typingUsers: Record<string, string[]>;
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  clearTypingUsers: (conversationId: string) => void;

  // Online users (userId set)
  onlineUsers: Set<string>;
  setUserOnline: (userId: string, isOnline: boolean) => void;

  // Offline message queue
  messageQueue: QueuedMessage[];
  addToQueue: (message: QueuedMessage) => void;
  removeFromQueue: (tempId: string) => void;
  clearQueue: () => void;
  incrementRetryCount: (tempId: string) => void;

  // Draft messages per conversation
  drafts: Record<string, string>;
  setDraft: (conversationId: string, content: string) => void;
  clearDraft: (conversationId: string) => void;

  // Unread count cache
  totalUnreadCount: number;
  setTotalUnreadCount: (count: number) => void;
  decrementUnreadCount: (amount?: number) => void;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Konuşma listesi query params
 */
export interface ConversationListParams {
  page?: number;
  size?: number;
}

/**
 * Mesaj listesi query params
 */
export interface MessageListParams {
  page?: number;
  size?: number;
}

/**
 * Mesaj arama params
 */
export interface MessageSearchParams {
  query: string;
  conversationId?: string;
  page?: number;
  size?: number;
}
