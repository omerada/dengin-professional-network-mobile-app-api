// src/features/messaging/screens/ConversationListScreen.tsx
// Placeholder - will be implemented in Sprint 7-8
// Oku: mobile-development-guide/features/06-MESSAGING-MODULE.md

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';

export const ConversationListScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={{ color: theme.colors.text.primary }}>Mesajlar - Sprint 7-8'de implemente edilecek</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
