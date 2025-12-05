// src/features/moderation/services/moderationApi.ts
// Moderation API service - Backend ReportController ve BlockController ile %100 uyumlu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import { apiClient } from '@core/api';
import type { CreateReportRequest, ReportResponse, BlockedUser } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Moderation API Service
 *
 * Backend Endpoints:
 * - POST /api/reports - Şikayet oluştur (ReportController.createReport)
 * - GET /api/reports/my-reports - Kullanıcının raporlarını getir (NOT: /api/reports değil!)
 * - GET /api/users/me/blocked - Engellenen kullanıcıları getir (BlockController)
 */
export const moderationApi = {
  /**
   * POST /api/reports
   * Şikayet oluştur
   *
   * Backend: ReportController.createReport()
   * NOT: Backend contentOwnerId ve contentText parametrelerini query param olarak da alabilir
   */
  createReport: async (data: CreateReportRequest): Promise<ReportResponse> => {
    const response = await apiClient.post<ApiResponse<ReportResponse>>('/api/reports', data);
    return response.data.data;
  },

  /**
   * GET /api/reports/my-reports
   * Kullanıcının raporlarını getir
   *
   * Backend: ReportController.getMyReports()
   * NOT: Endpoint /api/reports/my-reports, /api/reports DEĞİL!
   */
  getMyReports: async (): Promise<ReportResponse[]> => {
    const response = await apiClient.get<ApiResponse<ReportResponse[]>>('/api/reports/my-reports');
    return response.data.data;
  },

  /**
   * GET /api/reports/{reportId}
   * Rapor detayını getir
   *
   * Backend: ReportController.getReport()
   */
  getReport: async (reportId: string): Promise<ReportResponse> => {
    const response = await apiClient.get<ApiResponse<ReportResponse>>(`/api/reports/${reportId}`);
    return response.data.data;
  },

  /**
   * DELETE /api/reports/{reportId}
   * Bekleyen raporu iptal et
   *
   * Backend: ReportController.cancelReport()
   */
  cancelReport: async (reportId: string): Promise<void> => {
    await apiClient.delete(`/api/reports/${reportId}`);
  },

  /**
   * GET /api/reports/check
   * Kullanıcının belirli içeriği daha önce raporlayıp raporlamadığını kontrol et
   *
   * Backend: ReportController.checkIfReported()
   */
  checkIfReported: async (contentId: string, type: string): Promise<{ hasReported: boolean }> => {
    const response = await apiClient.get<{ hasReported: boolean }>('/api/reports/check', {
      params: { contentId, type },
    });
    return response.data;
  },

  /**
   * GET /api/users/me/blocked
   * Engellenen kullanıcıları getir
   *
   * Backend: BlockController.getBlockedUsers()
   * NOT: Endpoint /api/users/me/blocked, /api/users/blocked DEĞİL!
   */
  getBlockedUsers: async (): Promise<BlockedUser[]> => {
    const response = await apiClient.get<ApiResponse<BlockedUser[]>>('/api/users/me/blocked');
    return response.data.data;
  },
};

export default moderationApi;
