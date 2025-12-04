// __tests__/unit/hooks/useLogout.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogout } from '../../../src/features/auth/hooks/useLogout';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset,
  }),
}));

// Mock auth services
const mockLogoutApi = jest.fn();
const mockClearTokens = jest.fn();

jest.mock('../../../src/features/auth/services', () => ({
  authApi: {
    logout: (...args: unknown[]) => mockLogoutApi(...args),
  },
  tokenService: {
    clearTokens: (...args: unknown[]) => mockClearTokens(...args),
  },
  biometricService: {},
}));

// Mock auth store
const mockLogoutStore = jest.fn();

jest.mock('../../../src/features/auth/stores', () => ({
  useAuthStore: (selector?: (state: { logout: () => void }) => unknown) => {
    const state = { logout: mockLogoutStore };
    return selector ? selector(state) : state;
  },
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
    mockLogoutApi.mockResolvedValue({ success: true });
    mockClearTokens.mockResolvedValue(undefined);
    mockLogoutStore.mockResolvedValue(undefined);
  });

  it('başarılı çıkış yapmalı', async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(mockClearTokens).toHaveBeenCalled();
    });

    expect(mockLogoutStore).toHaveBeenCalled();
  });

  it('API hatası durumunda da token ve kullanıcıyı temizlemeli', async () => {
    mockLogoutApi.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.logout();
    });

    // Even on error, tokens should be cleared locally
    await waitFor(() => {
      expect(mockClearTokens).toHaveBeenCalled();
    });

    expect(mockLogoutStore).toHaveBeenCalled();
  });

  it('loading durumu doğru çalışmalı', async () => {
    let resolveLogout: (value: unknown) => void;
    const logoutPromise = new Promise(resolve => {
      resolveLogout = resolve;
    });
    mockLogoutApi.mockReturnValue(logoutPromise);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      resolveLogout!({ success: true });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
