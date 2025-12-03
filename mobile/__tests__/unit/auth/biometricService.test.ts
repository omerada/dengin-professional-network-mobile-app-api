// __tests__/unit/auth/biometricService.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { biometricService } from '../../../src/features/auth/services/biometricService';
import ReactNativeBiometrics from 'react-native-biometrics';

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => {
  return jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn(),
    simplePrompt: jest.fn(),
    createKeys: jest.fn(),
    biometricKeysExist: jest.fn(),
    deleteKeys: jest.fn(),
    createSignature: jest.fn(),
  }));
});

describe('BiometricService', () => {
  let mockBiometrics: jest.Mocked<InstanceType<typeof ReactNativeBiometrics>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBiometrics = new ReactNativeBiometrics() as jest.Mocked<
      InstanceType<typeof ReactNativeBiometrics>
    >;
  });

  describe('isAvailable', () => {
    it('biyometrik mevcut olduğunda true döndürmeli', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: 'FaceID',
      });

      const result = await biometricService.isAvailable();

      expect(result.available).toBe(true);
      expect(result.biometryType).toBe('FaceID');
    });

    it('biyometrik mevcut olmadığında false döndürmeli', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: false,
        error: 'Biometrics not available',
      });

      const result = await biometricService.isAvailable();

      expect(result.available).toBe(false);
    });
  });

  describe('authenticate', () => {
    it('başarılı kimlik doğrulama yapmalı', async () => {
      mockBiometrics.simplePrompt.mockResolvedValue({
        success: true,
      });

      const result = await biometricService.authenticate('Test prompt');

      expect(result.success).toBe(true);
    });

    it('başarısız kimlik doğrulamada hata döndürmeli', async () => {
      mockBiometrics.simplePrompt.mockResolvedValue({
        success: false,
        error: 'Authentication failed',
      });

      const result = await biometricService.authenticate('Test prompt');

      expect(result.success).toBe(false);
    });

    it('kullanıcı iptal ettiğinde başarısız olmalı', async () => {
      mockBiometrics.simplePrompt.mockResolvedValue({
        success: false,
        error: 'User cancelled',
      });

      const result = await biometricService.authenticate('Test prompt');

      expect(result.success).toBe(false);
    });
  });

  describe('hasKeys', () => {
    it('anahtarlar varsa true döndürmeli', async () => {
      mockBiometrics.biometricKeysExist.mockResolvedValue({
        keysExist: true,
      });

      const result = await biometricService.hasKeys();

      expect(result).toBe(true);
    });

    it('anahtarlar yoksa false döndürmeli', async () => {
      mockBiometrics.biometricKeysExist.mockResolvedValue({
        keysExist: false,
      });

      const result = await biometricService.hasKeys();

      expect(result).toBe(false);
    });
  });

  describe('createKeys', () => {
    it('başarılı anahtar oluşturmalı', async () => {
      mockBiometrics.createKeys.mockResolvedValue({
        publicKey: 'public-key-123',
      });

      const publicKey = await biometricService.createKeys();

      expect(publicKey).toBe('public-key-123');
    });
  });

  describe('deleteKeys', () => {
    it('anahtarları silmeli', async () => {
      mockBiometrics.deleteKeys.mockResolvedValue({
        keysDeleted: true,
      });

      const result = await biometricService.deleteKeys();

      expect(result).toBe(true);
    });
  });

  describe('createSignature', () => {
    it('başarılı imza oluşturmalı', async () => {
      mockBiometrics.createSignature.mockResolvedValue({
        success: true,
        signature: 'signature-abc123',
      });

      const result = await biometricService.createSignature('payload', 'prompt');

      expect(result.success).toBe(true);
      expect(result.signature).toBe('signature-abc123');
    });

    it('imza başarısız olduğunda hata döndürmeli', async () => {
      mockBiometrics.createSignature.mockResolvedValue({
        success: false,
        error: 'Signature creation failed',
      });

      const result = await biometricService.createSignature('payload', 'prompt');

      expect(result.success).toBe(false);
    });
  });
});
