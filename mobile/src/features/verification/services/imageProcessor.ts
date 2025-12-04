// src/features/verification/services/imageProcessor.ts
// Görüntü işleme servisi - sıkıştırma, doğrulama, kırpma
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image as RNImage } from 'react-native';
import type { CapturedImage, ImageValidationResult, ImageValidationError } from '../types';

/**
 * Görüntü işleme ayarları
 */
const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
  format: 'JPEG' as const,
  rotation: 0,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  minWidth: 640,
  minHeight: 480,
  minBrightness: 30,
  maxBrightness: 95,
  minSharpness: 40,
};

/**
 * Görüntü işleme servisi
 */
export const imageProcessor = {
  /**
   * Görüntüyü sıkıştır ve yeniden boyutlandır
   */
  async compress(uri: string): Promise<CapturedImage> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: IMAGE_CONFIG.maxWidth, height: IMAGE_CONFIG.maxHeight } }],
        { compress: IMAGE_CONFIG.quality / 100, format: ImageManipulator.SaveFormat.JPEG },
      );

      const fileInfo = await FileSystem.getInfoAsync(result.uri);

      return {
        uri: result.uri,
        path: result.uri.replace('file://', ''),
        width: result.width,
        height: result.height,
        type: 'front',
        capturedAt: new Date().toISOString(),
        fileSize: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      };
    } catch (error) {
      console.error('Image compression error:', error);
      throw new Error('Görüntü sıkıştırılamadı');
    }
  },

  /**
   * Görüntüyü doğrula
   */
  async validate(uri: string): Promise<ImageValidationResult> {
    const errors: ImageValidationError[] = [];

    try {
      // Dosya boyutunu kontrol et
      const fileSize = await this.getFileSize(uri);
      if (fileSize > IMAGE_CONFIG.maxFileSize) {
        errors.push('TOO_LARGE');
      }

      // Çözünürlüğü kontrol et
      const resolution = await this.getResolution(uri);
      if (resolution.width < IMAGE_CONFIG.minWidth || resolution.height < IMAGE_CONFIG.minHeight) {
        errors.push('TOO_SMALL');
      }

      // Parlaklığı kontrol et (simüle edilmiş)
      const brightness = await this.estimateBrightness(uri);
      if (brightness < IMAGE_CONFIG.minBrightness) {
        errors.push('TOO_DARK');
      }
      if (brightness > IMAGE_CONFIG.maxBrightness) {
        errors.push('TOO_BRIGHT');
      }

      // Netliği kontrol et (simüle edilmiş)
      const sharpness = await this.estimateSharpness(uri);
      if (sharpness < IMAGE_CONFIG.minSharpness) {
        errors.push('BLURRY');
      }

      return {
        isValid: errors.length === 0,
        brightness,
        sharpness,
        fileSize,
        resolution,
        errors,
      };
    } catch (error) {
      console.error('Image validation error:', error);
      return {
        isValid: false,
        brightness: 0,
        sharpness: 0,
        fileSize: 0,
        resolution: { width: 0, height: 0 },
        errors: ['WRONG_FORMAT'],
      };
    }
  },

  /**
   * Dosya boyutunu getir
   */
  async getFileSize(uri: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
    } catch {
      return 0;
    }
  },

  /**
   * Görüntü çözünürlüğünü getir
   */
  getResolution(uri: string): Promise<{ width: number; height: number }> {
    return new Promise(resolve => {
      RNImage.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        () => resolve({ width: 0, height: 0 }),
      );
    });
  },

  /**
   * Parlaklığı tahmin et (0-100)
   * Not: Gerçek implementasyonda native modül kullanılmalı
   */
  async estimateBrightness(_uri: string): Promise<number> {
    // Simüle edilmiş değer - gerçek implementasyonda
    // görüntü piksellerinin ortalama değeri hesaplanır
    return Math.floor(Math.random() * 30) + 50; // 50-80 arası
  },

  /**
   * Netliği tahmin et (0-100)
   * Not: Gerçek implementasyonda Laplacian variance kullanılmalı
   */
  async estimateSharpness(_uri: string): Promise<number> {
    // Simüle edilmiş değer - gerçek implementasyonda
    // Laplacian variance hesaplanır
    return Math.floor(Math.random() * 30) + 50; // 50-80 arası
  },

  /**
   * Görüntüyü kırp
   */
  async crop(
    uri: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<CapturedImage> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX: x, originY: y, width, height } }],
        { compress: IMAGE_CONFIG.quality / 100, format: ImageManipulator.SaveFormat.JPEG },
      );

      const fileInfo = await FileSystem.getInfoAsync(result.uri);

      return {
        uri: result.uri,
        path: result.uri.replace('file://', ''),
        width: result.width,
        height: result.height,
        type: 'front',
        capturedAt: new Date().toISOString(),
        fileSize: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      };
    } catch (error) {
      console.error('Image crop error:', error);
      throw new Error('Görüntü kırpılamadı');
    }
  },

  /**
   * Görüntüyü döndür
   */
  async rotate(uri: string, degrees: number): Promise<CapturedImage> {
    try {
      const result = await ImageManipulator.manipulateAsync(uri, [{ rotate: degrees }], {
        compress: IMAGE_CONFIG.quality / 100,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const fileInfo = await FileSystem.getInfoAsync(result.uri);

      return {
        uri: result.uri,
        path: result.uri.replace('file://', ''),
        width: result.width,
        height: result.height,
        type: 'front',
        capturedAt: new Date().toISOString(),
        fileSize: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      };
    } catch (error) {
      console.error('Image rotation error:', error);
      throw new Error('Görüntü döndürülemedi');
    }
  },

  /**
   * Base64'e dönüştür
   */
  async toBase64(uri: string): Promise<string> {
    try {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (error) {
      console.error('Base64 conversion error:', error);
      throw new Error('Görüntü dönüştürülemedi');
    }
  },

  /**
   * Geçici dosyayı sil
   */
  async deleteTemp(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Delete temp file error:', error);
    }
  },

  /**
   * Doğrulama hatasını kullanıcı mesajına dönüştür
   */
  getErrorMessage(error: ImageValidationError): string {
    const messages: Record<ImageValidationError, string> = {
      TOO_DARK: 'Görüntü çok karanlık. Daha iyi ışıklandırma ile tekrar deneyin.',
      TOO_BRIGHT: 'Görüntü çok parlak. Işık kaynağından uzaklaşın.',
      BLURRY: 'Görüntü bulanık. Kamerayı sabit tutun ve odaklanmasını bekleyin.',
      TOO_SMALL: 'Görüntü çözünürlüğü çok düşük.',
      TOO_LARGE: 'Dosya boyutu çok büyük.',
      WRONG_FORMAT: 'Desteklenmeyen dosya formatı.',
      NO_FACE_DETECTED: 'Yüz tespit edilemedi.',
      MULTIPLE_FACES: 'Birden fazla yüz tespit edildi.',
    };

    return messages[error] || 'Görüntü doğrulanamadı.';
  },
};

export default imageProcessor;
