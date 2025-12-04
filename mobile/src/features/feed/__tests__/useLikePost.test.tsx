// src/features/feed/__tests__/useLikePost.test.tsx
// Like post hook unit testleri - optimistic updates
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLikePost } from '../hooks/useLikePost';
import { feedService } from '../services/feedService';
import { FEED_QUERY_KEY } from '../hooks/useFeed';
import type { FeedResponse, Post } from '../types';

// Mock feed service
jest.mock('../services/feedService');

const mockFeedService = feedService as jest.Mocked<typeof feedService>;

// Mock data - Backend API uyumlu
const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  postId: 1,
  content: 'Test post',
  author: {
    id: 1,
    name: 'Test',
    surname: 'User',
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
  ...overrides,
});

const mockFeedResponse: FeedResponse = {
  content: [createMockPost()],
  page: 0,
  size: 20,
  totalElements: 100,
  totalPages: 5,
  hasNext: true,
  hasPrevious: false,
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
    const likedPost = createMockPost({
      userInteraction: { isLiked: true, isSaved: false },
      stats: { likeCount: 10, commentCount: 5, viewCount: 2 },
    });
    queryClient.setQueryData([FEED_QUERY_KEY, undefined], {
      pages: [{ ...mockFeedResponse, content: [likedPost] }],
      pageParams: [0],
    });

    mockFeedService.unlikePost.mockResolvedValue({ isLiked: false, likeCount: 9 });

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Act: Unlike the post
    await act(async () => {
      result.current.mutate({ postId: 1, isLiked: true });
    });

    // Assert: Optimistic update should occur
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFeedService.unlikePost).toHaveBeenCalledWith(1);
  });

  it('should optimistically update like status on like', async () => {
    // Setup: Post is not liked
    const unlikedPost = createMockPost({
      userInteraction: { isLiked: false, isSaved: false },
      stats: { likeCount: 10, commentCount: 5, viewCount: 2 },
    });
    queryClient.setQueryData([FEED_QUERY_KEY, undefined], {
      pages: [{ ...mockFeedResponse, content: [unlikedPost] }],
      pageParams: [0],
    });

    mockFeedService.likePost.mockResolvedValue({ isLiked: true, likeCount: 11 });

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Act: Like the post
    await act(async () => {
      result.current.mutate({ postId: 1, isLiked: false });
    });

    // Assert: API should be called
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFeedService.likePost).toHaveBeenCalledWith(1);
  });

  it('should rollback on error', async () => {
    // Setup: Post is not liked
    const unlikedPost = createMockPost({
      userInteraction: { isLiked: false, isSaved: false },
      stats: { likeCount: 10, commentCount: 5, viewCount: 2 },
    });
    queryClient.setQueryData([FEED_QUERY_KEY, undefined], {
      pages: [{ ...mockFeedResponse, content: [unlikedPost] }],
      pageParams: [0],
    });

    mockFeedService.likePost.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Act: Try to like the post
    await act(async () => {
      result.current.mutate({ postId: 1, isLiked: false });
    });

    // Wait for mutation to settle
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // API was called but failed
    expect(mockFeedService.likePost).toHaveBeenCalledWith(1);
  });

  it('should call correct API based on isLiked status', async () => {
    const unlikedPost = createMockPost({
      userInteraction: { isLiked: false, isSaved: false },
      stats: { likeCount: 10, commentCount: 5, viewCount: 2 },
    });
    queryClient.setQueryData([FEED_QUERY_KEY, undefined], {
      pages: [{ ...mockFeedResponse, content: [unlikedPost] }],
      pageParams: [0],
    });

    mockFeedService.likePost.mockResolvedValue({ isLiked: true, likeCount: 11 });
    mockFeedService.unlikePost.mockResolvedValue({ isLiked: false, likeCount: 9 });

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Like the post
    await act(async () => {
      result.current.mutate({ postId: 1, isLiked: false });
    });

    await waitFor(() => {
      expect(mockFeedService.likePost).toHaveBeenCalledWith(1);
    });

    expect(mockFeedService.unlikePost).not.toHaveBeenCalled();
  });

  it('should not update if post not found in cache', async () => {
    // Setup: Empty cache
    queryClient.setQueryData([FEED_QUERY_KEY, undefined], {
      pages: [{ ...mockFeedResponse, content: [] }],
      pageParams: [0],
    });

    mockFeedService.likePost.mockResolvedValue({ isLiked: true, likeCount: 11 });

    const { result } = renderHook(() => useLikePost(), { wrapper });

    // Act: Try to like a non-existent post
    await act(async () => {
      result.current.mutate({ postId: 999, isLiked: false });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // API should still be called
    expect(mockFeedService.likePost).toHaveBeenCalledWith(999);
  });
});
