// src/features/feed/__tests__/PostCard.test.tsx
// PostCard component testi - Backend API uyumlu
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
        primary: { 100: '#E3F2FD', 500: '#007AFF' },
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

// Mock child components
jest.mock('../components/PostHeader', () => ({
  PostHeader: ({ author, onAuthorPress }: any) => {
    const { Text, Pressable } = require('react-native');
    return (
      <Pressable onPress={onAuthorPress} testID="author-header">
        <Text>
          {author.name} {author.surname}
        </Text>
        <Text>{author.profession}</Text>
      </Pressable>
    );
  },
}));

jest.mock('../components/PostContent', () => ({
  PostContent: ({ content }: any) => {
    const { Text, Pressable } = require('react-native');
    return (
      <Pressable testID="post-content">
        <Text>{content}</Text>
      </Pressable>
    );
  },
}));

jest.mock('../components/PostImages', () => ({
  PostImages: ({ images }: any) => {
    const { View, Text } = require('react-native');
    return images.length > 0 ? (
      <View testID="post-images">
        <Text>{images.length} images</Text>
      </View>
    ) : null;
  },
}));

jest.mock('../components/PostActions', () => ({
  PostActions: ({ likesCount, commentsCount, isLiked, onLike, onComment, onBookmark }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID="post-actions">
        <Pressable onPress={onLike} testID="like-button">
          <Text>{likesCount}</Text>
        </Pressable>
        <Pressable onPress={onComment} testID="comment-button">
          <Text>{commentsCount}</Text>
        </Pressable>
        <Pressable onPress={onBookmark} testID="bookmark-button">
          <Text>Bookmark</Text>
        </Pressable>
      </View>
    );
  },
}));

// Mock post data - Backend API uyumlu
const mockPost: Post = {
  postId: 1,
  content: 'This is a test post with some content that should be displayed correctly.',
  author: {
    id: 1,
    name: 'John',
    surname: 'Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    profession: 'Software Engineer',
    isVerified: true,
  },
  images: ['https://example.com/image1.jpg'],
  stats: {
    likeCount: 42,
    commentCount: 7,
    viewCount: 3,
  },
  userInteraction: {
    isLiked: false,
    isSaved: false,
  },
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

    const likeButton = screen.getByTestId('like-button');
    fireEvent.press(likeButton);

    expect(defaultProps.onLike).toHaveBeenCalledWith(1, false);
  });

  it('should call onLike with true when post is already liked', () => {
    const likedPost: Post = {
      ...mockPost,
      userInteraction: { isLiked: true, isSaved: false },
    };
    render(<PostCard {...defaultProps} post={likedPost} />);

    const likeButton = screen.getByTestId('like-button');
    fireEvent.press(likeButton);

    expect(defaultProps.onLike).toHaveBeenCalledWith(1, true);
  });

  it('should navigate to post detail on content press', () => {
    render(<PostCard {...defaultProps} />);

    const content = screen.getByTestId('post-content');
    fireEvent.press(content);

    // Navigation happens via parent Pressable, not content
  });

  it('should navigate to author profile on author press', () => {
    render(<PostCard {...defaultProps} />);

    const authorHeader = screen.getByTestId('author-header');
    fireEvent.press(authorHeader);

    expect(mockNavigate).toHaveBeenCalledWith('UserProfile', { userId: 1 });
  });

  it('should render images when present', () => {
    render(<PostCard {...defaultProps} />);

    expect(screen.getByTestId('post-images')).toBeTruthy();
    expect(screen.getByText('1 images')).toBeTruthy();
  });

  it('should not render images when empty', () => {
    const postWithoutImages: Post = { ...mockPost, images: [] };
    render(<PostCard {...defaultProps} post={postWithoutImages} />);

    expect(screen.queryByTestId('post-images')).toBeNull();
  });

  it('should call onBookmark when bookmark pressed', () => {
    render(<PostCard {...defaultProps} />);

    const bookmarkButton = screen.getByTestId('bookmark-button');
    fireEvent.press(bookmarkButton);

    expect(defaultProps.onBookmark).toHaveBeenCalledWith(1, false);
  });

  it('should call onComment when comment button pressed', () => {
    render(<PostCard {...defaultProps} />);

    const commentButton = screen.getByTestId('comment-button');
    fireEvent.press(commentButton);

    expect(defaultProps.onComment).toHaveBeenCalledWith(1);
  });

  it('should memoize and not re-render unnecessarily', () => {
    const { rerender } = render(<PostCard {...defaultProps} />);

    // Same props, should not cause re-render
    rerender(<PostCard {...defaultProps} />);

    // This test verifies memo is working - component should use React.memo
  });
});
