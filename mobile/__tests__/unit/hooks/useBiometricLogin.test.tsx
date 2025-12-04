// __tests__/unit/hooks/useBiometricLogin.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBiometricLogin } from '../../../src/features/auth/hooks/useBiometricLogin';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset,
  }),
}));

// Mock biometric service
const mockIsAvailable = jest.fn();
const mockIsEnabled = jest.fn();
const mockGetBiometricName = jest.fn();
const mockGetStoredCredentials = jest.fn();

// Mock auth api
const mockRefreshToken = jest.fn();
const mockGetCurrentUser = jest.fn();

// Mock token service
const mockSaveTokens = jest.fn();

jest.mock('../../../src/features/auth/services', () => ({
  biometricService: {
    isAvailable: (...args: unknown[]) => mockIsAvailable(...args),
    isEnabled: (...args: unknown[]) => mockIsEnabled(...args),
    getBiometricName: (...args: unknown[]) => mockGetBiometricName(...args),
    getStoredCredentials: (...args: unknown[]) => mockGetStoredCredentials(...args),
  },
  authApi: {
    refreshToken: (...args: unknown[]) => mockRefreshToken(...args),
    getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  },
  tokenService: {
    saveTokens: (...args: unknown[]) => mockSaveTokens(...args),
  },
}));

// Mock auth store
const mockSetUser = jest.fn();

jest.mock('../../../src/features/auth/stores', () => ({
  useAuthStore: () => ({
    setUser: mockSetUser,
    biometricEnabled: true,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBiometricLogin Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks
    mockIsAvailable.mockResolvedValue({ available: false });
    mockIsEnabled.mockResolvedValue(false);
    mockGetBiometricName.mockResolvedValue('');
  });

  describe('Biometric Availability', () => {
    it('biyometrik mevcut ve etkin olduğunda true döndürmeli', async () => {
      mockIsAvailable.mockResolvedValue({ available: true });
      mockIsEnabled.mockResolvedValue(true);
      mockGetBiometricName.mockResolvedValue('Face ID');

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isBiometricAvailable).toBe(true);
        expect(result.current.biometricName).toBe('Face ID');
      });
    });

    it('biyometrik mevcut olmadığında false döndürmeli', async () => {
      mockIsAvailable.mockResolvedValue({ available: false });
      mockIsEnabled.mockResolvedValue(false);

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isBiometricAvailable).toBe(false);
      });
    });
  });

  describe('Biometric Authentication', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'John',
      surname: 'Doe',
    };

    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    beforeEach(() => {
      mockIsAvailable.mockResolvedValue({ available: true });
      mockIsEnabled.mockResolvedValue(true);
      mockGetBiometricName.mockResolvedValue('Face ID');
    });

    it('başarılı biyometrik kimlik doğrulama yapmalı', async () => {
      mockGetStoredCredentials.mockResolvedValue({ refreshToken: 'stored-refresh-token' });
      mockRefreshToken.mockResolvedValue(mockTokens);
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockSaveTokens.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      // Wait for availability check
      await waitFor(() => {
        expect(result.current.isBiometricAvailable).toBe(true);
      });

      await act(async () => {
        result.current.loginWithBiometric();
      });

      await waitFor(() => {
        expect(mockGetStoredCredentials).toHaveBeenCalled();
      });
    });

    it('biyometrik başarısız olduğunda hata döndürmeli', async () => {
      mockGetStoredCredentials.mockResolvedValue(null);

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      // Wait for availability check
      await waitFor(() => {
        expect(result.current.isBiometricAvailable).toBe(true);
      });

      await act(async () => {
        result.current.loginWithBiometric();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('Loading State', () => {
    it('loading durumu doğru çalışmalı', async () => {
      mockIsAvailable.mockResolvedValue({ available: true });
      mockIsEnabled.mockResolvedValue(true);
      mockGetBiometricName.mockResolvedValue('Face ID');

      let resolveCredentials: (value: unknown) => void;
      const credentialsPromise = new Promise(resolve => {
        resolveCredentials = resolve;
      });
      mockGetStoredCredentials.mockReturnValue(credentialsPromise);

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      // Wait for availability check
      await waitFor(() => {
        expect(result.current.isBiometricAvailable).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.loginWithBiometric();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveCredentials!(null);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
