// src/features/messaging/components/EmptyConversations.tsx
// Boş konuşma listesi komponenti - EmptyState wrapper with preset
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo } from 'react';
import { EmptyState } from '@shared/components';
import { EMPTY_STATE_PRESETS } from '@constants/emptyStatePresets';

interface EmptyConversationsProps {
  onStartConversation?: () => void;
}

/**
 * EmptyConversations Component
 *
 * Shows empty state when user has no conversations.
 * Uses standardized EmptyState component with preset configuration.
 */
export const EmptyConversations: React.FC<EmptyConversationsProps> = memo(
  ({ onStartConversation }) => {
    const preset = EMPTY_STATE_PRESETS.emptyMessages;

    return (
      <EmptyState
        {...preset}
        action={
          onStartConversation
            ? {
                title: 'Yeni Konuşma',
                onPress: onStartConversation,
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

EmptyConversations.displayName = 'EmptyConversations';

export default EmptyConversations;
