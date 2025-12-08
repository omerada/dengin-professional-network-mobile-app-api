// src/features/feed/__tests__/FeedScreen.test.tsx
// FeedScreen Integration Tests
// Sprint 5-6: Social Feed & Posts

import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { FeedScreen } from '../screens/FeedScreen';
import { useFeedPosts, useLikePost, useBookmarkPost } from '../hooks';
import { useAuthStore } from '@features/auth/stores';
import type { Post } from '../types';

// ============================================================================
// Mocks
// ============================================================================

jest.mock('../hooks', () => ({
  useFeedPosts: jest.fn(),
  useLikePost: jest.fn(),
  useBookmarkPost: jest.fn(),
  useDeletePost: jest.fn(),
}));

jest.mock('@features/auth/stores', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@shared/utils/share', () => ({
  sharePost: jest.fn(),
  showShareError: jest.fn(),
}));

// Mock useHaptic
jest.mock('@shared/hooks/useHaptic', () => ({
  useHaptic: () => ({
    medium: jest.fn(),
    light: jest.fn(),
    heavy: jest.fn(),
    trigger: jest.fn(),
  }),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockPost: Post = {
  id: 1,
  postId: 'uuid-1',
  author: {
    userId: 100,
    id: 100,
    name: 'John',
    surname: 'Doe',
    fullName: 'John Doe',
    profileImageUrl: 'https://example.com/avatar.jpg',
    avatarUrl: 'https://example.com/avatar.jpg',
    professionName: 'Doctor',
    verified: true,
    isVerified: true,
  },
  content: 'Test post content #hashtag @mention',
  images: [],
  likeCount: 10,
  commentCount: 5,
  liked: false,
  relevanceScore: 85,
  createdAt: '2024-01-01T00:00:00Z',
};

// ============================================================================
// Helper Functions
// ============================================================================

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{children}</NavigationContainer>
    </QueryClientProvider>
  );
};

// ============================================================================
// Tests
// ============================================================================

describe('FeedScreen Integration Tests', () => {
  const mockUseFeedPosts = useFeedPosts as jest.MockedFunction<typeof useFeedPosts>;
  const mockUseLikePost = useLikePost as jest.MockedFunction<typeof useLikePost>;
  const mockUseBookmarkPost = useBookmarkPost as jest.MockedFunction<typeof useBookmarkPost>;
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

  const mockLikeMutate = jest.fn();
  const mockBookmarkMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth store mock
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({
        user: { id: 1, name: 'Test User' },
      }),
    );

    // Default like post mock
    mockUseLikePost.mockReturnValue({
      mutate: mockLikeMutate,
      mutateAsync: jest.fn(),
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'idle',
      variables: undefined,
      isIdle: true,
      isPending: false,
      submittedAt: 0,
    });

    // Default bookmark post mock
    mockUseBookmarkPost.mockReturnValue({
      mutate: mockBookmarkMutate,
      mutateAsync: jest.fn(),
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'idle',
      variables: undefined,
      isIdle: true,
      isPending: false,
      submittedAt: 0,
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no posts', async () => {
      mockUseFeedPosts.mockReturnValue({
        posts: [],
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        isRefetching: false,
        totalCount: 0,
        error: null,
        data: undefined,
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: true,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'success',
        dataUpdatedAt: 0,
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: true,
        isFetchedAfterMount: true,
      });

      const wrapper = createWrapper();
      render(<FeedScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Henüz gönderi yok')).toBeTruthy();
        expect(screen.getByText('İlk gönderiyi paylaşan siz olun!')).toBeTruthy();
      });
    });

    it('should show skeleton loading when initially loading', async () => {
      mockUseFeedPosts.mockReturnValue({
        posts: [],
        isLoading: true,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        isRefetching: false,
        totalCount: 0,
        error: null,
        data: undefined,
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: false,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'loading',
        dataUpdatedAt: 0,
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: true,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: false,
        isFetchedAfterMount: false,
      });

      const wrapper = createWrapper();
      render(<FeedScreen />, { wrapper });

      // FeedSkeleton should be rendered
      await waitFor(() => {
        expect(screen.queryByText('Henüz gönderi yok')).toBeNull();
      });
    });
  });

  describe('Content Display', () => {
    it('should render posts correctly', async () => {
      mockUseFeedPosts.mockReturnValue({
        posts: [mockPost],
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        isRefetching: false,
        totalCount: 1,
        error: null,
        data: {
          pages: [{ posts: [mockPost], hasMore: false }],
          pageParams: [undefined],
        },
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: true,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: true,
        isFetchedAfterMount: true,
      });

      const wrapper = createWrapper();
      render(<FeedScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test post content #hashtag @mention')).toBeTruthy();
        expect(screen.getByText('John Doe')).toBeTruthy();
      });
    });

    it('should render multiple posts', async () => {
      const mockPost2: Post = {
        ...mockPost,
        id: 2,
        postId: 'uuid-2',
        content: 'Second post',
      };

      mockUseFeedPosts.mockReturnValue({
        posts: [mockPost, mockPost2],
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        isRefetching: false,
        totalCount: 2,
        error: null,
        data: {
          pages: [{ posts: [mockPost, mockPost2], hasMore: false }],
          pageParams: [undefined],
        },
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: true,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: true,
        isFetchedAfterMount: true,
      });

      const wrapper = createWrapper();
      render(<FeedScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test post content #hashtag @mention')).toBeTruthy();
        expect(screen.getByText('Second post')).toBeTruthy();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle like action with optimistic update', async () => {
      mockUseFeedPosts.mockReturnValue({
        posts: [mockPost],
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        isRefetching: false,
        totalCount: 1,
        error: null,
        data: {
          pages: [{ posts: [mockPost], hasMore: false }],
          pageParams: [undefined],
        },
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: true,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: true,
        isFetchedAfterMount: true,
      });

      const wrapper = createWrapper();
      render(<FeedScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test post content #hashtag @mention')).toBeTruthy();
      });

      // Find and press like button
      const likeButton = screen.getByLabelText(/Beğen/);
      fireEvent.press(likeButton);

      // Verify like mutation was called
      expect(mockLikeMutate).toHaveBeenCalledWith({
        postId: 1,
        isLiked: false,
      });
    });

    it('should handle bookmark action', async () => {
      const postWithBookmark: Post = {
        ...mockPost,
        userInteraction: {
          isLiked: false,
          isSaved: false,
        },
      };

      mockUseFeedPosts.mockReturnValue({
        posts: [postWithBookmark],
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        isRefetching: false,
        totalCount: 1,
        error: null,
        data: {
          pages: [{ posts: [postWithBookmark], hasMore: false }],
          pageParams: [undefined],
        },
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: true,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: true,
        isFetchedAfterMount: true,
      });

      const wrapper = createWrapper();
      render(<FeedScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Test post content #hashtag @mention')).toBeTruthy();
      });

      // Find and press bookmark button
      const bookmarkButton = screen.getByLabelText('Kaydet');
      fireEvent.press(bookmarkButton);

      // Verify bookmark mutation was called
      expect(mockBookmarkMutate).toHaveBeenCalledWith({
        postId: 1,
        isSaved: false,
      });
    });
  });

  describe('Pull-to-Refresh', () => {
    it('should trigger refetch on pull-to-refresh', async () => {
      const mockRefetch = jest.fn();

      mockUseFeedPosts.mockReturnValue({
        posts: [mockPost],
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: mockRefetch,
        isRefetching: false,
        totalCount: 1,
        error: null,
        data: {
          pages: [{ posts: [mockPost], hasMore: false }],
          pageParams: [undefined],
        },
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: true,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: true,
        isFetchedAfterMount: true,
      });

      const wrapper = createWrapper();
      const { getByTestId } = render(<FeedScreen />, { wrapper });

      // Simulate refresh
      const scrollView = getByTestId('feed-screen-list');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('should load more posts when scrolling to end', async () => {
      const mockFetchNextPage = jest.fn();

      mockUseFeedPosts.mockReturnValue({
        posts: [mockPost],
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        refetch: jest.fn(),
        isRefetching: false,
        totalCount: 1,
        error: null,
        data: {
          pages: [{ posts: [mockPost], hasMore: true }],
          pageParams: [undefined],
        },
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: true,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: true,
        isFetchedAfterMount: true,
      });

      const wrapper = createWrapper();
      const { getByTestId } = render(<FeedScreen />, { wrapper });

      // Simulate scroll to end
      const scrollView = getByTestId('feed-screen-list');
      fireEvent(scrollView, 'endReached');

      await waitFor(() => {
        expect(mockFetchNextPage).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      mockUseFeedPosts.mockReturnValue({
        posts: [mockPost],
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        isRefetching: false,
        totalCount: 1,
        error: null,
        data: {
          pages: [{ posts: [mockPost], hasMore: false }],
          pageParams: [undefined],
        },
        failureCount: 0,
        failureReason: null,
        isLoadingError: false,
        isPaused: false,
        isRefetchError: false,
        isSuccess: true,
        refetchOnWindowFocus: jest.fn(),
        remove: jest.fn(),
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdateCount: 0,
        errorUpdatedAt: 0,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isStale: false,
        isFetched: true,
        isFetchedAfterMount: true,
      });

      const wrapper = createWrapper();
      render(<FeedScreen />, { wrapper });

      await waitFor(() => {
        const list = screen.getByLabelText('Gönderi akışı');
        expect(list).toBeTruthy();
      });
    });
  });
});
