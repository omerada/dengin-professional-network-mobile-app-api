// src/features/notifications/screens/NotificationsScreen.tsx
// Production-ready Notifications Screen with modern UI
// Backend: NotificationController API - GET /api/notifications
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { useCallback, useEffect, useState, memo } from 'react';
import { View, StyleSheet, ActivityIndicator, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { navigateToChat, navigateToPostDetail, navigateToUserProfile } from '@core/navigation';
import { spacing } from '@theme';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useSemanticHaptic } from '@shared/hooks';
import { UnifiedScreenHeader, ActionSheet } from '@shared/components';
import { showOperationError } from '@shared/utils';

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
  const toast = useToast();
  const { triggerNavigation, triggerSystem } = useSemanticHaptic();
  const { markAllAsRead, isPending: isMarkingAllAsRead } = useMarkAllAsRead();
  const { isPermissionGranted, requestPermission } = useNotificationPermission();
  const { unreadCount } = useUnreadCount();

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [showMarkAllReadConfirm, setShowMarkAllReadConfirm] = useState(false);

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
      triggerNavigation('navigate');
      const type = notification.type as NotificationType;
      const metadata = notification.metadata;

      // Use InteractionManager to ensure smooth animations
      // Defers navigation until current interactions complete
      InteractionManager.runAfterInteractions(() => {
        try {
          switch (type) {
            case 'NEW_MESSAGE':
              if (metadata?.conversationId) {
                navigateToChat(navigation as any, {
                  conversationId: Number(metadata.conversationId),
                });
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
              toast.show({
                message: notification.body || 'Detaylar için bildirime tıklayın.',
                type: 'info',
                duration: 5000,
              });
              break;

            default:
              if (notification.body) {
                toast.info(notification.body);
              }
              break;
          }
        } catch (error) {
          console.error('[NotificationsScreen] Navigation error:', error);
          showOperationError(
            toast,
            { trigger: triggerNavigation },
            'Bildirim açılırken bir hata oluştu.',
          );
        }
      });
    },
    [navigation, triggerNavigation],
  );

  /**
   * Mark all notifications as read with confirmation
   */
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) return;

    triggerSystem('alert');
    setShowMarkAllReadConfirm(true);
  }, [unreadCount, triggerSystem]);

  /**
   * Confirm mark all as read
   */
  const handleConfirmMarkAllRead = useCallback(() => {
    markAllAsRead();
    triggerSystem('success');
    setShowMarkAllReadConfirm(false);
    toast.success('Tüm bildirimler okundu işaretlendi');
  }, [markAllAsRead, triggerSystem, toast]);

  /**
   * Navigate to notification settings
   */
  const handleSettingsPress = useCallback(() => {
    triggerNavigation('navigate');
    navigation.navigate('NotificationSettings');
  }, [navigation, triggerNavigation]);

  /**
   * Go back to previous screen
   */
  const handleBack = useCallback(() => {
    triggerNavigation('back');
    navigation.goBack();
  }, [navigation, triggerNavigation]);

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
      {/* Unified Header */}
      <UnifiedScreenHeader
        variant="default"
        title="Bildirimler"
        subtitle={unreadCount > 0 ? `${unreadCount} okunmamış` : undefined}
        showBackButton={true}
        onBackPress={handleBack}
        rightElement={
          <View style={styles.headerActions}>
            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <View
                style={[styles.iconButton, { backgroundColor: colors.interactive.default + '15' }]}>
                {isMarkingAllAsRead ? (
                  <ActivityIndicator size="small" color={colors.interactive.default} />
                ) : (
                  <Icon
                    name="checkmark-done"
                    size={20}
                    color={colors.interactive.default}
                    onPress={handleMarkAllAsRead}
                  />
                )}
              </View>
            )}

            {/* Settings Button */}
            <View style={styles.iconButton}>
              <Icon
                name="settings-outline"
                size={22}
                color={colors.text.primary}
                onPress={handleSettingsPress}
              />
            </View>
          </View>
        }
      />

      {/* Notification List */}
      <NotificationList onNotificationPress={handleNotificationPress} />

      {/* Permission Prompt Modal */}
      <PermissionPrompt
        visible={showPermissionPrompt}
        onRequestPermission={handleRequestPermission}
        onDismiss={() => setShowPermissionPrompt(false)}
        permissionDenied={!isPermissionGranted}
      />

      {/* Mark All Read Confirmation ActionSheet */}
      <ActionSheet
        visible={showMarkAllReadConfirm}
        onClose={() => setShowMarkAllReadConfirm(false)}
        title="Tümünü Okundu İşaretle"
        message={`${unreadCount} okunmamış bildirim okundu olarak işaretlenecek.`}
        options={[
          {
            id: 'mark-read',
            label: 'Okundu İşaretle',
            onPress: handleConfirmMarkAllRead,
          },
          {
            id: 'cancel',
            label: 'İptal',
            onPress: () => setShowMarkAllReadConfirm(false),
          },
        ]}
      />
    </SafeAreaView>
  );
});

NotificationsScreen.displayName = 'NotificationsScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
