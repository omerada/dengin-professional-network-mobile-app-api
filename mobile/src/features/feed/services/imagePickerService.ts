// src/features/feed/services/imagePickerService.ts
// Image picker servisi
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import type { LocalImage, ImagePickerOptions } from '../types';

/**
 * Galeri izni iste (Android)
 */
async function requestGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    // Android 13+ için READ_MEDIA_IMAGES
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Galeri İzni',
          message: 'Görsellere erişmek için galeri izni gereklidir.',
          buttonPositive: 'İzin Ver',
          buttonNegative: 'İptal',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // Android 12 ve altı için READ_EXTERNAL_STORAGE
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Galeri İzni',
        message: 'Görsellere erişmek için galeri izni gereklidir.',
        buttonPositive: 'İzin Ver',
        buttonNegative: 'İptal',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    // Gallery permission error
    return false;
  }
}

/**
 * Kamera izni iste (Android)
 */
async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Kamera İzni',
      message: 'Fotoğraf çekmek için kamera izni gereklidir.',
      buttonPositive: 'İzin Ver',
      buttonNegative: 'İptal',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    // Camera permission error
    return false;
  }
}

/**
 * Asset'i LocalImage'a çevir
 */
function assetToLocalImage(asset: any): LocalImage | null {
  if (!asset.uri) {
    return null;
  }

  return {
    uri: asset.uri,
    width: asset.width || 0,
    height: asset.height || 0,
    fileSize: asset.fileSize || 0,
    type: asset.type || 'image/jpeg',
  };
}

/**
 * İzin reddedildi uyarısı
 */
function showPermissionDeniedAlert(type: 'gallery' | 'camera'): void {
  if (Platform.OS === 'web') return;

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
 * Web için file input kullanarak görsel seç
 */
async function pickFromGalleryWeb(options: ImagePickerOptions): Promise<LocalImage[]> {
  return new Promise(resolve => {
    if (typeof document === 'undefined') {
      resolve([]);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = (options.selectionLimit || 1) > 1;

    input.onchange = (event: any) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        resolve([]);
        return;
      }

      const images: LocalImage[] = [];
      const limit = Math.min(files.length, options.selectionLimit || 5);

      for (let i = 0; i < limit; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        images.push({
          uri: url,
          width: 0,
          height: 0,
          fileSize: file.size,
          type: file.type,
        });
      }

      resolve(images);
    };

    input.click();
  });
}

/**
 * Image Picker Service - Web compatible
 */
export const imagePickerService = {
  /**
   * Galeriden görsel seç
   */
  async pickFromGallery(options: ImagePickerOptions): Promise<LocalImage[]> {
    // Web için file input kullan
    if (Platform.OS === 'web') {
      return pickFromGalleryWeb(options);
    }

    // Native modül yoksa boş dön
    if (!launchImageLibrary) {
      console.log('[ImagePickerService] launchImageLibrary not available');
      return [];
    }

    const hasPermission = await requestGalleryPermission();

    if (!hasPermission) {
      showPermissionDeniedAlert('gallery');
      return [];
    }

    return new Promise(resolve => {
      launchImageLibrary(
        {
          mediaType: options.mediaType,
          selectionLimit: options.selectionLimit,
          quality: (options.quality || 0.8) as
            | 0.1
            | 0.2
            | 0.3
            | 0.4
            | 0.5
            | 0.6
            | 0.7
            | 0.8
            | 0.9
            | 1,
          includeBase64: false,
          includeExtra: true,
        },
        (response: any) => {
          if (response.didCancel) {
            resolve([]);
            return;
          }

          if (response.errorCode) {
            // Image picker error
            resolve([]);
            return;
          }

          const images: LocalImage[] = [];

          if (response.assets) {
            response.assets.forEach((asset: any) => {
              const localImage = assetToLocalImage(asset);
              if (localImage) {
                images.push(localImage);
              }
            });
          }

          resolve(images);
        },
      );
    });
  },

  /**
   * Kameradan fotoğraf çek
   */
  async captureFromCamera(): Promise<LocalImage | null> {
    // Web'de kamera desteklenmez (şimdilik)
    if (Platform.OS === 'web') {
      console.log('[ImagePickerService] Camera not supported on web');
      return null;
    }

    // Native modül yoksa null dön
    if (!launchCamera) {
      console.log('[ImagePickerService] launchCamera not available');
      return null;
    }

    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      showPermissionDeniedAlert('camera');
      return null;
    }

    return new Promise(resolve => {
      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
          cameraType: 'back',
        },
        (response: any) => {
          if (response.didCancel) {
            resolve(null);
            return;
          }

          if (response.errorCode) {
            // Camera error
            resolve(null);
            return;
          }

          if (response.assets && response.assets[0]) {
            resolve(assetToLocalImage(response.assets[0]));
          } else {
            resolve(null);
          }
        },
      );
    });
  },

  /**
   * Maksimum görsel sayısını kontrol et
   */
  validateImageCount(currentCount: number, maxCount: number = 5): boolean {
    if (currentCount >= maxCount) {
      if (Platform.OS !== 'web') {
        Alert.alert('Limit Aşıldı', `En fazla ${maxCount} görsel ekleyebilirsiniz.`);
      }
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
      if (Platform.OS !== 'web') {
        Alert.alert('Dosya Çok Büyük', `Görsel boyutu ${maxSizeMB}MB\'dan küçük olmalıdır.`);
      }
      return false;
    }
    return true;
  },
};

export default imagePickerService;
