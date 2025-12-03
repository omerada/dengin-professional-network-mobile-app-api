// src/features/notifications/screens/NotificationSettingsScreen.tsx
// Notification settings management screen
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
import type { NotificationSettings } from '../types';

interface SettingsSection {
  title: string;
  items: {
    key: keyof NotificationSettings;
    icon: string;
    title: string;
    description: string;
  }[];
}

export const NotificationSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { settings, isLoading, updateSettings, isUpdating } = useNotificationSettings();
  const { permissionStatus, requestPermission } = useNotificationPermission();

  const isNotificationsDisabled = permissionStatus !== 'granted';

  // Settings sections
  const sections: SettingsSection[] = useMemo(
    () => [
      {
        title: 'Mesajlar',
        items: [
          {
            key: 'messages',
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
            key: 'likes',
            icon: 'heart',
            title: 'Beğeniler',
            description: 'Gönderileriniz beğenildiğinde bildirim alın',
          },
          {
            key: 'comments',
            icon: 'chatbubble-ellipses',
            title: 'Yorumlar',
            description: 'Gönderilerinize yorum yapıldığında bildirim alın',
          },
          {
            key: 'follows',
            icon: 'person-add',
            title: 'Yeni Takipçiler',
            description: 'Biri sizi takip ettiğinde bildirim alın',
          },
        ],
      },
      {
        title: 'Sistem',
        items: [
          {
            key: 'verification',
            icon: 'checkmark-circle',
            title: 'Doğrulama Güncellemeleri',
            description: 'Doğrulama durumunuz değiştiğinde bildirim alın',
          },
          {
            key: 'system',
            icon: 'information-circle',
            title: 'Sistem Bildirimleri',
            description: 'Önemli duyurular ve güncellemeler',
          },
        ],
      },
    ],
    []
  );

  // Handle toggle change
  const handleToggle = useCallback(
    (key: keyof NotificationSettings, value: boolean) => {
      if (!settings) return;

      updateSettings({ [key]: value });
    },
    [settings, updateSettings]
  );

  // Handle master toggle
  const handleMasterToggle = useCallback(
    (value: boolean) => {
      if (!settings) return;

      if (!value) {
        // Turning off all notifications
        Alert.alert(
          'Tüm Bildirimleri Kapat',
          'Tüm bildirim kategorileri kapatılacak. Devam etmek istiyor musunuz?',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Kapat',
              style: 'destructive',
              onPress: () => {
                updateSettings({
                  enabled: false,
                  messages: false,
                  likes: false,
                  comments: false,
                  follows: false,
                  verification: false,
                  system: false,
                });
              },
            },
          ]
        );
      } else {
        // Turning on - restore default settings
        updateSettings({
          enabled: true,
          messages: true,
          likes: true,
          comments: true,
          follows: true,
          verification: true,
          system: true,
        });
      }
    },
    [settings, updateSettings]
  );

  // Handle enable notifications (system permission)
  const handleEnableNotifications = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

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
        {isNotificationsDisabled && (
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
            value={settings?.enabled ?? true}
            onValueChange={handleMasterToggle}
            disabled={isNotificationsDisabled || isUpdating}
          />
        </View>

        {/* Settings Sections */}
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
                <React.Fragment key={item.key}>
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
                    value={settings?.[item.key] ?? true}
                    onValueChange={(value) => handleToggle(item.key, value)}
                    disabled={
                      isNotificationsDisabled ||
                      !settings?.enabled ||
                      isUpdating
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
