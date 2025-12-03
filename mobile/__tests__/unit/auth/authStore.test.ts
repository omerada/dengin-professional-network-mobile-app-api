// __tests__/unit/auth/authStore.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../../../src/features/auth/stores/authStore';

// Mock secure storage
jest.mock('../../../src/core/storage/secureStorage', () => ({
  secureStorage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(true),
    remove: jest.fn().mockResolvedValue(true),
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.clearUser();
    });
  });

  it('başlangıç durumu doğru olmalı', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('setUser kullanıcıyı ayarlamalı ve authenticated yapmalı', () => {
    const { result } = renderHook(() => useAuthStore());

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

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('clearUser kullanıcıyı temizlemeli', () => {
    const { result } = renderHook(() => useAuthStore());

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

    act(() => {
      result.current.setUser(mockUser);
    });

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('setLoading loading durumunu değiştirmeli', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('setBiometricEnabled biyometrik durumunu değiştirmeli', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setBiometricEnabled(true);
    });

    expect(result.current.biometricEnabled).toBe(true);

    act(() => {
      result.current.setBiometricEnabled(false);
    });

    expect(result.current.biometricEnabled).toBe(false);
  });

  it('setLastLoginEmail son giriş emailini kaydetmeli', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLastLoginEmail('test@example.com');
    });

    expect(result.current.lastLoginEmail).toBe('test@example.com');
  });
});
