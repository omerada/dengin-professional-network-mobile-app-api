// __tests__/unit/verification/verificationApi.test.ts
// Verification API service unit tests
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { verificationApi } from '@features/verification/services/verificationApi';
import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  SubmitVerificationRequest,
  VerificationResponse,
  VerificationEligibilityResponse,
} from '@features/verification/types';

// Mock API client
jest.mock('@core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('verificationApi', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submit', () => {
    const mockRequest: SubmitVerificationRequest = {
      professionId: 1,
      documentUrl: 'https://s3.amazonaws.com/bucket/document.jpg',
      selfieUrl: 'https://s3.amazonaws.com/bucket/selfie.jpg',
    };

    const mockResponse: VerificationResponse = {
      id: 123,
      status: 'PENDING',
      profession: {
        id: 1,
        name: 'Doktor',
      },
      attemptCount: 1,
      maxAttempts: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should submit verification request successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, data: mockResponse },
      });

      const result = await verificationApi.submit(mockRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.VERIFICATION.SUBMIT,
        mockRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on submission failure', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(verificationApi.submit(mockRequest)).rejects.toThrow('Network error');
    });
  });

  describe('getVerifications', () => {
    const mockVerifications: VerificationResponse[] = [
      {
        id: 1,
        status: 'APPROVED',
        profession: { id: 1, name: 'Doktor' },
        attemptCount: 1,
        maxAttempts: 3,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: 2,
        status: 'PENDING',
        profession: { id: 2, name: 'Avukat' },
        attemptCount: 1,
        maxAttempts: 3,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      },
    ];

    it('should fetch verification list successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { success: true, data: mockVerifications },
      });

      const result = await verificationApi.getVerifications();

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.VERIFICATION.LIST);
      expect(result).toEqual(mockVerifications);
    });
  });

  describe('getLatestVerification', () => {
    it('should return the latest verification sorted by createdAt', async () => {
      const mockVerifications: VerificationResponse[] = [
        {
          id: 1,
          status: 'APPROVED',
          profession: { id: 1, name: 'Doktor' },
          attemptCount: 1,
          maxAttempts: 3,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: 2,
          status: 'PENDING',
          profession: { id: 2, name: 'Avukat' },
          attemptCount: 1,
          maxAttempts: 3,
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: { success: true, data: mockVerifications },
      });

      const result = await verificationApi.getLatestVerification();

      expect(result?.id).toBe(2); // Should return the newer one
    });

    it('should return null when no verifications exist', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { success: true, data: [] },
      });

      const result = await verificationApi.getLatestVerification();

      expect(result).toBeNull();
    });
  });

  describe('checkEligibility', () => {
    const mockEligibility: VerificationEligibilityResponse = {
      eligible: true,
      remainingAttempts: 3,
    };

    it('should check eligibility for profession successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { success: true, data: mockEligibility },
      });

      const result = await verificationApi.checkEligibility(1);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.VERIFICATION.CHECK_ELIGIBILITY(1)
      );
      expect(result).toEqual(mockEligibility);
    });

    it('should return ineligible when attempts exhausted', async () => {
      const ineligible: VerificationEligibilityResponse = {
        eligible: false,
        reason: 'Maximum attempts reached',
        remainingAttempts: 0,
        cooldownEndsAt: '2024-01-10T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: { success: true, data: ineligible },
      });

      const result = await verificationApi.checkEligibility(1);

      expect(result.eligible).toBe(false);
      expect(result.remainingAttempts).toBe(0);
    });
  });

  describe('getHistory', () => {
    it('should fetch verification history successfully', async () => {
      const mockHistory: VerificationResponse[] = [
        {
          id: 1,
          status: 'REJECTED',
          profession: { id: 1, name: 'Doktor' },
          attemptCount: 1,
          maxAttempts: 3,
          rejectionReason: 'Document unclear',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: { success: true, data: mockHistory },
      });

      const result = await verificationApi.getHistory();

      expect(mockApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.VERIFICATION.HISTORY);
      expect(result).toEqual(mockHistory);
    });
  });
});
