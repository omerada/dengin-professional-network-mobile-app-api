// src/features/verification/services/uploadService.ts
// Doğrulama yükleme servisi - FormData, progress tracking, retry
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  VerificationData,
  VerificationResponse,
  UploadProgress,
  CapturedImage,
} from '../types';

/**
 * Yükleme ayarları
 */
const UPLOAD_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000, // ms
  chunkSize: 1024 * 1024, // 1MB chunks (gelecekte chunked upload için)
  timeout: 60000, // 60 saniye
};

/**
 * Yükleme servisi
 */
export const uploadService = {
  /**
   * Doğrulama belgelerini yükle
   */
  async uploadVerification(
    data: VerificationData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<VerificationResponse> {
    const formData = new FormData();

    // Belge ön yüzünü ekle
    if (data.documentFront) {
      formData.append('documentFront', {
        uri: data.documentFront.uri,
        type: 'image/jpeg',
        name: 'document_front.jpg',
      } as unknown as Blob);
    }

    // Belge arka yüzünü ekle
    if (data.documentBack) {
      formData.append('documentBack', {
        uri: data.documentBack.uri,
        type: 'image/jpeg',
        name: 'document_back.jpg',
      } as unknown as Blob);
    }

    // Selfie'yi ekle
    if (data.selfie) {
      formData.append('selfie', {
        uri: data.selfie.uri,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as unknown as Blob);
    }

    // Meta verileri ekle
    formData.append('documentType', data.documentType);
    if (data.professionId) {
      formData.append('professionId', data.professionId);
    }

    try {
      const response = await apiClient.post<{ data: VerificationResponse }>(
        API_ENDPOINTS.VERIFICATION.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: UPLOAD_CONFIG.timeout,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              onProgress({
                documentFront: percentage,
                documentBack: percentage,
                selfie: percentage,
                total: percentage,
                status: percentage < 100 ? 'uploading' : 'processing',
              });
            }
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Upload verification error:', error);
      throw error;
    }
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
      return await this.uploadVerification(data, onProgress);
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
   */
  async uploadImage(
    image: CapturedImage,
    type: 'document_front' | 'document_back' | 'selfie',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Presigned URL al
    const { data: presignedData } = await apiClient.post<{
      data: { url: string; key: string };
    }>(API_ENDPOINTS.VERIFICATION.PRESIGNED_URL, {
      type,
      contentType: 'image/jpeg',
    });

    // S3'e yükle
    const response = await fetch(image.uri);
    const blob = await response.blob();

    await fetch(presignedData.url, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    if (onProgress) {
      onProgress(100);
    }

    return presignedData.key;
  },

  /**
   * Doğrulama durumunu sorgula
   */
  async checkStatus(verificationId: string): Promise<VerificationResponse> {
    const response = await apiClient.get<{ data: VerificationResponse }>(
      `${API_ENDPOINTS.VERIFICATION.STATUS}/${verificationId}`
    );

    return response.data.data;
  },

  /**
   * Doğrulama durumunu poll et
   */
  async pollStatus(
    verificationId: string,
    onStatusChange: (response: VerificationResponse) => void,
    maxAttempts = 30,
    intervalMs = 2000
  ): Promise<VerificationResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await this.checkStatus(verificationId);

      onStatusChange(response);

      // Eğer işlem tamamlandıysa döndür
      if (
        response.status === 'APPROVED' ||
        response.status === 'REJECTED' ||
        response.status === 'MANUAL_REVIEW'
      ) {
        return response;
      }

      attempts++;
      await this.sleep(intervalMs);
    }

    throw new Error('Doğrulama zaman aşımına uğradı');
  },

  /**
   * Yüklemeyi iptal et
   */
  async cancelUpload(verificationId: string): Promise<void> {
    await apiClient.delete(
      `${API_ENDPOINTS.VERIFICATION.CANCEL}/${verificationId}`
    );
  },

  /**
   * Yardımcı: sleep
   */
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

export default uploadService;
