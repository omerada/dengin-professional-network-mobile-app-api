// __tests__/unit/verification/hooks.test.ts
// Verification hooks testleri

import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useVerificationStatus, useIsVerified } from '../../../src/features/verification/hooks';
import { apiClient } from '../../../src/core/api/client';

// API client mock
jest.mock('../../../src/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useVerificationStatus', () => {
    it('should fetch verification status', async () => {
      const mockStatus = {
        verificationId: 'ver_123456',
        status: 'APPROVED',
        updatedAt: new Date().toISOString(),
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: { data: mockStatus },
      });

      const { result, waitFor } = renderHook(() => useVerificationStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.data).toEqual(mockStatus);
    });

    it('should return null when no verification exists', async () => {
      mockApiClient.get.mockRejectedValueOnce({ response: { status: 404 } });

      const { result, waitFor } = renderHook(() => useVerificationStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.data).toBeNull();
    });
  });

  describe('useIsVerified', () => {
    it('should return isVerified true when status is APPROVED', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            verificationId: 'ver_123456',
            status: 'APPROVED',
          },
        },
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(true);
      expect(result.current.isPending).toBe(false);
    });

    it('should return isPending true when status is PENDING_REVIEW', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            verificationId: 'ver_123456',
            status: 'PENDING_REVIEW',
          },
        },
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(false);
      expect(result.current.isPending).toBe(true);
    });

    it('should return isPending true when status is MANUAL_REVIEW', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            verificationId: 'ver_123456',
            status: 'MANUAL_REVIEW',
          },
        },
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(false);
      expect(result.current.isPending).toBe(true);
    });

    it('should return false for both when status is REJECTED', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: {
            verificationId: 'ver_123456',
            status: 'REJECTED',
          },
        },
      });

      const { result, waitFor } = renderHook(() => useIsVerified(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => !result.current.isLoading);

      expect(result.current.isVerified).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(result.current.status).toBe('REJECTED');
    });
  });
});
