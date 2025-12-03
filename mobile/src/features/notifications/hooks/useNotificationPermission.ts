// src/features/notifications/hooks/useNotificationPermission.ts
// Notification permission hook
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { fcmService } from '../services';
import { useNotificationStore } from '../stores';

/**
 * Bildirim izni hook'u
 */
export function useNotificationPermission() {
  const [isLoading, setIsLoading] = useState(false);
  const isPermissionGranted = useNotificationStore((state) => state.isPermissionGranted);
  const setPermissionGranted = useNotificationStore((state) => state.setPermissionGranted);
  const setFcmToken = useNotificationStore((state) => state.setFcmToken);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = useCallback(async () => {
    const granted = await fcmService.checkPermission();
    setPermissionGranted(granted);
    return granted;
  }, [setPermissionGranted]);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);

    try {
      const granted = await fcmService.requestPermission();
      setPermissionGranted(granted);

      if (granted) {
        // Get and save FCM token
        const token = await fcmService.getToken();
        if (token) {
          setFcmToken(token);
          await fcmService.sendTokenToServer(token);
        }
      }

      return granted;
    } catch (error) {
      console.error('[useNotificationPermission] Error requesting permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setPermissionGranted, setFcmToken]);

  const promptForPermission = useCallback(async () => {
    // First check current status
    const currentStatus = await checkPermission();

    if (currentStatus) {
      return true;
    }

    // Request permission
    const granted = await requestPermission();

    if (!granted) {
      // Show alert to open settings
      Alert.alert(
        'Bildirimler Kapalı',
        'Bildirim almak için ayarlardan bildirimleri açmanız gerekmektedir.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Ayarları Aç',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }

    return granted;
  }, [checkPermission, requestPermission]);

  const setupToken = useCallback(async () => {
    if (!isPermissionGranted) return;

    try {
      const token = await fcmService.getToken();
      if (token) {
        setFcmToken(token);
        await fcmService.sendTokenToServer(token);
      }

      // Setup token refresh listener
      fcmService.setupTokenRefreshListener((newToken) => {
        setFcmToken(newToken);
      });
    } catch (error) {
      console.error('[useNotificationPermission] Error setting up token:', error);
    }
  }, [isPermissionGranted, setFcmToken]);

  return {
    isPermissionGranted,
    isLoading,
    checkPermission,
    requestPermission,
    promptForPermission,
    setupToken,
  };
}

export default useNotificationPermission;
