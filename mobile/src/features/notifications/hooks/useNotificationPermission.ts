// src/features/notifications/hooks/useNotificationPermission.ts
// Production-ready notification permission hook using Firebase Cloud Messaging

import { useState, useCallback, useEffect } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { fcmService } from '../services/fcmService.production';
import { useNotificationStore } from '../stores';

/**
 * Production notification permission hook
 * Manages FCM notification permissions and token registration
 */
export function useNotificationPermission() {
  const [isLoading, setIsLoading] = useState(false);
  const isPermissionGranted = useNotificationStore(state => state.isPermissionGranted);
  const setPermissionGranted = useNotificationStore(state => state.setPermissionGranted);
  const setFcmToken = useNotificationStore(state => state.setFcmToken);

  /**
   * Check current permission status
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await fcmService.checkPermission();
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('[useNotificationPermission] Error checking permission:', error);
      return false;
    }
  }, [setPermissionGranted]);

  /**
   * Request notification permissions
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      const granted = await fcmService.requestPermission();
      setPermissionGranted(granted);

      if (granted) {
        // Get and register FCM token
        const token = await fcmService.getToken();
        if (token) {
          setFcmToken(token);
          await fcmService.sendTokenToServer(token);
        }
      } else {
        // Show alert to open settings
        Alert.alert(
          'Bildirimler Kapalı',
          'Bildirimleri almak için lütfen ayarlardan bildirimlere izin verin.',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Ayarlara Git',
              onPress: () => openSettings(),
            },
          ],
        );
      }

      return granted;
    } catch (error) {
      console.error('[useNotificationPermission] Error requesting permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setPermissionGranted, setFcmToken]);

  /**
   * Open device settings
   */
  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  /**
   * Check permission on mount
   */
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    isLoading,
    isPermissionGranted,
    requestPermission,
    checkPermission,
    openSettings,
  };
}
