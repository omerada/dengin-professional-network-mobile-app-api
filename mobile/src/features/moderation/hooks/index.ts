// src/features/moderation/hooks/index.ts
// Moderation hooks
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import { useMutation, useQuery } from '@tanstack/react-query';
import { moderationApi } from '../services';
import type { CreateReportRequest, ReportResponse, BlockedUser } from '../types';

/**
 * Hook: Şikayet oluştur
 */
export function useCreateReport() {
  return useMutation<ReportResponse, Error, CreateReportRequest>({
    mutationFn: (data: CreateReportRequest) => moderationApi.createReport(data),
  });
}

/**
 * Hook: Kullanıcının raporlarını getir
 */
export function useMyReports() {
  return useQuery<ReportResponse[], Error>({
    queryKey: ['my-reports'],
    queryFn: moderationApi.getMyReports,
  });
}

/**
 * Hook: Engellenen kullanıcıları getir
 */
export function useBlockedUsers() {
  return useQuery<BlockedUser[], Error>({
    queryKey: ['blocked-users'],
    queryFn: moderationApi.getBlockedUsers,
  });
}
