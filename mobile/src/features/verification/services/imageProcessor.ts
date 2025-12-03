// src/features/verification/services/imageProcessor.ts
// Görüntü işleme servisi - sıkıştırma, doğrulama, kırpma
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import ImageResizer from 'react-native-image-resizer';
import { Image as RNImage } from 'react-native';
import RNFS from 'react-native-fs';
import type {
  CapturedImage,
  ImageValidationResult,
  ImageValidationError,
} from '../types';

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
      const result = await ImageResizer.createResizedImage(
        uri,
        IMAGE_CONFIG.maxWidth,
        IMAGE_CONFIG.maxHeight,
        IMAGE_CONFIG.format,
        IMAGE_CONFIG.quality,
        IMAGE_CONFIG.rotation,
        undefined,
        false,
        { mode: 'contain' }
      );

      return {
        uri: result.uri,
        path: result.path,
        width: result.width,
        height: result.height,
        type: 'front',
        capturedAt: new Date().toISOString(),
        fileSize: result.size,
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
      if (
        resolution.width < IMAGE_CONFIG.minWidth ||
        resolution.height < IMAGE_CONFIG.minHeight
      ) {
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
      const path = uri.replace('file://', '');
      const stat = await RNFS.stat(path);
      return stat.size;
    } catch {
      return 0;
    }
  },

  /**
   * Görüntü çözünürlüğünü getir
   */
  getResolution(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      RNImage.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        () => resolve({ width: 0, height: 0 })
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
    height: number
  ): Promise<CapturedImage> {
    try {
      const result = await ImageResizer.createResizedImage(
        uri,
        width,
        height,
        IMAGE_CONFIG.format,
        IMAGE_CONFIG.quality,
        0,
        undefined,
        false,
        {
          mode: 'cover',
          onlyScaleDown: false,
        }
      );

      return {
        uri: result.uri,
        path: result.path,
        width: result.width,
        height: result.height,
        type: 'front',
        capturedAt: new Date().toISOString(),
        fileSize: result.size,
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
      const resolution = await this.getResolution(uri);
      const result = await ImageResizer.createResizedImage(
        uri,
        resolution.width,
        resolution.height,
        IMAGE_CONFIG.format,
        IMAGE_CONFIG.quality,
        degrees,
        undefined,
        false
      );

      return {
        uri: result.uri,
        path: result.path,
        width: result.width,
        height: result.height,
        type: 'front',
        capturedAt: new Date().toISOString(),
        fileSize: result.size,
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
      const path = uri.replace('file://', '');
      return await RNFS.readFile(path, 'base64');
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
      const path = uri.replace('file://', '');
      const exists = await RNFS.exists(path);
      if (exists) {
        await RNFS.unlink(path);
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
