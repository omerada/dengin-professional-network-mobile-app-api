// src/features/messaging/services/messagingService.ts
// Messaging API servisi
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  Conversation,
  ConversationSummary,
  ConversationsResponse,
  Message,
  MessagesResponse,
  SendMessageDto,
  StartConversationDto,
} from '../types';

/**
 * Messaging API Servisi
 */
export const messagingService = {
  /**
   * Konuşmaları getir
   */
  async getConversations(cursor?: string, limit = 20): Promise<ConversationsResponse> {
    const response = await apiClient.get<{ data: ConversationsResponse }>(
      API_ENDPOINTS.MESSAGING.CONVERSATIONS,
      { params: { cursor, limit } }
    );
    return response.data.data;
  },

  /**
   * Konuşma detayını getir
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<{ data: Conversation }>(
      API_ENDPOINTS.MESSAGING.CONVERSATION_BY_ID(conversationId)
    );
    return response.data.data;
  },

  /**
   * Yeni konuşma başlat
   */
  async startConversation(dto: StartConversationDto): Promise<Conversation> {
    const response = await apiClient.post<{ data: Conversation }>(
      API_ENDPOINTS.MESSAGING.START_CONVERSATION,
      dto
    );
    return response.data.data;
  },

  /**
   * Konuşmadaki mesajları getir
   */
  async getMessages(conversationId: string, cursor?: string, limit = 50): Promise<MessagesResponse> {
    const response = await apiClient.get<{ data: MessagesResponse }>(
      API_ENDPOINTS.MESSAGING.MESSAGES(conversationId),
      { params: { cursor, limit } }
    );
    return response.data.data;
  },

  /**
   * Mesaj gönder
   */
  async sendMessage(dto: SendMessageDto): Promise<Message> {
    const response = await apiClient.post<{ data: Message }>(
      API_ENDPOINTS.MESSAGING.SEND_MESSAGE(dto.conversationId),
      {
        content: dto.content,
        type: dto.type || 'text',
        attachmentIds: dto.attachmentIds,
        replyToId: dto.replyToId,
      }
    );
    return response.data.data;
  },

  /**
   * Mesaj sil
   */
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await apiClient.delete(`/api/v1/conversations/${conversationId}/messages/${messageId}`);
  },

  /**
   * Konuşmayı okundu olarak işaretle
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MESSAGING.MARK_READ(conversationId));
  },

  /**
   * Konuşmayı sabitle
   */
  async pinConversation(conversationId: string): Promise<void> {
    await apiClient.post(`/api/v1/conversations/${conversationId}/pin`);
  },

  /**
   * Konuşma sabitlemesini kaldır
   */
  async unpinConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/api/v1/conversations/${conversationId}/pin`);
  },

  /**
   * Konuşmayı sessize al
   */
  async muteConversation(conversationId: string): Promise<void> {
    await apiClient.post(`/api/v1/conversations/${conversationId}/mute`);
  },

  /**
   * Konuşma sessizini kaldır
   */
  async unmuteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/api/v1/conversations/${conversationId}/mute`);
  },

  /**
   * Konuşmayı sil (gizle)
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.MESSAGING.CONVERSATION_BY_ID(conversationId));
  },

  /**
   * Kullanıcıyla mevcut konuşmayı bul
   */
  async findConversationWithUser(userId: string): Promise<Conversation | null> {
    try {
      const response = await apiClient.get<{ data: Conversation }>(
        `/api/v1/conversations/with/${userId}`
      );
      return response.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Okunmamış mesaj sayısını getir
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ data: { count: number } }>(
      '/api/v1/conversations/unread-count'
    );
    return response.data.data.count;
  },
};

export default messagingService;
