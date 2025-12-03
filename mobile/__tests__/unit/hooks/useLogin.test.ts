// __tests__/unit/hooks/useLogin.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogin } from '../../../src/features/auth/hooks/useLogin';
import { authApi } from '../../../src/features/auth/services/authApi';
import { tokenService } from '../../../src/features/auth/services/tokenService';
import { useAuthStore } from '../../../src/features/auth/stores/authStore';

// Mock dependencies
jest.mock('../../../src/features/auth/services/authApi', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

jest.mock('../../../src/features/auth/services/tokenService', () => ({
  tokenService: {
    setTokens: jest.fn(),
  },
}));

jest.mock('../../../src/features/auth/stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    setUser: jest.fn(),
    setLastLoginEmail: jest.fn(),
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

describe('useLogin Hook', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    verificationStatus: 'VERIFIED' as const,
    role: 'USER' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockLoginResponse = {
    success: true,
    data: {
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('başarılı giriş yapmalı', async () => {
    (authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse);
    const setUser = jest.fn();
    const setLastLoginEmail = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      setUser,
      setLastLoginEmail,
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(tokenService.setTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
    expect(setUser).toHaveBeenCalledWith(mockUser);
    expect(setLastLoginEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('başarısız giriş hatası döndürmeli', async () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    };
    (authApi.login as jest.Mock).mockRejectedValue(errorResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(tokenService.setTokens).not.toHaveBeenCalled();
  });

  it('loading durumu doğru çalışmalı', async () => {
    let resolveLogin: (value: typeof mockLoginResponse) => void;
    const loginPromise = new Promise<typeof mockLoginResponse>((resolve) => {
      resolveLogin = resolve;
    });
    (authApi.login as jest.Mock).mockReturnValue(loginPromise);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolveLogin!(mockLoginResponse);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
