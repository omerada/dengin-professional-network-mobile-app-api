// src/features/messaging/components/EmptyChat.tsx
// Boş sohbet komponenti - Migrated to UnifiedEmptyState
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { UnifiedEmptyState } from '@shared/components';

interface EmptyChatProps {
  userName?: string;
}

/**
 * EmptyChat Component
 * Migrated to UnifiedEmptyState for consistency
 */
export const EmptyChat: React.FC<EmptyChatProps> = memo(({ userName }) => {
  return (
    <View style={styles.container}>
      <UnifiedEmptyState
        icon="chatbubble-ellipses-outline"
        title="Sohbete Başlayın"
        description={
          userName
            ? `${userName} ile ilk mesajınızı gönderin`
            : 'İlk mesajınızı göndererek sohbete başlayın'
        }
      />
    </View>
  );
});

EmptyChat.displayName = 'EmptyChat';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Inverted FlatList için dönüştürme
    transform: [{ scaleY: -1 }],
  },
});

export default EmptyChat;
