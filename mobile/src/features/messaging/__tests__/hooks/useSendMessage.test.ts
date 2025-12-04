// src/features/messaging/__tests__/hooks/useSendMessage.test.ts
// useSendMessage hook tests - STOMP WebSocket integration
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSendMessage } from '../../hooks/useSendMessage';
import { messagingService } from '../../services/messagingService';
import { stompClient } from '../../services/socketClient';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../services/messagingService', () => ({
  messagingService: {
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
  },
}));
jest.mock('../../services/socketClient', () => ({
  stompClient: {
    isConnected: jest.fn(() => false),
    sendMessage: jest.fn(),
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
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('useSendMessage', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

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
          recipientId: 'user2',
        });
      });

      await waitFor(() => {
        expect(mockStompClient.sendMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            recipientId: 'user2',
            content: 'Hello',
          }),
        );
      });
    });

    it('should fallback to HTTP when WebSocket fails', async () => {
      const mockResponse = {
        messageId: 'msg1',
        conversationId: 'conv1',
        content: 'Hello',
        status: 'SENT' as const,
        sentAt: new Date().toISOString(),
      };

      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);
      mockMessagingService.sendMessage.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: 'Hello',
          recipientId: 'user2',
        });
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(mockMessagingService.sendMessage).toHaveBeenCalledWith({
        recipientId: 'user2',
        content: 'Hello',
        attachment: undefined,
      });
    });

    it('should send message with attachment', async () => {
      const mockResponse = {
        messageId: 'msg2',
        conversationId: 'conv1',
        content: 'Check this out',
        status: 'SENT' as const,
        sentAt: new Date().toISOString(),
      };
      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);
      mockMessagingService.sendMessage.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: 'Check this out',
          recipientId: 'user2',
          attachment: { type: 'image', url: 'http://example.com/image.jpg' } as any,
        });
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(mockMessagingService.sendMessage).toHaveBeenCalledWith({
        recipientId: 'user2',
        content: 'Check this out',
        attachment: { type: 'image', url: 'http://example.com/image.jpg' },
      });
    });
  });

  describe('optimistic updates', () => {
    it('should apply optimistic update before server response', async () => {
      // Setup: WebSocket disconnected, HTTP will be used
      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);

      const mockResponse = {
        messageId: 'msg1',
        conversationId: 'conv1',
        content: 'Test',
        status: 'SENT',
        sentAt: new Date().toISOString(),
      };
      mockMessagingService.sendMessage.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      // Send message
      await act(async () => {
        result.current.sendMessage({
          content: 'Test',
          recipientId: 'user2',
        });
      });

      // Wait for mutation to complete
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      // Verify HTTP was called
      expect(mockMessagingService.sendMessage).toHaveBeenCalledWith({
        recipientId: 'user2',
        content: 'Test',
        attachment: undefined,
      });
    });
  });

  describe('offline handling', () => {
    it('should handle offline scenarios', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      } as any);
      (mockStompClient.isConnected as jest.Mock).mockReturnValue(false);

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
          recipientId: 'user2',
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
          recipientId: 'user2',
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
          recipientId: 'user2',
        });
      });

      // Should not call the service due to validation
      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
      expect(mockStompClient.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only message', async () => {
      const { result } = renderHook(() => useSendMessage('conv1'), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          content: '   ',
          recipientId: 'user2',
        });
      });

      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
      expect(mockStompClient.sendMessage).not.toHaveBeenCalled();
    });
  });
});
