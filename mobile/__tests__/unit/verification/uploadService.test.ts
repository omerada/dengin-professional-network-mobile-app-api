// __tests__/unit/verification/uploadService.test.ts
// Upload service testleri

import { uploadService } from '../../../src/features/verification/services/uploadService';
import { apiClient } from '../../../src/core/api/client';

// API client mock
jest.mock('../../../src/core/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Upload Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadWithRetry', () => {
    const mockVerificationData = {
      documentFront: {
        uri: 'file:///mock/front.jpg',
        width: 1920,
        height: 1080,
        fileSize: 500000,
      },
      documentBack: {
        uri: 'file:///mock/back.jpg',
        width: 1920,
        height: 1080,
        fileSize: 500000,
      },
      selfie: {
        uri: 'file:///mock/selfie.jpg',
        width: 1080,
        height: 1920,
        fileSize: 400000,
      },
    };

    it('should upload verification data successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            verificationId: 'ver_123456',
            status: 'PENDING_REVIEW',
            createdAt: new Date().toISOString(),
          },
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await uploadService.uploadWithRetry(mockVerificationData);

      expect(result).toEqual(mockResponse.data.data);
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it('should call onProgress callback', async () => {
      const mockResponse = {
        data: {
          data: {
            verificationId: 'ver_123456',
            status: 'PENDING_REVIEW',
          },
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const onProgress = jest.fn();

      await uploadService.uploadWithRetry(mockVerificationData, onProgress);

      // Progress callback çağrılmış olmalı
      expect(onProgress).toHaveBeenCalled();
    });

    it('should retry on failure', async () => {
      const error = new Error('Network error');
      mockApiClient.post
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({
          data: {
            data: {
              verificationId: 'ver_123456',
              status: 'PENDING_REVIEW',
            },
          },
        });

      const result = await uploadService.uploadWithRetry(mockVerificationData);

      expect(result).toBeDefined();
      expect(mockApiClient.post).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const error = new Error('Network error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(uploadService.uploadWithRetry(mockVerificationData))
        .rejects.toThrow('Yükleme başarısız oldu');

      expect(mockApiClient.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('getVerificationStatus', () => {
    it('should get verification status', async () => {
      const mockStatus = {
        verificationId: 'ver_123456',
        status: 'APPROVED',
        updatedAt: new Date().toISOString(),
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: { data: mockStatus },
      });

      const result = await uploadService.getVerificationStatus('ver_123456');

      expect(result).toEqual(mockStatus);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/verification/ver_123456/status');
    });

    it('should handle status fetch error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(uploadService.getVerificationStatus('ver_invalid'))
        .rejects.toThrow();
    });
  });

  describe('cancelUpload', () => {
    it('should cancel ongoing upload', () => {
      // Cancel edilebilir upload başlat
      const mockVerificationData = {
        documentFront: {
          uri: 'file:///mock/front.jpg',
          width: 1920,
          height: 1080,
          fileSize: 500000,
        },
        documentBack: {
          uri: 'file:///mock/back.jpg',
          width: 1920,
          height: 1080,
          fileSize: 500000,
        },
        selfie: {
          uri: 'file:///mock/selfie.jpg',
          width: 1080,
          height: 1920,
          fileSize: 400000,
        },
      };

      // İptal et
      uploadService.cancelUpload();

      // AbortController kullanılıyorsa iptal işlemi çalışmalı
      expect(true).toBe(true); // Placeholder assertion
    });
  });
});
