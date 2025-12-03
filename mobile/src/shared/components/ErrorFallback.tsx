// src/shared/components/ErrorFallback.tsx
// Error fallback component for error boundaries
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import type { ErrorFallbackProps } from '@utils/errorHandling';

export const ErrorFallback: React.FC<ErrorFallbackProps> = memo(
  ({ error, resetError }) => {
    const { theme } = useTheme();

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.error[50] },
            ]}
          >
            <Icon
              name="warning-outline"
              size={48}
              color={theme.colors.error[500]}
            />
          </View>

          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Bir Şeyler Yanlış Gitti
          </Text>

          <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
            Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </Text>

          {__DEV__ && (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.grey[100] }]}>
              <Text style={[styles.errorText, { color: theme.colors.error[700] }]}>
                {error.message}
              </Text>
            </View>
          )}

          <Pressable
            onPress={resetError}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.colors.primary[500] },
              pressed && styles.buttonPressed,
            ]}
          >
            <Icon name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
);

ErrorFallback.displayName = 'ErrorFallback';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorFallback;
