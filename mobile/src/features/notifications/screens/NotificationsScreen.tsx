// src/features/notifications/screens/NotificationsScreen.tsx
// Notifications screen with list and actions
// Backend: NotificationController API
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { NotificationList } from '../components/NotificationList';
import { PermissionPrompt } from '../components/PermissionPrompt';
import { useMarkAllAsRead, useNotificationPermission, useUnreadCount } from '../hooks';
import type { NotificationResponse, NotificationType } from '../types';
import type { RootStackParamList } from '@core/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const NotificationsScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();
  const { markAllAsRead, isPending: isMarkingAllAsRead } = useMarkAllAsRead();
  const { isPermissionGranted, promptForPermission } = useNotificationPermission();
  const { unreadCount } = useUnreadCount();

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Check permission on mount
  useEffect(() => {
    if (!isPermissionGranted) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isPermissionGranted]);

  // Handle notification press - navigate based on type and actionUrl
  const handleNotificationPress = useCallback(
    (notification: NotificationResponse) => {
      const type = notification.type as NotificationType;
      const metadata = notification.metadata;

      switch (type) {
        case 'NEW_MESSAGE':
          if (metadata?.conversationId) {
            navigation.navigate('Chat', {
              conversationId: metadata.conversationId,
            });
          }
          break;

        case 'POST_LIKED':
        case 'POST_COMMENTED':
        case 'MENTION':
          if (metadata?.postId) {
            navigation.navigate('PostDetail', {
              postId: metadata.postId,
            });
          }
          break;

        case 'NEW_FOLLOWER':
          if (metadata?.actorId) {
            navigation.navigate('Profile', {
              userId: metadata.actorId,
            });
          }
          break;

        case 'VERIFICATION_APPROVED':
        case 'VERIFICATION_REJECTED':
        case 'VERIFICATION_PENDING_REVIEW':
          navigation.navigate('VerificationStatus');
          break;

        case 'POST_FLAGGED':
        case 'CONTENT_REMOVED':
        case 'WARNING_ISSUED':
          // Moderation notifications - show details
          if (notification.actionUrl) {
            // Parse and navigate to actionUrl
          }
          break;

        default:
          // Use actionUrl if available
          if (notification.actionUrl) {
            // Handle deep link navigation
          }
          break;
      }
    },
    [navigation],
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
      ],
    );
  }, [unreadCount, markAllAsRead]);

  // Handle settings navigation
  const handleSettingsPress = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    await promptForPermission();
    setShowPermissionPrompt(false);
  }, [promptForPermission]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Bildirimler</Text>

        <View style={styles.headerActions}>
          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}>
              {isMarkingAllAsRead ? (
                <ActivityIndicator size="small" color={colors.interactive.default} />
              ) : (
                <Icon name="checkmark-done" size={24} color={colors.interactive.default} />
              )}
            </Pressable>
          )}

          {/* Settings Button */}
          <Pressable
            onPress={handleSettingsPress}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}>
            <Icon name="settings-outline" size={24} color={colors.text.primary} />
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
        permissionDenied={!isPermissionGranted}
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
