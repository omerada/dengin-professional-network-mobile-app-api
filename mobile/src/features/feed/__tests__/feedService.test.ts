// src/features/feed/__tests__/feedService.test.ts
// Feed service unit testleri - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { feedService } from '../services/feedService';
import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type { Post, FeedResponse, Comment, CommentListResponse } from '../types';

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

// Mock data - Backend API uyumlu yapı
const mockPost: Post = {
  postId: 1,
  content: 'Test post content',
  author: {
    id: 1,
    name: 'Test',
    surname: 'User',
    avatarUrl: 'https://example.com/avatar.jpg',
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

const mockFeedResponse: FeedResponse = {
  content: [mockPost],
  page: 0,
  size: 20,
  totalElements: 100,
  totalPages: 5,
  hasNext: true,
  hasPrevious: false,
};

const mockComment: Comment = {
  id: 'comment-1',
  content: 'Test comment',
  author: {
    id: 2,
    name: 'Commenter',
    surname: 'User',
    avatarUrl: 'https://example.com/avatar2.jpg',
  },
  likeCount: 3,
  isLiked: false,
  createdAt: '2024-01-01T11:00:00Z',
};

const mockCommentsResponse: CommentListResponse = {
  comments: [mockComment],
  page: 0,
  size: 20,
  totalElements: 50,
  totalPages: 3,
  hasNext: true,
};

describe('feedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should fetch feed with default parameters', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockFeedResponse } });

      const result = await feedService.getFeed();

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.FEED.PERSONALIZED, {
        params: { page: 0, limit: 20, professionFilter: undefined },
      });
      expect(result).toEqual(mockFeedResponse);
    });

    it('should fetch feed with custom parameters', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockFeedResponse } });

      const result = await feedService.getFeed(1, 15, 5);

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.FEED.PERSONALIZED, {
        params: { page: 1, limit: 15, professionFilter: 5 },
      });
      expect(result).toEqual(mockFeedResponse);
    });

    it('should handle empty feed', async () => {
      const emptyResponse: FeedResponse = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      mockApiClient.get.mockResolvedValue({ data: { data: emptyResponse } });

      const result = await feedService.getFeed();

      expect(result.content).toHaveLength(0);
      expect(result.hasNext).toBe(false);
    });
  });

  describe('getPost', () => {
    it('should fetch single post by ID', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockPost } });

      const result = await feedService.getPost(1);

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.FEED.POST_BY_ID(1));
      expect(result).toEqual(mockPost);
    });

    it('should throw error for non-existent post', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Post not found'));

      await expect(feedService.getPost(999)).rejects.toThrow('Post not found');
    });
  });

  describe('createPost', () => {
    it('should create post with content only', async () => {
      mockApiClient.post.mockResolvedValue({ data: { data: mockPost } });

      const result = await feedService.createPost({ content: 'New post' });

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.CREATE_POST, {
        content: 'New post',
      });
      expect(result).toEqual(mockPost);
    });

    it('should create post with images', async () => {
      const imageUrls = [
        'https://cdn.example.com/image1.jpg',
        'https://cdn.example.com/image2.jpg',
      ];
      mockApiClient.post.mockResolvedValue({ data: { data: mockPost } });

      await feedService.createPost({ content: 'Post with images', images: imageUrls });

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.CREATE_POST, {
        content: 'Post with images',
        images: imageUrls,
      });
    });
  });

  describe('deletePost', () => {
    it('should delete post by ID', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await feedService.deletePost(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.FEED.DELETE_POST(1));
    });
  });

  describe('likePost', () => {
    it('should like post and return new count', async () => {
      mockApiClient.post.mockResolvedValue({ data: { data: { isLiked: true, likeCount: 11 } } });

      const result = await feedService.likePost(1);

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.LIKE_POST(1));
      expect(result.likeCount).toBe(11);
    });
  });

  describe('unlikePost', () => {
    it('should unlike post and return new count', async () => {
      mockApiClient.delete.mockResolvedValue({ data: { data: { isLiked: false, likeCount: 9 } } });

      const result = await feedService.unlikePost(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith(API_ENDPOINTS.FEED.UNLIKE_POST(1));
      expect(result.likeCount).toBe(9);
    });
  });

  describe('savePost', () => {
    it('should save post', async () => {
      mockApiClient.post.mockResolvedValue({});

      await feedService.savePost(1);

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.SAVE_POST(1));
    });
  });

  describe('getComments', () => {
    it('should fetch comments for post', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockCommentsResponse } });

      const result = await feedService.getComments(1);

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.COMMENTS.BY_POST(1), {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(mockCommentsResponse);
    });

    it('should fetch comments with pagination', async () => {
      mockApiClient.get.mockResolvedValue({ data: { data: mockCommentsResponse } });

      const result = await feedService.getComments(1, 1, 10);

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.COMMENTS.BY_POST(1), {
        params: { page: 1, size: 10 },
      });
      expect(result).toEqual(mockCommentsResponse);
    });
  });

  describe('addComment', () => {
    it('should add comment to post', async () => {
      mockApiClient.post.mockResolvedValue({ data: { data: mockComment } });

      const result = await feedService.addComment(1, { content: 'Test comment' });

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.COMMENTS.CREATE(1), {
        content: 'Test comment',
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment by ID', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await feedService.deleteComment(1, 'comment-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/posts/1/comments/comment-1');
    });
  });

  describe('likeComment', () => {
    it('should like comment', async () => {
      mockApiClient.post.mockResolvedValue({});

      await feedService.likeComment(1, 'comment-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/posts/1/comments/comment-1/like');
    });
  });

  describe('reportPost', () => {
    it('should report post with reason', async () => {
      mockApiClient.post.mockResolvedValue({});

      await feedService.reportPost(1, 'spam');

      expect(mockApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.FEED.REPORT_POST(1), {
        reason: 'spam',
      });
    });
  });
});
