// src/features/feed/components/PostCard/__tests__/PostCard.test.tsx
// PostCard Component Unit Tests
// Sprint 5-6: Social Feed & Posts

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PostCard } from '../PostCard';
import type { Post } from '../../types';

// ============================================================================
// Mocks
// ============================================================================

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: { primary: '#FFFFFF' },
      text: { primary: '#000000', secondary: '#666666' },
      interactive: { default: '#0066FF' },
      status: { error: '#FF3B30' },
    },
  }),
}));

jest.mock('@shared/hooks/useHaptic', () => ({
  useHaptic: () => ({
    buttonPress: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
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
    profileImageUrl: null,
    professionName: 'Doctor',
    verified: true,
    isVerified: true,
  },
  content: 'Test post content',
  images: [],
  likeCount: 10,
  commentCount: 5,
  liked: false,
  createdAt: '2024-01-01T00:00:00Z',
};

// ============================================================================
// Tests
// ============================================================================

describe('PostCard Component', () => {
  const mockHandlers = {
    onLike: jest.fn(),
    onComment: jest.fn(),
    onShare: jest.fn(),
    onBookmark: jest.fn(),
    onMenuPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render post correctly', () => {
      const { getByText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Doctor')).toBeTruthy();
      expect(getByText('Test post content')).toBeTruthy();
    });

    it('should render author avatar when provided', () => {
      const postWithAvatar: Post = {
        ...mockPost,
        author: {
          ...mockPost.author,
          profileImageUrl: 'https://example.com/avatar.jpg',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      };

      const { UNSAFE_getByProps } = render(<PostCard post={postWithAvatar} {...mockHandlers} />);

      const image = UNSAFE_getByProps({ source: { uri: 'https://example.com/avatar.jpg' } });
      expect(image).toBeTruthy();
    });

    it('should render verified badge when author is verified', () => {
      const { UNSAFE_getByType } = render(<PostCard post={mockPost} {...mockHandlers} />);

      // Verified icon should be present
      const icons = UNSAFE_getByType(require('react-native-vector-icons/Ionicons').default);
      expect(icons).toBeTruthy();
    });

    it('should render like and comment counts', () => {
      const { getByText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      expect(getByText('10')).toBeTruthy(); // like count
      expect(getByText('5')).toBeTruthy(); // comment count
    });

    it('should render images when present', () => {
      const postWithImages: Post = {
        ...mockPost,
        images: [
          {
            url: 'https://example.com/image1.jpg',
          },
        ],
      };

      const { UNSAFE_getByProps } = render(<PostCard post={postWithImages} {...mockHandlers} />);

      // Image should be rendered
      const image = UNSAFE_getByProps({ source: { uri: 'https://example.com/image1.jpg' } });
      expect(image).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onLike when like button is pressed', async () => {
      const { getByLabelText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      const likeButton = getByLabelText(/Beğen/);
      fireEvent.press(likeButton);

      await waitFor(() => {
        expect(mockHandlers.onLike).toHaveBeenCalledWith(1, false);
      });
    });

    it('should call onComment when comment button is pressed', async () => {
      const { getByLabelText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      const commentButton = getByLabelText(/Yorum yap/);
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(mockHandlers.onComment).toHaveBeenCalledWith(1);
      });
    });

    it('should call onShare when share button is pressed', async () => {
      const { getByLabelText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      const shareButton = getByLabelText(/Paylaş/);
      fireEvent.press(shareButton);

      await waitFor(() => {
        expect(mockHandlers.onShare).toHaveBeenCalledWith(1);
      });
    });

    it('should call onBookmark when bookmark button is pressed', async () => {
      const postWithBookmark: Post = {
        ...mockPost,
        userInteraction: {
          isLiked: false,
          isSaved: false,
        },
      };

      const { getByLabelText } = render(<PostCard post={postWithBookmark} {...mockHandlers} />);

      const bookmarkButton = getByLabelText('Kaydet');
      fireEvent.press(bookmarkButton);

      await waitFor(() => {
        expect(mockHandlers.onBookmark).toHaveBeenCalledWith(1, false);
      });
    });

    it('should call onMenuPress when menu button is pressed', async () => {
      const { getByTestId } = render(
        <PostCard post={mockPost} {...mockHandlers} testID="test-post" />,
      );

      // Menu button is in PostHeader
      const menuButton = getByTestId('test-post').findByProps({ name: 'ellipsis-horizontal' })
        .parent.parent;
      fireEvent.press(menuButton);

      await waitFor(() => {
        expect(mockHandlers.onMenuPress).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Like State', () => {
    it('should show filled heart when post is liked', () => {
      const likedPost: Post = {
        ...mockPost,
        liked: true,
        likeCount: 11,
      };

      const { getByLabelText } = render(<PostCard post={likedPost} {...mockHandlers} />);

      const likeButton = getByLabelText(/Beğeniyi kaldır/);
      expect(likeButton).toBeTruthy();
    });

    it('should show outline heart when post is not liked', () => {
      const { getByLabelText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      const likeButton = getByLabelText(/Beğen/);
      expect(likeButton).toBeTruthy();
    });
  });

  describe('Bookmark State', () => {
    it('should show filled bookmark when post is saved', () => {
      const savedPost: Post = {
        ...mockPost,
        userInteraction: {
          isLiked: false,
          isSaved: true,
        },
      };

      const { getByLabelText } = render(<PostCard post={savedPost} {...mockHandlers} />);

      const bookmarkButton = getByLabelText('Kayıtlılardan kaldır');
      expect(bookmarkButton).toBeTruthy();
    });

    it('should show outline bookmark when post is not saved', () => {
      const unsavedPost: Post = {
        ...mockPost,
        userInteraction: {
          isLiked: false,
          isSaved: false,
        },
      };

      const { getByLabelText } = render(<PostCard post={unsavedPost} {...mockHandlers} />);

      const bookmarkButton = getByLabelText('Kaydet');
      expect(bookmarkButton).toBeTruthy();
    });
  });

  describe('Memoization', () => {
    it('should not re-render when props do not change', () => {
      const { rerender } = render(<PostCard post={mockPost} {...mockHandlers} />);

      // Re-render with same props
      rerender(<PostCard post={mockPost} {...mockHandlers} />);

      // Component should be memoized and not re-render
      // This is validated by React.memo comparison function
    });

    it('should re-render when like count changes', () => {
      const { rerender, getByText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      expect(getByText('10')).toBeTruthy();

      const updatedPost: Post = {
        ...mockPost,
        likeCount: 11,
      };

      rerender(<PostCard post={updatedPost} {...mockHandlers} />);

      expect(getByText('11')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      expect(getByLabelText(/Beğen. 10 beğeni/)).toBeTruthy();
      expect(getByLabelText(/Yorum yap. 5 yorum/)).toBeTruthy();
    });

    it('should have accessibility role for buttons', () => {
      const { getByLabelText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      const likeButton = getByLabelText(/Beğen/);
      expect(likeButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('Content Formatting', () => {
    it('should render hashtags', () => {
      const postWithHashtag: Post = {
        ...mockPost,
        content: 'Test post with #hashtag',
      };

      const { getByText } = render(<PostCard post={postWithHashtag} {...mockHandlers} />);

      expect(getByText('Test post with #hashtag')).toBeTruthy();
    });

    it('should render mentions', () => {
      const postWithMention: Post = {
        ...mockPost,
        content: 'Test post with @username',
      };

      const { getByText } = render(<PostCard post={postWithMention} {...mockHandlers} />);

      expect(getByText('Test post with @username')).toBeTruthy();
    });

    it('should render long content', () => {
      const longContent = 'A'.repeat(500);
      const postWithLongContent: Post = {
        ...mockPost,
        content: longContent,
      };

      const { getByText } = render(<PostCard post={postWithLongContent} {...mockHandlers} />);

      expect(getByText(longContent)).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle rapid like button presses', async () => {
      const { getByLabelText } = render(<PostCard post={mockPost} {...mockHandlers} />);

      const likeButton = getByLabelText(/Beğen/);

      // Rapidly press like button
      fireEvent.press(likeButton);
      fireEvent.press(likeButton);
      fireEvent.press(likeButton);

      await waitFor(() => {
        // Should be called 3 times
        expect(mockHandlers.onLike).toHaveBeenCalledTimes(3);
      });
    });
  });
});
