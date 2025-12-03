// __tests__/unit/verification/imageProcessor.test.ts
// Image processor testleri

import { imageProcessor, ImageValidationError } from '../../../src/features/verification/services/imageProcessor';

// react-native-image-resizer mock
jest.mock('react-native-image-resizer', () => ({
  createResizedImage: jest.fn().mockResolvedValue({
    uri: 'file:///resized/image.jpg',
    width: 1920,
    height: 1080,
    path: '/resized/image.jpg',
    size: 500000,
  }),
}));

// react-native mock
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Image: {
    getSize: jest.fn((uri, success) => success(1920, 1080)),
  },
}));

// RNFS mock
jest.mock('react-native-fs', () => ({
  stat: jest.fn().mockResolvedValue({
    size: 1024000,
    isFile: () => true,
    mtime: new Date(),
  }),
}));

describe('Image Processor', () => {
  describe('validate', () => {
    it('should validate a correct image', async () => {
      const result = await imageProcessor.validate('file:///test/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect file too large', async () => {
      const RNFS = require('react-native-fs');
      RNFS.stat.mockResolvedValueOnce({
        size: 20 * 1024 * 1024, // 20MB
        isFile: () => true,
      });

      const result = await imageProcessor.validate('file:///test/large.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(ImageValidationError.FILE_TOO_LARGE);
    });

    it('should detect invalid format', async () => {
      const result = await imageProcessor.validate('file:///test/image.gif');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(ImageValidationError.INVALID_FORMAT);
    });
  });

  describe('compress', () => {
    it('should compress image with default options', async () => {
      const result = await imageProcessor.compress('file:///test/image.jpg');

      expect(result).toBeDefined();
      expect(result.uri).toContain('resized');
    });

    it('should compress image with custom options', async () => {
      const ImageResizer = require('react-native-image-resizer');

      await imageProcessor.compress('file:///test/image.jpg', {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 70,
      });

      expect(ImageResizer.createResizedImage).toHaveBeenCalledWith(
        'file:///test/image.jpg',
        1280,
        720,
        'JPEG',
        70,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );
    });
  });

  describe('getMetadata', () => {
    it('should get image metadata', async () => {
      const metadata = await imageProcessor.getMetadata('file:///test/image.jpg');

      expect(metadata).toBeDefined();
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
      expect(metadata.fileSize).toBe(1024000);
    });
  });

  describe('processForUpload', () => {
    it('should validate, compress and return processed image', async () => {
      const result = await imageProcessor.processForUpload('file:///test/image.jpg');

      expect(result.uri).toContain('resized');
      expect(result.width).toBeDefined();
      expect(result.height).toBeDefined();
    });

    it('should throw on invalid image', async () => {
      const RNFS = require('react-native-fs');
      RNFS.stat.mockResolvedValueOnce({
        size: 20 * 1024 * 1024, // 20MB
        isFile: () => true,
      });

      await expect(imageProcessor.processForUpload('file:///test/large.jpg'))
        .rejects.toThrow('Dosya boyutu çok büyük');
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error messages', () => {
      expect(imageProcessor.getErrorMessage(ImageValidationError.FILE_TOO_LARGE))
        .toBe('Dosya boyutu çok büyük (max 10MB)');

      expect(imageProcessor.getErrorMessage(ImageValidationError.INVALID_FORMAT))
        .toBe('Geçersiz dosya formatı (JPG, PNG kabul edilir)');

      expect(imageProcessor.getErrorMessage(ImageValidationError.DIMENSIONS_TOO_SMALL))
        .toBe('Görüntü çözünürlüğü çok düşük (min 640x480)');

      expect(imageProcessor.getErrorMessage(ImageValidationError.CORRUPTED))
        .toBe('Görüntü dosyası bozuk veya okunamıyor');
    });
  });
});
