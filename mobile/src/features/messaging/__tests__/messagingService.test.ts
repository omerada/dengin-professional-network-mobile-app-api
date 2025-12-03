// src/features/messaging/__tests__/messagingService.test.ts
// Messaging service unit tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { messagingService } from '../services/messagingService';
import { apiClient } from '@services/apiClient';

jest.mock('@services/apiClient');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('messagingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should fetch conversations with pagination', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              id: '1',
              name: 'Test User',
              lastMessage: 'Hello',
              lastMessageAt: '2024-01-15T10:00:00Z',
              unreadCount: 2,
            },
          ],
          hasNext: true,
          nextCursor: 'cursor123',
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.getConversations();

      expect(mockApiClient.get).toHaveBeenCalledWith('/messaging/conversations', {
        params: { limit: 20, cursor: undefined },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty conversations', async () => {
      const mockResponse = {
        data: {
          content: [],
          hasNext: false,
          nextCursor: null,
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.getConversations();

      expect(result.content).toHaveLength(0);
      expect(result.hasNext).toBe(false);
    });
  });

  describe('getMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const conversationId = 'conv123';
      const mockResponse = {
        data: {
          content: [
            {
              id: 'msg1',
              content: 'Hello',
              senderId: 'user1',
              status: 'read',
              createdAt: '2024-01-15T10:00:00Z',
            },
          ],
          hasNext: false,
          nextCursor: null,
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.getMessages(conversationId);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}/messages`,
        { params: { limit: 50, cursor: undefined } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should pass cursor for pagination', async () => {
      const conversationId = 'conv123';
      const cursor = 'cursor456';

      mockApiClient.get.mockResolvedValueOnce({
        data: { content: [], hasNext: false, nextCursor: null },
      });

      await messagingService.getMessages(conversationId, 50, cursor);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}/messages`,
        { params: { limit: 50, cursor } }
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const conversationId = 'conv123';
      const content = 'Test message';
      const mockResponse = {
        data: {
          id: 'msg1',
          content,
          senderId: 'user1',
          status: 'sent',
          createdAt: '2024-01-15T10:00:00Z',
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.sendMessage(conversationId, content);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}/messages`,
        { content, replyToId: undefined }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should send a reply message', async () => {
      const conversationId = 'conv123';
      const content = 'Reply message';
      const replyToId = 'msg0';

      mockApiClient.post.mockResolvedValueOnce({
        data: { id: 'msg1', content, replyToId },
      });

      await messagingService.sendMessage(conversationId, content, replyToId);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}/messages`,
        { content, replyToId }
      );
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const conversationId = 'conv123';
      const messageId = 'msg1';

      mockApiClient.delete.mockResolvedValueOnce({});

      await messagingService.deleteMessage(conversationId, messageId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}/messages/${messageId}`
      );
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read', async () => {
      const conversationId = 'conv123';

      mockApiClient.put.mockResolvedValueOnce({});

      await messagingService.markConversationAsRead(conversationId);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}/read`
      );
    });
  });

  describe('startConversation', () => {
    it('should start a new conversation', async () => {
      const userId = 'user123';
      const mockResponse = {
        data: {
          id: 'conv1',
          name: 'Test User',
          participants: [{ id: userId, displayName: 'Test User' }],
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.startConversation(userId);

      expect(mockApiClient.post).toHaveBeenCalledWith('/messaging/conversations', {
        participantId: userId,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('findConversationWithUser', () => {
    it('should find existing conversation with user', async () => {
      const userId = 'user123';
      const mockResponse = {
        data: {
          id: 'conv1',
          name: 'Test User',
        },
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await messagingService.findConversationWithUser(userId);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/messaging/conversations/with/${userId}`
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should return null if no conversation exists', async () => {
      const userId = 'user123';

      mockApiClient.get.mockRejectedValueOnce({ response: { status: 404 } });

      const result = await messagingService.findConversationWithUser(userId);

      expect(result).toBeNull();
    });
  });

  describe('pinConversation', () => {
    it('should pin a conversation', async () => {
      const conversationId = 'conv123';

      mockApiClient.put.mockResolvedValueOnce({});

      await messagingService.pinConversation(conversationId);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}/pin`
      );
    });
  });

  describe('muteConversation', () => {
    it('should mute a conversation', async () => {
      const conversationId = 'conv123';

      mockApiClient.put.mockResolvedValueOnce({});

      await messagingService.muteConversation(conversationId);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}/mute`
      );
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const conversationId = 'conv123';

      mockApiClient.delete.mockResolvedValueOnce({});

      await messagingService.deleteConversation(conversationId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/messaging/conversations/${conversationId}`
      );
    });
  });
});
