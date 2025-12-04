// __tests__/unit/feed/useCreatePost.test.ts
// useCreatePost Hook Unit Tests
// Sprint 5-6: Social Feed & Posts

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreatePost } from '../../../src/features/feed/hooks';
import { feedService, mediaUploader } from '../../../src/features/feed/services';
import { useFeedStore } from '../../../src/features/feed/stores';
import type { Post, LocalImage } from '../../../src/features/feed/types';
import React from 'react';

// Mock store
jest.mock('../../../src/features/feed/stores', () => ({
  useFeedStore: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    canGoBack: jest.fn(() => true),
    goBack: jest.fn(),
  }),
}));

// Mock services - must be after imports but jest hoists it
jest.mock('../../../src/features/feed/services');

const mockFeedService = feedService as jest.Mocked<typeof feedService>;
const mockMediaUploader = mediaUploader as jest.Mocked<typeof mediaUploader>;
const mockUseFeedStore = useFeedStore as jest.MockedFunction<typeof useFeedStore>;

describe('useCreatePost Hook', () => {
  let queryClient: QueryClient;
  const mockClearDraft = jest.fn();

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

    // Setup store mock
    mockUseFeedStore.mockImplementation(selector =>
      selector({
        draftContent: '',
        draftImages: [],
        setDraftContent: jest.fn(),
        addDraftImage: jest.fn(),
        removeDraftImage: jest.fn(),
        clearDraft: mockClearDraft,
      }),
    );
  });

  afterEach(() => {
    queryClient.clear();
  });

  const mockLocalImages: LocalImage[] = [
    {
      uri: 'file:///path/to/image1.jpg',
      width: 1920,
      height: 1080,
      fileSize: 500000,
      type: 'image/jpeg',
    },
    {
      uri: 'file:///path/to/image2.jpg',
      width: 1280,
      height: 720,
      fileSize: 300000,
      type: 'image/jpeg',
    },
  ];

  const mockS3Urls = ['https://s3.example.com/image1.jpg', 'https://s3.example.com/image2.jpg'];

  const mockCreatedPost: Post = {
    postId: 1,
    author: {
      id: 1,
      name: 'John',
      surname: 'Doe',
      avatarUrl: null,
      profession: 'Engineer',
      isVerified: true,
    },
    content: 'Test post content',
    images: mockS3Urls,
    stats: { likeCount: 0, commentCount: 0, viewCount: 0 },
    userInteraction: { isLiked: false, isSaved: false },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('Create Post', () => {
    it('should upload images and create post', async () => {
      mockMediaUploader.uploadImages.mockResolvedValue(mockS3Urls);
      mockFeedService.createPost.mockResolvedValue(mockCreatedPost);

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      await act(async () => {
        result.current.mutate({
          data: {
            content: 'Test post content',
            images: mockLocalImages,
            professionId: 1,
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockMediaUploader.uploadImages).toHaveBeenCalledWith(mockLocalImages, undefined);
      expect(mockFeedService.createPost).toHaveBeenCalledWith({
        content: 'Test post content',
        images: mockS3Urls,
        professionId: 1,
      });
    });

    it('should create post without images', async () => {
      mockFeedService.createPost.mockResolvedValue({
        ...mockCreatedPost,
        images: [],
      });

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      await act(async () => {
        result.current.mutate({
          data: {
            content: 'Text only post',
            images: [],
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockMediaUploader.uploadImages).not.toHaveBeenCalled();
      expect(mockFeedService.createPost).toHaveBeenCalledWith({
        content: 'Text only post',
        images: undefined,
        professionId: undefined,
      });
    });

    it('should clear draft on success', async () => {
      mockFeedService.createPost.mockResolvedValue(mockCreatedPost);

      const { result } = renderHook(() => useCreatePost(), { wrapper });

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

      expect(mockClearDraft).toHaveBeenCalled();
    });

    it('should report upload progress', async () => {
      const progressCallback = jest.fn();

      mockMediaUploader.uploadImages.mockImplementation(
        async (
          _: unknown,
          onProgress?: (progress: {
            imageIndex: number;
            totalImages: number;
            progress: number;
          }) => void,
        ) => {
          if (onProgress) {
            onProgress({ imageIndex: 0, totalImages: 2, progress: 50 });
            onProgress({ imageIndex: 1, totalImages: 2, progress: 100 });
          }
          return mockS3Urls;
        },
      );
      mockFeedService.createPost.mockResolvedValue(mockCreatedPost);

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      await act(async () => {
        result.current.mutate({
          data: {
            content: 'Test post',
            images: mockLocalImages,
          },
          onProgress: progressCallback,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(progressCallback).toHaveBeenCalledWith(expect.objectContaining({ progress: 50 }));
    });

    it('should handle upload error', async () => {
      mockMediaUploader.uploadImages.mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() => useCreatePost(), { wrapper });

      await act(async () => {
        result.current.mutate({
          data: {
            content: 'Test post',
            images: mockLocalImages,
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Upload failed');
      expect(mockFeedService.createPost).not.toHaveBeenCalled();
    });
  });
});
