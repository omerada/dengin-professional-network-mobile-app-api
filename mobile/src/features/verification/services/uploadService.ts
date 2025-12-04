// src/features/verification/services/uploadService.ts
// Doğrulama yükleme servisi - FormData, progress tracking, retry
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

/* eslint-disable no-console */
import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  VerificationData,
  VerificationResponse,
  UploadProgress,
  CapturedImage,
  SubmitVerificationRequest,
} from '../types';
import { verificationApi } from './verificationApi';

/**
 * Yükleme ayarları
 */
const UPLOAD_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000, // ms
  timeout: 60000, // 60 saniye
};

/**
 * Yükleme servisi
 */
export const uploadService = {
  /**
   * Doğrulama belgelerini yükle
   * @deprecated Use uploadAndSubmitVerification instead for proper S3 + API flow
   */
  async uploadVerification(
    data: VerificationData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<VerificationResponse> {
    return this.uploadAndSubmitVerification(data, onProgress);
  },

  /**
   * Retry mekanizması ile yükle
   */
  async uploadWithRetry(
    data: VerificationData,
    onProgress?: (progress: UploadProgress) => void,
    retryCount = 0
  ): Promise<VerificationResponse> {
    try {
      return await this.uploadAndSubmitVerification(data, onProgress);
    } catch (error) {
      if (retryCount < UPLOAD_CONFIG.maxRetries) {
        console.log(`Upload retry attempt ${retryCount + 1}`);

        // Exponential backoff
        const delay = UPLOAD_CONFIG.retryDelay * Math.pow(2, retryCount);
        await this.sleep(delay);

        return this.uploadWithRetry(data, onProgress, retryCount + 1);
      }

      throw error;
    }
  },

  /**
   * Tek görüntüyü yükle (presigned URL ile)
   * Backend: POST /api/media/presigned-url -> PUT to S3
   */
  async uploadImage(
    image: CapturedImage,
    type: 'document' | 'selfie',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Presigned URL al from media endpoint
    const { data: presignedData } = await apiClient.post<{
      data: { url: string; key: string };
    }>(API_ENDPOINTS.MEDIA.PRESIGNED_URL, {
      type: `verification_${type}`,
      contentType: 'image/jpeg',
    });

    // S3'e yükle
    const response = await fetch(image.uri);
    const blob = await response.blob();

    await fetch(presignedData.data.url, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    if (onProgress) {
      onProgress(100);
    }

    // Return the S3 key/URL for verification submission
    return presignedData.data.key;
  },

  /**
   * Upload all verification images and submit verification
   * 1. Upload document image to S3
   * 2. Upload selfie image to S3
   * 3. Submit verification with S3 URLs
   */
  async uploadAndSubmitVerification(
    data: VerificationData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<VerificationResponse> {
    if (!data.professionId) {
      throw new Error('Profession ID is required');
    }
    if (!data.documentFront) {
      throw new Error('Document image is required');
    }
    if (!data.selfie) {
      throw new Error('Selfie image is required');
    }

    // Step 1: Upload document image
    if (onProgress) {
      onProgress({
        documentFront: 0,
        documentBack: 0,
        selfie: 0,
        total: 0,
        status: 'uploading',
      });
    }

    const documentUrl = await this.uploadImage(
      data.documentFront,
      'document',
      (progress) => {
        if (onProgress) {
          onProgress({
            documentFront: progress,
            documentBack: 0,
            selfie: 0,
            total: Math.round(progress / 2),
            status: 'uploading',
          });
        }
      }
    );

    // Step 2: Upload selfie image
    const selfieUrl = await this.uploadImage(
      data.selfie,
      'selfie',
      (progress) => {
        if (onProgress) {
          onProgress({
            documentFront: 100,
            documentBack: data.documentBack ? 0 : 100,
            selfie: progress,
            total: Math.round(50 + progress / 2),
            status: 'uploading',
          });
        }
      }
    );

    // Step 3: Submit verification
    if (onProgress) {
      onProgress({
        documentFront: 100,
        documentBack: 100,
        selfie: 100,
        total: 100,
        status: 'processing',
      });
    }

    const submitRequest: SubmitVerificationRequest = {
      professionId: data.professionId,
      documentUrl,
      selfieUrl,
    };

    const response = await verificationApi.submit(submitRequest);

    if (onProgress) {
      onProgress({
        documentFront: 100,
        documentBack: 100,
        selfie: 100,
        total: 100,
        status: 'completed',
      });
    }

    return response;
  },

  /**
   * Doğrulama durumunu poll et
   */
  async pollStatus(
    onStatusChange: (response: VerificationResponse) => void,
    maxAttempts = 30,
    intervalMs = 2000
  ): Promise<VerificationResponse | null> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await verificationApi.getLatestVerification();

      if (response) {
        onStatusChange(response);

        // Eğer işlem tamamlandıysa döndür
        if (
          response.status === 'APPROVED' ||
          response.status === 'REJECTED' ||
          response.status === 'MANUAL_REVIEW'
        ) {
          return response;
        }
      }

      attempts++;
      await this.sleep(intervalMs);
    }

    throw new Error('Doğrulama zaman aşımına uğradı');
  },

  /**
   * Yardımcı: sleep
   */
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

export default uploadService;
