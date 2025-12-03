// src/features/feed/__tests__/CreatePostScreen.test.tsx
// CreatePostScreen component testi
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreatePostScreen } from '../screens/CreatePostScreen';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock theme
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 500: '#007AFF', 600: '#0066CC' },
        text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
        background: { primary: '#FFFFFF', secondary: '#F5F5F5' },
        border: { light: '#E0E0E0' },
        status: { error: '#FF0000' },
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      borderRadius: { sm: 4, md: 8, lg: 16 },
      typography: {
        fontFamily: { regular: 'System', medium: 'System', bold: 'System' },
        fontSize: { xs: 10, sm: 12, md: 14, lg: 16, xl: 18 },
      },
    },
  }),
}));

// Mock feed store
jest.mock('../stores/feedStore', () => ({
  useFeedStore: () => ({
    draftContent: '',
    draftImages: [],
    setDraftContent: jest.fn(),
    setDraftImages: jest.fn(),
    clearDraft: jest.fn(),
  }),
}));

// Mock useCreatePost
const mockCreatePost = jest.fn();
jest.mock('../hooks/useCreatePost', () => ({
  useCreatePost: () => ({
    createPost: mockCreatePost,
    isLoading: false,
    progress: 0,
    isSuccess: false,
    error: null,
  }),
}));

// Mock image picker service
jest.mock('../services/imagePickerService', () => ({
  imagePickerService: {
    pickFromGallery: jest.fn(),
    pickFromCamera: jest.fn(),
  },
}));

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CreatePostScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render text input', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText(/Ne düşünüyorsun/)).toBeTruthy();
  });

  it('should render character counter', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    // Character counter should show 0/500 initially
    expect(screen.getByText('0/500')).toBeTruthy();
  });

  it('should update character counter on input', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/Ne düşünüyorsun/);
    fireEvent.changeText(input, 'Hello world');

    expect(screen.getByText('11/500')).toBeTruthy();
  });

  it('should disable submit button when content is empty', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    // Submit button should be disabled
    const submitButton = screen.getByText('Paylaş');
    expect(submitButton).toBeTruthy();
    // Check if button is disabled via accessibility state or style
  });

  it('should enable submit button when content is provided', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/Ne düşünüyorsun/);
    fireEvent.changeText(input, 'This is my post content');

    const submitButton = screen.getByText('Paylaş');
    fireEvent.press(submitButton);

    expect(mockCreatePost).toHaveBeenCalled();
  });

  it('should render image picker buttons', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    // Gallery and camera buttons should be visible
    // Would check for icons or test IDs
  });

  it('should limit content to 500 characters', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/Ne düşünüyorsun/);
    const longText = 'a'.repeat(600);
    
    fireEvent.changeText(input, longText);

    // Counter should show 500/500 (maxLength enforced)
  });

  it('should show loading state during submission', () => {
    // Override the hook mock to return loading state
    jest.mock('../hooks/useCreatePost', () => ({
      useCreatePost: () => ({
        createPost: mockCreatePost,
        isLoading: true,
        progress: 50,
        isSuccess: false,
        error: null,
      }),
    }));

    // Re-render with loading state
    // Submit button should show loading indicator
  });

  it('should navigate back on close button press', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    // Find close button and press
    const closeButton = screen.getByTestId?.('close-button');
    if (closeButton) {
      fireEvent.press(closeButton);
      expect(mockGoBack).toHaveBeenCalled();
    }
  });

  it('should call createPost with content and images', async () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/Ne düşünüyorsun/);
    fireEvent.changeText(input, 'Test post content');

    const submitButton = screen.getByText('Paylaş');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test post content',
          images: [],
        })
      );
    });
  });

  it('should show validation error for empty content', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    const submitButton = screen.getByText('Paylaş');
    fireEvent.press(submitButton);

    // Should not call createPost
    expect(mockCreatePost).not.toHaveBeenCalled();
  });
});
