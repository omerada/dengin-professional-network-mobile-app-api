// src/features/messaging/types/messaging.types.ts
// Messaging modülü tip tanımlamaları
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

/**
 * Mesaj durumu
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Mesaj tipi
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
  SYSTEM = 'system',
}

/**
 * Kullanıcı özeti
 */
export interface UserSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  profession: string;
  isVerified: boolean;
  isOnline?: boolean;
  lastSeenAt?: string;
}

/**
 * Mesaj eki
 */
export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'voice';
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // ses için saniye
}

/**
 * Mesaj
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments: MessageAttachment[];
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  deliveredAt?: string;
}

/**
 * Konuşma
 */
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: UserSummary[];
  lastMessage: Message | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Konuşma özeti (liste için)
 */
export interface ConversationSummary {
  id: string;
  participant: UserSummary; // 1:1 için karşı taraf
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isOnline: boolean;
}

/**
 * Mesaj listesi yanıtı
 */
export interface MessagesResponse {
  data: Message[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    totalCount: number;
  };
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Konuşma listesi yanıtı
 */
export interface ConversationsResponse {
  data: ConversationSummary[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    totalCount: number;
  };
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Mesaj gönderme DTO
 */
export interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: MessageType;
  attachmentIds?: string[];
  replyToId?: string;
}

/**
 * Konuşma başlatma DTO
 */
export interface StartConversationDto {
  participantId: string;
  message?: string;
}

/**
 * Socket olayları
 */
export type SocketEvent =
  | 'message:new'
  | 'message:status'
  | 'message:deleted'
  | 'typing:start'
  | 'typing:stop'
  | 'presence:update'
  | 'conversation:update';

/**
 * Typing event payload
 */
export interface TypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
}

/**
 * Presence event payload
 */
export interface PresenceEvent {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

/**
 * Message status event payload
 */
export interface MessageStatusEvent {
  messageId: string;
  status: MessageStatus;
  timestamp: string;
}

/**
 * Queued message (offline support)
 */
export interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  attachmentIds?: string[];
  replyToId?: string;
  createdAt: string;
  retryCount: number;
}

/**
 * Messaging store state
 */
export interface MessagingStoreState {
  // Active conversation
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;

  // Typing users per conversation
  typingUsers: Record<string, string[]>;
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  clearTypingUsers: (conversationId: string) => void;

  // Online users
  onlineUsers: Set<string>;
  setUserOnline: (userId: string, isOnline: boolean) => void;

  // Message queue
  messageQueue: QueuedMessage[];
  addToQueue: (message: QueuedMessage) => void;
  removeFromQueue: (messageId: string) => void;
  clearQueue: () => void;

  // Draft messages
  drafts: Record<string, string>;
  setDraft: (conversationId: string, content: string) => void;
  clearDraft: (conversationId: string) => void;
}
