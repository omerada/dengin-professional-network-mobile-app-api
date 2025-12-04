// __tests__/unit/verification/uploadService.test.ts
// Upload service testleri
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { uploadService } from '@features/verification/services/uploadService';
import { verificationApi } from '@features/verification/services/verificationApi';
import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type { VerificationData, CapturedImage } from '@features/verification/types';

// Mock API client
jest.mock('@core/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock verification API
jest.mock('@features/verification/services/verificationApi', () => ({
  verificationApi: {
    submit: jest.fn(),
    getLatestVerification: jest.fn(),
  },
}));

// Mock fetch for S3 upload
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockVerificationApi = verificationApi as jest.Mocked<typeof verificationApi>;

describe('Upload Service', () => {
  const mockDocumentImage: CapturedImage = {
    uri: 'file:///mock/document.jpg',
    path: '/mock/document.jpg',
    width: 1920,
    height: 1080,
    type: 'front',
    capturedAt: new Date().toISOString(),
    fileSize: 500000,
  };

  const mockSelfieImage: CapturedImage = {
    uri: 'file:///mock/selfie.jpg',
    path: '/mock/selfie.jpg',
    width: 1080,
    height: 1920,
    type: 'selfie',
    capturedAt: new Date().toISOString(),
    fileSize: 400000,
  };

  const mockVerificationData: VerificationData = {
    documentType: 'DIPLOMA',
    documentFront: mockDocumentImage,
    documentBack: null,
    selfie: mockSelfieImage,
    professionId: 1,
    profession: 'Doktor',
  };

  const mockPresignedResponse = {
    data: {
      data: {
        url: 'https://s3.amazonaws.com/bucket/presigned-url',
        key: 'verification/document-123.jpg',
      },
    },
  };

  const mockVerificationResponse = {
    id: 123,
    status: 'PENDING' as const,
    profession: { id: 1, name: 'Doktor' },
    attemptCount: 1,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('uploadImage', () => {
    it('should upload image to S3 using presigned URL', async () => {
      // Mock presigned URL response
      mockApiClient.post.mockResolvedValueOnce(mockPresignedResponse);

      // Mock fetch for getting blob and S3 upload
      mockFetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob(['image data'])) })
        .mockResolvedValueOnce({ ok: true });

      const result = await uploadService.uploadImage(mockDocumentImage, 'document');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.MEDIA.PRESIGNED_URL,
        {
          type: 'verification_document',
          contentType: 'image/jpeg',
        }
      );
      expect(result).toBe(mockPresignedResponse.data.data.key);
    });
  });

  describe('uploadAndSubmitVerification', () => {
    it('should upload images and submit verification successfully', async () => {
      // Mock presigned URLs for both images
      mockApiClient.post
        .mockResolvedValueOnce(mockPresignedResponse) // document
        .mockResolvedValueOnce({
          data: { data: { url: 'https://s3.amazonaws.com/bucket/selfie', key: 'verification/selfie-123.jpg' } },
        }); // selfie

      // Mock fetch calls
      mockFetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob(['doc data'])) })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob(['selfie data'])) })
        .mockResolvedValueOnce({ ok: true });

      // Mock submit verification
      mockVerificationApi.submit.mockResolvedValueOnce(mockVerificationResponse);

      const onProgress = jest.fn();
      const result = await uploadService.uploadAndSubmitVerification(mockVerificationData, onProgress);

      expect(result).toEqual(mockVerificationResponse);
      expect(onProgress).toHaveBeenCalled();
      expect(mockVerificationApi.submit).toHaveBeenCalledWith({
        professionId: 1,
        documentUrl: mockPresignedResponse.data.data.key,
        selfieUrl: 'verification/selfie-123.jpg',
      });
    });

    it('should throw error if professionId is missing', async () => {
      const dataWithoutProfession = { ...mockVerificationData, professionId: undefined };

      await expect(uploadService.uploadAndSubmitVerification(dataWithoutProfession as VerificationData))
        .rejects.toThrow('Profession ID is required');
    });

    it('should throw error if document image is missing', async () => {
      const dataWithoutDocument = { ...mockVerificationData, documentFront: null };

      await expect(uploadService.uploadAndSubmitVerification(dataWithoutDocument))
        .rejects.toThrow('Document image is required');
    });

    it('should throw error if selfie is missing', async () => {
      const dataWithoutSelfie = { ...mockVerificationData, selfie: null };

      await expect(uploadService.uploadAndSubmitVerification(dataWithoutSelfie))
        .rejects.toThrow('Selfie image is required');
    });
  });

  describe('uploadWithRetry', () => {
    it('should retry on failure', async () => {
      const error = new Error('Network error');

      // First two attempts fail, third succeeds
      mockApiClient.post
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockPresignedResponse)
        .mockResolvedValueOnce({
          data: { data: { url: 'https://s3.amazonaws.com/bucket/selfie', key: 'verification/selfie-123.jpg' } },
        });

      mockFetch
        .mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob(['doc data'])) })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob(['selfie data'])) })
        .mockResolvedValueOnce({ ok: true });

      mockVerificationApi.submit.mockResolvedValueOnce(mockVerificationResponse);

      // Should succeed on third attempt
      const result = await uploadService.uploadWithRetry(mockVerificationData);

      expect(result).toBeDefined();
    });

    it('should throw after max retries exceeded', async () => {
      const error = new Error('Network error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(uploadService.uploadWithRetry(mockVerificationData))
        .rejects.toThrow();
    });
  });

  describe('pollStatus', () => {
    it('should poll until verification is complete', async () => {
      mockVerificationApi.getLatestVerification
        .mockResolvedValueOnce({ ...mockVerificationResponse, status: 'PROCESSING' })
        .mockResolvedValueOnce({ ...mockVerificationResponse, status: 'PROCESSING' })
        .mockResolvedValueOnce({ ...mockVerificationResponse, status: 'APPROVED' });

      const onStatusChange = jest.fn();
      const result = await uploadService.pollStatus(onStatusChange, 5, 10);

      expect(result?.status).toBe('APPROVED');
      expect(onStatusChange).toHaveBeenCalledTimes(3);
    });

    it('should return result for REJECTED status', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce({
        ...mockVerificationResponse,
        status: 'REJECTED',
        rejectionReason: 'Document unclear',
      });

      const onStatusChange = jest.fn();
      const result = await uploadService.pollStatus(onStatusChange, 5, 10);

      expect(result?.status).toBe('REJECTED');
    });

    it('should return result for MANUAL_REVIEW status', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce({
        ...mockVerificationResponse,
        status: 'MANUAL_REVIEW',
      });

      const onStatusChange = jest.fn();
      const result = await uploadService.pollStatus(onStatusChange, 5, 10);

      expect(result?.status).toBe('MANUAL_REVIEW');
    });

    it('should throw timeout error after max attempts', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValue({
        ...mockVerificationResponse,
        status: 'PENDING',
      });

      const onStatusChange = jest.fn();

      await expect(uploadService.pollStatus(onStatusChange, 3, 10))
        .rejects.toThrow('Doğrulama zaman aşımına uğradı');
    });
  });

  describe('sleep', () => {
    it('should wait for specified milliseconds', async () => {
      const start = Date.now();
      await uploadService.sleep(50);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some tolerance
    });
  });
});
