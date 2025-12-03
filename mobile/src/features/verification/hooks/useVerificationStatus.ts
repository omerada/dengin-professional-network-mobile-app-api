// src/features/verification/hooks/useVerificationStatus.ts
// Doğrulama durumu hook'u
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type { VerificationResponse, VerificationStatus } from '../types';

/**
 * Query key
 */
export const VERIFICATION_STATUS_KEY = ['verification', 'status'] as const;

/**
 * Doğrulama durumunu getir
 */
async function fetchVerificationStatus(): Promise<VerificationResponse | null> {
  try {
    const response = await apiClient.get<{ data: VerificationResponse }>(
      API_ENDPOINTS.VERIFICATION.STATUS
    );
    return response.data.data;
  } catch (error) {
    // Doğrulama yoksa null döndür
    return null;
  }
}

/**
 * Doğrulama durumu hook'u
 */
export function useVerificationStatus() {
  return useQuery({
    queryKey: VERIFICATION_STATUS_KEY,
    queryFn: fetchVerificationStatus,
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
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
    isPending: status?.status === 'PENDING_REVIEW' || status?.status === 'MANUAL_REVIEW',
    status: status?.status as VerificationStatus | undefined,
    isLoading,
  };
}

export default useVerificationStatus;
