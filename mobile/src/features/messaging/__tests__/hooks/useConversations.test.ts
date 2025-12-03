// src/features/messaging/__tests__/hooks/useConversations.test.ts
// Conversations hook tests - STOMP WebSocket integration
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useConversations,
  useConversation,
  useUnreadCount,
  useTotalUnreadCount,
} from '../../hooks/useConversations';
import { messagingService } from '../../services/messagingService';
import { stompClient } from '@core/socket';

jest.mock('../../services/messagingService');
jest.mock('@core/socket', () => ({
  stompClient: {
    on: jest.fn(() => jest.fn()),
    isConnected: jest.fn(() => true),
  },
}));

const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;
const mockStompClient = stompClient as jest.Mocked<typeof stompClient>;

describe('useConversations', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  const mockConversations = [
    {
      id: 'conv1',
      participantIds: ['user1', 'user2'],
      lastMessage: {
        id: 'msg1',
        content: 'Hello',
        senderId: 'user1',
        createdAt: '2024-01-15T10:00:00Z',
      },
      unreadCount: 2,
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'conv2',
      participantIds: ['user1', 'user3'],
      lastMessage: {
        id: 'msg2',
        content: 'Hi there',
        senderId: 'user3',
        createdAt: '2024-01-15T09:30:00Z',
      },
      unreadCount: 0,
      createdAt: '2024-01-14T08:00:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
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
    (mockStompClient.on as jest.Mock).mockImplementation(() => jest.fn());
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useConversations', () => {
    it('should fetch conversations', async () => {
      mockMessagingService.getConversations.mockResolvedValueOnce({
        content: mockConversations,
        hasNext: false,
        nextCursor: null,
      });

      const { result } = renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversations).toHaveLength(2);
      expect(result.current.conversations[0].id).toBe('conv1');
      expect(mockMessagingService.getConversations).toHaveBeenCalled();
    });

    it('should return empty array initially', () => {
      mockMessagingService.getConversations.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useConversations(), { wrapper });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle fetch error', async () => {
      mockMessagingService.getConversations.mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should register STOMP listeners on mount', async () => {
      mockMessagingService.getConversations.mockResolvedValueOnce({
        content: [],
        hasNext: false,
        nextCursor: null,
      });

      renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(mockStompClient.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(mockStompClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      });
    });

    it('should cleanup STOMP listeners on unmount', async () => {
      const unsubscribeMock = jest.fn();
      (mockStompClient.on as jest.Mock).mockReturnValue(unsubscribeMock);

      mockMessagingService.getConversations.mockResolvedValueOnce({
        content: [],
        hasNext: false,
        nextCursor: null,
      });

      const { unmount } = renderHook(() => useConversations(), { wrapper });

      await waitFor(() => {
        expect(mockStompClient.on).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('useConversation', () => {
    it('should fetch single conversation', async () => {
      mockMessagingService.getConversation.mockResolvedValueOnce(mockConversations[0]);

      const { result } = renderHook(() => useConversation('conv1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversation?.id).toBe('conv1');
      expect(mockMessagingService.getConversation).toHaveBeenCalledWith('conv1');
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useConversation(''), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockMessagingService.getConversation).not.toHaveBeenCalled();
    });
  });

  describe('useUnreadCount', () => {
    it('should return unread count for conversation', async () => {
      // Pre-populate cache
      queryClient.setQueryData(['conversations'], {
        pages: [{ content: mockConversations }],
        pageParams: [undefined],
      });

      const { result } = renderHook(() => useUnreadCount('conv1'), { wrapper });

      expect(result.current).toBe(2);
    });

    it('should return 0 for unknown conversation', () => {
      queryClient.setQueryData(['conversations'], {
        pages: [{ content: mockConversations }],
        pageParams: [undefined],
      });

      const { result } = renderHook(() => useUnreadCount('unknown'), { wrapper });

      expect(result.current).toBe(0);
    });
  });

  describe('useTotalUnreadCount', () => {
    it('should return total unread count across all conversations', async () => {
      queryClient.setQueryData(['conversations'], {
        pages: [{ content: mockConversations }],
        pageParams: [undefined],
      });

      const { result } = renderHook(() => useTotalUnreadCount(), { wrapper });

      // conv1 has 2, conv2 has 0
      expect(result.current).toBe(2);
    });

    it('should return 0 when no conversations', () => {
      queryClient.setQueryData(['conversations'], {
        pages: [{ content: [] }],
        pageParams: [undefined],
      });

      const { result } = renderHook(() => useTotalUnreadCount(), { wrapper });

      expect(result.current).toBe(0);
    });
  });

  describe('pagination', () => {
    it('should fetch next page', async () => {
      mockMessagingService.getConversations
        .mockResolvedValueOnce({
          content: [mockConversations[0]],
          hasNext: true,
          nextCursor: 'cursor1',
        })
        .mockResolvedValueOnce({
          content: [mockConversations[1]],
          hasNext: false,
          nextCursor: null,
        });

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
      mockMessagingService.getConversations.mockResolvedValue({
        content: mockConversations,
        hasNext: false,
        nextCursor: null,
      });

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
