// __tests__/unit/auth/authApi.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { authApi } from '../../../src/features/auth/services/authApi';
import { apiClient } from '../../../src/core/api/client';
import { API_ENDPOINTS } from '../../../src/core/api/endpoints';

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
      password: 'Password123!',
    };

    // Backend response format: { user, accessToken, refreshToken, tokenType, expiresIn }
    const mockResponse = {
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'John',
          surname: 'Doe',
          verificationStatus: 'PENDING',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: 86400,
      },
    };

    it('should call correct endpoint POST /api/auth/login', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.login(loginData);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGIN, loginData);
    });

    it('should return AuthResponse with user and tokens', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.login(loginData);

      expect(result).toEqual(mockResponse.data);
      expect(result.user.id).toBe(1);
      expect(result.accessToken).toBe('access-token');
      expect(result.expiresIn).toBe(86400);
    });

    it('should throw error on invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(authApi.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    // Backend request format: { email, password, name, surname }
    const registerData = {
      email: 'new@example.com',
      password: 'Password123!',
      name: 'Jane',
      surname: 'Doe',
    };

    // Backend response format: { id, email, name, surname, createdAt }
    const mockResponse = {
      data: {
        id: 2,
        email: 'new@example.com',
        name: 'Jane',
        surname: 'Doe',
        createdAt: '2024-12-04T12:00:00Z',
      },
    };

    it('should call correct endpoint POST /api/auth/register', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REGISTER, registerData);
    });

    it('should return RegisterResponse', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.register(registerData);

      expect(result).toEqual(mockResponse.data);
      expect(result.id).toBe(2);
      expect(result.email).toBe('new@example.com');
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'refresh-token-123';

    // Backend response format: { accessToken, refreshToken, expiresIn }
    const mockResponse = {
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 86400,
      },
    };

    it('should call correct endpoint with Refresh-Token header', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.refreshToken(refreshToken);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REFRESH_TOKEN, null, {
        headers: {
          'Refresh-Token': refreshToken,
        },
      });
    });

    it('should return new tokens', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.refreshToken(refreshToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.expiresIn).toBe(86400);
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should call correct endpoint POST /api/auth/password-reset/request', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: null });

      await authApi.forgotPassword(email);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    });

    it('should not throw error (always returns 204 for security)', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: null });

      await expect(authApi.forgotPassword(email)).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    const resetToken = 'reset-token-123';
    const newPassword = 'NewPassword123!';

    it('should call correct endpoint POST /api/auth/password-reset/confirm', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: null });

      await authApi.resetPassword(resetToken, newPassword);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        resetToken,
        newPassword,
      });
    });
  });

  describe('logout', () => {
    it('should call correct endpoint POST /api/auth/logout', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: null });

      await authApi.logout();

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGOUT);
    });
  });

  describe('getCurrentUser', () => {
    // Backend response format: User object
    const mockResponse = {
      data: {
        id: 1,
        email: 'test@example.com',
        name: 'John',
        surname: 'Doe',
        verificationStatus: 'PENDING',
        createdAt: '2024-12-04T12:00:00Z',
        updatedAt: '2024-12-04T12:00:00Z',
      },
    };

    it('should call correct endpoint GET /api/users/me', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.USER.ME);
    });

    it('should return User data', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getCurrentUser();

      expect(result.email).toBe('test@example.com');
      expect(result.id).toBe(1);
    });
  });

  describe('loginWithGoogle', () => {
    const idToken = 'google-id-token';

    // Backend OAuth2 response format
    const mockResponse = {
      data: {
        success: true,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: 86400,
        isNewUser: false,
        user: {
          id: 1,
          email: 'test@gmail.com',
          name: 'John',
          surname: 'Doe',
          fullName: 'John Doe',
          verificationStatus: 'PENDING',
        },
      },
    };

    it('should call correct endpoint POST /api/auth/oauth/google', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.loginWithGoogle(idToken);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.OAUTH_GOOGLE, { idToken });
    });

    it('should return OAuth2AuthResponse', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.loginWithGoogle(idToken);

      expect(result.success).toBe(true);
      expect(result.isNewUser).toBe(false);
      expect(result.user.email).toBe('test@gmail.com');
    });
  });

  describe('loginWithApple', () => {
    const idToken = 'apple-id-token';
    const authorizationCode = 'auth-code';
    const fullName = { givenName: 'John', familyName: 'Doe' };

    const mockResponse = {
      data: {
        success: true,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: 86400,
        isNewUser: true,
        user: {
          id: 1,
          email: 'test@privaterelay.appleid.com',
          name: 'John',
          surname: 'Doe',
          verificationStatus: 'PENDING',
        },
      },
    };

    it('should call correct endpoint POST /api/auth/oauth/apple', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await authApi.loginWithApple(idToken, authorizationCode, fullName);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.OAUTH_APPLE, {
        idToken,
        authorizationCode,
        fullName,
      });
    });

    it('should handle first-time login with user name', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.loginWithApple(idToken, authorizationCode, fullName);

      expect(result.isNewUser).toBe(true);
      expect(result.user.name).toBe('John');
    });
  });
});
