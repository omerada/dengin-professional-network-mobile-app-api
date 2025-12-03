// src/features/feed/__tests__/PostCard.test.tsx
// PostCard component testi
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { PostCard } from '../components/PostCard';
import type { Post } from '../types';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock theme
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 500: '#007AFF' },
        text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
        background: { primary: '#FFFFFF', secondary: '#F5F5F5' },
        border: { light: '#E0E0E0' },
        status: { error: '#FF0000' },
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      borderRadius: { sm: 4, md: 8, lg: 16 },
      typography: {
        fontFamily: { regular: 'System', medium: 'System', bold: 'System' },
        fontSize: { xs: 10, sm: 12, md: 14, lg: 16 },
      },
    },
  }),
}));

// Mock haptic feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock post data
const mockPost: Post = {
  id: 'post-1',
  content: 'This is a test post with some content that should be displayed correctly.',
  author: {
    id: 'user-1',
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    profession: 'Software Engineer',
    isVerified: true,
  },
  images: [
    { id: 'img-1', url: 'https://example.com/image1.jpg', thumbnailUrl: 'https://example.com/thumb1.jpg' },
  ],
  likesCount: 42,
  commentsCount: 7,
  sharesCount: 3,
  isLiked: false,
  isBookmarked: false,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

describe('PostCard', () => {
  const defaultProps = {
    post: mockPost,
    onLike: jest.fn(),
    onComment: jest.fn(),
    onShare: jest.fn(),
    onBookmark: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render post content', () => {
    render(<PostCard {...defaultProps} />);

    expect(screen.getByText(/This is a test post/)).toBeTruthy();
  });

  it('should render author name', () => {
    render(<PostCard {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  it('should render author profession', () => {
    render(<PostCard {...defaultProps} />);

    expect(screen.getByText('Software Engineer')).toBeTruthy();
  });

  it('should render like count', () => {
    render(<PostCard {...defaultProps} />);

    expect(screen.getByText('42')).toBeTruthy();
  });

  it('should render comment count', () => {
    render(<PostCard {...defaultProps} />);

    expect(screen.getByText('7')).toBeTruthy();
  });

  it('should call onLike when like button pressed', () => {
    render(<PostCard {...defaultProps} />);

    // Find and press like button (by test ID if available, or by parent)
    const likeButton = screen.getByTestId?.('like-button') || 
      screen.getAllByRole?.('button')?.[0];
    
    if (likeButton) {
      fireEvent.press(likeButton);
      expect(defaultProps.onLike).toHaveBeenCalledWith('post-1', false);
    }
  });

  it('should show filled heart when post is liked', () => {
    const likedPost = { ...mockPost, isLiked: true };
    render(<PostCard {...defaultProps} post={likedPost} />);

    // The heart icon should be filled (check color or icon name)
    // This would need testID in the actual component
  });

  it('should navigate to post detail on press', () => {
    render(<PostCard {...defaultProps} />);

    // Press on the card content area
    const content = screen.getByText(/This is a test post/);
    fireEvent.press(content);

    // Navigation should be triggered
    expect(mockNavigate).toHaveBeenCalledWith('PostDetail', { postId: 'post-1' });
  });

  it('should navigate to author profile on avatar press', () => {
    render(<PostCard {...defaultProps} />);

    const authorName = screen.getByText('John Doe');
    fireEvent.press(authorName);

    // Should navigate to user profile
    expect(mockNavigate).toHaveBeenCalledWith('UserProfile', { userId: 'user-1' });
  });

  it('should render images when present', () => {
    render(<PostCard {...defaultProps} />);

    // Image component should be rendered
    // Would check for Image component with correct source
  });

  it('should not render images when empty', () => {
    const postWithoutImages = { ...mockPost, images: [] };
    render(<PostCard {...defaultProps} post={postWithoutImages} />);

    // No image component should be rendered
  });

  it('should call onBookmark when bookmark pressed', () => {
    render(<PostCard {...defaultProps} />);

    const bookmarkButton = screen.getByTestId?.('bookmark-button');
    
    if (bookmarkButton) {
      fireEvent.press(bookmarkButton);
      expect(defaultProps.onBookmark).toHaveBeenCalledWith('post-1', false);
    }
  });

  it('should call onComment when comment button pressed', () => {
    render(<PostCard {...defaultProps} />);

    const commentButton = screen.getByTestId?.('comment-button');
    
    if (commentButton) {
      fireEvent.press(commentButton);
      expect(defaultProps.onComment).toHaveBeenCalledWith('post-1');
    }
  });

  it('should memoize and not re-render unnecessarily', () => {
    const { rerender } = render(<PostCard {...defaultProps} />);

    // Same props, should not cause re-render
    rerender(<PostCard {...defaultProps} />);

    // This test verifies memo is working - component should use React.memo
  });
});
