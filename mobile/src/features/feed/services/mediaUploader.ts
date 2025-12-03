// src/features/feed/services/mediaUploader.ts
// Media upload servisi
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
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
   * Tek görsel yükle
   */
  async uploadImage(
    image: LocalImage,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    
    formData.append('file', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: `image_${Date.now()}.jpg`,
    } as unknown as Blob);

    const controller = new AbortController();
    const uploadId = `${Date.now()}-${Math.random()}`;
    abortControllers.set(uploadId, controller);

    try {
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
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }
      );

      return response.data.data;
    } finally {
      abortControllers.delete(uploadId);
    }
  },

  /**
   * Çoklu görsel yükle
   */
  async uploadImages(
    images: LocalImage[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string[]> {
    const urls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const result = await this.uploadImage(images[i], (progress) => {
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

    return urls;
  },

  /**
   * Çoklu görsel paralel yükle
   */
  async uploadImagesParallel(
    images: LocalImage[],
    onProgress?: (completedCount: number, totalCount: number) => void
  ): Promise<string[]> {
    let completedCount = 0;

    const uploadPromises = images.map(async (image) => {
      const result = await this.uploadImage(image);
      completedCount++;
      onProgress?.(completedCount, images.length);
      return result.url;
    });

    return Promise.all(uploadPromises);
  },

  /**
   * Tüm yüklemeleri iptal et
   */
  cancelAll(): void {
    abortControllers.forEach((controller) => {
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
