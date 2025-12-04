// __tests__/unit/auth/tokenService.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md
// Oku: mobile-development-guide/features/03-AUTH-MODULE.md

import { tokenService } from '../../../src/features/auth/services/tokenService';
import { secureStorage, SECURE_KEYS } from '../../../src/core/storage';

// Mock secure storage
jest.mock('../../../src/core/storage', () => ({
  secureStorage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(true),
    remove: jest.fn().mockResolvedValue(true),
  },
  SECURE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
  },
}));

// Mock authApi
jest.mock('../../../src/features/auth/services/authApi', () => ({
  authApi: {
    refreshToken: jest.fn(),
  },
}));

describe('TokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveTokens', () => {
    it('should save tokens from AuthResponse format', async () => {
      const authResponse = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 86400,
        tokenType: 'Bearer' as const,
        user: { id: 1, email: 'test@test.com' },
      };

      const result = await tokenService.saveTokens(authResponse);

      expect(result).toBe(true);
      expect(secureStorage.set).toHaveBeenCalledWith('access_token', 'access-123');
      expect(secureStorage.set).toHaveBeenCalledWith('refresh_token', 'refresh-456');
      expect(secureStorage.set).toHaveBeenCalledWith(
        'token_expires_at',
        expect.any(String),
      );
    });
  });

  describe('getAccessToken', () => {
    it('should return access token', async () => {
      const mockToken = 'access-token-123';
      (secureStorage.get as jest.Mock).mockResolvedValue(mockToken);

      const token = await tokenService.getAccessToken();

      expect(token).toBe(mockToken);
      expect(secureStorage.get).toHaveBeenCalledWith('access_token');
    });

    it('should return null when token not found', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue(null);

      const token = await tokenService.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token', async () => {
      const mockToken = 'refresh-token-123';
      (secureStorage.get as jest.Mock).mockResolvedValue(mockToken);

      const token = await tokenService.getRefreshToken();

      expect(token).toBe(mockToken);
      expect(secureStorage.get).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when expiresAt not found', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue(null);

      const isExpired = await tokenService.isTokenExpired();

      expect(isExpired).toBe(true);
    });

    it('should return true when token is expired', async () => {
      // Set expiry to past
      const pastTime = (Date.now() - 60000).toString();
      (secureStorage.get as jest.Mock).mockResolvedValue(pastTime);

      const isExpired = await tokenService.isTokenExpired();

      expect(isExpired).toBe(true);
    });

    it('should return false when token is valid', async () => {
      // Set expiry to future (2 minutes from now)
      const futureTime = (Date.now() + 120000).toString();
      (secureStorage.get as jest.Mock).mockResolvedValue(futureTime);

      const isExpired = await tokenService.isTokenExpired();

      expect(isExpired).toBe(false);
    });
  });

  describe('clearTokens', () => {
    it('should remove all tokens', async () => {
      const result = await tokenService.clearTokens();

      expect(result).toBe(true);
      expect(secureStorage.remove).toHaveBeenCalledWith('access_token');
      expect(secureStorage.remove).toHaveBeenCalledWith('refresh_token');
      expect(secureStorage.remove).toHaveBeenCalledWith('token_expires_at');
    });
  });

  describe('hasTokens', () => {
    it('should return true when access token exists', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue('valid-token');

      const hasTokens = await tokenService.hasTokens();

      expect(hasTokens).toBe(true);
    });

    it('should return false when access token not found', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue(null);

      const hasTokens = await tokenService.hasTokens();

      expect(hasTokens).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('should decode JWT token payload', () => {
      // Mock JWT: header.payload.signature
      // Payload: { sub: "user123", exp: 9999999999, iat: 1234567890 }
      const mockJWT =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjEyMzQ1Njc4OTB9.signature';

      const decoded = tokenService.decodeToken(mockJWT);

      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe('user123');
      expect(decoded?.exp).toBe(9999999999);
    });

    it('should return null for invalid token', () => {
      const decoded = tokenService.decodeToken('invalid-token');

      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = tokenService.decodeToken('');

      expect(decoded).toBeNull();
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should return true when no expiry stored', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue(null);

      const isExpiringSoon = await tokenService.isTokenExpiringSoon();

      expect(isExpiringSoon).toBe(true);
    });

    it('should return true when token expires within threshold', async () => {
      // Expires in 1 minute (threshold is 5 minutes)
      const soonTime = (Date.now() + 60000).toString();
      (secureStorage.get as jest.Mock).mockResolvedValue(soonTime);

      const isExpiringSoon = await tokenService.isTokenExpiringSoon();

      expect(isExpiringSoon).toBe(true);
    });

    it('should return false when token has plenty of time', async () => {
      // Expires in 1 hour
      const laterTime = (Date.now() + 3600000).toString();
      (secureStorage.get as jest.Mock).mockResolvedValue(laterTime);

      const isExpiringSoon = await tokenService.isTokenExpiringSoon();

      expect(isExpiringSoon).toBe(false);
    });
  });
});
