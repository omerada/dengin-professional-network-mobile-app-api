// src/features/feed/__tests__/CreatePostScreen.test.tsx
// CreatePostScreen component testi - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreatePostScreen } from '../screens/CreatePostScreen';

// Mock navigation
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    setOptions: mockSetOptions,
    canGoBack: () => true,
  }),
}));

// Mock theme
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 200: '#BBDEFB', 500: '#007AFF', 600: '#0066CC' },
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

// Mock feed store with correct state structure
const mockSetDraftContent = jest.fn();
const mockAddDraftImage = jest.fn();
const mockRemoveDraftImage = jest.fn();
const mockClearDraft = jest.fn();

let mockDraftContent = '';
let mockDraftImages: any[] = [];

jest.mock('../stores', () => ({
  useFeedStore: (selector: any) => {
    const state = {
      draftContent: mockDraftContent,
      draftImages: mockDraftImages,
      setDraftContent: mockSetDraftContent,
      addDraftImage: mockAddDraftImage,
      removeDraftImage: mockRemoveDraftImage,
      clearDraft: mockClearDraft,
    };
    return selector(state);
  },
}));

// Mock useCreatePost
const mockMutate = jest.fn();
jest.mock('../hooks', () => ({
  useCreatePost: () => ({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    error: null,
  }),
}));

// Mock image picker service
jest.mock('../services', () => ({
  imagePickerService: {
    pickFromGallery: jest.fn().mockResolvedValue([]),
    captureFromCamera: jest.fn().mockResolvedValue(null),
    validateImageCount: jest.fn().mockReturnValue(true),
    validateFileSize: jest.fn().mockReturnValue(true),
  },
}));

// Mock components
jest.mock('../components', () => ({
  PostTextInput: ({ value, onChangeText, placeholder }: any) => {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID="post-text-input"
      />
    );
  },
  ImagePreviewGrid: () => null,
}));

// Mock Icon
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

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
    mockDraftContent = '';
    mockDraftImages = [];
  });

  it('should render text input', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    expect(screen.getByTestId('post-text-input')).toBeTruthy();
  });

  it('should call setOptions on mount', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    expect(mockSetOptions).toHaveBeenCalled();
  });

  it('should handle text input changes', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    const input = screen.getByTestId('post-text-input');
    fireEvent.changeText(input, 'Hello world');

    expect(mockSetDraftContent).toHaveBeenCalledWith('Hello world');
  });

  it('should render with empty draft initially', () => {
    render(<CreatePostScreen />, { wrapper: createWrapper() });

    const input = screen.getByTestId('post-text-input');
    expect(input.props.value).toBe('');
  });
});
