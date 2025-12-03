// src/features/feed/__tests__/feedService.test.ts
// Feed service unit testleri
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { feedService } from '../services/feedService';
import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type { Post, FeedResponse, Comment, CommentsResponse } from '../types';

// Mock API client
jest.mock('@core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock data
const mockPost: Post = {
  id: 'post-1',
  content: 'Test post content',
  author: {
    id: 'user-1',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
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

const mockFeedResponse: FeedResponse = {
  data: [mockPost],
  pagination: {
    cursor: 'cursor-123',
    hasMore: true,
    totalCount: 100,
  },
  nextCursor: 'cursor-123',
  hasMore: true,
};

const mockComment: Comment = {
  id: 'comment-1',
  content: 'Test comment',
  author: {
    id: 'user-2',
    name: 'Commenter',
    avatarUrl: 'https://example.com/avatar2.jpg',
    profession: 'Designer',
    isVerified: false,
  },
  likesCount: 3,
  isLiked: false,
  createdAt: '2024-01-01T11:00:00Z',
};

const mockCommentsResponse: CommentsResponse = {
  data: [mockComment],
  pagination: {
    cursor: 'comment-cursor',
    hasMore: true,
    totalCount: 50,
  },
  nextCursor: 'comment-cursor',
  hasMore: true,
};

describe('feedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should fetch feed without cursor', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockFeedResponse } });

      const result = await feedService.getFeed();

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.FEED.LIST, {
        params: { cursor: undefined, filter: 'all', limit: 20 },
      });
      expect(result).toEqual(mockFeedResponse);
    });

    it('should fetch feed with cursor for pagination', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockFeedResponse } });

      const result = await feedService.getFeed('cursor-abc', 'following', 15);

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.FEED.LIST, {
        params: { cursor: 'cursor-abc', filter: 'following', limit: 15 },
      });
      expect(result).toEqual(mockFeedResponse);
    });

    it('should handle empty feed', async () => {
      const emptyResponse: FeedResponse = {
        data: [],
        pagination: { cursor: null, hasMore: false, totalCount: 0 },
        nextCursor: null,
        hasMore: false,
      };
      mockApiClient.get.mockResolvedValue({ data: { data: emptyResponse } });

      const result = await feedService.getFeed();

      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getPost', () => {
    it('should fetch single post by ID', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockPost } });

      const result = await feedService.getPost('post-1');

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.FEED.POST_BY_ID('post-1'));
      expect(result).toEqual(mockPost);
    });

    it('should throw error for non-existent post', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Post not found'));

      await expect(feedService.getPost('invalid-id')).rejects.toThrow('Post not found');
    });
  });

  describe('createPost', () => {
    it('should create post with content only', async () => {
      mockApiClient.post.mockResolvedValue({ data: { data: mockPost } });

      const result = await feedService.createPost({ content: 'New post' }, []);

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.CREATE_POST, {
        content: 'New post',
        imageUrls: [],
      });
      expect(result).toEqual(mockPost);
    });

    it('should create post with images', async () => {
      const imageUrls = ['https://cdn.example.com/image1.jpg', 'https://cdn.example.com/image2.jpg'];
      mockApiClient.post.mockResolvedValue({ data: { data: mockPost } });

      await feedService.createPost({ content: 'Post with images' }, imageUrls);

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.CREATE_POST, {
        content: 'Post with images',
        imageUrls,
      });
    });
  });

  describe('deletePost', () => {
    it('should delete post by ID', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await feedService.deletePost('post-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.FEED.DELETE_POST('post-1'));
    });
  });

  describe('likePost', () => {
    it('should like post and return new count', async () => {
      mockApiClient.post.mockResolvedValue({ data: { data: { likesCount: 11 } } });

      const result = await feedService.likePost('post-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.LIKE_POST('post-1'));
      expect(result.likesCount).toBe(11);
    });
  });

  describe('unlikePost', () => {
    it('should unlike post and return new count', async () => {
      mockApiClient.delete.mockResolvedValue({ data: { data: { likesCount: 9 } } });

      const result = await feedService.unlikePost('post-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.FEED.UNLIKE_POST('post-1'));
      expect(result.likesCount).toBe(9);
    });
  });

  describe('bookmarkPost', () => {
    it('should bookmark post', async () => {
      mockApiClient.post.mockResolvedValue({});

      await feedService.bookmarkPost('post-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.BOOKMARK_POST('post-1'));
    });
  });

  describe('getComments', () => {
    it('should fetch comments for post', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockCommentsResponse } });

      const result = await feedService.getComments('post-1');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.COMMENTS.BY_POST('post-1'),
        { params: { cursor: undefined, limit: 20 } }
      );
      expect(result).toEqual(mockCommentsResponse);
    });

    it('should fetch comments with pagination', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockCommentsResponse } });

      const result = await feedService.getComments('post-1', 'cursor-abc', 10);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.COMMENTS.BY_POST('post-1'),
        { params: { cursor: 'cursor-abc', limit: 10 } }
      );
      expect(result).toEqual(mockCommentsResponse);
    });
  });

  describe('addComment', () => {
    it('should add comment to post', async () => {
      mockApiClient.post.mockResolvedValue({ data: { data: mockComment } });

      const result = await feedService.addComment({
        postId: 'post-1',
        content: 'Test comment',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.COMMENTS.CREATE('post-1'),
        { content: 'Test comment', parentId: undefined }
      );
      expect(result).toEqual(mockComment);
    });

    it('should add reply to comment', async () => {
      mockApiClient.post.mockResolvedValue({ data: { data: mockComment } });

      await feedService.addComment({
        postId: 'post-1',
        content: 'Reply',
        parentId: 'comment-1',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.COMMENTS.CREATE('post-1'),
        { content: 'Reply', parentId: 'comment-1' }
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete comment by ID', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await feedService.deleteComment('comment-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        API_ENDPOINTS.COMMENTS.DELETE('comment-1')
      );
    });
  });

  describe('likeComment', () => {
    it('should like comment', async () => {
      mockApiClient.post.mockResolvedValue({});

      await feedService.likeComment('comment-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.COMMENTS.LIKE('comment-1')
      );
    });
  });

  describe('reportPost', () => {
    it('should report post with reason', async () => {
      mockApiClient.post.mockResolvedValue({});

      await feedService.reportPost('post-1', 'spam');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.FEED.REPORT_POST('post-1'),
        { reason: 'spam' }
      );
    });
  });
});
