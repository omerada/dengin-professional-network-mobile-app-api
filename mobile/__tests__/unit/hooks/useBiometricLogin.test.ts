// __tests__/unit/hooks/useBiometricLogin.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBiometricLogin } from '../../../src/features/auth/hooks/useBiometricLogin';
import { biometricService } from '../../../src/features/auth/services/biometricService';
import { tokenService } from '../../../src/features/auth/services/tokenService';
import { useAuthStore } from '../../../src/features/auth/stores/authStore';

// Mock dependencies
jest.mock('../../../src/features/auth/services/biometricService', () => ({
  biometricService: {
    isAvailable: jest.fn(),
    authenticate: jest.fn(),
    hasKeys: jest.fn(),
    createSignature: jest.fn(),
  },
}));

jest.mock('../../../src/features/auth/services/tokenService', () => ({
  tokenService: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
  },
}));

jest.mock('../../../src/features/auth/stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    setUser: jest.fn(),
    biometricEnabled: true,
  })),
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
  });

  describe('Biometric Availability', () => {
    it('biyometrik mevcut olduğunda true döndürmeli', async () => {
      (biometricService.isAvailable as jest.Mock).mockResolvedValue({
        available: true,
        biometryType: 'FaceID',
      });

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isBiometricAvailable).toBe(true);
        expect(result.current.biometryType).toBe('FaceID');
      });
    });

    it('biyometrik mevcut olmadığında false döndürmeli', async () => {
      (biometricService.isAvailable as jest.Mock).mockResolvedValue({
        available: false,
      });

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isBiometricAvailable).toBe(false);
      });
    });
  });

  describe('Biometric Authentication', () => {
    beforeEach(() => {
      (biometricService.isAvailable as jest.Mock).mockResolvedValue({
        available: true,
        biometryType: 'FaceID',
      });
      (biometricService.hasKeys as jest.Mock).mockResolvedValue(true);
    });

    it('başarılı biyometrik kimlik doğrulama yapmalı', async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
      });
      (biometricService.createSignature as jest.Mock).mockResolvedValue({
        success: true,
        signature: 'mock-signature',
      });
      (tokenService.getAccessToken as jest.Mock).mockResolvedValue('saved-token');

      const setUser = jest.fn();
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        setUser,
        biometricEnabled: true,
      });

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.loginWithBiometric();
      });

      await waitFor(() => {
        expect(biometricService.authenticate).toHaveBeenCalled();
      });
    });

    it('biyometrik başarısız olduğunda hata döndürmeli', async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: 'User cancelled',
      });

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.loginWithBiometric();
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });

  describe('Biometric Keys', () => {
    it('anahtarlar mevcut olduğunda true döndürmeli', async () => {
      (biometricService.isAvailable as jest.Mock).mockResolvedValue({
        available: true,
        biometryType: 'TouchID',
      });
      (biometricService.hasKeys as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasStoredCredentials).toBe(true);
      });
    });

    it('anahtarlar yoksa false döndürmeli', async () => {
      (biometricService.isAvailable as jest.Mock).mockResolvedValue({
        available: true,
        biometryType: 'TouchID',
      });
      (biometricService.hasKeys as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useBiometricLogin(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasStoredCredentials).toBe(false);
      });
    });
  });
});
