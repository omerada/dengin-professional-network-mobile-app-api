// src/features/moderation/services/moderationApi.ts
// Moderation API service
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
 * Endpoints:
 * - POST /api/reports - Şikayet oluştur
 * - GET /api/reports - Kullanıcının raporlarını getir
 * - GET /api/users/blocked - Engellenen kullanıcıları getir
 */
export const moderationApi = {
  /**
   * POST /api/reports
   * Şikayet oluştur
   */
  createReport: async (data: CreateReportRequest): Promise<ReportResponse> => {
    const response = await apiClient.post<ApiResponse<ReportResponse>>(
      '/api/reports',
      data,
    );
    return response.data.data;
  },

  /**
   * GET /api/reports
   * Kullanıcının raporlarını getir
   */
  getMyReports: async (): Promise<ReportResponse[]> => {
    const response = await apiClient.get<ApiResponse<ReportResponse[]>>('/api/reports');
    return response.data.data;
  },

  /**
   * GET /api/users/blocked
   * Engellenen kullanıcıları getir
   */
  getBlockedUsers: async (): Promise<BlockedUser[]> => {
    const response = await apiClient.get<ApiResponse<BlockedUser[]>>(
      '/api/users/blocked',
    );
    return response.data.data;
  },
};

export default moderationApi;
