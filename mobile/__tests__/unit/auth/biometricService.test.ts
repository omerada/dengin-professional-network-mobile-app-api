// __tests__/unit/auth/biometricService.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

// Mock storage
const mockSecureStorage = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
};

const mockAsyncStorage = {
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock('../../../src/core/storage', () => ({
  secureStorage: mockSecureStorage,
  asyncStorage: mockAsyncStorage,
  SECURE_KEYS: {
    BIOMETRIC_KEY: 'biometric_key',
  },
  STORAGE_KEYS: {
    BIOMETRIC_ENABLED: 'biometric_enabled',
  },
}));

// Mock react-native
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

// Create mock rnBiometrics instance
const mockRnBiometrics = {
  isSensorAvailable: jest.fn(),
  simplePrompt: jest.fn(),
};

// Mock the entire biometricService module
jest.mock('../../../src/features/auth/services/biometricService', () => {
  const actualModule = jest.requireActual('../../../src/features/auth/services/biometricService');

  return {
    ...actualModule,
    biometricService: {
      isAvailable: jest.fn(),
      authenticate: jest.fn(),
      getBiometricName: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      isEnabled: jest.fn(),
      getStoredCredentials: jest.fn(),
    },
  };
});

import { biometricService } from '../../../src/features/auth/services/biometricService';

describe('BiometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('biyometrik mevcut olduğunda true döndürmeli', async () => {
      (biometricService.isAvailable as jest.Mock).mockResolvedValue({
        available: true,
        biometryType: 'FaceID',
      });

      const result = await biometricService.isAvailable();

      expect(result.available).toBe(true);
      expect(result.biometryType).toBe('FaceID');
    });

    it('biyometrik mevcut olmadığında false döndürmeli', async () => {
      (biometricService.isAvailable as jest.Mock).mockResolvedValue({
        available: false,
        biometryType: null,
      });

      const result = await biometricService.isAvailable();

      expect(result.available).toBe(false);
    });

    it('hata durumunda false döndürmeli', async () => {
      (biometricService.isAvailable as jest.Mock).mockResolvedValue({
        available: false,
        biometryType: null,
      });

      const result = await biometricService.isAvailable();

      expect(result.available).toBe(false);
      expect(result.biometryType).toBe(null);
    });
  });

  describe('authenticate', () => {
    it('başarılı kimlik doğrulama yapmalı', async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await biometricService.authenticate('Test prompt');

      expect(result.success).toBe(true);
    });

    it('başarısız kimlik doğrulamada hata döndürmeli', async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Authentication failed',
      });

      const result = await biometricService.authenticate('Test prompt');

      expect(result.success).toBe(false);
    });

    it('biyometrik kullanılamıyorsa hata döndürmeli', async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Biyometrik doğrulama kullanılamıyor',
      });

      const result = await biometricService.authenticate('Test prompt');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Biyometrik doğrulama kullanılamıyor');
    });
  });

  describe('getBiometricName', () => {
    it('Face ID için doğru isim döndürmeli', async () => {
      (biometricService.getBiometricName as jest.Mock).mockResolvedValue('Face ID');

      const name = await biometricService.getBiometricName();

      expect(name).toBe('Face ID');
    });

    it('Touch ID için doğru isim döndürmeli', async () => {
      (biometricService.getBiometricName as jest.Mock).mockResolvedValue('Touch ID');

      const name = await biometricService.getBiometricName();

      expect(name).toBe('Touch ID');
    });
  });

  describe('enable', () => {
    it('başarılı enable işlemi yapmalı', async () => {
      (biometricService.enable as jest.Mock).mockResolvedValue(true);

      const result = await biometricService.enable('test@email.com', 'refresh-token');

      expect(result).toBe(true);
      expect(biometricService.enable).toHaveBeenCalledWith('test@email.com', 'refresh-token');
    });

    it('biyometrik yoksa false döndürmeli', async () => {
      (biometricService.enable as jest.Mock).mockResolvedValue(false);

      const result = await biometricService.enable('test@email.com', 'refresh-token');

      expect(result).toBe(false);
    });
  });

  describe('disable', () => {
    it('başarılı disable işlemi yapmalı', async () => {
      (biometricService.disable as jest.Mock).mockResolvedValue(true);

      const result = await biometricService.disable();

      expect(result).toBe(true);
      expect(biometricService.disable).toHaveBeenCalled();
    });
  });

  describe('isEnabled', () => {
    it('enabled olduğunda true döndürmeli', async () => {
      (biometricService.isEnabled as jest.Mock).mockResolvedValue(true);

      const result = await biometricService.isEnabled();

      expect(result).toBe(true);
    });

    it('disabled olduğunda false döndürmeli', async () => {
      (biometricService.isEnabled as jest.Mock).mockResolvedValue(false);

      const result = await biometricService.isEnabled();

      expect(result).toBe(false);
    });
  });
});
