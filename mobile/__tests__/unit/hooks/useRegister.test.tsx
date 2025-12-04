// __tests__/unit/hooks/useRegister.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Alert } from 'react-native';
import { useRegister } from '../../../src/features/auth/hooks/useRegister';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

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
const mockRegister = jest.fn();

jest.mock('../../../src/features/auth/services', () => ({
  authApi: {
    register: (...args: unknown[]) => mockRegister(...args),
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

describe('useRegister Hook', () => {
  const mockRegisterResponse = {
    id: '1',
    email: 'new@example.com',
    name: 'Jane',
    surname: 'Doe',
    createdAt: new Date().toISOString(),
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
    mockRegister.mockResolvedValue(mockRegisterResponse);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.register(validRegisterData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Backend expects name and surname
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'Password123',
      name: 'Jane',
      surname: 'Doe',
    });

    // Alert should be shown on success
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('email zaten kullanılıyorsa hata döndürmeli', async () => {
    const errorResponse = new Error('Email already registered');
    mockRegister.mockRejectedValue(errorResponse);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.register(validRegisterData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('loading durumu doğru çalışmalı', async () => {
    let resolveRegister: (value: typeof mockRegisterResponse) => void;
    const registerPromise = new Promise<typeof mockRegisterResponse>(resolve => {
      resolveRegister = resolve;
    });
    mockRegister.mockReturnValue(registerPromise);

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.register(validRegisterData);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      resolveRegister!(mockRegisterResponse);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
