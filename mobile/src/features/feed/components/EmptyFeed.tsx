// src/features/feed/components/EmptyFeed.tsx
// Boş feed komponenti - EmptyState wrapper with presets
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo } from 'react';
import { EmptyState } from '@shared/components';
import { EMPTY_STATE_PRESETS } from '@constants/emptyStatePresets';

interface EmptyFeedProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

/**
 * EmptyFeed Component
 *
 * Wrapper around EmptyState with feed-specific preset.
 * Maintains backwards compatibility while using new design system.
 */
export const EmptyFeed: React.FC<EmptyFeedProps> = memo(
  ({ title, message, actionLabel, onAction, icon }) => {
    // Use preset with optional overrides
    const preset = EMPTY_STATE_PRESETS.emptyFeed;

    return (
      <EmptyState
        icon={icon || preset.icon}
        title={title || preset.title}
        description={message || preset.description}
        action={
          actionLabel && onAction
            ? {
                title: actionLabel,
                onPress: onAction,
                variant: 'primary',
              }
            : undefined
        }
        floatingIcon
        animated
      />
    );
  },
);

EmptyFeed.displayName = 'EmptyFeed';

export default EmptyFeed;
