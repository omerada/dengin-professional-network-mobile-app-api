// src/features/notifications/components/EmptyNotifications.tsx
// Empty notifications state component - Using EmptyState preset
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo } from 'react';
import { UnifiedEmptyState } from '@shared/components';

/**
 * EmptyNotifications Component
 *
 * Shows empty state when user has no notifications.
 * Uses standardized EmptyState component with preset configuration.
 */
export const EmptyNotifications: React.FC = memo(() => {
  return (
    <UnifiedEmptyState
      icon="notifications-outline"
      title="Tüm Bildirimler Okundu"
      description="Yeni aktiviteler burada görünecek"
      testID="empty-notifications"
    />
  );
});

EmptyNotifications.displayName = 'EmptyNotifications';

export default EmptyNotifications;
