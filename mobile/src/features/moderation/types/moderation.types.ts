// src/features/moderation/types/moderation.types.ts
// Moderation ve şikayet tipleri
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

/**
 * Rapor tipi
 */
export type ReportType = 'USER' | 'POST' | 'COMMENT' | 'MESSAGE';

/**
 * Rapor nedeni
 */
export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'VIOLENCE'
  | 'NUDITY'
  | 'FALSE_INFORMATION'
  | 'IMPERSONATION'
  | 'INTELLECTUAL_PROPERTY'
  | 'OTHER';

/**
 * Rapor oluşturma request
 */
export interface CreateReportRequest {
  type: ReportType;
  targetId: number | string;
  reason: ReportReason;
  description?: string;
}

/**
 * Rapor response
 */
export interface ReportResponse {
  id: number;
  type: ReportType;
  targetId: string;
  reason: ReportReason;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

/**
 * Engellenen kullanıcı
 */
export interface BlockedUser {
  id: number;
  name: string;
  surname: string;
  fullName: string;
  avatarUrl: string | null;
  blockedAt: string;
}

/**
 * Report reason display info
 */
export interface ReportReasonInfo {
  value: ReportReason;
  label: string;
  icon: string;
}

/**
 * Report nedenleri listesi
 */
export const REPORT_REASONS: ReportReasonInfo[] = [
  { value: 'SPAM', label: 'Spam', icon: 'alert-circle-outline' },
  { value: 'HARASSMENT', label: 'Taciz veya Zorbalık', icon: 'person-remove-outline' },
  { value: 'HATE_SPEECH', label: 'Nefret Söylemi', icon: 'warning-outline' },
  { value: 'VIOLENCE', label: 'Şiddet', icon: 'flash-outline' },
  { value: 'NUDITY', label: 'Uygunsuz İçerik', icon: 'eye-off-outline' },
  { value: 'FALSE_INFORMATION', label: 'Yanlış Bilgi', icon: 'newspaper-outline' },
  { value: 'IMPERSONATION', label: 'Kimliğe Bürünme', icon: 'person-outline' },
  { value: 'INTELLECTUAL_PROPERTY', label: 'Fikri Mülkiyet', icon: 'document-outline' },
  { value: 'OTHER', label: 'Diğer', icon: 'ellipsis-horizontal-outline' },
];
