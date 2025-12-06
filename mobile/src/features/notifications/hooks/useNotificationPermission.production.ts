// src/features/notifications/hooks/useNotificationPermission.production.ts
// Production-ready notification permission hook using Expo Notifications

import { useState, useCallback, useEffect } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { expoNotificationService } from '../services/expoNotificationService';
import { useNotificationStore } from '../stores';

/**
 * Production notification permission hook
 * Manages notification permissions and token registration
 */
export function useNotificationPermission() {
  const [isLoading, setIsLoading] = useState(false);
  const isPermissionGranted = useNotificationStore((state) => state.isPermissionGranted);
  const setPermissionGranted = useNotificationStore((state) => state.setPermissionGranted);
  const setFcmToken = useNotificationStore((state) => state.setFcmToken);

  /**
   * Check current permission status
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await expoNotificationService.checkPermissions();
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
      const granted = await expoNotificationService.requestPermissions();
      setPermissionGranted(granted);

      if (granted) {
        // Get and register token
        const token = await expoNotificationService.getExpoPushToken();
        if (token) {
          setFcmToken(token);
          await expoNotificationService.registerWithBackend(token);
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

  /**
   * Request permission with user-friendly prompts
   */
  const requestWithPrompt = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermission();

    if (!granted) {
      Alert.alert(
        'Bildirim İzni Gerekli',
        'Mesaj ve eşleşme bildirimlerini almak için bildirim iznine ihtiyacımız var.',
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Ayarlara Git',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ],
      );
    }

    return granted;
  }, [requestPermission]);

  /**
   * Initialize permissions on mount
   */
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  /**
   * Setup token if permission is granted
   */
  useEffect(() => {
    if (isPermissionGranted) {
      expoNotificationService.getExpoPushToken().then((token) => {
        if (token) {
          setFcmToken(token);
        }
      });
    }
  }, [isPermissionGranted, setFcmToken]);

  return {
    isPermissionGranted,
    isLoading,
    checkPermission,
    requestPermission,
    requestWithPrompt,
  };
}

export default useNotificationPermission;
