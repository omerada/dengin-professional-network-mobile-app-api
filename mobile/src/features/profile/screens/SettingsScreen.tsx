// src/features/profile/screens/SettingsScreen.tsx
// Settings screen with organized sections
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { useMemo, useCallback, useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { SettingsSection } from '../components';
import type { SettingsSectionType } from '../types';

/**
 * SettingsScreen
 *
 * Organized settings in sections:
 * - Account (profile, password, biometric)
 * - Notifications
 * - Privacy & Security
 * - Support
 * - Danger Zone (delete account)
 */
export const SettingsScreen: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();
  const colors = useColors();
  const navigation = useNavigation();

  // Loading states
  const [loadingStates, _setLoadingStates] = useState<Record<string, boolean>>({});

  // Handlers
  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile' as never);
  }, [navigation]);

  const handleChangePassword = useCallback(() => {
    navigation.navigate('ChangePassword' as never);
  }, [navigation]);

  const handleBiometric = useCallback(() => {
    navigation.navigate('BiometricSettings' as never);
  }, [navigation]);

  const handleNotificationSettings = useCallback(() => {
    navigation.navigate('NotificationSettings' as never);
  }, [navigation]);

  const handlePrivacySettings = useCallback(() => {
    navigation.navigate('PrivacySettings' as never);
  }, [navigation]);

  const handleBlockedUsers = useCallback(() => {
    navigation.navigate('BlockedUsers' as never);
  }, [navigation]);

  const handleHelp = useCallback(() => {
    // Open help center or FAQ
    Alert.alert('Yardım', 'Yardım merkezi yakında eklenecek.');
  }, []);

  const handleContact = useCallback(() => {
    // Open contact support
    Alert.alert('İletişim', 'destek@dengin.app');
  }, []);

  const handleDeleteAccount = useCallback(() => {
    navigation.navigate('AccountDeletion' as never);
  }, [navigation]);

  // Settings sections
  const sections: SettingsSectionType[] = useMemo(
    () => [
      {
        title: 'Hesap',
        items: [
          {
            id: 'editProfile',
            title: 'Profili Düzenle',
            subtitle: 'Ad, soyad, bio ve fotoğraf',
            icon: 'person-outline',
            type: 'navigation',
            onPress: handleEditProfile,
          },
          {
            id: 'changePassword',
            title: 'Şifre Değiştir',
            icon: 'lock-closed-outline',
            type: 'navigation',
            onPress: handleChangePassword,
          },
          {
            id: 'biometric',
            title: 'Biyometrik Giriş',
            subtitle: 'Face ID / Touch ID',
            icon: 'finger-print-outline',
            type: 'navigation',
            onPress: handleBiometric,
          },
        ],
      },
      {
        title: 'Bildirimler',
        items: [
          {
            id: 'notifications',
            title: 'Bildirim Ayarları',
            subtitle: 'Push bildirimleri ve e-posta',
            icon: 'notifications-outline',
            type: 'navigation',
            onPress: handleNotificationSettings,
          },
        ],
      },
      {
        title: 'Gizlilik ve Güvenlik',
        items: [
          {
            id: 'privacy',
            title: 'Gizlilik Ayarları',
            subtitle: 'Profil görünürlüğü',
            icon: 'shield-outline',
            type: 'navigation',
            onPress: handlePrivacySettings,
          },
          {
            id: 'blockedUsers',
            title: 'Engellenen Kullanıcılar',
            icon: 'ban-outline',
            type: 'navigation',
            onPress: handleBlockedUsers,
          },
        ],
      },
      {
        title: 'Görünüm',
        items: [
          {
            id: 'darkMode',
            title: 'Karanlık Mod',
            icon: 'moon-outline',
            type: 'toggle',
            value: isDark,
            onToggle: toggleTheme,
          },
        ],
      },
      {
        title: 'Destek',
        items: [
          {
            id: 'help',
            title: 'Yardım Merkezi',
            icon: 'help-circle-outline',
            type: 'navigation',
            onPress: handleHelp,
          },
          {
            id: 'contact',
            title: 'Bize Ulaşın',
            icon: 'mail-outline',
            type: 'navigation',
            onPress: handleContact,
          },
        ],
      },
      {
        title: 'Tehlikeli Bölge',
        items: [
          {
            id: 'deleteAccount',
            title: 'Hesabı Sil',
            subtitle: 'Bu işlem geri alınamaz',
            icon: 'trash-outline',
            type: 'danger',
            onPress: handleDeleteAccount,
          },
        ],
      },
    ],
    [
      isDark,
      toggleTheme,
      handleEditProfile,
      handleChangePassword,
      handleBiometric,
      handleNotificationSettings,
      handlePrivacySettings,
      handleBlockedUsers,
      handleHelp,
      handleContact,
      handleDeleteAccount,
    ],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.secondary }]}
      edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sections.map(section => (
          <SettingsSection
            key={section.title}
            title={section.title}
            items={section.items}
            loadingStates={loadingStates}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
  },
});
