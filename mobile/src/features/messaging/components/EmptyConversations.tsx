// src/features/messaging/components/EmptyConversations.tsx
// Boş konuşma listesi komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';

interface EmptyConversationsProps {
  onStartConversation?: () => void;
}

export const EmptyConversations: React.FC<EmptyConversationsProps> = memo(
  ({ onStartConversation }) => {
    const colors = useColors();

    return (
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: colors.interactive.subtle }]}>
          <Icon name="chatbubbles-outline" size={48} color={colors.interactive.default} />
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>Henüz mesajınız yok</Text>

        <Text style={[styles.description, { color: colors.text.secondary }]}>
          Meslektaşlarınızla iletişime geçmek için yeni bir konuşma başlatın
        </Text>

        {onStartConversation && (
          <Pressable
            onPress={onStartConversation}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.interactive.default },
              pressed && styles.buttonPressed,
            ]}>
            <Icon name="add" size={20} color={colors.text.inverse} />
            <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Yeni Konuşma</Text>
          </Pressable>
        )}
      </View>
    );
  },
);

EmptyConversations.displayName = 'EmptyConversations';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyConversations;
