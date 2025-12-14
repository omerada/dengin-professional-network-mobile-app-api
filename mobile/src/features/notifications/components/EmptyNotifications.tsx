// src/features/notifications/components/EmptyNotifications.tsx
// Empty notifications state component - Using EmptyState preset
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo } from 'react';
import { EmptyState } from '@shared/components';
import { EMPTY_STATE_PRESETS } from '@constants/emptyStatePresets';

/**
 * EmptyNotifications Component
 *
 * Shows empty state when user has no notifications.
 * Uses standardized EmptyState component with preset configuration.
 */
export const EmptyNotifications: React.FC = memo(() => {
  const preset = EMPTY_STATE_PRESETS.emptyNotifications;

  return (
    <EmptyState
      icon={preset.icon}
      title={preset.title}
      description={preset.description}
      floatingIcon
      animated
    />
  );
});

EmptyNotifications.displayName = 'EmptyNotifications';

export default EmptyNotifications;
