// src/features/notifications/utils/groupNotifications.ts
// Time-based notification grouping utility
// Groups notifications into: Today, This Week, Earlier

import type { NotificationResponse } from '../types';

export interface NotificationGroup {
  title: 'Bugün' | 'Bu Hafta' | 'Daha Önce';
  notifications: NotificationResponse[];
}

/**
 * Group notifications by time periods
 *
 * @param notifications - Flat list of notifications (assumed sorted by createdAt DESC)
 * @returns Array of grouped notifications
 */
export function groupNotificationsByTime(
  notifications: NotificationResponse[],
): NotificationGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const today: NotificationResponse[] = [];
  const thisWeek: NotificationResponse[] = [];
  const earlier: NotificationResponse[] = [];

  notifications.forEach(notification => {
    const createdAt = new Date(notification.createdAt);

    if (createdAt >= todayStart) {
      today.push(notification);
    } else if (createdAt >= weekStart) {
      thisWeek.push(notification);
    } else {
      earlier.push(notification);
    }
  });

  const groups: NotificationGroup[] = [];

  if (today.length > 0) {
    groups.push({ title: 'Bugün', notifications: today });
  }
  if (thisWeek.length > 0) {
    groups.push({ title: 'Bu Hafta', notifications: thisWeek });
  }
  if (earlier.length > 0) {
    groups.push({ title: 'Daha Önce', notifications: earlier });
  }

  return groups;
}

/**
 * Format relative time string
 */
export function getRelativeTimeString(date: Date | string): string {
  const now = new Date();
  const notificationDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - notificationDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) {
    return 'Şimdi';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} dk önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays === 1) {
    return 'Dün';
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else {
    // Format as date
    return notificationDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  }
}
