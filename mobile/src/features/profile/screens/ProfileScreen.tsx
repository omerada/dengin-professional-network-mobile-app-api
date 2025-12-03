// src/features/profile/screens/ProfileScreen.tsx
// Placeholder - will be implemented in Sprint 5-6
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores';
import { useLogout } from '@features/auth/hooks';
import { Button } from '@shared/components';
import { spacing } from '@theme';

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const user = useAuthStore(state => state.user);
  const { logout, isLoading } = useLogout();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Profil</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={{ color: theme.colors.text.primary, fontSize: 18, fontWeight: '600' }}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ color: theme.colors.text.secondary, marginTop: spacing.xs }}>
              {user.email}
            </Text>
          </View>
        )}

        <View style={styles.logoutContainer}>
          <Button
            title="Çıkış Yap"
            onPress={handleLogout}
            loading={isLoading}
            variant="danger"
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  userInfo: {
    marginBottom: spacing.xl,
  },
  logoutContainer: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
});
