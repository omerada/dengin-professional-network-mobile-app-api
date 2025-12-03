// src/features/verification/hooks/useCameraPermission.ts
// Kamera izni hook'u
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import { useState, useCallback, useEffect } from 'react';
import { Linking, Platform, Alert } from 'react-native';
import { cameraService, CameraPermissionStatus } from '../services/cameraService';

/**
 * Kamera izni hook sonucu
 */
interface CameraPermissionResult {
  hasPermission: boolean;
  status: CameraPermissionStatus;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  openSettings: () => void;
}

/**
 * Kamera izni hook'u
 */
export function useCameraPermission(): CameraPermissionResult {
  const [status, setStatus] = useState<CameraPermissionStatus>('not-determined');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * İzni kontrol et
   */
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const currentStatus = await cameraService.checkPermission();
        setStatus(currentStatus);
      } catch (error) {
        console.error('Permission check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, []);

  /**
   * İzin iste
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Android için özel izin kontrolü
      if (Platform.OS === 'android') {
        const granted = await cameraService.checkAndroidPermissions();
        if (granted) {
          setStatus('granted');
          return true;
        }
        setStatus('denied');
        return false;
      }

      // iOS için
      const newStatus = await cameraService.requestPermission();
      setStatus(newStatus);

      if (newStatus === 'denied') {
        Alert.alert(
          'Kamera İzni Gerekli',
          'Kamera izni vermek için ayarları açmak ister misiniz?',
          [
            { text: 'Hayır', style: 'cancel' },
            { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      return newStatus === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Ayarları aç
   */
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return {
    hasPermission: status === 'granted',
    status,
    isLoading,
    requestPermission,
    openSettings,
  };
}

export default useCameraPermission;
