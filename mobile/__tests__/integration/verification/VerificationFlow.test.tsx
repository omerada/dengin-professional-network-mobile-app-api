// __tests__/integration/verification/VerificationFlow.test.tsx
// Verification flow integration testleri

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VerificationNavigator } from '../../../src/core/navigation/VerificationNavigator';
import { useVerificationStore } from '../../../src/features/verification/stores';
import { VerificationStep } from '../../../src/features/verification/types';

// Mocks
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: jest.fn(() => ({ id: 'back' })),
  useCameraFormat: jest.fn(() => ({})),
}));

jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { main: '#007AFF', 500: '#007AFF' },
        background: { primary: '#FFFFFF', secondary: '#F5F5F5' },
        text: { primary: '#000000', secondary: '#666666' },
        success: { main: '#34C759' },
        error: { main: '#FF3B30' },
        border: { light: '#E0E0E0' },
      },
    },
  }),
}));

jest.mock('../../../src/features/verification/hooks', () => ({
  useCameraPermission: () => ({
    hasPermission: true,
    status: 'granted',
    isLoading: false,
    requestPermission: jest.fn().mockResolvedValue(true),
  }),
  useImageValidation: () => ({
    isValidating: false,
    validationResult: { isValid: true, errors: [] },
    error: null,
    validateImage: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
  }),
  useUploadVerification: () => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue({
      verificationId: 'ver_123',
      status: 'PENDING_REVIEW',
    }),
    isLoading: false,
    error: null,
  }),
  useVerificationStatus: () => ({
    data: null,
    isLoading: false,
  }),
  useIsVerified: () => ({
    isVerified: false,
    isPending: false,
    isLoading: false,
  }),
}));

const createTestWrapper = () => {
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

describe('Verification Flow Integration', () => {
  beforeEach(() => {
    useVerificationStore.getState().reset();
  });

  describe('VerificationIntroScreen', () => {
    it('should render intro screen', async () => {
      const { getByText } = render(<VerificationNavigator />, {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(getByText(/kimlik doğrulama/i)).toBeTruthy();
      });
    });

    it('should show verification requirements', async () => {
      const { getByText } = render(<VerificationNavigator />, {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(getByText(/kimlik belgesi/i)).toBeTruthy();
      });
    });
  });

  describe('Store Integration', () => {
    it('should update store when moving through steps', () => {
      const store = useVerificationStore.getState();

      expect(store.currentStep).toBe(VerificationStep.INTRO);

      act(() => {
        store.goToNextStep();
      });

      expect(useVerificationStore.getState().currentStep).toBe(
        VerificationStep.DOCUMENT_FRONT
      );
    });

    it('should store captured images', () => {
      const store = useVerificationStore.getState();

      const mockImage = {
        uri: 'file:///test/image.jpg',
        width: 1920,
        height: 1080,
        fileSize: 500000,
      };

      act(() => {
        store.setDocumentFront(mockImage);
      });

      expect(useVerificationStore.getState().documentFront).toEqual(mockImage);
    });

    it('should track upload progress', () => {
      const store = useVerificationStore.getState();

      act(() => {
        store.setIsUploading(true);
        store.setUploadProgress(50);
      });

      expect(useVerificationStore.getState().isUploading).toBe(true);
      expect(useVerificationStore.getState().uploadProgress).toBe(50);
    });
  });
});
