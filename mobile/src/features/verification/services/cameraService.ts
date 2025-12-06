// src/features/verification/services/cameraService.ts
// Kamera servisi - Vision Camera wrapper - Web compatible
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import { Platform, PermissionsAndroid } from 'react-native';
import type { CameraSettings, CapturedImage } from '../types';

// Tip tanımlamaları
export interface CameraDevice {
  id: string;
  position: 'front' | 'back';
  hasFlash: boolean;
  supportsPhotoHdr: boolean;
}

export interface PhotoFile {
  path: string;
  width: number;
  height: number;
}

/**
 * Kamera izin durumları
 */
export type CameraPermissionStatus = 'granted' | 'denied' | 'not-determined' | 'restricted';

// Native modülü dinamik olarak yükle
let Camera: any = null;

if (Platform.OS !== 'web') {
  try {
    Camera = require('react-native-vision-camera').Camera;
  } catch (e) {
    console.log('[CameraService] Native module not available');
  }
}

/**
 * Kamera servisi - Web compatible
 */
export const cameraService = {
  /**
   * Kamera iznini kontrol et
   */
  async checkPermission(): Promise<CameraPermissionStatus> {
    if (Platform.OS === 'web' || !Camera) {
      return 'not-determined';
    }
    const status = await Camera.getCameraPermissionStatus();
    return status as CameraPermissionStatus;
  },

  /**
   * Kamera izni iste
   */
  async requestPermission(): Promise<CameraPermissionStatus> {
    if (Platform.OS === 'web' || !Camera) {
      return 'denied';
    }
    const status = await Camera.requestCameraPermission();
    return status as CameraPermissionStatus;
  },

  /**
   * Mikrofon izni iste (video için)
   */
  async requestMicrophonePermission(): Promise<CameraPermissionStatus> {
    if (Platform.OS === 'web' || !Camera) {
      return 'denied';
    }
    const status = await Camera.requestMicrophonePermission();
    return status as CameraPermissionStatus;
  },

  /**
   * Android için özel izin kontrolü
   */
  async checkAndroidPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Kamera İzni',
        message: 'Kimlik doğrulama için kamera erişimine ihtiyacımız var.',
        buttonNeutral: 'Daha Sonra Sor',
        buttonNegative: 'İptal',
        buttonPositive: 'Tamam',
      });

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Android permission error:', err);
      return false;
    }
  },

  /**
   * Kullanılabilir kameraları getir
   */
  getAvailableDevices(): CameraDevice[] {
    if (Platform.OS === 'web' || !Camera) {
      return [];
    }
    return Camera.getAvailableCameraDevices();
  },

  /**
   * En iyi arka kamerayı getir
   */
  getBestBackCamera(): CameraDevice | undefined {
    const devices = this.getAvailableDevices();
    return (
      devices.find(
        device => device.position === 'back' && device.hasFlash && device.supportsPhotoHdr,
      ) || devices.find(device => device.position === 'back')
    );
  },

  /**
   * En iyi ön kamerayı getir
   */
  getBestFrontCamera(): CameraDevice | undefined {
    const devices = this.getAvailableDevices();
    return devices.find(device => device.position === 'front');
  },

  /**
   * Fotoğraf dosyasını CapturedImage'e dönüştür
   */
  photoToImage(photo: PhotoFile, type: 'front' | 'back' | 'selfie'): CapturedImage {
    return {
      uri: `file://${photo.path}`,
      path: photo.path,
      width: photo.width,
      height: photo.height,
      type,
      capturedAt: new Date().toISOString(),
    };
  },

  /**
   * Varsayılan kamera ayarları
   */
  getDefaultSettings(): CameraSettings {
    return {
      flash: 'auto',
      focus: 'auto',
      zoom: 1,
      position: 'back',
    };
  },

  /**
   * Flaş modunu döndür
   */
  toggleFlash(current: CameraSettings['flash']): CameraSettings['flash'] {
    const modes: CameraSettings['flash'][] = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(current);
    return modes[(currentIndex + 1) % modes.length];
  },

  /**
   * Kamera pozisyonunu değiştir
   */
  togglePosition(current: CameraSettings['position']): CameraSettings['position'] {
    return current === 'back' ? 'front' : 'back';
  },
};

export default cameraService;
