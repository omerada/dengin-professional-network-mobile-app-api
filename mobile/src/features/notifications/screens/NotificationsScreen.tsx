// src/features/notifications/screens/NotificationsScreen.tsx
// Placeholder - will be implemented in Sprint 9-10
// Oku: mobile-development-guide/features/07-NOTIFICATIONS-MODULE.md

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';

export const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={{ color: theme.colors.text.primary }}>Bildirimler - Sprint 9-10'da implemente edilecek</Text>
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
