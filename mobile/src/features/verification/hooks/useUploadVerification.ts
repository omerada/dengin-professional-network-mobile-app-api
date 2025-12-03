// src/features/verification/hooks/useUploadVerification.ts
// Doğrulama yükleme hook'u
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadService } from '../services';
import { VERIFICATION_STATUS_KEY } from './useVerificationStatus';
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
    },
  });
}

export default useUploadVerification;
