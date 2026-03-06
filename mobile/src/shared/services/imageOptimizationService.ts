// src/shared/services/imageOptimizationService.ts
// Generic image optimization service for S3 upload efficiency
// Reduces storage costs and improves upload performance
// Production-ready with quality/size balance

import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

/**
 * Image optimization configuration
 */
interface ImageOptimizationConfig {
  /**
   * Max width in pixels (maintains aspect ratio)
   * @default 1920
   */
  maxWidth?: number;

  /**
   * Max height in pixels (maintains aspect ratio)
   * @default 1920
   */
  maxHeight?: number;

  /**
   * JPEG compression quality (0-1)
   * @default 0.85
   */
  quality?: number;

  /**
   * Output format
   * @default 'jpeg'
   */
  format?: 'jpeg' | 'png' | 'webp';

  /**
   * Whether to maintain EXIF data
   * @default false (removes EXIF for privacy and size reduction)
   */
  preserveExif?: boolean;
}

/**
 * Preset configurations for different use cases
 */
export const IMAGE_OPTIMIZATION_PRESETS = {
  /**
   * Avatar/Profile Photos
   * - Small file size priority
   * - Square crop friendly
   * - Max 800px (sufficient for 2x retina displays)
   */
  AVATAR: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
    format: 'jpeg' as const,
    preserveExif: false,
  },

  /**
   * Post Images (Feed)
   * - Balanced quality/size
   * - Full HD support for modern displays
   * - Max 1920px (optimal for mobile/web viewing)
   */
  POST: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    format: 'jpeg' as const,
    preserveExif: false,
  },

  /**
   * High Quality (Verification, Documents)
   * - Quality priority
   * - Minimal compression
   * - Max 2560px
   */
  HIGH_QUALITY: {
    maxWidth: 2560,
    maxHeight: 2560,
    quality: 0.92,
    format: 'jpeg' as const,
    preserveExif: false,
  },

  /**
   * Thumbnail
   * - Maximum compression
   * - Small dimensions
   * - Fast loading
   */
  THUMBNAIL: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.75,
    format: 'jpeg' as const,
    preserveExif: false,
  },
} as const;

/**
 * Optimization result
 */
export interface OptimizationResult {
  /**
   * Optimized image URI
   */
  uri: string;

  /**
   * Optimized image width
   */
  width: number;

  /**
   * Optimized image height
   */
  height: number;

  /**
   * Original file size (bytes)
   */
  originalSize: number;

  /**
   * Optimized file size (bytes)
   */
  optimizedSize: number;

  /**
   * Compression ratio (0-1)
   */
  compressionRatio: number;

  /**
   * Size reduction percentage
   */
  reductionPercentage: number;
}

/**
 * Image Optimization Service
 *
 * Benefits:
 * - Reduces S3 storage costs (30-70% file size reduction)
 * - Faster uploads (smaller files)
 * - Bandwidth savings
 * - Better user experience (faster image loading)
 * - Privacy protection (removes EXIF data including GPS)
 *
 * @example
 * ```typescript
 * // Avatar optimization
 * const result = await imageOptimizationService.optimizeImage(
 *   imageUri,
 *   IMAGE_OPTIMIZATION_PRESETS.AVATAR
 * );
 *
 * // Post image optimization
 * const result = await imageOptimizationService.optimizeImage(
 *   imageUri,
 *   IMAGE_OPTIMIZATION_PRESETS.POST
 * );
 *
 * // Custom configuration
 * const result = await imageOptimizationService.optimizeImage(
 *   imageUri,
 *   { maxWidth: 1024, quality: 0.8 }
 * );
 * ```
 */
export const imageOptimizationService = {
  /**
   * Optimize a single image
   *
   * @param imageUri Local image URI (file://, content://, etc.)
   * @param config Optimization configuration or preset
   * @returns Optimization result with new URI and statistics
   */
  async optimizeImage(
    imageUri: string,
    config: ImageOptimizationConfig = IMAGE_OPTIMIZATION_PRESETS.POST,
  ): Promise<OptimizationResult> {
    try {
      const startTime = Date.now();

      // Get original file size
      const originalSize = await this.getFileSize(imageUri);

      // Load image info for dimensions
      const imageInfo = await this.getImageInfo(imageUri);

      console.log('[ImageOptimization] Starting optimization:', {
        uri: imageUri.substring(0, 50) + '...',
        originalSize: this.formatBytes(originalSize),
        originalDimensions: `${imageInfo.width}x${imageInfo.height}`,
        config,
      });

      // Calculate target dimensions (maintain aspect ratio)
      const targetDimensions = this.calculateTargetDimensions(
        imageInfo.width,
        imageInfo.height,
        config.maxWidth || 1920,
        config.maxHeight || 1920,
      );

      // Prepare manipulation actions
      const actions: ImageManipulator.Action[] = [];

      // Resize if needed
      if (
        targetDimensions.width !== imageInfo.width ||
        targetDimensions.height !== imageInfo.height
      ) {
        actions.push({
          resize: {
            width: targetDimensions.width,
            height: targetDimensions.height,
          },
        });
      }

      // Manipulate image
      const manipulatedImage = await ImageManipulator.manipulateAsync(imageUri, actions, {
        compress: config.quality || 0.85,
        format:
          config.format === 'png'
            ? ImageManipulator.SaveFormat.PNG
            : config.format === 'webp'
              ? ImageManipulator.SaveFormat.WEBP
              : ImageManipulator.SaveFormat.JPEG,
        base64: false,
      });

      // Get optimized file size
      const optimizedSize = await this.getFileSize(manipulatedImage.uri);

      const compressionRatio = optimizedSize / originalSize;
      const reductionPercentage = Math.round((1 - compressionRatio) * 100);

      const result: OptimizationResult = {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        originalSize,
        optimizedSize,
        compressionRatio,
        reductionPercentage,
      };

      const duration = Date.now() - startTime;

      console.log('[ImageOptimization] Optimization completed:', {
        duration: `${duration}ms`,
        originalSize: this.formatBytes(originalSize),
        optimizedSize: this.formatBytes(optimizedSize),
        reduction: `${reductionPercentage}%`,
        dimensions: `${manipulatedImage.width}x${manipulatedImage.height}`,
      });

      return result;
    } catch (error) {
      console.error('[ImageOptimization] Optimization failed:', error);
      throw new Error('Görsel optimize edilemedi. Lütfen tekrar deneyin.');
    }
  },

  /**
   * Optimize multiple images
   *
   * @param imageUris Array of local image URIs
   * @param config Optimization configuration
   * @param onProgress Progress callback (current, total)
   * @returns Array of optimization results
   */
  async optimizeImages(
    imageUris: string[],
    config: ImageOptimizationConfig = IMAGE_OPTIMIZATION_PRESETS.POST,
    onProgress?: (current: number, total: number) => void,
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (let i = 0; i < imageUris.length; i++) {
      const result = await this.optimizeImage(imageUris[i], config);
      results.push(result);
      onProgress?.(i + 1, imageUris.length);
    }

    // Log summary
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimizedSize = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const averageReduction = Math.round((1 - totalOptimizedSize / totalOriginalSize) * 100);

    console.log('[ImageOptimization] Batch optimization summary:', {
      count: imageUris.length,
      totalOriginalSize: this.formatBytes(totalOriginalSize),
      totalOptimizedSize: this.formatBytes(totalOptimizedSize),
      averageReduction: `${averageReduction}%`,
    });

    return results;
  },

  /**
   * Check if optimization is needed
   *
   * @param imageUri Image URI
   * @param config Optimization configuration
   * @returns True if optimization would reduce file size significantly
   */
  async shouldOptimize(
    imageUri: string,
    config: ImageOptimizationConfig = IMAGE_OPTIMIZATION_PRESETS.POST,
  ): Promise<boolean> {
    try {
      const info = await this.getImageInfo(imageUri);
      const fileSize = await this.getFileSize(imageUri);

      // Optimize if dimensions exceed limits
      if (info.width > (config.maxWidth || 1920) || info.height > (config.maxHeight || 1920)) {
        return true;
      }

      // Optimize if file size is large (>2MB)
      if (fileSize > 2 * 1024 * 1024) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('[ImageOptimization] shouldOptimize check failed:', error);
      return true; // Optimize on error (safer)
    }
  },

  /**
   * Calculate target dimensions maintaining aspect ratio
   */
  calculateTargetDimensions(
    currentWidth: number,
    currentHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    // Already within limits
    if (currentWidth <= maxWidth && currentHeight <= maxHeight) {
      return { width: currentWidth, height: currentHeight };
    }

    const aspectRatio = currentWidth / currentHeight;

    let targetWidth = currentWidth;
    let targetHeight = currentHeight;

    // Scale down by width
    if (currentWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = Math.round(maxWidth / aspectRatio);
    }

    // Scale down by height if still too tall
    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = Math.round(maxHeight * aspectRatio);
    }

    return {
      width: targetWidth,
      height: targetHeight,
    };
  },

  /**
   * Get image info (dimensions)
   */
  async getImageInfo(uri: string): Promise<{ width: number; height: number }> {
    try {
      // Use ImageManipulator to get image info without loading full image
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return {
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('[ImageOptimization] Failed to get image info:', error);
      throw new Error('Görsel bilgileri alınamadı');
    }
  },

  /**
   * Get file size in bytes
   */
  async getFileSize(uri: string): Promise<number> {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // For React Native, use fetch to get blob size
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob.size;
      }

      // Fallback (web or other platforms)
      return 0;
    } catch (error) {
      console.error('[ImageOptimization] Failed to get file size:', error);
      return 0;
    }
  },

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },

  /**
   * Get optimization preset by name
   */
  getPreset(presetName: keyof typeof IMAGE_OPTIMIZATION_PRESETS): ImageOptimizationConfig {
    return IMAGE_OPTIMIZATION_PRESETS[presetName];
  },
};

export default imageOptimizationService;
