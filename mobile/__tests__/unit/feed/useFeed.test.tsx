// __tests__/unit/feed/useFeed.test.ts
// useFeed Hook Unit Tests
// Sprint 5-6: Social Feed & Posts

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeed, useFeedPosts } from '../../../src/features/feed/hooks';
import { useTrendingFeed } from '../../../src/features/feed/hooks/useFeed';
import { feedService } from '../../../src/features/feed/services';
import type { Post, FeedResponse } from '../../../src/features/feed/types';
import React from 'react';

// Mock feedService - use jest.mock with auto-mocking
jest.mock('../../../src/features/feed/services');

const mockFeedService = feedService as jest.Mocked<typeof feedService>;

describe('useFeed Hook', () => {
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
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const mockPosts: Post[] = [
    {
      postId: 1,
      author: {
        id: 1,
        name: 'John',
        surname: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        profession: 'Software Engineer',
        isVerified: true,
      },
      content: 'Test post 1',
      images: ['https://s3.example.com/image1.jpg'],
      stats: { likeCount: 10, commentCount: 5, viewCount: 100 },
      userInteraction: { isLiked: false, isSaved: false },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      postId: 2,
      author: {
        id: 2,
        name: 'Jane',
        surname: 'Smith',
        avatarUrl: null,
        profession: 'Doctor',
        isVerified: true,
      },
      content: 'Test post 2',
      images: [],
      stats: { likeCount: 20, commentCount: 10, viewCount: 200 },
      userInteraction: { isLiked: true, isSaved: true },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockFeedResponse: FeedResponse = {
    content: mockPosts,
    page: 0,
    size: 20,
    totalElements: 2,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  describe('useFeed', () => {
    it('should fetch feed on initial render', async () => {
      mockFeedService.getFeed.mockResolvedValue(mockFeedResponse);

      const { result } = renderHook(() => useFeed(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.getFeed).toHaveBeenCalledWith(0, 20, undefined);
    });

    it('should fetch trending feed', async () => {
      mockFeedService.getTrendingFeed.mockResolvedValue(mockFeedResponse);

      const { result } = renderHook(() => useTrendingFeed(20), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.getTrendingFeed).toHaveBeenCalledWith(20);
    });

    it('should apply profession filter when provided', async () => {
      mockFeedService.getFeed.mockResolvedValue(mockFeedResponse);

      const { result } = renderHook(() => useFeed(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.getFeed).toHaveBeenCalledWith(0, 20, 1);
    });
  });

  describe('useFeedPosts', () => {
    it('should return flattened posts array', async () => {
      mockFeedService.getFeed.mockResolvedValue(mockFeedResponse);

      const { result } = renderHook(() => useFeedPosts(), { wrapper });

      await waitFor(() => {
        expect(result.current.posts.length).toBe(2);
      });

      expect(result.current.posts[0].postId).toBe(1);
      expect(result.current.posts[1].postId).toBe(2);
    });

    it('should handle loading state correctly', async () => {
      mockFeedService.getFeed.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockFeedResponse), 100)),
      );

      const { result } = renderHook(() => useFeedPosts(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should indicate when more pages are available', async () => {
      mockFeedService.getFeed.mockResolvedValue({
        ...mockFeedResponse,
        hasNext: true,
      });

      const { result } = renderHook(() => useFeedPosts(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(true);
      });
    });

    it('should indicate when no more pages available', async () => {
      mockFeedService.getFeed.mockResolvedValue({
        ...mockFeedResponse,
        hasNext: false,
      });

      const { result } = renderHook(() => useFeedPosts(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(false);
      });
    });
  });
});
