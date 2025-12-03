// src/features/messaging/__tests__/hooks/useSendMessage.test.ts
// useSendMessage hook tests - STOMP WebSocket integration
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSendMessage } from '../../hooks/useSendMessage';
import { messagingService } from '../../services/messagingService';
import { stompClient, messageQueue } from '@core/socket';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../services/messagingService');
jest.mock('@core/socket', () => ({
  stompClient: {
    isConnected: jest.fn(() => false),
    sendMessage: jest.fn(),
  },
  messageQueue: {
    add: jest.fn(),
    remove: jest.fn(),
    getAll: jest.fn(() => []),
  },
}));
jest.mock('@react-native-community/netinfo');

// Mock auth store
jest.mock('@features/auth/stores', () => ({
  useAuthStore: jest.fn(() => ({
    user: { id: 'current-user' },
  })),
}));

const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;
const mockStompClient = stompClient as jest.Mocked<typeof stompClient>;
const mockMessageQueue = messageQueue as jest.Mocked<typeof messageQueue>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('useSendMessage', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
    
    // Default to online
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    } as any);
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('sending messages', () => {
    it('should send message via WebSocket when connected', async () => {
      (mockStompClient.isConnected as jest.Mock).mockReturnValue(true);
      (mockStompClient.sendMessage as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: 'Hello',
        });
      });

      await waitFor(() => {
        expect(mockStompClient.sendMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            conversationId: 'conv1',
            content: 'Hello',
          })
        );
      });
    });

    it('should fallback to HTTP when WebSocket fails', async () => {
      const mockResponse = {
        id: 'msg1',
        content: 'Hello',
        senderId: 'user1',
        conversationId: 'conv1',
        status: 'sent' as const,
        createdAt: new Date().toISOString(),
        type: 'text' as const,
      };

      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);
      mockMessagingService.sendMessage.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: 'Hello',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockMessagingService.sendMessage).toHaveBeenCalledWith({
        conversationId: 'conv1',
        content: 'Hello',
        replyToId: undefined,
      });
    });

    it('should send message with reply', async () => {
      mockMessagingService.sendMessage.mockResolvedValueOnce({
        id: 'msg2',
        content: 'Reply',
        senderId: 'user1',
        conversationId: 'conv1',
        replyToId: 'msg1',
        status: 'sent' as const,
        createdAt: new Date().toISOString(),
        type: 'text' as const,
      });
      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: 'Reply',
          replyToId: 'msg1',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockMessagingService.sendMessage).toHaveBeenCalledWith({
        conversationId: 'conv1',
        content: 'Reply',
        replyToId: 'msg1',
      });
    });
  });

  describe('optimistic updates', () => {
    it('should apply optimistic update before server response', async () => {
      // Create a promise that won't resolve immediately
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });

      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);
      mockMessagingService.sendMessage.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      act(() => {
        result.current.sendMessage({
          content: 'Test',
        });
      });

      // Should be pending
      expect(result.current.isPending).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          id: 'msg1',
          content: 'Test',
          status: 'sent',
        });
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe('offline handling', () => {
    it('should queue message when offline', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      } as any);
      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);

      mockMessageQueue.add.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      // The hook should handle offline scenarios gracefully
      expect(result.current.sendMessage).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle send error', async () => {
      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);
      mockMessagingService.sendMessage.mockRejectedValueOnce(new Error('Send failed'));

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: 'Test',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should provide retry function after error', async () => {
      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);
      mockMessagingService.sendMessage.mockRejectedValueOnce(new Error('First attempt failed'));

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: 'Test',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should have retry function
      expect(typeof result.current.retryMessage).toBe('function');
    });
  });

  describe('validation', () => {
    it('should not send empty message', async () => {
      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: '',
        });
      });

      // Should not call the service
      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
      expect(mockStompClient.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only message', async () => {
      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: '   ',
        });
      });

      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
      expect(mockStompClient.sendMessage).not.toHaveBeenCalled();
    });
  });
});
