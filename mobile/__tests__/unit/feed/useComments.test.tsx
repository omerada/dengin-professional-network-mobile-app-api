// __tests__/unit/feed/useComments.test.ts
// useComments Hook Unit Tests
// Sprint 5-6: Social Feed & Posts

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useComments,
  useCommentsData,
  useAddComment,
  useDeleteComment,
} from '../../../src/features/feed/hooks';
import { feedService } from '../../../src/features/feed/services';
import type { CommentListResponse, Comment } from '../../../src/features/feed/types';
import React from 'react';

// Mock feedService - use jest.mock with auto-mocking
jest.mock('../../../src/features/feed/services');

const mockFeedService = feedService as jest.Mocked<typeof feedService>;

describe('useComments Hooks', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const mockComments: Comment[] = [
    {
      id: '1',
      author: {
        id: 1,
        name: 'John',
        surname: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
      },
      content: 'Great post!',
      likeCount: 5,
      isLiked: false,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      author: {
        id: 2,
        name: 'Jane',
        surname: 'Smith',
        avatarUrl: null,
      },
      content: 'Thanks for sharing',
      likeCount: 3,
      isLiked: true,
      createdAt: '2024-01-01T01:00:00Z',
    },
  ];

  const mockCommentsResponse: CommentListResponse = {
    comments: mockComments,
    page: 0,
    size: 20,
    totalElements: 2,
    totalPages: 1,
    hasNext: false,
  };

  describe('useComments', () => {
    it('should fetch comments for a post', async () => {
      mockFeedService.getComments.mockResolvedValue(mockCommentsResponse);

      const { result } = renderHook(() => useComments(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.getComments).toHaveBeenCalledWith(1, 0, 20);
    });

    it('should not fetch when postId is undefined', async () => {
      const { result } = renderHook(() => useComments(undefined), { wrapper });

      expect(result.current.isFetching).toBe(false);
      expect(mockFeedService.getComments).not.toHaveBeenCalled();
    });
  });

  describe('useCommentsData', () => {
    it('should return flattened comments array', async () => {
      mockFeedService.getComments.mockResolvedValue(mockCommentsResponse);

      const { result } = renderHook(() => useCommentsData(1), { wrapper });

      await waitFor(() => {
        expect(result.current.comments.length).toBe(2);
      });

      expect(result.current.totalCount).toBe(2);
    });

    it('should return empty array when no comments', async () => {
      mockFeedService.getComments.mockResolvedValue({
        comments: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
      });

      const { result } = renderHook(() => useCommentsData(1), { wrapper });

      await waitFor(() => {
        expect(result.current.comments.length).toBe(0);
      });

      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('useAddComment', () => {
    it('should add a new comment', async () => {
      const newComment: Comment = {
        id: '3',
        author: {
          id: 3,
          name: 'New',
          surname: 'User',
          avatarUrl: null,
        },
        content: 'New comment',
        likeCount: 0,
        isLiked: false,
        createdAt: '2024-01-01T02:00:00Z',
      };

      mockFeedService.addComment.mockResolvedValue(newComment);

      const { result } = renderHook(() => useAddComment(), { wrapper });

      await act(async () => {
        result.current.mutate({
          postId: 1,
          request: { content: 'New comment' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.addComment).toHaveBeenCalledWith(1, { content: 'New comment' });
    });

    it('should handle error when adding comment fails', async () => {
      mockFeedService.addComment.mockRejectedValue(new Error('Failed to add comment'));

      const { result } = renderHook(() => useAddComment(), { wrapper });

      await act(async () => {
        result.current.mutate({
          postId: 1,
          request: { content: 'New comment' },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Failed to add comment');
    });
  });

  describe('useDeleteComment', () => {
    it('should delete a comment', async () => {
      mockFeedService.deleteComment.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteComment(1), { wrapper });

      await act(async () => {
        result.current.mutate('1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.deleteComment).toHaveBeenCalledWith(1, '1');
    });
  });
});
