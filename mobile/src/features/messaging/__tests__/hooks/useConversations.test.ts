// src/features/messaging/__tests__/hooks/useConversations.test.ts
// Conversations hook tests - STOMP WebSocket integration
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useConversations,
  useUnreadCount,
  useTotalUnreadCount,
} from '../../hooks/useConversations';
import { messagingService } from '../../services/messagingService';
import { stompClient } from '../../services/socketClient';
import type { Conversation, ConversationListResponse } from '../../types';

jest.mock('../../services/messagingService');
jest.mock('../../services/socketClient', () => ({
  stompClient: {
    on: jest.fn(() => jest.fn()),
    off: jest.fn(),
    isConnected: jest.fn(() => true),
  },
}));

const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;
const mockStompClient = stompClient as jest.Mocked<typeof stompClient>;

// Test data factory
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

describe('useConversations', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  const mockConversations = [
    createMockConversation({
      conversationId: 'conv1',
      unreadCount: 2,
    }),
    createMockConversation({
      conversationId: 'conv2',
      unreadCount: 0,
    }),
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    jest.clearAllMocks();
    (mockStompClient.on as jest.Mock).mockImplementation(() => jest.fn());
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useConversations', () => {
    it('should fetch conversations', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: mockConversations,
        pageNumber: 0,
        pageSize: 20,
        totalElements: 2,
        totalPages: 1,
        hasMore: false,
      };
      mockMessagingService.getConversations.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversations).toHaveLength(2);
      expect(result.current.conversations[0].conversationId).toBe('conv1');
      expect(mockMessagingService.getConversations).toHaveBeenCalled();
    });

    it('should return empty array initially', () => {
      mockMessagingService.getConversations.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const { result } = renderHook(() => useConversations(), { wrapper });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle fetch error', async () => {
      mockMessagingService.getConversations.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should register STOMP listeners on mount', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: [],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        hasMore: false,
      };
      mockMessagingService.getConversations.mockResolvedValueOnce(mockResponse);

      renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(mockStompClient.on).toHaveBeenCalledWith('message:new', expect.any(Function));
        expect(mockStompClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      });
    });

    it('should cleanup STOMP listeners on unmount', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: [],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        hasMore: false,
      };
      mockMessagingService.getConversations.mockResolvedValueOnce(mockResponse);

      const { unmount } = renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(mockStompClient.on).toHaveBeenCalled();
      });

      unmount();

      expect(mockStompClient.off).toHaveBeenCalled();
    });
  });

  describe('useUnreadCount', () => {
    it('should fetch unread count', async () => {
      mockMessagingService.getUnreadCount.mockResolvedValueOnce(5);

      const { result } = renderHook(() => useUnreadCount(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBe(5);
    });
  });

  describe('useTotalUnreadCount', () => {
    it('should return total unread count across all conversations', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: mockConversations,
        pageNumber: 0,
        pageSize: 20,
        totalElements: 2,
        totalPages: 1,
        hasMore: false,
      };
      mockMessagingService.getConversations.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useTotalUnreadCount(), { wrapper });

      await waitFor(() => {
        // conv1 has 2, conv2 has 0
        expect(result.current).toBe(2);
      });
    });

    it('should return 0 when no conversations', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: [],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        hasMore: false,
      };
      mockMessagingService.getConversations.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useTotalUnreadCount(), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(0);
      });
    });
  });

  describe('pagination', () => {
    it('should fetch next page', async () => {
      const page1: ConversationListResponse = {
        conversations: [mockConversations[0]],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 2,
        totalPages: 2,
        hasMore: true,
      };
      const page2: ConversationListResponse = {
        conversations: [mockConversations[1]],
        pageNumber: 1,
        pageSize: 20,
        totalElements: 2,
        totalPages: 2,
        hasMore: false,
      };

      mockMessagingService.getConversations
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const { result } = renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(true);
      });

      act(() => {
        result.current.fetchNextPage();
      });

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });
    });
  });

  describe('refetch', () => {
    it('should refetch conversations', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: mockConversations,
        pageNumber: 0,
        pageSize: 20,
        totalElements: 2,
        totalPages: 1,
        hasMore: false,
      };
      mockMessagingService.getConversations.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockMessagingService.getConversations).toHaveBeenCalledTimes(2);
      });
    });
  });
});
