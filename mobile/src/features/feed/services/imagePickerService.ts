// src/features/feed/services/imagePickerService.ts
// Image picker servisi
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { launchImageLibrary, launchCamera, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
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
        }
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
      }
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
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Kamera İzni',
        message: 'Fotoğraf çekmek için kamera izni gereklidir.',
        buttonPositive: 'İzin Ver',
        buttonNegative: 'İptal',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    // Camera permission error
    return false;
  }
}

/**
 * Asset'i LocalImage'a çevir
 */
function assetToLocalImage(asset: Asset): LocalImage | null {
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
  const title = type === 'gallery' ? 'Galeri İzni Gerekli' : 'Kamera İzni Gerekli';
  const message = type === 'gallery'
    ? 'Galeri erişimi için izin vermeniz gerekmektedir.'
    : 'Fotoğraf çekmek için kamera iznine ihtiyacımız var.';

  Alert.alert(
    title,
    message,
    [
      { text: 'İptal', style: 'cancel' },
      { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
    ]
  );
}

/**
 * Image Picker Service
 */
export const imagePickerService = {
  /**
   * Galeriden görsel seç
   */
  async pickFromGallery(options: ImagePickerOptions): Promise<LocalImage[]> {
    const hasPermission = await requestGalleryPermission();
    
    if (!hasPermission) {
      showPermissionDeniedAlert('gallery');
      return [];
    }

    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: options.mediaType,
          selectionLimit: options.selectionLimit,
          quality: options.quality || 0.8,
          includeBase64: false,
          includeExtra: true,
        },
        (response: ImagePickerResponse) => {
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
            response.assets.forEach((asset: Asset) => {
              const localImage = assetToLocalImage(asset);
              if (localImage) {
                images.push(localImage);
              }
            });
          }

          resolve(images);
        }
      );
    });
  },

  /**
   * Kameradan fotoğraf çek
   */
  async captureFromCamera(): Promise<LocalImage | null> {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      showPermissionDeniedAlert('camera');
      return null;
    }

    return new Promise((resolve) => {
      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
          cameraType: 'back',
        },
        (response: ImagePickerResponse) => {
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
        }
      );
    });
  },

  /**
   * Maksimum görsel sayısını kontrol et
   */
  validateImageCount(currentCount: number, maxCount: number = 5): boolean {
    if (currentCount >= maxCount) {
      Alert.alert(
        'Limit Aşıldı',
        `En fazla ${maxCount} görsel ekleyebilirsiniz.`
      );
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
      Alert.alert(
        'Dosya Çok Büyük',
        `Görsel boyutu ${maxSizeMB}MB\'dan küçük olmalıdır.`
      );
      return false;
    }
    return true;
  },
};

export default imagePickerService;
