// __tests__/unit/auth/tokenService.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { tokenService } from '../../../src/features/auth/services/tokenService';
import { secureStorage } from '../../../src/core/storage/secureStorage';

// Mock secure storage
jest.mock('../../../src/core/storage/secureStorage', () => ({
  secureStorage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(true),
    remove: jest.fn().mockResolvedValue(true),
  },
}));

describe('TokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('access token döndürmeli', async () => {
      const mockToken = 'access-token-123';
      (secureStorage.get as jest.Mock).mockResolvedValue(mockToken);

      const token = await tokenService.getAccessToken();

      expect(token).toBe(mockToken);
      expect(secureStorage.get).toHaveBeenCalledWith('access_token');
    });

    it('token yoksa null döndürmeli', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue(null);

      const token = await tokenService.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('refresh token döndürmeli', async () => {
      const mockToken = 'refresh-token-123';
      (secureStorage.get as jest.Mock).mockResolvedValue(mockToken);

      const token = await tokenService.getRefreshToken();

      expect(token).toBe(mockToken);
      expect(secureStorage.get).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('setTokens', () => {
    it('her iki token\'ı da kaydetmeli', async () => {
      const accessToken = 'access-123';
      const refreshToken = 'refresh-456';

      await tokenService.setTokens(accessToken, refreshToken);

      expect(secureStorage.set).toHaveBeenCalledWith('access_token', accessToken);
      expect(secureStorage.set).toHaveBeenCalledWith('refresh_token', refreshToken);
    });
  });

  describe('clearTokens', () => {
    it('her iki token\'ı da silmeli', async () => {
      await tokenService.clearTokens();

      expect(secureStorage.remove).toHaveBeenCalledWith('access_token');
      expect(secureStorage.remove).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('hasValidToken', () => {
    it('token varsa true döndürmeli', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue('valid-token');

      const hasToken = await tokenService.hasValidToken();

      expect(hasToken).toBe(true);
    });

    it('token yoksa false döndürmeli', async () => {
      (secureStorage.get as jest.Mock).mockResolvedValue(null);

      const hasToken = await tokenService.hasValidToken();

      expect(hasToken).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('JWT token decode etmeli', () => {
      // JWT structure: header.payload.signature
      // This is a mock JWT with payload: { sub: "user123", exp: 9999999999 }
      const mockJWT =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjo5OTk5OTk5OTk5fQ.signature';

      const decoded = tokenService.decodeToken(mockJWT);

      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe('user123');
      expect(decoded?.exp).toBe(9999999999);
    });

    it('geçersiz token için null döndürmeli', () => {
      const decoded = tokenService.decodeToken('invalid-token');

      expect(decoded).toBeNull();
    });

    it('null token için null döndürmeli', () => {
      const decoded = tokenService.decodeToken(null as any);

      expect(decoded).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('expired token için true döndürmeli', () => {
      // Token with exp in the past
      const expiredJWT =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxfQ.signature';

      const isExpired = tokenService.isTokenExpired(expiredJWT);

      expect(isExpired).toBe(true);
    });

    it('geçerli token için false döndürmeli', () => {
      // Token with exp far in the future
      const validJWT =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjo5OTk5OTk5OTk5fQ.signature';

      const isExpired = tokenService.isTokenExpired(validJWT);

      expect(isExpired).toBe(false);
    });

    it('null token için true döndürmeli', () => {
      const isExpired = tokenService.isTokenExpired(null as any);

      expect(isExpired).toBe(true);
    });
  });
});
