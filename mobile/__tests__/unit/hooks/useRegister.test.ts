// __tests__/unit/hooks/useRegister.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRegister } from '../../../src/features/auth/hooks/useRegister';
import { authApi } from '../../../src/features/auth/services/authApi';
import { tokenService } from '../../../src/features/auth/services/tokenService';
import { useAuthStore } from '../../../src/features/auth/stores/authStore';

// Mock dependencies
jest.mock('../../../src/features/auth/services/authApi', () => ({
  authApi: {
    register: jest.fn(),
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

describe('useRegister Hook', () => {
  const mockUser = {
    id: '1',
    email: 'new@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    displayName: 'Jane Doe',
    verificationStatus: 'PENDING' as const,
    role: 'USER' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockRegisterResponse = {
    success: true,
    data: {
      user: mockUser,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
  };

  const validRegisterData = {
    email: 'new@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    firstName: 'Jane',
    lastName: 'Doe',
    acceptTerms: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('başarılı kayıt yapmalı', async () => {
    (authApi.register as jest.Mock).mockResolvedValue(mockRegisterResponse);
    const setUser = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      setUser,
    });

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(validRegisterData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authApi.register).toHaveBeenCalledWith(validRegisterData);
    expect(tokenService.setTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
    expect(setUser).toHaveBeenCalledWith(mockUser);
  });

  it('email zaten kullanılıyorsa hata döndürmeli', async () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already registered',
      },
    };
    (authApi.register as jest.Mock).mockRejectedValue(errorResponse);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(validRegisterData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(tokenService.setTokens).not.toHaveBeenCalled();
  });

  it('loading durumu doğru çalışmalı', async () => {
    let resolveRegister: (value: typeof mockRegisterResponse) => void;
    const registerPromise = new Promise<typeof mockRegisterResponse>((resolve) => {
      resolveRegister = resolve;
    });
    (authApi.register as jest.Mock).mockReturnValue(registerPromise);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate(validRegisterData);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolveRegister!(mockRegisterResponse);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
