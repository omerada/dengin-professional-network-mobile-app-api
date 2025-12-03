// __tests__/unit/auth/authApi.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { authApi } from '../../../src/features/auth/services/authApi';
import { apiClient } from '../../../src/core/api/client';

// Mock api client
jest.mock('../../../src/core/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe('AuthApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      },
    };

    it('doğru endpoint ile istek yapmalı', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.login(loginData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginData);
    });

    it('başarılı yanıt döndürmeli', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.login(loginData);

      expect(result).toEqual(mockResponse.data);
    });

    it('hata durumunda exception fırlatmalı', async () => {
      const error = new Error('Invalid credentials');
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(authApi.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'new@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      firstName: 'Jane',
      lastName: 'Doe',
      acceptTerms: true,
    };

    const mockResponse = {
      data: {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'new@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      },
    };

    it('doğru endpoint ile istek yapmalı', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
    });

    it('başarılı yanıt döndürmeli', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.register(registerData);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'refresh-token-123';

    const mockResponse = {
      data: {
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      },
    };

    it('doğru endpoint ile istek yapmalı', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.refreshToken(refreshToken);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken,
      });
    });

    it('yeni tokenlar döndürmeli', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.refreshToken(refreshToken);

      expect(result.data.accessToken).toBe('new-access-token');
      expect(result.data.refreshToken).toBe('new-refresh-token');
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    const mockResponse = {
      data: {
        success: true,
        message: 'Password reset email sent',
      },
    };

    it('doğru endpoint ile istek yapmalı', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.forgotPassword(email);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email,
      });
    });
  });

  describe('resetPassword', () => {
    const resetData = {
      token: 'reset-token',
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    };

    const mockResponse = {
      data: {
        success: true,
        message: 'Password reset successful',
      },
    };

    it('doğru endpoint ile istek yapmalı', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.resetPassword(resetData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', resetData);
    });
  });

  describe('logout', () => {
    const mockResponse = {
      data: {
        success: true,
      },
    };

    it('doğru endpoint ile istek yapmalı', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('getProfile', () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    };

    it('doğru endpoint ile istek yapmalı', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.getProfile();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
    });

    it('kullanıcı bilgilerini döndürmeli', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getProfile();

      expect(result.data.email).toBe('test@example.com');
    });
  });
});
