// __tests__/unit/feed/feedService.test.ts
// Feed Service Unit Tests
// Sprint 5-6: Social Feed & Posts

import { feedService } from '../../../src/features/feed/services';
import { apiClient } from '../../../src/core/api/client';
import type { CreatePostRequest, AddCommentRequest } from '../../../src/features/feed/types';

// Mock apiClient - use module path that feedService imports from
jest.mock('../../../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('FeedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should fetch feed with pagination', async () => {
      const mockResponse = {
        data: {
          data: {
            content: [
              {
                postId: 1,
                author: { id: 1, name: 'John', surname: 'Doe' },
                content: 'Test post',
                stats: { likeCount: 10, commentCount: 5, viewCount: 100 },
                userInteraction: { isLiked: false, isSaved: false },
              },
            ],
            page: 0,
            size: 20,
            totalElements: 1,
            totalPages: 1,
            hasNext: false,
          },
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await feedService.getFeed(0, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/feed', {
        params: { page: 0, limit: 20, professionFilter: undefined },
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should fetch feed with profession filter', async () => {
      const mockResponse = {
        data: {
          data: {
            content: [],
            page: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0,
            hasNext: false,
          },
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await feedService.getFeed(0, 20, 1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/feed', {
        params: { page: 0, limit: 20, professionFilter: 1 },
      });
    });
  });

  describe('getTrendingFeed', () => {
    it('should fetch trending posts', async () => {
      const mockResponse = {
        data: {
          data: {
            content: [],
            page: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0,
            hasNext: false,
          },
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await feedService.getTrendingFeed(20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/feed/trending', {
        params: { limit: 20 },
      });
    });
  });

  describe('getPost', () => {
    it('should fetch single post by ID', async () => {
      const mockPost = {
        postId: 1,
        author: { id: 1, name: 'John', surname: 'Doe' },
        content: 'Test post',
      };

      mockApiClient.get.mockResolvedValue({
        data: { data: mockPost },
      });

      const result = await feedService.getPost(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/posts/1');
      expect(result).toEqual(mockPost);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const request: CreatePostRequest = {
        content: 'New post content',
        images: ['https://s3.example.com/image1.jpg'],
        professionId: 1,
      };

      const mockResponse = {
        data: {
          data: {
            postId: 1,
            content: 'New post content',
            images: ['https://s3.example.com/image1.jpg'],
          },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await feedService.createPost(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/posts', request);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('deletePost', () => {
    it('should delete a post by ID', async () => {
      mockApiClient.delete.mockResolvedValue({ data: {} });

      await feedService.deletePost(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/posts/1');
    });
  });

  describe('likePost', () => {
    it('should like a post and return LikeResponse', async () => {
      const mockResponse = {
        data: {
          data: { isLiked: true, likeCount: 11 },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await feedService.likePost(1);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/posts/1/like');
      expect(result).toEqual({ isLiked: true, likeCount: 11 });
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post and return LikeResponse', async () => {
      const mockResponse = {
        data: {
          data: { isLiked: false, likeCount: 10 },
        },
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await feedService.unlikePost(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/posts/1/like');
      expect(result).toEqual({ isLiked: false, likeCount: 10 });
    });
  });

  describe('savePost', () => {
    it('should save a post', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} });

      await feedService.savePost(1);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/posts/1/save');
    });
  });

  describe('unsavePost', () => {
    it('should unsave a post', async () => {
      mockApiClient.delete.mockResolvedValue({ data: {} });

      await feedService.unsavePost(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/posts/1/save');
    });
  });

  describe('getComments', () => {
    it('should fetch comments with pagination', async () => {
      const mockResponse = {
        data: {
          data: {
            comments: [
              {
                id: '1',
                author: { id: 1, name: 'John', surname: 'Doe' },
                content: 'Test comment',
                likeCount: 5,
                isLiked: false,
                createdAt: '2024-01-01T00:00:00Z',
              },
            ],
            page: 0,
            size: 20,
            totalElements: 1,
            totalPages: 1,
            hasNext: false,
          },
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await feedService.getComments(1, 0, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/posts/1/comments', {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', async () => {
      const request: AddCommentRequest = { content: 'New comment' };
      const mockComment = {
        id: '1',
        author: { id: 1, name: 'John', surname: 'Doe' },
        content: 'New comment',
        likeCount: 0,
        isLiked: false,
        createdAt: '2024-01-01T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue({
        data: { data: mockComment },
      });

      const result = await feedService.addComment(1, request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/posts/1/comments', request);
      expect(result).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment from a post', async () => {
      mockApiClient.delete.mockResolvedValue({ data: {} });

      await feedService.deleteComment(1, 'comment-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/posts/1/comments/comment-123');
    });
  });
});
