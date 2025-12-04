// src/features/feed/__tests__/useFeed.test.tsx
// Feed hook unit testleri - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeed, useFeedPosts } from '../hooks/useFeed';
import { feedService } from '../services/feedService';
import type { FeedResponse, Post } from '../types';

// Mock feed service
jest.mock('../services/feedService');

const mockFeedService = feedService as jest.Mocked<typeof feedService>;

// Mock data - Backend API uyumlu
const mockPost1: Post = {
  postId: 1,
  content: 'First post',
  author: {
    id: 1,
    name: 'User',
    surname: '1',
    avatarUrl: undefined,
    profession: 'Engineer',
    isVerified: true,
  },
  images: [],
  stats: {
    likeCount: 10,
    commentCount: 5,
    viewCount: 2,
  },
  userInteraction: {
    isLiked: false,
    isSaved: false,
  },
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

const mockPost2: Post = {
  ...mockPost1,
  postId: 2,
  content: 'Second post',
};

const mockFirstPage: FeedResponse = {
  content: [mockPost1, mockPost2],
  page: 0,
  size: 20,
  totalElements: 100,
  totalPages: 5,
  hasNext: true,
  hasPrevious: false,
};

const mockSecondPage: FeedResponse = {
  content: [
    { ...mockPost1, postId: 3 },
    { ...mockPost1, postId: 4 },
  ],
  page: 1,
  size: 20,
  totalElements: 100,
  totalPages: 5,
  hasNext: false,
  hasPrevious: true,
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
    expect(result.current.data?.pages[0].content).toHaveLength(2);
    expect(mockFeedService.getFeed).toHaveBeenCalledWith(0, 20, undefined);
  });

  it('should handle professionFilter parameter', async () => {
    mockFeedService.getFeed.mockResolvedValue(mockFirstPage);

    const { result } = renderHook(() => useFeed(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFeedService.getFeed).toHaveBeenCalledWith(0, 20, 5);
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
    expect(mockFeedService.getFeed).toHaveBeenLastCalledWith(1, 20, undefined);
  });

  it('should set hasNextPage to false when no more pages', async () => {
    const noMorePagesResponse: FeedResponse = {
      content: [mockPost1],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };

    mockFeedService.getFeed.mockResolvedValue(noMorePagesResponse);

    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(false);
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
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
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
