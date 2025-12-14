// src/features/profile/screens/SettingsScreen.tsx
// Settings screen with organized sections
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { useMemo, useCallback, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HAPTIC_TYPES, SCREEN_ANIMATIONS } from '@constants';
import { useTheme, useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useHaptic } from '@shared/hooks/useHaptic';
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
  const { setThemeMode, themeMode, isDark } = useTheme();
  const colors = useColors();
  const { trigger } = useHaptic();
  const toast = useToast();
  const navigation = useNavigation();

  // Loading states
  const [loadingStates, _setLoadingStates] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    trigger(HAPTIC_TYPES.buttonPress);
    // Open help center or FAQ
    toast.info('Yardım merkezi yakında eklenecek.');
  }, [trigger, toast]);

  const handleContact = useCallback(() => {
    trigger(HAPTIC_TYPES.buttonPress);
    // Open contact support
    toast.info('İletişim: destek@dengin.app');
  }, [trigger, toast]);

  const handleDeleteAccount = useCallback(() => {
    trigger(HAPTIC_TYPES.warning);
    navigation.navigate('AccountDeletion' as never);
  }, [navigation, trigger]);

  // Cycle through theme modes: system → light → dark → system
  const handleThemeCycle = useCallback(() => {
    trigger(HAPTIC_TYPES.selection);
    const modes = ['system', 'light', 'dark'] as const;
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);

    // User feedback with toast
    const labels = { system: 'Sistem', light: 'Açık', dark: 'Koyu' };
    toast.success(`Tema: ${labels[nextMode]}`);
  }, [themeMode, setThemeMode, trigger, toast]);

  const handleRefresh = useCallback(() => {
    trigger(HAPTIC_TYPES.pullToRefresh);
    setIsRefreshing(true);
    // Simulate settings refresh (in real app, refetch user preferences)
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  }, [trigger]);

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
            id: 'themeMode',
            title: 'Tema',
            subtitle: `${themeMode === 'system' ? 'Sistem' : themeMode === 'light' ? 'Açık' : 'Koyu'}${themeMode === 'system' ? ` (${isDark ? 'Koyu' : 'Açık'})` : ''}`,
            icon:
              themeMode === 'system'
                ? 'phone-portrait-outline'
                : isDark
                  ? 'moon-outline'
                  : 'sunny-outline',
            type: 'navigation',
            onPress: handleThemeCycle,
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
      themeMode,
      isDark,
      handleThemeCycle,
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

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        tintColor={colors.interactive.default}
        colors={[colors.interactive.default]}
        progressBackgroundColor={colors.background.primary}
      />
    ),
    [isRefreshing, handleRefresh, colors],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.secondary }]}
      edges={['bottom']}>
      <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          {sections.map(section => (
            <SettingsSection
              key={section.title}
              title={section.title}
              items={section.items}
              loadingStates={loadingStates}
            />
          ))}
        </ScrollView>
      </Animated.View>
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
