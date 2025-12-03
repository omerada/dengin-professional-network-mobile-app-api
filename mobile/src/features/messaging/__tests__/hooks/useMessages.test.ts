// src/features/messaging/__tests__/hooks/useMessages.test.ts
// useMessages hook tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMessages } from '../../hooks/useMessages';
import { messagingService } from '../../services/messagingService';
import { socketClient } from '../../services/socketClient';

jest.mock('../../services/messagingService');
jest.mock('../../services/socketClient');

const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;
const mockSocketClient = socketClient as jest.Mocked<typeof socketClient>;

describe('useMessages', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  const mockMessages = [
    {
      id: 'msg1',
      content: 'Hello',
      senderId: 'user1',
      conversationId: 'conv1',
      status: 'read' as const,
      createdAt: '2024-01-15T10:00:00Z',
      type: 'text' as const,
    },
    {
      id: 'msg2',
      content: 'Hi there',
      senderId: 'user2',
      conversationId: 'conv1',
      status: 'read' as const,
      createdAt: '2024-01-15T10:01:00Z',
      type: 'text' as const,
    },
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
    mockSocketClient.on.mockImplementation(() => {});
    mockSocketClient.off.mockImplementation(() => {});
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('data fetching', () => {
    it('should fetch messages for conversation', async () => {
      mockMessagingService.getMessages.mockResolvedValueOnce({
        content: mockMessages,
        hasNext: false,
        nextCursor: null,
      });

      const { result } = renderHook(() => useMessages('conv1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(mockMessagingService.getMessages).toHaveBeenCalledWith('conv1', 50, undefined);
    });

    it('should return empty array initially', () => {
      mockMessagingService.getMessages.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useMessages('conv1'), { wrapper });

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle fetch error', async () => {
      mockMessagingService.getMessages.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useMessages('conv1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('pagination', () => {
    it('should fetch next page', async () => {
      mockMessagingService.getMessages
        .mockResolvedValueOnce({
          content: mockMessages.slice(0, 1),
          hasNext: true,
          nextCursor: 'cursor1',
        })
        .mockResolvedValueOnce({
          content: mockMessages.slice(1),
          hasNext: false,
          nextCursor: null,
        });

      const { result } = renderHook(() => useMessages('conv1'), { wrapper });

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(true);
      });

      act(() => {
        result.current.fetchNextPage();
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });
    });

    it('should indicate when no more pages', async () => {
      mockMessagingService.getMessages.mockResolvedValueOnce({
        content: mockMessages,
        hasNext: false,
        nextCursor: null,
      });

      const { result } = renderHook(() => useMessages('conv1'), { wrapper });

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(false);
      });
    });
  });

  describe('socket events', () => {
    it('should register socket listeners on mount', async () => {
      mockMessagingService.getMessages.mockResolvedValueOnce({
        content: [],
        hasNext: false,
        nextCursor: null,
      });

      renderHook(() => useMessages('conv1'), { wrapper });

      await waitFor(() => {
        expect(mockSocketClient.on).toHaveBeenCalledWith('message:new', expect.any(Function));
        expect(mockSocketClient.on).toHaveBeenCalledWith('message:status', expect.any(Function));
        expect(mockSocketClient.on).toHaveBeenCalledWith('message:deleted', expect.any(Function));
      });
    });

    it('should unregister socket listeners on unmount', async () => {
      mockMessagingService.getMessages.mockResolvedValueOnce({
        content: [],
        hasNext: false,
        nextCursor: null,
      });

      const { unmount } = renderHook(() => useMessages('conv1'), { wrapper });

      await waitFor(() => {
        expect(mockSocketClient.on).toHaveBeenCalled();
      });

      unmount();

      expect(mockSocketClient.off).toHaveBeenCalledWith('message:new', expect.any(Function));
      expect(mockSocketClient.off).toHaveBeenCalledWith('message:status', expect.any(Function));
      expect(mockSocketClient.off).toHaveBeenCalledWith('message:deleted', expect.any(Function));
    });
  });

  describe('refetch', () => {
    it('should refetch messages', async () => {
      mockMessagingService.getMessages.mockResolvedValue({
        content: mockMessages,
        hasNext: false,
        nextCursor: null,
      });

      const { result } = renderHook(() => useMessages('conv1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockMessagingService.getMessages).toHaveBeenCalledTimes(2);
      });
    });
  });
});
