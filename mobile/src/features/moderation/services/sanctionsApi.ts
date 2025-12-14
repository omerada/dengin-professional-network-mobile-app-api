// src/features/moderation/services/sanctionsApi.ts
// Sanctions API service - Backend SanctionController ile %100 uyumlu
// Backend: com.dengin.moderation.api.SanctionController

import { apiClient } from '@core/api';
import { API_ENDPOINTS } from '@core/api/endpoints';
import type {
  SanctionResponse,
  AppealRequest,
  SanctionStatusResponse,
  RemainingTimeResponse,
} from '../types';

/**
 * Sanctions API Service
 *
 * Kullanıcıların yaptırımlarını görüntülemesi ve itiraz etmesi için API servisi.
 *
 * Backend Endpoints:
 * - GET /api/sanctions/my-sanctions - Tüm yaptırımları getir
 * - GET /api/sanctions/my-sanctions/active - Aktif yaptırımları getir
 * - GET /api/sanctions/{sanctionId} - Yaptırım detayı
 * - POST /api/sanctions/appeal - İtiraz gönder
 * - GET /api/sanctions/status - Yaptırım durumunu kontrol et
 * - GET /api/sanctions/remaining-time - Kalan süreyi getir
 */
export const sanctionsApi = {
  /**
   * GET /api/sanctions/my-sanctions
   * Kullanıcının tüm yaptırımlarını getir
   *
   * Backend: SanctionController.getMySanctions()
   */
  getMySanctions: async (): Promise<SanctionResponse[]> => {
    const response = await apiClient.get<SanctionResponse[]>(API_ENDPOINTS.SANCTIONS.MY_SANCTIONS);
    return response.data;
  },

  /**
   * GET /api/sanctions/my-sanctions/active
   * Kullanıcının aktif yaptırımlarını getir
   *
   * Backend: SanctionController.getMyActiveSanctions()
   */
  getMyActiveSanctions: async (): Promise<SanctionResponse[]> => {
    const response = await apiClient.get<SanctionResponse[]>(
      API_ENDPOINTS.SANCTIONS.MY_ACTIVE_SANCTIONS,
    );
    return response.data;
  },

  /**
   * GET /api/sanctions/{sanctionId}
   * Yaptırım detayını getir
   *
   * Backend: SanctionController.getSanction()
   */
  getSanction: async (sanctionId: string): Promise<SanctionResponse> => {
    const response = await apiClient.get<SanctionResponse>(
      API_ENDPOINTS.SANCTIONS.BY_ID(sanctionId),
    );
    return response.data;
  },

  /**
   * POST /api/sanctions/appeal
   * Yaptırıma itiraz et
   *
   * Backend: SanctionController.submitAppeal()
   *
   * @param request - İtiraz verisi (sanctionId ve reason)
   * @returns Güncellenmiş yaptırım bilgisi
   */
  submitAppeal: async (request: AppealRequest): Promise<SanctionResponse> => {
    const response = await apiClient.post<SanctionResponse>(
      API_ENDPOINTS.SANCTIONS.APPEAL,
      request,
    );
    return response.data;
  },

  /**
   * GET /api/sanctions/status
   * Kullanıcının yaptırım durumunu kontrol et
   *
   * Backend: SanctionController.checkStatus()
   *
   * @returns isBanned, isSuspended, canAct gibi durumlar
   */
  checkStatus: async (): Promise<SanctionStatusResponse> => {
    const response = await apiClient.get<SanctionStatusResponse>(API_ENDPOINTS.SANCTIONS.STATUS);
    return response.data;
  },

  /**
   * GET /api/sanctions/remaining-time
   * Kalan askıya alma süresini getir
   *
   * Backend: SanctionController.getRemainingTime()
   *
   * @returns remainingDays, expiresAt gibi bilgiler
   */
  getRemainingTime: async (): Promise<RemainingTimeResponse> => {
    const response = await apiClient.get<RemainingTimeResponse>(
      API_ENDPOINTS.SANCTIONS.REMAINING_TIME,
    );
    return response.data;
  },
};

export default sanctionsApi;
