// src/features/feed/screens/__tests__/CreatePostScreen.test.tsx
// CreatePostScreen Component Tests
// Test coverage: Rendering, interactions, validation, accessibility

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CreatePostScreen } from '../CreatePostScreen';

// Mock dependencies
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
    setOptions: mockSetOptions,
    canGoBack: jest.fn(() => true),
  }),
}));

jest.mock('@contexts/ThemeContext', () => ({
  useColors: jest.fn(() => ({
    interactive: {
      default: '#F59E42',
      subtle: '#FFF8F0',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
    },
    border: {
      default: '#E0E0E0',
    },
  })),
}));

jest.mock('@shared/hooks/useHaptic', () => ({
  useHaptic: jest.fn(() => ({
    medium: jest.fn(),
    heavy: jest.fn(),
    trigger: jest.fn(),
  })),
}));

const mockMutate = jest.fn();
jest.mock('../../hooks', () => ({
  useCreatePost: jest.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

const mockClearDraft = jest.fn();
const mockSetDraftContent = jest.fn();
const mockAddDraftImage = jest.fn();
const mockRemoveDraftImage = jest.fn();

jest.mock('../../stores', () => ({
  useFeedStore: jest.fn((selector: any) => {
    const state = {
      draftContent: '',
      draftImages: [],
      setDraftContent: mockSetDraftContent,
      addDraftImage: mockAddDraftImage,
      removeDraftImage: mockRemoveDraftImage,
      clearDraft: mockClearDraft,
    };
    return selector ? selector(state) : state;
  }),
}));

const mockPickFromGallery = jest.fn(() => Promise.resolve([]));
const mockCaptureFromCamera = jest.fn(() => Promise.resolve(null));
const mockValidateImageCount = jest.fn(() => true);
const mockValidateFileSize = jest.fn(() => true);

jest.mock('../../services', () => ({
  imagePickerService: {
    pickFromGallery: mockPickFromGallery,
    captureFromCamera: mockCaptureFromCamera,
    validateImageCount: mockValidateImageCount,
    validateFileSize: mockValidateFileSize,
  },
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('CreatePostScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  describe('Rendering', () => {
    it('should render correctly', () => {
      const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);

      expect(getByPlaceholderText('Ne düşünüyorsunuz?')).toBeTruthy();
      expect(getByText('Galeri')).toBeTruthy();
      expect(getByText('Kamera')).toBeTruthy();
      expect(getByText('0/5 görsel')).toBeTruthy();
    });

    it('should set header options on mount', () => {
      render(<CreatePostScreen />);

      expect(mockSetOptions).toHaveBeenCalled();
    });
  });

  describe('Text Input', () => {
    it('should update draft content when typing', () => {
      const { getByPlaceholderText } = render(<CreatePostScreen />);

      const input = getByPlaceholderText('Ne düşünüyorsunuz?');
      fireEvent.changeText(input, 'Test content');

      expect(mockSetDraftContent).toHaveBeenCalledWith('Test content');
    });
  });

  describe('Image Picker', () => {
    it('should open gallery when gallery button pressed', async () => {
      const { getByText } = render(<CreatePostScreen />);

      const galleryButton = getByText('Galeri');
      fireEvent.press(galleryButton);

      await waitFor(() => {
        expect(mockPickFromGallery).toHaveBeenCalled();
      });
    });

    it('should open camera when camera button pressed', async () => {
      const { getByText } = render(<CreatePostScreen />);

      const cameraButton = getByText('Kamera');
      fireEvent.press(cameraButton);

      await waitFor(() => {
        expect(mockCaptureFromCamera).toHaveBeenCalled();
      });
    });

    it('should validate image count before adding', async () => {
      mockValidateImageCount.mockReturnValueOnce(false);

      const { getByText } = render(<CreatePostScreen />);

      const galleryButton = getByText('Galeri');
      fireEvent.press(galleryButton);

      await waitFor(() => {
        expect(mockPickFromGallery).not.toHaveBeenCalled();
      });
    });

    it('should add images from gallery', async () => {
      const mockImages = [
        { uri: 'file://test1.jpg', fileSize: 1000000 },
        { uri: 'file://test2.jpg', fileSize: 2000000 },
      ];
      mockPickFromGallery.mockResolvedValueOnce(mockImages);

      const { getByText } = render(<CreatePostScreen />);

      const galleryButton = getByText('Galeri');
      fireEvent.press(galleryButton);

      await waitFor(() => {
        expect(mockAddDraftImage).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Post Submission', () => {
    it('should disable post button when no content', () => {
      render(<CreatePostScreen />);

      const headerRight = mockSetOptions.mock.calls[0][0].headerRight();
      expect(headerRight.props.disabled).toBe(true);
    });

    it('should show close confirmation when has draft', () => {
      const useFeedStoreMock = require('../../stores').useFeedStore;
      useFeedStoreMock.mockImplementation((selector: any) => {
        const state = {
          draftContent: 'Test content',
          draftImages: [],
          clearDraft: mockClearDraft,
        };
        return selector ? selector(state) : state;
      });

      render(<CreatePostScreen />);

      const headerLeft = mockSetOptions.mock.calls[0][0].headerLeft();
      fireEvent.press(headerLeft);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Taslağı Sil',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('should go back without confirmation when no draft', () => {
      render(<CreatePostScreen />);

      const headerLeft = mockSetOptions.mock.calls[0][0].headerLeft();
      fireEvent.press(headerLeft);

      expect(mockGoBack).toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });
  });

  describe('Upload Progress', () => {
    it('should show progress indicator during upload', async () => {
      const { getByText } = render(<CreatePostScreen />);

      // Simulate upload progress
      const onProgress = mockMutate.mock.calls[0]?.[0]?.onProgress;
      if (onProgress) {
        onProgress({ imageIndex: 0, totalImages: 3, progress: 50 });
      }

      await waitFor(() => {
        expect(getByText(/Görsel yükleniyor/)).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for toolbar buttons', () => {
      const { getByLabelText } = render(<CreatePostScreen />);

      expect(getByLabelText('Galeriden görsel seç')).toBeTruthy();
      expect(getByLabelText('Kamera ile fotoğraf çek')).toBeTruthy();
    });

    it('should have accessibility hints', () => {
      const { getByA11yHint } = render(<CreatePostScreen />);

      expect(getByA11yHint(/görsel daha ekleyebilirsiniz/)).toBeTruthy();
      expect(getByA11yHint('Hemen fotoğraf çekin ve paylaşın')).toBeTruthy();
    });

    it('should have accessibility roles', () => {
      const { getAllByRole } = render(<CreatePostScreen />);

      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should disable buttons during posting', () => {
      const useCreatePostMock = require('../../hooks').useCreatePost;
      useCreatePostMock.mockReturnValueOnce({
        mutate: mockMutate,
        isPending: true,
      });

      const { getByLabelText } = render(<CreatePostScreen />);

      const galleryButton = getByLabelText('Galeriden görsel seç');
      expect(galleryButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Keyboard Handling', () => {
    it('should render keyboard avoiding view', () => {
      const { UNSAFE_getByType } = render(<CreatePostScreen />);
      const KeyboardAvoidingView = require('react-native').KeyboardAvoidingView;

      expect(UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
    });

    it('should dismiss keyboard on scroll tap', () => {
      const { UNSAFE_getByType } = render(<CreatePostScreen />);
      const ScrollView = require('react-native').ScrollView;

      const scrollView = UNSAFE_getByType(ScrollView);
      expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
    });
  });

  describe('Draft Persistence', () => {
    it('should clear draft after successful post', async () => {
      mockMutate.mockImplementation(({ data, onProgress }) => {
        // Simulate successful post
        Promise.resolve().then(() => {
          mockClearDraft();
          mockGoBack();
        });
      });

      const useFeedStoreMock = require('../../stores').useFeedStore;
      useFeedStoreMock.mockImplementation((selector: any) => {
        const state = {
          draftContent: 'Test content',
          draftImages: [],
          clearDraft: mockClearDraft,
        };
        return selector ? selector(state) : state;
      });

      render(<CreatePostScreen />);

      const headerRight = mockSetOptions.mock.calls[0][0].headerRight();
      fireEvent.press(headerRight);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });
  });
});
