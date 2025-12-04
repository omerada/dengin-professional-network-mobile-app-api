// src/features/verification/hooks/useUploadVerification.ts
// Doğrulama yükleme hook'u
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadService } from '../services';
import { VERIFICATION_STATUS_KEY, VERIFICATION_LIST_KEY } from './useVerificationStatus';
import type { VerificationData, VerificationResponse, UploadProgress } from '../types';

/**
 * Yükleme parametreleri
 */
interface UploadParams {
  data: VerificationData;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Doğrulama yükleme hook'u
 * 1. Uploads images to S3 via presigned URLs
 * 2. Submits verification request to backend
 */
export function useUploadVerification() {
  const queryClient = useQueryClient();

  return useMutation<VerificationResponse, Error, UploadParams>({
    mutationFn: async ({ data, onProgress }) => {
      return uploadService.uploadWithRetry(data, onProgress);
    },
    onSuccess: () => {
      // Doğrulama durumunu yenile
      queryClient.invalidateQueries({ queryKey: VERIFICATION_STATUS_KEY });
      queryClient.invalidateQueries({ queryKey: VERIFICATION_LIST_KEY });
    },
  });
}

export default useUploadVerification;
