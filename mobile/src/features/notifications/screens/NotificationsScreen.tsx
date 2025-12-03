// src/features/notifications/screens/NotificationsScreen.tsx
// Notifications screen with list and actions
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@contexts/ThemeContext';
import { NotificationList } from '../components/NotificationList';
import { PermissionPrompt } from '../components/PermissionPrompt';
import {
  useNotificationActions,
  useNotificationPermission,
} from '../hooks';
import { useNotificationStore } from '../stores';
import { NotificationType } from '../types';
import type { NotificationData } from '../types';
import type { RootStackParamList } from '@navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { markAllAsRead, isMarkingAllAsRead } = useNotificationActions();
  const { permissionStatus, requestPermission, isRequesting } =
    useNotificationPermission();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Check permission on mount
  useEffect(() => {
    if (permissionStatus === 'denied' || permissionStatus === 'not-determined') {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [permissionStatus]);

  // Handle notification press - navigate to relevant screen
  const handleNotificationPress = useCallback(
    (notification: NotificationData) => {
      switch (notification.type) {
        case NotificationType.MESSAGE:
          if (notification.referenceId) {
            navigation.navigate('Chat', {
              conversationId: notification.referenceId,
            });
          }
          break;

        case NotificationType.POST_LIKE:
        case NotificationType.POST_COMMENT:
        case NotificationType.COMMENT_REPLY:
          if (notification.referenceId) {
            navigation.navigate('PostDetail', {
              postId: notification.referenceId,
            });
          }
          break;

        case NotificationType.FOLLOW:
          if (notification.senderId) {
            navigation.navigate('Profile', {
              userId: notification.senderId,
            });
          }
          break;

        case NotificationType.VERIFICATION_UPDATE:
          navigation.navigate('VerificationStatus');
          break;

        case NotificationType.SYSTEM:
          // System notifications might have deep links
          if (notification.data?.deepLink) {
            // Handle deep link
          }
          break;
      }
    },
    [navigation]
  );

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) return;

    Alert.alert(
      'Tümünü Okundu Olarak İşaretle',
      'Tüm bildirimler okundu olarak işaretlenecek. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => markAllAsRead(),
        },
      ]
    );
  }, [unreadCount, markAllAsRead]);

  // Handle settings navigation
  const handleSettingsPress = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    await requestPermission();
    setShowPermissionPrompt(false);
  }, [requestPermission]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Bildirimler
        </Text>

        <View style={styles.headerActions}>
          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              {isMarkingAllAsRead ? (
                <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              ) : (
                <Icon
                  name="checkmark-done"
                  size={24}
                  color={theme.colors.primary[500]}
                />
              )}
            </Pressable>
          )}

          {/* Settings Button */}
          <Pressable
            onPress={handleSettingsPress}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
          >
            <Icon
              name="settings-outline"
              size={24}
              color={theme.colors.text.primary}
            />
          </Pressable>
        </View>
      </View>

      {/* Notification List */}
      <NotificationList onNotificationPress={handleNotificationPress} />

      {/* Permission Prompt */}
      <PermissionPrompt
        visible={showPermissionPrompt}
        onRequestPermission={handleRequestPermission}
        onDismiss={() => setShowPermissionPrompt(false)}
        permissionDenied={permissionStatus === 'denied'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
});
