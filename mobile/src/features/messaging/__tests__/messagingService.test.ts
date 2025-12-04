// src/features/messaging/__tests__/messagingService.test.ts
// Messaging service unit tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { messagingService } from '../services/messagingService';
import { apiClient } from '@core/api/client';

jest.mock('@core/api/client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('messagingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should fetch conversations with pagination', async () => {
      const mockData = {
        content: [
          {
            conversationId: '1',
            participant: { userId: 'user1', fullName: 'Test User' },
            lastMessage: { content: 'Hello', sentAt: '2024-01-15T10:00:00Z' },
            unreadCount: 2,
          },
        ],
        totalPages: 1,
        totalElements: 1,
      };
      const mockResponse = {
        data: {
          success: true,
          message: 'OK',
          data: mockData,
          timestamp: new Date().toISOString(),
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.getConversations();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/conversations', {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(mockData);
    });

    it('should handle empty conversations', async () => {
      const mockData = {
        content: [],
        totalPages: 0,
        totalElements: 0,
      };
      const mockResponse = {
        data: {
          success: true,
          message: 'OK',
          data: mockData,
          timestamp: new Date().toISOString(),
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.getConversations();

      expect(result.content).toHaveLength(0);
    });
  });

  describe('getMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const conversationId = 'conv123';
      const mockData = {
        content: [
          {
            messageId: 'msg1',
            content: 'Hello',
            senderId: 'user1',
            status: 'READ',
            sentAt: '2024-01-15T10:00:00Z',
          },
        ],
        totalPages: 1,
        totalElements: 1,
      };
      const mockResponse = {
        data: {
          success: true,
          message: 'OK',
          data: mockData,
          timestamp: new Date().toISOString(),
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.getMessages(conversationId);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/conversations/${conversationId}/messages`,
        { params: { page: 0, size: 30 } },
      );
      expect(result).toEqual(mockData);
    });

    it('should pass page for pagination', async () => {
      const conversationId = 'conv123';
      const mockData = { content: [], totalPages: 0, totalElements: 0 };

      mockApiClient.get.mockResolvedValueOnce({
        data: { success: true, message: 'OK', data: mockData, timestamp: new Date().toISOString() },
      });

      await messagingService.getMessages(conversationId, { page: 2, size: 30 });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/conversations/${conversationId}/messages`,
        { params: { page: 2, size: 30 } },
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const request = {
        conversationId: 'conv123',
        content: 'Test message',
        type: 'text' as const,
      };
      const mockData = {
        messageId: 'msg1',
        conversationId: 'conv123',
        content: 'Test message',
        status: 'SENT',
        sentAt: '2024-01-15T10:00:00Z',
      };
      const mockResponse = {
        data: {
          success: true,
          message: 'OK',
          data: mockData,
          timestamp: new Date().toISOString(),
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.sendMessage(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/messages', request);
      expect(result).toEqual(mockData);
    });

    it('should send a reply message', async () => {
      const request = {
        conversationId: 'conv123',
        content: 'Reply message',
        type: 'text' as const,
        replyToId: 'msg0',
      };
      const mockData = {
        messageId: 'msg1',
        conversationId: 'conv123',
        content: 'Reply message',
        status: 'SENT',
        sentAt: '2024-01-15T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OK', data: mockData, timestamp: new Date().toISOString() },
      });

      await messagingService.sendMessage(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/messages', request);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const conversationId = 'conv123';
      const messageId = 'msg1';

      mockApiClient.delete.mockResolvedValueOnce({});

      await messagingService.deleteMessage(conversationId, messageId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/api/conversations/${conversationId}/messages/${messageId}`,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      const conversationId = 'conv123';

      mockApiClient.put.mockResolvedValueOnce({});

      await messagingService.markAsRead(conversationId);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/conversations/${conversationId}/read`);
    });
  });

  describe('searchMessages', () => {
    it('should search messages', async () => {
      const mockData = {
        messages: [{ messageId: 'msg1', content: 'test search' }],
        totalResults: 1,
        pageNumber: 0,
        pageSize: 20,
        hasMore: false,
      };
      const mockResponse = {
        data: {
          success: true,
          message: 'OK',
          data: mockData,
          timestamp: new Date().toISOString(),
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.searchMessages({ query: 'test' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/messages/search', {
        params: { q: 'test', conversationId: undefined, page: 0, size: 20 },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'OK',
          data: 5,
          timestamp: new Date().toISOString(),
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.getUnreadCount();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/conversations/unread-count');
      expect(result).toBe(5);
    });
  });
});
