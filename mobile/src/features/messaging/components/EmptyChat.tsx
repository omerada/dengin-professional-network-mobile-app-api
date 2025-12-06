// src/features/messaging/components/EmptyChat.tsx
// Boş sohbet komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';

interface EmptyChatProps {
  userName?: string;
}

export const EmptyChat: React.FC<EmptyChatProps> = memo(({ userName }) => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.interactive.subtle }]}>
        <Icon name="chatbubble-ellipses-outline" size={40} color={colors.interactive.default} />
      </View>

      <Text style={[styles.title, { color: colors.text.primary }]}>Sohbete Başlayın</Text>

      <Text style={[styles.description, { color: colors.text.secondary }]}>
        {userName
          ? `${userName} ile ilk mesajınızı gönderin`
          : 'İlk mesajınızı göndererek sohbete başlayın'}
      </Text>
    </View>
  );
});

EmptyChat.displayName = 'EmptyChat';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    // Inverted FlatList için dönüştürme
    transform: [{ scaleY: -1 }],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyChat;
