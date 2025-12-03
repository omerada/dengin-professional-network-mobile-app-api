// src/features/feed/screens/FeedScreen.tsx
// Placeholder - will be implemented in Sprint 5-6
// Oku: mobile-development-guide/features/05-FEED-MODULE.md

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';

export const FeedScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Text style={{ color: theme.colors.text.primary }}>Feed Screen - Sprint 5-6'da implemente edilecek</Text>
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
