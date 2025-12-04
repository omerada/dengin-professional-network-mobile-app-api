// src/features/notifications/screens/NotificationSettingsScreen.tsx
// Notification settings management screen
// Backend: GET/PUT /api/notifications/preferences
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { NotificationSettingsToggle } from '../components/NotificationSettingsToggle';
import {
  useNotificationSettings,
  useNotificationPermission,
} from '../hooks';
import type { NotificationType } from '../types';

interface SettingsSection {
  title: string;
  items: {
    type: NotificationType;
    icon: string;
    title: string;
    description: string;
  }[];
}

export const NotificationSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { 
    preferences, 
    isLoading, 
    toggleNotifications,
    togglePush,
    toggleEmail,
    toggleTypeEnabled,
    setQuietHours,
    isSaving,
    isNotificationsEnabled,
    isPushEnabled,
    isEmailEnabled,
    inQuietHours,
  } = useNotificationSettings();
  const { isPermissionGranted, promptForPermission } = useNotificationPermission();

  const isSystemNotificationsDisabled = !isPermissionGranted;

  // Settings sections - Backend NotificationType enum ile uyumlu
  const sections: SettingsSection[] = useMemo(
    () => [
      {
        title: 'Mesajlar',
        items: [
          {
            type: 'NEW_MESSAGE',
            icon: 'chatbubble',
            title: 'Yeni Mesajlar',
            description: 'Biri size mesaj gönderdiğinde bildirim alın',
          },
        ],
      },
      {
        title: 'Etkileşimler',
        items: [
          {
            type: 'POST_LIKED',
            icon: 'heart',
            title: 'Beğeniler',
            description: 'Gönderileriniz beğenildiğinde bildirim alın',
          },
          {
            type: 'POST_COMMENTED',
            icon: 'chatbubble-ellipses',
            title: 'Yorumlar',
            description: 'Gönderilerinize yorum yapıldığında bildirim alın',
          },
          {
            type: 'MENTION',
            icon: 'at',
            title: 'Bahsetmeler',
            description: 'Birisi sizi etiketlediğinde bildirim alın',
          },
          {
            type: 'NEW_FOLLOWER',
            icon: 'person-add',
            title: 'Yeni Takipçiler',
            description: 'Biri sizi takip ettiğinde bildirim alın',
          },
        ],
      },
      {
        title: 'Doğrulama',
        items: [
          {
            type: 'VERIFICATION_APPROVED',
            icon: 'shield-checkmark',
            title: 'Doğrulama Onaylandı',
            description: 'Hesabınız doğrulandığında bildirim alın',
          },
          {
            type: 'VERIFICATION_REJECTED',
            icon: 'shield-half',
            title: 'Doğrulama Reddedildi',
            description: 'Doğrulama başvurunuz reddedildiğinde bildirim alın',
          },
        ],
      },
      {
        title: 'Sistem',
        items: [
          {
            type: 'WELCOME',
            icon: 'happy',
            title: 'Hoşgeldiniz',
            description: 'Hoşgeldiniz mesajları',
          },
        ],
      },
    ],
    []
  );

  // Get toggle value for a notification type
  const getTypeEnabled = useCallback((type: NotificationType): boolean => {
    return preferences.typeSettings?.[type]?.enabled ?? true;
  }, [preferences.typeSettings]);

  // Handle type toggle
  const handleTypeToggle = useCallback(
    (type: NotificationType, value: boolean) => {
      toggleTypeEnabled(type, value);
    },
    [toggleTypeEnabled]
  );

  // Handle master toggle
  const handleMasterToggle = useCallback(
    (value: boolean) => {
      if (!value) {
        Alert.alert(
          'Tüm Bildirimleri Kapat',
          'Tüm bildirimler kapatılacak. Devam etmek istiyor musunuz?',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Kapat',
              style: 'destructive',
              onPress: () => toggleNotifications(false),
            },
          ]
        );
      } else {
        toggleNotifications(true);
      }
    },
    [toggleNotifications]
  );

  // Handle enable notifications (system permission)
  const handleEnableNotifications = useCallback(() => {
    promptForPermission();
  }, [promptForPermission]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text.primary} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Bildirim Ayarları
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Warning */}
        {isSystemNotificationsDisabled && (
          <Pressable
            onPress={handleEnableNotifications}
            style={[
              styles.permissionWarning,
              { backgroundColor: theme.colors.warning[50] },
            ]}
          >
            <Icon
              name="warning"
              size={24}
              color={theme.colors.warning[500]}
              style={styles.warningIcon}
            />
            <View style={styles.warningContent}>
              <Text
                style={[
                  styles.warningTitle,
                  { color: theme.colors.warning[700] },
                ]}
              >
                Bildirimler Kapalı
              </Text>
              <Text
                style={[
                  styles.warningText,
                  { color: theme.colors.warning[600] },
                ]}
              >
                Bildirimleri almak için cihaz ayarlarından izin vermeniz gerekiyor.
              </Text>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={theme.colors.warning[500]}
            />
          </Pressable>
        )}

        {/* Quiet Hours Info */}
        {inQuietHours && (
          <View
            style={[
              styles.quietHoursInfo,
              { backgroundColor: theme.colors.info[50] },
            ]}
          >
            <Icon
              name="moon"
              size={20}
              color={theme.colors.info[500]}
              style={styles.warningIcon}
            />
            <Text style={[styles.quietHoursText, { color: theme.colors.info[700] }]}>
              Sessiz saatler aktif ({preferences.quietHoursStart} - {preferences.quietHoursEnd})
            </Text>
          </View>
        )}

        {/* Master Toggle */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <NotificationSettingsToggle
            icon="notifications"
            title="Bildirimleri Etkinleştir"
            description="Tüm bildirimleri açıp kapatın"
            value={isNotificationsEnabled}
            onValueChange={handleMasterToggle}
            disabled={isSystemNotificationsDisabled || isSaving}
          />
        </View>

        {/* Delivery Channel Toggles */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text.secondary },
          ]}
        >
          Bildirim Kanalları
        </Text>
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <NotificationSettingsToggle
            icon="phone-portrait"
            title="Push Bildirimleri"
            description="Mobil cihazınıza push bildirimleri gönderin"
            value={isPushEnabled}
            onValueChange={togglePush}
            disabled={!isNotificationsEnabled || isSystemNotificationsDisabled || isSaving}
          />
          <View
            style={[
              styles.separator,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <NotificationSettingsToggle
            icon="mail"
            title="E-posta Bildirimleri"
            description="Önemli güncellemeleri e-posta ile alın"
            value={isEmailEnabled}
            onValueChange={toggleEmail}
            disabled={!isNotificationsEnabled || isSaving}
          />
        </View>

        {/* Settings Sections by Type */}
        {sections.map((section) => (
          <View key={section.title}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text.secondary },
              ]}
            >
              {section.title}
            </Text>

            <View
              style={[
                styles.section,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              {section.items.map((item, index) => (
                <React.Fragment key={item.type}>
                  {index > 0 && (
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: theme.colors.border },
                      ]}
                    />
                  )}
                  <NotificationSettingsToggle
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    value={getTypeEnabled(item.type)}
                    onValueChange={(value) => handleTypeToggle(item.type, value)}
                    disabled={
                      isSystemNotificationsDisabled ||
                      !isNotificationsEnabled ||
                      isSaving
                    }
                  />
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Help Text */}
        <Text style={[styles.helpText, { color: theme.colors.text.secondary }]}>
          Bildirim tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Bazı önemli
          sistem bildirimleri kapatılamaz.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  quietHoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  quietHoursText: {
    fontSize: 14,
    flex: 1,
  },
  warningIcon: {
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    marginLeft: 68,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 24,
    marginHorizontal: 16,
    textAlign: 'center',
  },
});

export default NotificationSettingsScreen;
