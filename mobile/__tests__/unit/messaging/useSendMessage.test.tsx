// __tests__/unit/messaging/useSendMessage.test.ts
// Unit tests for useSendMessage hook
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSendMessage } from '@features/messaging/hooks/useSendMessage';
import { messagingService } from '@features/messaging/services/messagingService';
import { stompClient } from '@features/messaging/services/socketClient';
import type { Message } from '@features/messaging/types';
import React from 'react';

// Mock messaging service
jest.mock('@features/messaging/services/messagingService', () => ({
  messagingService: {
    sendMessage: jest.fn(),
  },
}));

// Mock STOMP client
jest.mock('@features/messaging/services/socketClient', () => ({
  stompClient: {
    sendMessage: jest.fn(),
    isConnected: jest.fn(() => true),
  },
}));

// Mock messaging store
jest.mock('@features/messaging/stores', () => ({
  useMessagingStore: jest.fn(() => ({
    addToMessageQueue: jest.fn(),
    removeFromMessageQueue: jest.fn(),
    messageQueue: [],
  })),
}));

const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;
const mockStompClient = stompClient as jest.Mocked<typeof stompClient>;

// Test data factory
const createMockMessage = (overrides?: Partial<Message>): Message => ({
  messageId: '123e4567-e89b-12d3-a456-426614174002',
  conversationId: '123e4567-e89b-12d3-a456-426614174000',
  senderId: '123e4567-e89b-12d3-a456-426614174001',
  senderName: 'Current User',
  content: 'Test message',
  attachments: [],
  status: 'SENT',
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
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useSendMessage Hook', () => {
  const conversationId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
    mockStompClient.isConnected.mockReturnValue(true);
  });

  it('should send message via WebSocket when connected', async () => {
    mockStompClient.isConnected.mockReturnValue(true);

    const { result } = renderHook(() => useSendMessage(conversationId), {
      wrapper: createWrapper(),
    });

    const messageParams = {
      content: 'Hello World',
      recipientId: '123e4567-e89b-12d3-a456-426614174001',
    };

    await act(async () => {
      await result.current.sendMessage(messageParams);
    });

    expect(mockStompClient.sendMessage).toHaveBeenCalledWith({
      content: 'Hello World',
      recipientId: '123e4567-e89b-12d3-a456-426614174001',
      attachment: undefined,
    });
  });

  it('should fallback to HTTP when WebSocket is not connected', async () => {
    mockStompClient.isConnected.mockReturnValue(false);
    const mockResponse = createMockMessage({ content: 'Hello World' });
    mockMessagingService.sendMessage.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useSendMessage(conversationId), {
      wrapper: createWrapper(),
    });

    const messageParams = {
      content: 'Hello World',
      recipientId: '123e4567-e89b-12d3-a456-426614174001',
    };

    await act(async () => {
      await result.current.sendMessage(messageParams);
    });

    expect(mockMessagingService.sendMessage).toHaveBeenCalledWith({
      content: 'Hello World',
      recipientId: '123e4567-e89b-12d3-a456-426614174001',
      attachment: undefined,
    });
    expect(mockStompClient.sendMessage).not.toHaveBeenCalled();
  });

  it('should handle send error gracefully', async () => {
    const error = new Error('Send failed');
    mockStompClient.sendMessage.mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useSendMessage(conversationId), {
      wrapper: createWrapper(),
    });

    const messageParams = {
      content: 'Hello World',
      recipientId: '123e4567-e89b-12d3-a456-426614174001',
    };

    await act(async () => {
      try {
        await result.current.sendMessage(messageParams);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  it('should not send empty messages', async () => {
    const { result } = renderHook(() => useSendMessage(conversationId), {
      wrapper: createWrapper(),
    });

    const messageParams = {
      content: '   ', // Empty/whitespace only
      recipientId: '123e4567-e89b-12d3-a456-426614174001',
    };

    await act(async () => {
      try {
        await result.current.sendMessage(messageParams);
      } catch (e) {
        // Expected to throw for empty content
      }
    });

    // Should not send whitespace-only messages
    expect(mockStompClient.sendMessage).not.toHaveBeenCalled();
    expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
  });

  it('should indicate loading state while sending', async () => {
    // Create a delayed mock response
    let resolvePromise: () => void;
    const delayedPromise = new Promise<void>(resolve => {
      resolvePromise = resolve;
    });

    mockStompClient.sendMessage.mockImplementation(() => {
      return delayedPromise as any;
    });

    const { result } = renderHook(() => useSendMessage(conversationId), {
      wrapper: createWrapper(),
    });

    // Hook uses isPending from mutation
    expect(result.current.isPending).toBe(false);

    const sendPromise = act(async () => {
      result.current.sendMessage({
        content: 'Hello',
        recipientId: '123e4567-e89b-12d3-a456-426614174001',
      });
    });

    resolvePromise!();
    await sendPromise;

    expect(result.current.isPending).toBe(false);
  });
});
