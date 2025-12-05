// src/features/verification/services/verificationApi.ts
// Verification API service - Backend VerificationController ile %100 uyumlu
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  SubmitVerificationRequest,
  VerificationResponse,
  VerificationEligibilityResponse,
} from '../types';

/**
 * API Response wrapper - Backend ApiResponse<T> formatı
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Verification API Service
 * Backend /api/verifications/* endpoints
 *
 * NOT: Backend response formatları güncellendi, SubmitVerificationRequest
 * artık S3 key ve metadata içermeli (URL değil!)
 */
export const verificationApi = {
  /**
   * Submit verification request
   * POST /api/verifications
   *
   * Backend beklentisi (SubmitVerificationRequest.java):
   * - professionId: Long (zorunlu)
   * - documentS3Key: String (zorunlu)
   * - documentFileName: String (zorunlu)
   * - documentContentType: String (zorunlu)
   * - documentFileSize: Long (zorunlu)
   * - selfieS3Key: String (zorunlu)
   * - selfieFileName: String (zorunlu)
   * - selfieContentType: String (zorunlu)
   * - selfieFileSize: Long (zorunlu)
   *
   * @param data - Verification submission data with S3 keys and metadata
   * @returns VerificationResponse with status and attempt info
   */
  submit: async (data: SubmitVerificationRequest): Promise<VerificationResponse> => {
    const response = await apiClient.post<ApiResponse<VerificationResponse>>(
      API_ENDPOINTS.VERIFICATION.SUBMIT,
      data,
    );
    return response.data.data;
  },

  /**
   * Get user's verification list
   * GET /api/verifications
   *
   * @returns List of user's verification requests
   */
  getVerifications: async (): Promise<VerificationResponse[]> => {
    const response = await apiClient.get<ApiResponse<VerificationResponse[]>>(
      API_ENDPOINTS.VERIFICATION.LIST,
    );
    return response.data.data;
  },

  /**
   * Get latest verification status
   * Convenience method - returns most recent verification
   *
   * NOT: Backend submittedAt alanı kullanıyor (createdAt değil!)
   *
   * @returns Latest verification response or null
   */
  getLatestVerification: async (): Promise<VerificationResponse | null> => {
    const verifications = await verificationApi.getVerifications();
    if (verifications.length === 0) {
      return null;
    }
    // Sort by submittedAt descending and return the latest
    return verifications.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )[0];
  },

  /**
   * Check verification eligibility for a profession
   * GET /api/verifications/check/{professionId}
   *
   * @param professionId - Profession ID to check eligibility for
   * @returns Eligibility status with remaining attempts
   */
  checkEligibility: async (professionId: number): Promise<VerificationEligibilityResponse> => {
    const response = await apiClient.get<ApiResponse<VerificationEligibilityResponse>>(
      API_ENDPOINTS.VERIFICATION.CHECK_ELIGIBILITY(professionId),
    );
    return response.data.data;
  },

  /**
   * Get verification history
   * GET /api/verifications/history
   *
   * @returns List of all verification attempts
   */
  getHistory: async (): Promise<VerificationResponse[]> => {
    const response = await apiClient.get<ApiResponse<VerificationResponse[]>>(
      API_ENDPOINTS.VERIFICATION.HISTORY,
    );
    return response.data.data;
  },

  /**
   * Get verification by ID
   * GET /api/verifications/{verificationId}
   *
   * @param verificationId - The ID of the verification to retrieve
   * @returns VerificationResponse
   */
  getById: async (verificationId: number): Promise<VerificationResponse> => {
    const response = await apiClient.get<ApiResponse<VerificationResponse>>(
      API_ENDPOINTS.VERIFICATION.BY_ID(verificationId),
    );
    return response.data.data;
  },
};

export default verificationApi;
