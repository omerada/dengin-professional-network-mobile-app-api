// __tests__/unit/verification/hooks.test.ts
// Verification hooks testleri
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { renderHook, waitFor } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useVerificationStatus,
  useVerificationList,
  useVerificationEligibility,
  useIsVerified,
} from '@features/verification/hooks';
import { verificationApi } from '@features/verification/services/verificationApi';
import type { VerificationResponse, VerificationEligibilityResponse } from '@features/verification/types';

// Mock verification API
jest.mock('@features/verification/services/verificationApi', () => ({
  verificationApi: {
    getLatestVerification: jest.fn(),
    getVerifications: jest.fn(),
    checkEligibility: jest.fn(),
  },
}));

const mockVerificationApi = verificationApi as jest.Mocked<typeof verificationApi>;

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Verification Hooks', () => {
  const mockVerificationResponse: VerificationResponse = {
    id: 123,
    status: 'APPROVED',
    profession: { id: 1, name: 'Doktor' },
    attemptCount: 1,
    maxAttempts: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useVerificationStatus', () => {
    it('should fetch latest verification status', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce(mockVerificationResponse);

      const { result, waitFor } = renderHook(() => useVerificationStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.data).toEqual(mockVerificationResponse);
    });

    it('should return null when no verification exists', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce(null);

      const { result, waitFor } = renderHook(() => useVerificationStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.data).toBeNull();
    });
  });

  describe('useVerificationList', () => {
    it('should fetch all verifications', async () => {
      const mockVerifications: VerificationResponse[] = [
        mockVerificationResponse,
        { ...mockVerificationResponse, id: 124, status: 'REJECTED' },
      ];

      mockVerificationApi.getVerifications.mockResolvedValueOnce(mockVerifications);

      const { result, waitFor } = renderHook(() => useVerificationList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.data).toEqual(mockVerifications);
      expect(result.current.data?.length).toBe(2);
    });
  });

  describe('useVerificationEligibility', () => {
    const mockEligibility: VerificationEligibilityResponse = {
      eligible: true,
      remainingAttempts: 3,
    };

    it('should check eligibility for profession', async () => {
      mockVerificationApi.checkEligibility.mockResolvedValueOnce(mockEligibility);

      const { result, waitFor } = renderHook(
        () => useVerificationEligibility(1),
        { wrapper: createWrapper() }
      );

      await waitFor(() => !result.current.isLoading);

      expect(result.current.data).toEqual(mockEligibility);
      expect(mockVerificationApi.checkEligibility).toHaveBeenCalledWith(1);
    });

    it('should not fetch when professionId is undefined', async () => {
      const { result } = renderHook(
        () => useVerificationEligibility(undefined),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockVerificationApi.checkEligibility).not.toHaveBeenCalled();
    });

    it('should return ineligible when attempts exhausted', async () => {
      const ineligibleResponse: VerificationEligibilityResponse = {
        eligible: false,
        reason: 'Maximum attempts reached',
        remainingAttempts: 0,
        cooldownEndsAt: '2024-01-10T00:00:00Z',
      };

      mockVerificationApi.checkEligibility.mockResolvedValueOnce(ineligibleResponse);

      const { result, waitFor } = renderHook(
        () => useVerificationEligibility(1),
        { wrapper: createWrapper() }
      );

      await waitFor(() => !result.current.isLoading);

      expect(result.current.data?.eligible).toBe(false);
      expect(result.current.data?.remainingAttempts).toBe(0);
    });
  });

  describe('useIsVerified', () => {
    it('should return isVerified true when status is APPROVED', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce({
        ...mockVerificationResponse,
        status: 'APPROVED',
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isRejected).toBe(false);
    });

    it('should return isPending true when status is PENDING', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce({
        ...mockVerificationResponse,
        status: 'PENDING',
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(false);
      expect(result.current.isPending).toBe(true);
    });

    it('should return isPending true when status is PROCESSING', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce({
        ...mockVerificationResponse,
        status: 'PROCESSING',
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(false);
      expect(result.current.isPending).toBe(true);
    });

    it('should return isPending true when status is MANUAL_REVIEW', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce({
        ...mockVerificationResponse,
        status: 'MANUAL_REVIEW',
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(false);
      expect(result.current.isPending).toBe(true);
    });

    it('should return isRejected true when status is REJECTED', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce({
        ...mockVerificationResponse,
        status: 'REJECTED',
        rejectionReason: 'Document unclear',
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isRejected).toBe(true);
    });

    it('should return attempt info', async () => {
      mockVerificationApi.getLatestVerification.mockResolvedValueOnce({
        ...mockVerificationResponse,
        attemptCount: 2,
        maxAttempts: 3,
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.attemptCount).toBe(2);
      expect(result.current.maxAttempts).toBe(3);
    });
  });
});
