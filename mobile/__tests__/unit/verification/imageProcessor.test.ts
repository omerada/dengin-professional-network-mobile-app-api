// __tests__/unit/verification/imageProcessor.test.ts
// Image processor testleri

import { imageProcessor } from '../../../src/features/verification/services/imageProcessor';

// expo-image-manipulator mock
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: 'file:///resized/image.jpg',
    width: 1920,
    height: 1080,
  }),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

// expo-file-system mock
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn().mockResolvedValue({
    exists: true,
    size: 1024000,
    isDirectory: false,
  }),
  readAsStringAsync: jest.fn().mockResolvedValue('base64-encoded-data'),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: {
    Base64: 'base64',
    UTF8: 'utf8',
  },
}));

// react-native mock
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Image: {
    getSize: jest.fn((uri, success) => success(1920, 1080)),
  },
}));

describe('Image Processor', () => {
  describe('validate', () => {
    it('should validate a correct image', async () => {
      const result = await imageProcessor.validate('file:///test/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect file too large', async () => {
      const FileSystem = require('expo-file-system');
      FileSystem.getInfoAsync.mockResolvedValueOnce({
        exists: true,
        size: 20 * 1024 * 1024, // 20MB
        isDirectory: false,
      });

      const result = await imageProcessor.validate('file:///test/large.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TOO_LARGE');
    });

    it('should detect resolution too small', async () => {
      const { Image } = require('react-native');
      Image.getSize.mockImplementationOnce((uri: string, success: Function) => success(320, 240));

      const result = await imageProcessor.validate('file:///test/small.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('TOO_SMALL');
    });
  });

  describe('compress', () => {
    it('should compress image with default options', async () => {
      const result = await imageProcessor.compress('file:///test/image.jpg');

      expect(result).toBeDefined();
      expect(result.uri).toContain('resized');
    });

    it('should return CapturedImage format', async () => {
      const result = await imageProcessor.compress('file:///test/image.jpg');

      expect(result.uri).toBeDefined();
      expect(result.path).toBeDefined();
      expect(result.width).toBeDefined();
      expect(result.height).toBeDefined();
      expect(result.type).toBe('front');
      expect(result.capturedAt).toBeDefined();
    });
  });

  describe('getResolution', () => {
    it('should get image resolution', async () => {
      const resolution = await imageProcessor.getResolution('file:///test/image.jpg');

      expect(resolution).toBeDefined();
      expect(resolution.width).toBe(1920);
      expect(resolution.height).toBe(1080);
    });
  });

  describe('getFileSize', () => {
    it('should get file size', async () => {
      const size = await imageProcessor.getFileSize('file:///test/image.jpg');

      expect(size).toBe(1024000);
    });
  });

  describe('toBase64', () => {
    it('should convert image to base64', async () => {
      const result = await imageProcessor.toBase64('file:///test/image.jpg');

      expect(result).toBe('base64-encoded-data');
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error messages', () => {
      expect(imageProcessor.getErrorMessage('TOO_LARGE')).toBe('Dosya boyutu çok büyük.');

      expect(imageProcessor.getErrorMessage('WRONG_FORMAT')).toBe('Desteklenmeyen dosya formatı.');

      expect(imageProcessor.getErrorMessage('TOO_SMALL')).toBe('Görüntü çözünürlüğü çok düşük.');

      expect(imageProcessor.getErrorMessage('BLURRY')).toBe(
        'Görüntü bulanık. Kamerayı sabit tutun ve odaklanmasını bekleyin.',
      );
    });
  });
});
