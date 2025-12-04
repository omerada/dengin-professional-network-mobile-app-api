// __tests__/unit/messaging/useMessages.test.ts
// Unit tests for useMessages hook
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessages } from '@features/messaging/hooks/useMessages';
import { messagingService } from '@features/messaging/services/messagingService';
import type { Message, MessageListResponse } from '@features/messaging/types';
import React from 'react';

// Mock messaging service
jest.mock('@features/messaging/services/messagingService', () => ({
  messagingService: {
    getMessages: jest.fn(),
  },
}));

// Mock STOMP client
jest.mock('@features/messaging/services/socketClient', () => ({
  stompClient: {
    on: jest.fn(),
    off: jest.fn(),
    isConnected: jest.fn(() => true),
  },
}));

// Mock messaging store
jest.mock('@features/messaging/stores', () => ({
  useMessagingStore: jest.fn(() => ({
    addMessage: jest.fn(),
    setActiveConversationId: jest.fn(),
  })),
}));

const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;

// Test data factory
const createMockMessage = (overrides?: Partial<Message>): Message => ({
  messageId: '123e4567-e89b-12d3-a456-426614174002',
  conversationId: '123e4567-e89b-12d3-a456-426614174000',
  senderId: '123e4567-e89b-12d3-a456-426614174001',
  senderName: 'Test User',
  content: 'Test message',
  attachments: [],
  status: 'READ',
  createdAt: '2024-01-01T12:00:00Z',
  ...overrides,
});

// Wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useMessages Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch messages for a conversation', async () => {
    const conversationId = '123e4567-e89b-12d3-a456-426614174000';
    // Response format matching the actual API
    const mockResponse = {
      messages: [createMockMessage()],
      totalMessages: 1,
      totalPages: 1,
      pageNumber: 0,
      pageSize: 50,
      hasMore: false,
    };

    mockMessagingService.getMessages.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useMessages(conversationId), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should handle empty message list', async () => {
    const conversationId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      messages: [],
      totalMessages: 0,
      totalPages: 0,
      pageNumber: 0,
      pageSize: 50,
      hasMore: false,
    };

    mockMessagingService.getMessages.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useMessages(conversationId), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it('should handle pagination with hasMore', async () => {
    const conversationId = '123e4567-e89b-12d3-a456-426614174000';
    const mockResponse = {
      messages: Array(50)
        .fill(null)
        .map((_, i) => createMockMessage({ messageId: `msg-${i}` })),
      totalMessages: 100,
      totalPages: 2,
      pageNumber: 0,
      pageSize: 50,
      hasMore: true,
    };

    mockMessagingService.getMessages.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useMessages(conversationId), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(50);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should handle fetch error', async () => {
    const conversationId = '123e4567-e89b-12d3-a456-426614174000';
    const error = new Error('Network error');

    mockMessagingService.getMessages.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useMessages(conversationId), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should not fetch when conversationId is undefined', async () => {
    const { result } = renderHook(() => useMessages(undefined), { wrapper: createWrapper() });

    // Should not call API without conversationId
    expect(mockMessagingService.getMessages).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });
});
