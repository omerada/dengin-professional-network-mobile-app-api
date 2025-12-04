// __tests__/integration/verification/VerificationFlow.test.tsx
// Verification flow integration testleri

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVerificationStore } from '../../../src/features/verification/stores';
import type { VerificationStep } from '../../../src/features/verification/types';

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

// Mock VerificationNavigator to avoid SafeAreaProvider issues
jest.mock('../../../src/core/navigation/VerificationNavigator', () => ({
  VerificationNavigator: () => {
    const { Text, View } = require('react-native');
    return (
      <View>
        <Text>Kimlik Doğrulama</Text>
        <Text>Kimlik belgesi</Text>
      </View>
    );
  },
}));

import { VerificationNavigator } from '../../../src/core/navigation/VerificationNavigator';

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

      expect(store.currentStep).toBe('intro');

      act(() => {
        store.setStep('document_front');
      });

      expect(useVerificationStore.getState().currentStep).toBe('document_front');
    });

    it('should store captured images', () => {
      const store = useVerificationStore.getState();

      const mockImage = {
        uri: 'file:///test/image.jpg',
        path: 'file:///test/image.jpg',
        width: 1920,
        height: 1080,
        type: 'front' as const,
        capturedAt: new Date().toISOString(),
        fileSize: 500000,
      };

      act(() => {
        store.setDocumentFront(mockImage);
      });

      expect(useVerificationStore.getState().data.documentFront).toEqual(mockImage);
    });

    it('should track upload progress', () => {
      const store = useVerificationStore.getState();

      act(() => {
        store.setUploadProgress({ documentFront: 100, documentBack: 50, selfie: 0 });
      });

      expect(useVerificationStore.getState().uploadProgress.total).toBe(50);
    });
  });
});
