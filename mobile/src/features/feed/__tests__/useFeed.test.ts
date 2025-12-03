// src/features/feed/__tests__/useFeed.test.ts
// Feed hook unit testleri
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFeed, useFeedPosts } from '../hooks/useFeed';
import { feedService } from '../services/feedService';
import type { FeedResponse, Post } from '../types';

// Mock feed service
jest.mock('../services/feedService');

const mockFeedService = feedService as jest.Mocked<typeof feedService>;

// Mock data
const mockPost1: Post = {
  id: 'post-1',
  content: 'First post',
  author: {
    id: 'user-1',
    name: 'User 1',
    avatarUrl: null,
    profession: 'Engineer',
    isVerified: true,
  },
  images: [],
  likesCount: 10,
  commentsCount: 5,
  sharesCount: 2,
  isLiked: false,
  isBookmarked: false,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

const mockPost2: Post = {
  ...mockPost1,
  id: 'post-2',
  content: 'Second post',
};

const mockFirstPage: FeedResponse = {
  data: [mockPost1, mockPost2],
  pagination: {
    cursor: 'cursor-page-1',
    hasMore: true,
    totalCount: 100,
  },
  nextCursor: 'cursor-page-1',
  hasMore: true,
};

const mockSecondPage: FeedResponse = {
  data: [{ ...mockPost1, id: 'post-3' }, { ...mockPost1, id: 'post-4' }],
  pagination: {
    cursor: 'cursor-page-2',
    hasMore: false,
    totalCount: 100,
  },
  nextCursor: null,
  hasMore: false,
};

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch initial feed data', async () => {
    mockFeedService.getFeed.mockResolvedValue(mockFirstPage);

    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0].data).toHaveLength(2);
    expect(mockFeedService.getFeed).toHaveBeenCalledWith(undefined, 'all', 20);
  });

  it('should handle filter parameter', async () => {
    mockFeedService.getFeed.mockResolvedValue(mockFirstPage);

    const { result } = renderHook(() => useFeed('following'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFeedService.getFeed).toHaveBeenCalledWith(undefined, 'following', 20);
  });

  it('should fetch next page when hasNextPage is true', async () => {
    mockFeedService.getFeed
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage);

    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(true);

    // Fetch next page
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });

    expect(mockFeedService.getFeed).toHaveBeenCalledTimes(2);
    expect(mockFeedService.getFeed).toHaveBeenLastCalledWith('cursor-page-1', 'all', 20);
  });

  it('should set hasNextPage to false when no more pages', async () => {
    mockFeedService.getFeed
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage);

    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(false);
    });
  });

  it('should handle API error', async () => {
    mockFeedService.getFeed.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });
});

describe('useFeedPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should flatten pages into posts array', async () => {
    mockFeedService.getFeed
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage);

    const { result } = renderHook(() => useFeedPosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First page has 2 posts
    expect(result.current.posts).toHaveLength(2);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      // After second page, should have 4 posts total
      expect(result.current.posts).toHaveLength(4);
    });
  });

  it('should return empty array when no data', async () => {
    mockFeedService.getFeed.mockResolvedValue({
      data: [],
      pagination: { cursor: null, hasMore: false, totalCount: 0 },
      nextCursor: null,
      hasMore: false,
    });

    const { result } = renderHook(() => useFeedPosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toEqual([]);
  });
});
