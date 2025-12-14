// src/features/feed/services/mediaUploader.ts
// Media upload servisi with automatic image optimization
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import {
  imageOptimizationService,
  IMAGE_OPTIMIZATION_PRESETS,
} from '@shared/services/imageOptimizationService';
import type { LocalImage, UploadProgress } from '../types';
import type { AxiosProgressEvent } from 'axios';

/**
 * Upload yanıtı
 */
interface UploadResponse {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

/**
 * Abort controller map (iptal için)
 */
const abortControllers = new Map<string, AbortController>();

/**
 * Media Uploader Service
 */
export const mediaUploader = {
  /**
   * Tek görsel yükle (with automatic optimization)
   */
  async uploadImage(
    image: LocalImage,
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse> {
    const controller = new AbortController();
    const uploadId = `${Date.now()}-${Math.random()}`;
    abortControllers.set(uploadId, controller);

    try {
      // Step 1: Optimize image before upload (10% of progress)
      console.log('[MediaUploader] Optimizing image before upload...');
      onProgress?.(5);

      const optimizationResult = await imageOptimizationService.optimizeImage(
        image.uri,
        IMAGE_OPTIMIZATION_PRESETS.POST,
      );

      console.log('[MediaUploader] Image optimized:', {
        reduction: `${optimizationResult.reductionPercentage}%`,
        originalSize: imageOptimizationService.formatBytes(optimizationResult.originalSize),
        optimizedSize: imageOptimizationService.formatBytes(optimizationResult.optimizedSize),
        dimensions: `${optimizationResult.width}x${optimizationResult.height}`,
      });

      onProgress?.(15);

      // Step 2: Prepare form data with optimized image
      const formData = new FormData();

      formData.append('file', {
        uri: optimizationResult.uri,
        type: 'image/jpeg', // Always JPEG after optimization
        name: `image_${Date.now()}.jpg`,
      } as unknown as Blob);

      // Step 3: Upload to server (remaining 85% of progress)
      const response = await apiClient.post<{ data: UploadResponse }>(
        API_ENDPOINTS.MEDIA.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: controller.signal,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (onProgress && progressEvent.total) {
              // Map upload progress to 15-100% range
              const uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              const totalProgress = 15 + Math.round(uploadProgress * 0.85);
              onProgress(totalProgress);
            }
          },
        },
      );

      return response.data.data;
    } finally {
      abortControllers.delete(uploadId);
    }
  },

  /**
   * Çoklu görsel yükle (sequential with optimization)
   */
  async uploadImages(
    images: LocalImage[],
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<string[]> {
    const urls: string[] = [];

    console.log(`[MediaUploader] Starting batch upload of ${images.length} images`);

    for (let i = 0; i < images.length; i++) {
      const result = await this.uploadImage(images[i], progress => {
        if (onProgress) {
          onProgress({
            imageIndex: i,
            progress,
            totalImages: images.length,
          });
        }
      });
      urls.push(result.url);
    }

    console.log(`[MediaUploader] Batch upload completed: ${urls.length} images uploaded`);

    return urls;
  },

  /**
   * Çoklu görsel paralel yükle (with optimization)
   *
   * Note: Parallel upload is faster but uses more memory
   * Use sequential upload (uploadImages) for large batches
   */
  async uploadImagesParallel(
    images: LocalImage[],
    onProgress?: (completedCount: number, totalCount: number) => void,
  ): Promise<string[]> {
    let completedCount = 0;

    console.log(`[MediaUploader] Starting parallel upload of ${images.length} images`);

    const uploadPromises = images.map(async image => {
      const result = await this.uploadImage(image);
      completedCount++;
      onProgress?.(completedCount, images.length);
      return result.url;
    });

    const urls = await Promise.all(uploadPromises);

    console.log(`[MediaUploader] Parallel upload completed: ${urls.length} images uploaded`);

    return urls;
  },

  /**
   * Tüm yüklemeleri iptal et
   */
  cancelAll(): void {
    abortControllers.forEach(controller => {
      controller.abort();
    });
    abortControllers.clear();
  },

  /**
   * Dosya boyutunu formatla
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },
};

export default mediaUploader;
