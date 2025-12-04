// __tests__/unit/messaging/messagingService.test.ts
// Unit tests for messaging HTTP service
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { messagingService } from '@features/messaging/services/messagingService';
import { apiClient } from '@core/services/api';
import type {
  Conversation,
  Message,
  ConversationListResponse,
  MessageListResponse,
  SendMessageRequest,
} from '@features/messaging/types';

// Mock API client
jest.mock('@core/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test data factories
const createMockConversation = (overrides?: Partial<Conversation>): Conversation => ({
  conversationId: '123e4567-e89b-12d3-a456-426614174000',
  participant: {
    userId: '123e4567-e89b-12d3-a456-426614174001',
    fullName: 'Test User',
    profession: 'Developer',
    profileImageUrl: null,
    verified: true,
    online: false,
    lastSeenAt: null,
  },
  lastMessage: {
    content: 'Last message content',
    hasAttachment: false,
    sentByMe: false,
    read: true,
    sentAt: '2024-01-01T12:00:00Z',
  },
  unreadCount: 0,
  updatedAt: '2024-01-01T12:00:00Z',
  createdAt: '2024-01-01T10:00:00Z',
  ...overrides,
});

const createMockMessage = (overrides?: Partial<Message>): Message => ({
  messageId: '123e4567-e89b-12d3-a456-426614174002',
  conversationId: '123e4567-e89b-12d3-a456-426614174000',
  senderId: '123e4567-e89b-12d3-a456-426614174001',
  senderName: 'Test User',
  content: 'Test message content',
  attachments: [],
  status: 'READ',
  createdAt: '2024-01-01T12:00:00Z',
  ...overrides,
});

describe('Messaging Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should fetch conversations with pagination', async () => {
      const mockResponse: ConversationListResponse = {
        content: [createMockConversation()],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasMore: false,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await messagingService.getConversations(0, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/conversations', {
        params: { page: 0, size: 20 },
      });
      expect(result.data).toEqual(mockResponse);
    });

    it('should use default pagination values', async () => {
      const mockResponse: ConversationListResponse = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasMore: false,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      await messagingService.getConversations();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/conversations', {
        params: { page: 0, size: 20 },
      });
    });
  });

  describe('getMessages', () => {
    it('should fetch messages for a conversation with pagination', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResponse: MessageListResponse = {
        content: [createMockMessage()],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
        hasMore: false,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await messagingService.getMessages(conversationId, 0, 50);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/conversations/${conversationId}/messages`,
        { params: { page: 0, size: 50 } }
      );
      expect(result.data).toEqual(mockResponse);
    });

    it('should use default pagination values for messages', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';
      const mockResponse: MessageListResponse = {
        content: [],
        page: 0,
        size: 50,
        totalElements: 0,
        totalPages: 0,
        hasMore: false,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      await messagingService.getMessages(conversationId);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/conversations/${conversationId}/messages`,
        { params: { page: 0, size: 50 } }
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a message via HTTP', async () => {
      const request: SendMessageRequest = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Test message',
        recipientId: '123e4567-e89b-12d3-a456-426614174001',
      };
      const mockResponse = createMockMessage({
        content: 'Test message',
      });

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await messagingService.sendMessage(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/messages', request);
      expect(result.data).toEqual(mockResponse);
    });

    it('should send a message with attachment', async () => {
      const request: SendMessageRequest = {
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Check this file',
        recipientId: '123e4567-e89b-12d3-a456-426614174001',
        attachmentKey: 'uploads/123/file.pdf',
      };
      const mockResponse = createMockMessage({
        content: 'Check this file',
        attachments: [
          {
            url: 'https://cdn.example.com/file.pdf',
            contentType: 'application/pdf',
            fileSize: 1024,
            fileName: 'file.pdf',
          },
        ],
      });

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await messagingService.sendMessage(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/messages', request);
      expect(result.data.attachments).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';

      mockApiClient.put.mockResolvedValueOnce({ data: null });

      await messagingService.markAsRead(conversationId);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/api/conversations/${conversationId}/read`
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch total unread message count', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: 5 });

      const result = await messagingService.getUnreadCount();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/conversations/unread-count');
      expect(result.data).toBe(5);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';
      const messageId = '123e4567-e89b-12d3-a456-426614174002';

      mockApiClient.delete.mockResolvedValueOnce({ data: null });

      await messagingService.deleteMessage(conversationId, messageId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/api/conversations/${conversationId}/messages/${messageId}`
      );
    });
  });

  describe('searchMessages', () => {
    it('should search messages with query', async () => {
      const searchParams = {
        q: 'test',
        conversationId: '123e4567-e89b-12d3-a456-426614174000',
        page: 0,
        size: 20,
      };
      const mockResponse: MessageListResponse = {
        content: [createMockMessage({ content: 'test message' })],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasMore: false,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await messagingService.searchMessages(searchParams);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/messages/search', {
        params: searchParams,
      });
      expect(result.data.content).toHaveLength(1);
    });

    it('should search messages with date range', async () => {
      const searchParams = {
        q: 'test',
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        page: 0,
        size: 20,
      };
      const mockResponse: MessageListResponse = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasMore: false,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      await messagingService.searchMessages(searchParams);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/messages/search', {
        params: searchParams,
      });
    });
  });

  describe('getAttachmentUploadUrl', () => {
    it('should get presigned URL for file upload', async () => {
      const request = {
        fileName: 'document.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      };
      const mockResponse = {
        uploadUrl: 'https://s3.amazonaws.com/bucket/presigned-url',
        key: 'uploads/123/document.pdf',
        expiresIn: 3600,
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await messagingService.getAttachmentUploadUrl(request);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/messages/attachments/upload-url',
        request
      );
      expect(result.data).toEqual(mockResponse);
    });
  });
});
