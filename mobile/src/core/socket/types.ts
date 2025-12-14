// src/core/socket/types.ts
// STOMP WebSocket type definitions
// Oku: mobile-development-guide/core/13-REAL-TIME.md

/**
 * Socket connection configuration
 */
export interface SocketConfig {
  url: string;
  token: string;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  reconnectDelay?: number;
  debug?: boolean;
}

/**
 * Socket message for queue
 */
export interface SocketMessage {
  id: string;
  destination: string;
  body: unknown;
  timestamp: number;
  retry?: number;
}

/**
 * Socket connection status
 */
export enum SocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

// ========== WebSocket Request Types ==========

/**
 * Send message request via WebSocket
 * Backend: com.dengin.messaging.application.dto.SendMessageRequest
 *
 * NOT: Backend UUID tipi bekliyor, number değil!
 */
export interface WsSendMessageRequest {
  /** Recipient user UUID (string format) */
  recipientId: string;
  content: string;
  attachment?: WsAttachment;
}

/**
 * Attachment in WebSocket message
 */
export interface WsAttachment {
  s3Key: string;
  url: string;
  contentType: string;
  fileSize: number;
  fileName: string;
}

// ========== WebSocket Response Types ==========

/**
 * Message response from WebSocket
 * Backend: com.dengin.messaging.application.dto.MessageDto
 *
 * NOT: Backend UUID tipleri kullanıyor
 */
export interface WsMessageResponse {
  messageId: string;
  conversationId: string;
  /** Sender user UUID */
  senderId: string;
  /** Recipient user UUID (optional in response) */
  recipientId?: string;
  content: string;
  attachment?: WsAttachment;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sentAt: string;
}

/**
 * Typing notification
 * Backend: com.dengin.messaging.infrastructure.websocket.dto.TypingNotification
 */
export interface WsTypingNotification {
  conversationId: string;
  /** User UUID */
  userId: string;
  userName: string;
  isTyping: boolean;
}

/**
 * Read receipt
 * Backend: com.dengin.messaging.infrastructure.websocket.dto.ReadReceipt
 */
export interface WsReadReceipt {
  conversationId: string;
  /** User UUID who read the messages */
  readByUserId: string;
  messagesRead: number;
  readAt: string;
}

/**
 * Error response from WebSocket
 */
export interface WsErrorResponse {
  code: 'VALIDATION_ERROR' | 'FORBIDDEN' | 'INTERNAL_ERROR';
  message: string;
  action: string;
}

/**
 * Notification from WebSocket
 */
export interface WsNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Presence update
 * Backend: Presence tracking for online/offline status
 */
export interface WsPresenceUpdate {
  /** User UUID */
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

/**
 * Socket event types
 */
export type SocketEventType =
  | 'message'
  | 'typing'
  | 'read'
  | 'error'
  | 'notification'
  | 'presence'
  | 'connect'
  | 'disconnect';

/**
 * Socket event handler
 */
export type SocketEventHandler<T = unknown> = (data: T) => void;
