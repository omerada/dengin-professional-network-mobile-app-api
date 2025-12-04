// src/features/verification/services/verificationApi.ts
// Verification API service - Backend ile iletişim
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { apiClient } from '@core/api/client';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  SubmitVerificationRequest,
  VerificationResponse,
  VerificationEligibilityResponse,
} from '../types';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Verification API Service
 * Backend /api/verifications/* endpoints
 */
export const verificationApi = {
  /**
   * Submit verification request
   * POST /api/verifications
   * 
   * @param data - Verification submission data with S3 URLs
   * @returns VerificationResponse with status and attempt info
   */
  submit: async (data: SubmitVerificationRequest): Promise<VerificationResponse> => {
    const response = await apiClient.post<ApiResponse<VerificationResponse>>(
      API_ENDPOINTS.VERIFICATION.SUBMIT,
      data
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
      API_ENDPOINTS.VERIFICATION.LIST
    );
    return response.data.data;
  },

  /**
   * Get latest verification status
   * Convenience method - returns most recent verification
   * 
   * @returns Latest verification response or null
   */
  getLatestVerification: async (): Promise<VerificationResponse | null> => {
    const verifications = await verificationApi.getVerifications();
    if (verifications.length === 0) {
      return null;
    }
    // Sort by createdAt descending and return the latest
    return verifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      API_ENDPOINTS.VERIFICATION.CHECK_ELIGIBILITY(professionId)
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
      API_ENDPOINTS.VERIFICATION.HISTORY
    );
    return response.data.data;
  },
};

export default verificationApi;
