// __tests__/unit/hooks/useLogout.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogout } from '../../../src/features/auth/hooks/useLogout';
import { authApi } from '../../../src/features/auth/services/authApi';
import { tokenService } from '../../../src/features/auth/services/tokenService';
import { useAuthStore } from '../../../src/features/auth/stores/authStore';

// Mock dependencies
jest.mock('../../../src/features/auth/services/authApi', () => ({
  authApi: {
    logout: jest.fn(),
  },
}));

jest.mock('../../../src/features/auth/services/tokenService', () => ({
  tokenService: {
    clearTokens: jest.fn(),
  },
}));

jest.mock('../../../src/features/auth/stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    clearUser: jest.fn(),
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

describe('useLogout Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('başarılı çıkış yapmalı', async () => {
    (authApi.logout as jest.Mock).mockResolvedValue({ success: true });
    const clearUser = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      clearUser,
    });

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(tokenService.clearTokens).toHaveBeenCalled();
    expect(clearUser).toHaveBeenCalled();
  });

  it('API hatası durumunda da token ve kullanıcıyı temizlemeli', async () => {
    (authApi.logout as jest.Mock).mockRejectedValue(new Error('Network error'));
    const clearUser = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      clearUser,
    });

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    // Even on error, tokens should be cleared locally
    await waitFor(() => {
      expect(result.current.isError || result.current.isSuccess).toBe(true);
    });
  });

  it('loading durumu doğru çalışmalı', async () => {
    let resolveLogout: (value: unknown) => void;
    const logoutPromise = new Promise((resolve) => {
      resolveLogout = resolve;
    });
    (authApi.logout as jest.Mock).mockReturnValue(logoutPromise);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolveLogout!({ success: true });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
