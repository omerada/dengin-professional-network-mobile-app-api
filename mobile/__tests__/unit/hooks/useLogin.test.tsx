// __tests__/unit/hooks/useLogin.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogin } from '../../../src/features/auth/hooks/useLogin';

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
const mockLogin = jest.fn();
const mockSaveTokens = jest.fn();

jest.mock('../../../src/features/auth/services', () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
  },
  tokenService: {
    saveTokens: (...args: unknown[]) => mockSaveTokens(...args),
  },
}));

// Mock auth store
const mockSetUser = jest.fn();
const mockSetLastLoginEmail = jest.fn();

jest.mock('../../../src/features/auth/stores', () => ({
  useAuthStore: () => ({
    setUser: mockSetUser,
    setLastLoginEmail: mockSetLastLoginEmail,
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
    user: mockUser,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('başarılı giriş yapmalı', async () => {
    mockLogin.mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.login({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockSaveTokens).toHaveBeenCalledWith(mockLoginResponse);
    expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    expect(mockSetLastLoginEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('başarısız giriş hatası döndürmeli', async () => {
    const errorResponse = new Error('Invalid email or password');
    mockLogin.mockRejectedValue(errorResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.login({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockSaveTokens).not.toHaveBeenCalled();
  });

  it('loading durumu doğru çalışmalı', async () => {
    let resolveLogin: (value: typeof mockLoginResponse) => void;
    const loginPromise = new Promise<typeof mockLoginResponse>(resolve => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValue(loginPromise);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      resolveLogin!(mockLoginResponse);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
