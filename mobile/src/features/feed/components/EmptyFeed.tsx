// src/features/feed/components/EmptyFeed.tsx
// Boş feed komponenti
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';

interface EmptyFeedProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyFeed: React.FC<EmptyFeedProps> = memo(({
  title = 'Henüz gönderi yok',
  message = 'Takip ettiğiniz kişilerden gönderiler burada görünecek.',
  actionLabel,
  onAction,
  icon = 'newspaper-outline',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.primary[100] },
        ]}
      >
        <Icon
          name={icon}
          size={48}
          color={theme.colors.primary[500]}
        />
      </View>

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {title}
      </Text>

      <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
        {message}
      </Text>

      {actionLabel && onAction && (
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={onAction}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
});

EmptyFeed.displayName = 'EmptyFeed';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
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
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EmptyFeed;
