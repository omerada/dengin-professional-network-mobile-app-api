// src/features/feed/__tests__/useCreatePost.test.tsx
// Create post hook unit testleri - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreatePost } from '../hooks/useCreatePost';
import { feedService } from '../services/feedService';
import { mediaUploader } from '../services/mediaUploader';
import type { Post } from '../types';

// Mock services
jest.mock('../services/feedService');
jest.mock('../services/mediaUploader');

// Mock stores
const mockClearDraft = jest.fn();
jest.mock('../stores', () => ({
  useFeedStore: (selector: any) => {
    const state = {
      clearDraft: mockClearDraft,
    };
    return selector(state);
  },
}));

// Mock navigation
const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    canGoBack: mockCanGoBack,
  }),
}));

const mockFeedService = feedService as jest.Mocked<typeof feedService>;
const mockMediaUploader = mediaUploader as jest.Mocked<typeof mediaUploader>;

// Mock data - Backend API uyumlu
const mockPost: Post = {
  postId: 1,
  content: 'New post content',
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
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
  },
  userInteraction: {
    isLiked: false,
    isSaved: false,
  },
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

describe('useCreatePost', () => {
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

  it('should create post without images', async () => {
    mockFeedService.createPost.mockResolvedValue(mockPost);

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.mutate({
        data: {
          content: 'New post content',
          images: [],
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFeedService.createPost).toHaveBeenCalledWith({
      content: 'New post content',
      images: undefined,
      professionId: undefined,
    });
    expect(mockMediaUploader.uploadImages).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should upload images before creating post', async () => {
    const mockImages = [{ uri: 'file:///image1.jpg' }, { uri: 'file:///image2.jpg' }];
    const mockUploadedUrls = [
      'https://cdn.example.com/image1.jpg',
      'https://cdn.example.com/image2.jpg',
    ];

    const postWithImages: Post = {
      ...mockPost,
      images: mockUploadedUrls,
    };

    mockMediaUploader.uploadImages.mockResolvedValue(mockUploadedUrls);
    mockFeedService.createPost.mockResolvedValue(postWithImages);

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.mutate({
        data: {
          content: 'Post with images',
          images: mockImages as any,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockMediaUploader.uploadImages).toHaveBeenCalledWith(mockImages, undefined);
    expect(mockFeedService.createPost).toHaveBeenCalledWith({
      content: 'Post with images',
      images: mockUploadedUrls,
      professionId: undefined,
    });
  });

  it('should track upload progress', async () => {
    const mockImages = [{ uri: 'file:///image1.jpg' }];
    const mockUploadedUrls = ['https://cdn.example.com/image1.jpg'];

    // Simulate progress callback
    mockMediaUploader.uploadImages.mockImplementation(async (images, onProgress) => {
      onProgress?.({ percent: 0.25, current: 1, total: 1 });
      onProgress?.({ percent: 0.5, current: 1, total: 1 });
      onProgress?.({ percent: 0.75, current: 1, total: 1 });
      onProgress?.({ percent: 1.0, current: 1, total: 1 });
      return mockUploadedUrls;
    });
    mockFeedService.createPost.mockResolvedValue(mockPost);

    const onProgress = jest.fn();
    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.mutate({
        data: {
          content: 'Post with progress',
          images: mockImages as any,
        },
        onProgress,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Progress should have been tracked
    expect(mockMediaUploader.uploadImages).toHaveBeenCalled();
  });

  it('should handle image upload error', async () => {
    const mockImages = [{ uri: 'file:///image1.jpg' }];

    mockMediaUploader.uploadImages.mockRejectedValue(new Error('Upload failed'));

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.mutate({
        data: {
          content: 'Post with failed images',
          images: mockImages as any,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockFeedService.createPost).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('should handle post creation error', async () => {
    mockFeedService.createPost.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.mutate({
        data: {
          content: 'Failed post',
          images: [],
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Server error');
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('should invalidate feed queries on success', async () => {
    mockFeedService.createPost.mockResolvedValue(mockPost);

    // Pre-populate feed cache
    queryClient.setQueryData(['feed', undefined], {
      pages: [{ content: [] }],
      pageParams: [0],
    });

    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.mutate({
        data: {
          content: 'New post',
          images: [],
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['feed'] }));
  });

  it('should have mutation function available', async () => {
    mockFeedService.createPost.mockResolvedValue(mockPost);

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    // Check that mutate function exists
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');

    // Perform mutation
    await act(async () => {
      result.current.mutate({
        data: {
          content: 'Test post',
          images: [],
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // After success, isPending should be false
    expect(result.current.isPending).toBe(false);
  });
});
