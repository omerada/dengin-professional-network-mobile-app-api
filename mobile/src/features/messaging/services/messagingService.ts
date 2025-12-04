// src/features/messaging/services/messagingService.ts
// Messaging HTTP API servisi - Backend ConversationController ile %100 uyumlu
// Backend: com.meslektas.messaging.api.ConversationController
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import { apiClient } from '@core/api/client';
import type {
  Conversation,
  ConversationListResponse,
  Message,
  MessageListResponse,
  SendMessageRequest,
  ConversationListParams,
  MessageListParams,
  MessageSearchParams,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from '../types';

/**
 * API Response wrapper (backend ApiResponse<T> ile uyumlu)
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Mesaj arama yanıtı
 */
interface MessageSearchResponse {
  messages: Message[];
  totalResults: number;
  pageNumber: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Ek yükleme URL yanıtı
 */
interface AttachmentUploadResponse {
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
  instructions: {
    method: string;
    contentType: string;
    maxFileSize: number;
  };
}

/**
 * Mesaj gönderme yanıtı
 */
interface SendMessageResponse {
  messageId: string;
  conversationId: string;
  content: string;
  status: string;
  sentAt: string;
}

/**
 * Messaging API Servisi
 * 
 * Endpoints:
 * - GET /api/conversations - Konuşmaları getir
 * - GET /api/conversations/{conversationId}/messages - Mesajları getir
 * - POST /api/messages - Mesaj gönder
 * - PUT /api/conversations/{conversationId}/read - Okundu işaretle
 * - DELETE /api/conversations/{conversationId}/messages/{messageId} - Mesaj sil
 * - GET /api/conversations/unread-count - Okunmamış sayısı
 * - GET /api/messages/search - Mesaj ara
 * - POST /api/messages/attachments/upload-url - Ek yükleme URL'i
 */
export const messagingService = {
  // =========================================================================
  // CONVERSATION ENDPOINTS
  // =========================================================================

  /**
   * GET /api/conversations
   * Kullanıcının konuşmalarını sayfalanmış olarak getir
   */
  async getConversations(params: ConversationListParams = {}): Promise<ConversationListResponse> {
    const { page = 0, size = 20 } = params;
    
    const response = await apiClient.get<ApiResponse<ConversationListResponse>>(
      '/api/conversations',
      { params: { page, size } }
    );
    
    return response.data.data;
  },

  /**
   * GET /api/conversations/{conversationId}/messages
   * Konuşmadaki mesajları sayfalanmış olarak getir
   */
  async getMessages(
    conversationId: string, 
    params: MessageListParams = {}
  ): Promise<MessageListResponse> {
    const { page = 0, size = 30 } = params;
    
    const response = await apiClient.get<ApiResponse<MessageListResponse>>(
      `/api/conversations/${conversationId}/messages`,
      { params: { page, size } }
    );
    
    return response.data.data;
  },

  /**
   * GET /api/conversations/unread-count
   * Toplam okunmamış mesaj sayısını getir
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(
      '/api/conversations/unread-count'
    );
    
    return response.data.data;
  },

  // =========================================================================
  // MESSAGE ENDPOINTS
  // =========================================================================

  /**
   * POST /api/messages
   * Yeni mesaj gönder (HTTP fallback - WebSocket tercih edilir)
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await apiClient.post<ApiResponse<SendMessageResponse>>(
      '/api/messages',
      request
    );
    
    return response.data.data;
  },

  /**
   * PUT /api/conversations/{conversationId}/read
   * Konuşmadaki tüm mesajları okundu olarak işaretle
   */
  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.put<ApiResponse<void>>(
      `/api/conversations/${conversationId}/read`
    );
  },

  /**
   * DELETE /api/conversations/{conversationId}/messages/{messageId}
   * Mesajı sil (soft delete)
   */
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(
      `/api/conversations/${conversationId}/messages/${messageId}`
    );
  },

  // =========================================================================
  // SEARCH ENDPOINTS
  // =========================================================================

  /**
   * GET /api/messages/search
   * Mesajlarda tam metin araması yap
   */
  async searchMessages(params: MessageSearchParams): Promise<MessageSearchResponse> {
    const { query, conversationId, page = 0, size = 20 } = params;
    
    const response = await apiClient.get<ApiResponse<MessageSearchResponse>>(
      '/api/messages/search',
      { 
        params: { 
          q: query, 
          conversationId, 
          page, 
          size 
        } 
      }
    );
    
    return response.data.data;
  },

  // =========================================================================
  // ATTACHMENT ENDPOINTS
  // =========================================================================

  /**
   * POST /api/messages/attachments/upload-url
   * Ek dosya yüklemek için presigned URL al
   * 
   * Desteklenen formatlar: JPEG, PNG, GIF, WebP
   * Max boyut: 10MB
   */
  async getAttachmentUploadUrl(
    conversationId: string,
    request: PresignedUrlRequest
  ): Promise<AttachmentUploadResponse> {
    const response = await apiClient.post<ApiResponse<AttachmentUploadResponse>>(
      '/api/messages/attachments/upload-url',
      {
        conversationId,
        ...request,
      }
    );
    
    return response.data.data;
  },

  /**
   * S3'e dosya yükle (presigned URL ile)
   */
  async uploadAttachment(uploadUrl: string, file: Blob, contentType: string): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
      },
    });
  },
};

export default messagingService;
