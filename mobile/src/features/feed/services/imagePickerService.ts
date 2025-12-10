// src/features/feed/services/imagePickerService.ts
// Image picker servisi - Expo Go compatible
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { LocalImage, ImagePickerOptions } from '../types';

/**
 * Galeri izni iste
 */
async function requestGalleryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    showPermissionDeniedAlert('gallery');
    return false;
  }
  return true;
}

/**
 * Kamera izni iste
 */
async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    showPermissionDeniedAlert('camera');
    return false;
  }
  return true;
}

/**
 * Expo ImagePicker Asset'i LocalImage'a çevir
 */
function assetToLocalImage(asset: ImagePicker.ImagePickerAsset): LocalImage {
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize || 0,
    type: asset.mimeType || 'image/jpeg',
  };
}

/**
 * İzin reddedildi uyarısı
 */
function showPermissionDeniedAlert(type: 'gallery' | 'camera'): void {
  const title = type === 'gallery' ? 'Galeri İzni Gerekli' : 'Kamera İzni Gerekli';
  const message =
    type === 'gallery'
      ? 'Galeri erişimi için izin vermeniz gerekmektedir.'
      : 'Fotoğraf çekmek için kamera iznine ihtiyacımız var.';

  Alert.alert(title, message, [
    { text: 'İptal', style: 'cancel' },
    { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
  ]);
}

/**
 * Image Picker Service - Expo compatible
 */
export const imagePickerService = {
  /**
   * Galeriden görsel seç
   */
  async pickFromGallery(options: ImagePickerOptions): Promise<LocalImage[]> {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      return [];
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: (options.selectionLimit || 1) > 1,
        quality: options.quality || 0.8,
        allowsEditing: false,
      });

      if (result.canceled) {
        return [];
      }

      return result.assets.map(assetToLocalImage);
    } catch (error) {
      console.error('[ImagePickerService] Gallery error:', error);
      return [];
    }
  },

  /**
   * Kameradan fotoğraf çek
   */
  async captureFromCamera(): Promise<LocalImage | null> {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return null;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      return assetToLocalImage(result.assets[0]);
    } catch (error) {
      console.error('[ImagePickerService] Camera error:', error);
      return null;
    }
  },

  /**
   * Maksimum görsel sayısını kontrol et
   */
  validateImageCount(currentCount: number, maxCount: number = 5): boolean {
    if (currentCount >= maxCount) {
      Alert.alert('Limit Aşıldı', `En fazla ${maxCount} görsel ekleyebilirsiniz.`);
      return false;
    }
    return true;
  },

  /**
   * Dosya boyutunu kontrol et (MB cinsinden)
   */
  validateFileSize(fileSize: number, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (fileSize > maxSizeBytes) {
      Alert.alert('Dosya Çok Büyük', `Görsel boyutu ${maxSizeMB}MB&apos;dan küçük olmalıdır.`);
      return false;
    }
    return true;
  },
};

export default imagePickerService;
