// src/features/messaging/components/EmptyConversations.tsx
// Boş konuşma listesi komponenti - EmptyState wrapper with preset
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo } from 'react';
import { UnifiedEmptyState } from '@shared/components';

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
    return (
      <UnifiedEmptyState
        icon="chatbubbles-outline"
        title="Henüz Mesajınız Yok"
        description="Profesyonellerle sohbet başlatın ve ağınızı genişletin"
        primaryAction={
          onStartConversation
            ? {
                label: 'Yeni Konuşma',
                icon: 'add-circle-outline',
                onPress: onStartConversation,
              }
            : undefined
        }
        testID="empty-conversations"
      />
    );
  },
);

EmptyConversations.displayName = 'EmptyConversations';

export default EmptyConversations;
