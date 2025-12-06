// src/features/notifications/components/EmptyNotifications.tsx
// Empty notifications state component
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';

export const EmptyNotifications: React.FC = memo(() => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.interactive.subtle }]}>
        <Icon name="notifications-outline" size={48} color={colors.interactive.default} />
      </View>

      <Text style={[styles.title, { color: colors.text.primary }]}>Bildirim Yok</Text>

      <Text style={[styles.description, { color: colors.text.secondary }]}>
        Henüz hiç bildiriminiz yok. Yeni etkileşimler olduğunda burada göreceksiniz.
      </Text>
    </View>
  );
});

EmptyNotifications.displayName = 'EmptyNotifications';

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
  },
});

export default EmptyNotifications;
