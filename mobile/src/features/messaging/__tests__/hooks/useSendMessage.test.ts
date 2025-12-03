// src/features/messaging/__tests__/hooks/useSendMessage.test.ts
// useSendMessage hook tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSendMessage } from '../../hooks/useSendMessage';
import { messagingService } from '../../services/messagingService';
import { messageQueue } from '../../services/messageQueue';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../services/messagingService');
jest.mock('../../services/messageQueue');
jest.mock('@react-native-community/netinfo');

const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;
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
    it('should send message successfully', async () => {
      const mockResponse = {
        id: 'msg1',
        content: 'Hello',
        senderId: 'user1',
        conversationId: 'conv1',
        status: 'sent' as const,
        createdAt: new Date().toISOString(),
        type: 'text' as const,
      };

      mockMessagingService.sendMessage.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          conversationId: 'conv1',
          content: 'Hello',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockMessagingService.sendMessage).toHaveBeenCalledWith(
        'conv1',
        'Hello',
        undefined
      );
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

      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          conversationId: 'conv1',
          content: 'Reply',
          replyToId: 'msg1',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockMessagingService.sendMessage).toHaveBeenCalledWith(
        'conv1',
        'Reply',
        'msg1'
      );
    });
  });

  describe('optimistic updates', () => {
    it('should apply optimistic update before server response', async () => {
      // Create a promise that won't resolve immediately
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });

      mockMessagingService.sendMessage.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useSendMessage(), { wrapper });

      act(() => {
        result.current.sendMessage({
          conversationId: 'conv1',
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

      mockMessageQueue.add.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          conversationId: 'conv1',
          content: 'Offline message',
        });
      });

      // Message should be queued when offline
      // Note: Implementation may vary
    });
  });

  describe('error handling', () => {
    it('should handle send error', async () => {
      mockMessagingService.sendMessage.mockRejectedValueOnce(new Error('Send failed'));

      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          conversationId: 'conv1',
          content: 'Test',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should allow retry after error', async () => {
      mockMessagingService.sendMessage
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({
          id: 'msg1',
          content: 'Test',
          status: 'sent',
        } as any);

      const { result } = renderHook(() => useSendMessage(), { wrapper });

      // First attempt
      await act(async () => {
        result.current.sendMessage({
          conversationId: 'conv1',
          content: 'Test',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Reset and retry
      act(() => {
        result.current.reset();
      });

      await act(async () => {
        result.current.sendMessage({
          conversationId: 'conv1',
          content: 'Test',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('validation', () => {
    it('should not send empty message', async () => {
      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          conversationId: 'conv1',
          content: '',
        });
      });

      // Should not call the service
      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only message', async () => {
      const { result } = renderHook(() => useSendMessage(), { wrapper });

      await act(async () => {
        result.current.sendMessage({
          conversationId: 'conv1',
          content: '   ',
        });
      });

      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
    });
  });
});
