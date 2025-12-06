// src/features/verification/hooks/useVerificationStatus.ts
// Doğrulama durumu hook'u
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { useQuery } from '@tanstack/react-query';
import { verificationApi } from '../services';
import type { VerificationStatus } from '../types';

/**
 * Query keys
 */
export const VERIFICATION_STATUS_KEY = ['verification', 'status'] as const;
export const VERIFICATION_LIST_KEY = ['verification', 'list'] as const;
export const VERIFICATION_ELIGIBILITY_KEY = ['verification', 'eligibility'] as const;

/**
 * Doğrulama durumu hook'u
 * GET /api/verifications -> returns latest verification
 */
export function useVerificationStatus() {
  return useQuery({
    queryKey: VERIFICATION_STATUS_KEY,
    queryFn: () => verificationApi.getLatestVerification(),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
    retry: 1,
  });
}

/**
 * Tüm doğrulama listesi hook'u
 * GET /api/verifications
 */
export function useVerificationList() {
  return useQuery({
    queryKey: VERIFICATION_LIST_KEY,
    queryFn: () => verificationApi.getVerifications(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Meslek için doğrulama uygunluğu hook'u
 * GET /api/verifications/check/{professionId}
 */
export function useVerificationEligibility(professionId: number | undefined) {
  return useQuery({
    queryKey: [...VERIFICATION_ELIGIBILITY_KEY, professionId] as const,
    queryFn: () => verificationApi.checkEligibility(professionId!),
    enabled: !!professionId,
    staleTime: 60 * 1000, // 1 dakika
    retry: 1,
  });
}

/**
 * Kullanıcının doğrulanıp doğrulanmadığını kontrol et
 */
export function useIsVerified() {
  const { data: status, isLoading } = useVerificationStatus();

  return {
    isVerified: status?.status === 'APPROVED',
    isPending:
      status?.status === 'PENDING' ||
      status?.status === 'PROCESSING' ||
      status?.status === 'MANUAL_REVIEW',
    isRejected: status?.status === 'REJECTED',
    status: status?.status as VerificationStatus | undefined,
    attemptCount: status?.attemptNumber,
    maxAttempts: 3, // Default max attempts
    isLoading,
  };
}

export default useVerificationStatus;
