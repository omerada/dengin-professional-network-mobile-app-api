// __tests__/unit/feed/useFeed.test.ts
// useFeed Hook Unit Tests
// Sprint 5-6: Social Feed & Posts

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeed, useFeedPosts } from '../../../src/features/feed/hooks';
import { feedService } from '../../../src/features/feed/services';
import type { Post } from '../../../src/features/feed/types';
import React from 'react';

// Mock feedService
jest.mock('../../../src/features/feed/services', () => ({
  feedService: {
    getPersonalizedFeed: jest.fn(),
    getTrendingFeed: jest.fn(),
  },
}));

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

  describe('useFeed', () => {
    it('should fetch personalized feed on initial render', async () => {
      mockFeedService.getPersonalizedFeed.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => useFeed('all'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.getPersonalizedFeed).toHaveBeenCalledWith(0, 20, undefined);
    });

    it('should fetch trending feed when filter is trending', async () => {
      mockFeedService.getTrendingFeed.mockResolvedValue({
        content: mockPosts,
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });

      const { result } = renderHook(() => useFeed('trending'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.getTrendingFeed).toHaveBeenCalledWith(20);
    });

    it('should apply profession filter when provided', async () => {
      mockFeedService.getPersonalizedFeed.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => useFeed('all', 1), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockFeedService.getPersonalizedFeed).toHaveBeenCalledWith(0, 20, 1);
    });
  });

  describe('useFeedPosts', () => {
    it('should return flattened posts array', async () => {
      mockFeedService.getPersonalizedFeed.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => useFeedPosts('all'), { wrapper });

      await waitFor(() => {
        expect(result.current.posts.length).toBe(2);
      });

      expect(result.current.posts[0].postId).toBe(1);
      expect(result.current.posts[1].postId).toBe(2);
    });

    it('should handle loading state correctly', async () => {
      mockFeedService.getPersonalizedFeed.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPosts), 100))
      );

      const { result } = renderHook(() => useFeedPosts('all'), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should indicate when more pages are available', async () => {
      mockFeedService.getPersonalizedFeed.mockResolvedValue(
        Array(20).fill(mockPosts[0])
      );

      const { result } = renderHook(() => useFeedPosts('all'), { wrapper });

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(true);
      });
    });

    it('should indicate when no more pages available', async () => {
      mockFeedService.getPersonalizedFeed.mockResolvedValue([mockPosts[0]]);

      const { result } = renderHook(() => useFeedPosts('all'), { wrapper });

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(false);
      });
    });
  });
});
