// src/features/feed/__tests__/useLikePost.test.ts
// Like post hook unit testleri - optimistic updates
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLikePost } from '../hooks/useLikePost';
import { feedService } from '../services/feedService';
import { FEED_QUERY_KEY } from '../hooks/useFeed';
import type { FeedResponse, Post } from '../types';

// Mock feed service
jest.mock('../services/feedService');
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

const mockFeedService = feedService as jest.Mocked<typeof feedService>;

// Mock data
const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 'post-1',
  content: 'Test post',
  author: {
    id: 'user-1',
    name: 'Test User',
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
  ...overrides,
});

const mockFeedResponse: FeedResponse = {
  data: [createMockPost()],
  pagination: {
    cursor: 'cursor-1',
    hasMore: true,
    totalCount: 100,
  },
  nextCursor: 'cursor-1',
  hasMore: true,
};

describe('useLikePost', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should optimistically update like status on unlike', async () => {
    // Setup: Post is liked
    const likedPost = createMockPost({ isLiked: true, likesCount: 10 });
    queryClient.setQueryData([FEED_QUERY_KEY, 'all'], {
      pages: [{ ...mockFeedResponse, data: [likedPost] }],
      pageParams: [undefined],
    });

    mockFeedService.unlikePost.mockResolvedValue({ likesCount: 9 });

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Act: Unlike the post
    await act(async () => {
      result.current.mutate({ postId: 'post-1', isLiked: true });
    });

    // Assert: Optimistic update should occur immediately
    const updatedData = queryClient.getQueryData<{
      pages: FeedResponse[];
      pageParams: unknown[];
    }>([FEED_QUERY_KEY, 'all']);

    await waitFor(() => {
      const post = updatedData?.pages[0].data[0];
      expect(post?.isLiked).toBe(false);
      expect(post?.likesCount).toBe(9);
    });
  });

  it('should optimistically update like status on like', async () => {
    // Setup: Post is not liked
    const unlikedPost = createMockPost({ isLiked: false, likesCount: 10 });
    queryClient.setQueryData([FEED_QUERY_KEY, 'all'], {
      pages: [{ ...mockFeedResponse, data: [unlikedPost] }],
      pageParams: [undefined],
    });

    mockFeedService.likePost.mockResolvedValue({ likesCount: 11 });

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Act: Like the post
    await act(async () => {
      result.current.mutate({ postId: 'post-1', isLiked: false });
    });

    // Assert: Optimistic update
    const updatedData = queryClient.getQueryData<{
      pages: FeedResponse[];
      pageParams: unknown[];
    }>([FEED_QUERY_KEY, 'all']);

    await waitFor(() => {
      const post = updatedData?.pages[0].data[0];
      expect(post?.isLiked).toBe(true);
      expect(post?.likesCount).toBe(11);
    });
  });

  it('should rollback on error', async () => {
    // Setup: Post is not liked
    const unlikedPost = createMockPost({ isLiked: false, likesCount: 10 });
    queryClient.setQueryData([FEED_QUERY_KEY, 'all'], {
      pages: [{ ...mockFeedResponse, data: [unlikedPost] }],
      pageParams: [undefined],
    });

    mockFeedService.likePost.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Act: Try to like the post
    await act(async () => {
      result.current.mutate({ postId: 'post-1', isLiked: false });
    });

    // Wait for mutation to settle
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Assert: Should rollback to original state
    const rolledBackData = queryClient.getQueryData<{
      pages: FeedResponse[];
      pageParams: unknown[];
    }>([FEED_QUERY_KEY, 'all']);

    expect(rolledBackData?.pages[0].data[0]?.isLiked).toBe(false);
    expect(rolledBackData?.pages[0].data[0]?.likesCount).toBe(10);
  });

  it('should call correct API based on isLiked status', async () => {
    const unlikedPost = createMockPost({ isLiked: false, likesCount: 10 });
    queryClient.setQueryData([FEED_QUERY_KEY, 'all'], {
      pages: [{ ...mockFeedResponse, data: [unlikedPost] }],
      pageParams: [undefined],
    });

    mockFeedService.likePost.mockResolvedValue({ likesCount: 11 });
    mockFeedService.unlikePost.mockResolvedValue({ likesCount: 9 });

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Like the post
    await act(async () => {
      result.current.mutate({ postId: 'post-1', isLiked: false });
    });

    await waitFor(() => {
      expect(mockFeedService.likePost).toHaveBeenCalledWith('post-1');
    });

    expect(mockFeedService.unlikePost).not.toHaveBeenCalled();
  });

  it('should not update if post not found in cache', async () => {
    // Setup: Empty cache
    queryClient.setQueryData([FEED_QUERY_KEY, 'all'], {
      pages: [{ ...mockFeedResponse, data: [] }],
      pageParams: [undefined],
    });

    mockFeedService.likePost.mockResolvedValue({ likesCount: 11 });

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Act: Try to like a non-existent post
    await act(async () => {
      result.current.mutate({ postId: 'non-existent', isLiked: false });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // API should still be called
    expect(mockFeedService.likePost).toHaveBeenCalledWith('non-existent');
  });
});
