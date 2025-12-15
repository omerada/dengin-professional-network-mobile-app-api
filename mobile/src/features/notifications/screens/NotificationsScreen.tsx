// src/features/notifications/screens/NotificationsScreen.tsx
// Production-ready Notifications Screen with modern UI
// Backend: NotificationController API - GET /api/notifications
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { useCallback, useEffect, useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  navigateToChatFromTab,
  navigateToPostDetail,
  navigateToUserProfile,
} from '@core/navigation';
import { SCREEN_ANIMATIONS } from '@constants';
import { fontSize } from '@theme';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';

import { NotificationList } from '../components/NotificationList';
import { PermissionPrompt } from '../components/PermissionPrompt';
import { useMarkAllAsRead, useNotificationPermission, useUnreadCount } from '../hooks';
import type { NotificationResponse, NotificationType } from '../types';
import type { FeedStackParamList } from '@shared/types';

type NavigationProp = NativeStackNavigationProp<FeedStackParamList>;

/**
 * NotificationsScreen - Production-ready bildirimler ekranı
 *
 * Features:
 * - Infinite scroll pagination
 * - Pull-to-refresh
 * - Mark all as read
 * - Push notification permission handling
 * - Smart navigation based on notification type
 * - Haptic feedback
 * - Clean Material Design UI
 *
 * Backend Integration:
 * - GET /api/notifications (paginated)
 * - POST /api/notifications/mark-as-read
 * - GET /api/notifications/unread-count
 */
export const NotificationsScreen: React.FC = memo(() => {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();
  const { trigger } = useHaptic();
  const { markAllAsRead, isPending: isMarkingAllAsRead } = useMarkAllAsRead();
  const { isPermissionGranted, requestPermission } = useNotificationPermission();
  const { unreadCount } = useUnreadCount();

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Check permission on mount - Disabled in development (Expo Go)
  // Expo Go'da FCM çalışmadığı için izin popup'ı gösterilmiyor
  // Production EAS Build'de otomatik çalışacak
  useEffect(() => {
    // Only show permission prompt in production builds
    // __DEV__ is false in production/preview builds
    if (!isPermissionGranted && !__DEV__) {
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isPermissionGranted]);

  /**
   * Handle notification press - smart navigation based on type
   * Backend NotificationType enum ile uyumlu
   * Uses InteractionManager for smooth 300ms fade animations
   */
  const handleNotificationPress = useCallback(
    (notification: NotificationResponse) => {
      trigger('light');
      const type = notification.type as NotificationType;
      const metadata = notification.metadata;

      // Use InteractionManager to ensure smooth animations
      // Defers navigation until current interactions complete
      InteractionManager.runAfterInteractions(() => {
        try {
          switch (type) {
            case 'NEW_MESSAGE':
              if (metadata?.conversationId) {
                navigateToChatFromTab(navigation, metadata.conversationId);
              }
              break;

            case 'POST_LIKED':
            case 'POST_COMMENTED':
            case 'MENTION':
              if (metadata?.postId) {
                navigateToPostDetail(navigation, {
                  postId: Number(metadata.postId),
                });
              }
              break;

            case 'NEW_FOLLOWER':
              if (metadata?.actorId) {
                navigateToUserProfile(navigation, {
                  userId: Number(metadata.actorId),
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
              Alert.alert(
                notification.title || 'Bildirim',
                notification.body || 'Detaylar için bildirime tıklayın.',
                [{ text: 'Tamam' }],
              );
              break;

            default:
              if (notification.body) {
                Alert.alert(notification.title || 'Bildirim', notification.body, [
                  { text: 'Tamam' },
                ]);
              }
              break;
          }
        } catch (error) {
          console.error('[NotificationsScreen] Navigation error:', error);
          Alert.alert('Hata', 'Bildirim açılırken bir hata oluştu.');
        }
      });
    },
    [navigation, trigger],
  );

  /**
   * Mark all notifications as read with confirmation
   */
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) return;

    trigger('medium');
    Alert.alert(
      'Tümünü Okundu İşaretle',
      `${unreadCount} okunmamış bildirim okundu olarak işaretlenecek.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Okundu İşaretle',
          style: 'default',
          onPress: () => {
            markAllAsRead();
            trigger('success');
          },
        },
      ],
    );
  }, [unreadCount, markAllAsRead, trigger]);

  /**
   * Navigate to notification settings
   */
  const handleSettingsPress = useCallback(() => {
    trigger('light');
    navigation.navigate('NotificationSettings');
  }, [navigation, trigger]);

  /**
   * Go back to previous screen
   */
  const handleBack = useCallback(() => {
    trigger('light');
    navigation.goBack();
  }, [navigation, trigger]);

  /**
   * Handle permission request
   */
  const handleRequestPermission = useCallback(async () => {
    await requestPermission();
    setShowPermissionPrompt(false);
  }, [requestPermission]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
      {/* Modern Header with Back Button */}
      <Animated.View
        entering={SCREEN_ANIMATIONS.headerEnter}
        style={[styles.header, { borderBottomColor: colors.border.subtle }]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Bildirimler</Text>
            {unreadCount > 0 && (
              <Text style={[styles.headerSubtitle, { color: colors.text.tertiary }]}>
                {unreadCount} okunmamış
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              style={({ pressed }) => [
                styles.headerButton,
                { backgroundColor: colors.interactive.default + '15' },
                pressed && styles.headerButtonPressed,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {isMarkingAllAsRead ? (
                <ActivityIndicator size="small" color={colors.interactive.default} />
              ) : (
                <Icon name="checkmark-done" size={20} color={colors.interactive.default} />
              )}
            </Pressable>
          )}

          {/* Settings Button */}
          <Pressable
            onPress={handleSettingsPress}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="settings-outline" size={22} color={colors.text.primary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Notification List */}
      <NotificationList onNotificationPress={handleNotificationPress} />

      {/* Permission Prompt Modal */}
      <PermissionPrompt
        visible={showPermissionPrompt}
        onRequestPermission={handleRequestPermission}
        onDismiss={() => setShowPermissionPrompt(false)}
        permissionDenied={!isPermissionGranted}
      />
    </SafeAreaView>
  );
});

NotificationsScreen.displayName = 'NotificationsScreen';

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
