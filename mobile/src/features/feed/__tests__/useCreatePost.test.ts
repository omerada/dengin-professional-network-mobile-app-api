// src/features/feed/__tests__/useCreatePost.test.ts
// Create post hook unit testleri
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreatePost } from '../hooks/useCreatePost';
import { feedService } from '../services/feedService';
import { mediaUploader } from '../services/mediaUploader';
import type { Post, CreatePostDto } from '../types';

// Mock services
jest.mock('../services/feedService');
jest.mock('../services/mediaUploader');
jest.mock('@shared/utils', () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

const mockFeedService = feedService as jest.Mocked<typeof feedService>;
const mockMediaUploader = mediaUploader as jest.Mocked<typeof mediaUploader>;

// Mock data
const mockPost: Post = {
  id: 'post-new',
  content: 'New post content',
  author: {
    id: 'user-1',
    name: 'Test User',
    avatarUrl: null,
    profession: 'Engineer',
    isVerified: true,
  },
  images: [],
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  isLiked: false,
  isBookmarked: false,
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
      result.current.createPost({
        content: 'New post content',
        images: [],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFeedService.createPost).toHaveBeenCalledWith(
      { content: 'New post content' },
      []
    );
    expect(mockMediaUploader.uploadImages).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should upload images before creating post', async () => {
    const mockImages = [
      { uri: 'file:///image1.jpg' },
      { uri: 'file:///image2.jpg' },
    ];
    const mockUploadedUrls = [
      'https://cdn.example.com/image1.jpg',
      'https://cdn.example.com/image2.jpg',
    ];

    const postWithImages: Post = {
      ...mockPost,
      images: mockUploadedUrls.map((url, i) => ({
        id: `img-${i}`,
        url,
        thumbnailUrl: url,
      })),
    };

    mockMediaUploader.uploadImages.mockResolvedValue(mockUploadedUrls);
    mockFeedService.createPost.mockResolvedValue(postWithImages);

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.createPost({
        content: 'Post with images',
        images: mockImages as any,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockMediaUploader.uploadImages).toHaveBeenCalledWith(
      mockImages,
      expect.any(Function)
    );
    expect(mockFeedService.createPost).toHaveBeenCalledWith(
      { content: 'Post with images' },
      mockUploadedUrls
    );
  });

  it('should track upload progress', async () => {
    const mockImages = [{ uri: 'file:///image1.jpg' }];
    const mockUploadedUrls = ['https://cdn.example.com/image1.jpg'];

    // Simulate progress callback
    mockMediaUploader.uploadImages.mockImplementation(async (images, onProgress) => {
      onProgress?.(0.25);
      onProgress?.(0.5);
      onProgress?.(0.75);
      onProgress?.(1.0);
      return mockUploadedUrls;
    });
    mockFeedService.createPost.mockResolvedValue(mockPost);

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.createPost({
        content: 'Post with progress',
        images: mockImages as any,
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
      result.current.createPost({
        content: 'Post with failed images',
        images: mockImages as any,
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
      result.current.createPost({
        content: 'Failed post',
        images: [],
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
    queryClient.setQueryData(['feed', 'all'], {
      pages: [{ data: [] }],
      pageParams: [undefined],
    });

    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      result.current.createPost({
        content: 'New post',
        images: [],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['feed'] })
    );
  });

  it('should return isLoading during mutation', async () => {
    let resolvePromise: (value: Post) => void;
    const promise = new Promise<Post>((resolve) => {
      resolvePromise = resolve;
    });

    mockFeedService.createPost.mockReturnValue(promise);

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    act(() => {
      result.current.createPost({
        content: 'Loading post',
        images: [],
      });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!(mockPost);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
