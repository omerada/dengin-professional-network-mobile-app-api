// src/features/verification/screens/SelfieCaptureScreen.tsx
// Selfie yakalama ekranı
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  PhotoFile,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
import { Button, Loading } from '@shared/components';
import { useVerificationStore } from '../stores';
import { cameraService, imageProcessor } from '../services';
import { SelfieGuide, CaptureButton, CameraControls } from '../components';
import type { CameraSettings, CapturedImage } from '../types';
import type { VerificationStackParamList } from '@shared/types/navigation.types';

type NavigationProp = NativeStackNavigationProp<VerificationStackParamList, 'SelfieCapture'>;

/**
 * Selfie yakalama ekranı
 */
export const SelfieCaptureScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [settings, setSettings] = useState<CameraSettings>({
    ...cameraService.getDefaultSettings(),
    position: 'front',
    flash: 'off', // Ön kamerada flaş genellikle kapalı
  });

  const { setSelfie, setStep } = useVerificationStore();

  /**
   * İzin kontrolü
   */
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  /**
   * Simüle yüz tespiti
   * Not: Gerçek uygulamada ML Kit veya Vision Camera frame processor kullanılmalı
   */
  useEffect(() => {
    // Simüle: 2 saniye sonra yüz tespit edilmiş gibi davran
    const timer = setTimeout(() => {
      setFaceDetected(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Ayar değişikliği
   */
  const handleSettingsChange = useCallback((newSettings: Partial<CameraSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Fotoğraf çek
   */
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    if (!faceDetected) {
      Alert.alert(
        'Yüz Tespit Edilemedi',
        'Lütfen yüzünüzü çerçeve içine yerleştirin ve tekrar deneyin.',
        [{ text: 'Tamam' }],
      );
      return;
    }

    try {
      setIsCapturing(true);

      // Fotoğraf çek
      const photo: PhotoFile = await cameraRef.current.takePhoto({
        flash: settings.flash,
        qualityPrioritization: 'quality',
      });

      // Görüntüyü işle
      const compressedImage = await imageProcessor.compress(`file://${photo.path}`);

      // Görüntüyü doğrula
      const validation = await imageProcessor.validate(compressedImage.uri);

      if (!validation.isValid) {
        const errorMessages = validation.errors
          .map(err => imageProcessor.getErrorMessage(err))
          .join('\n');

        Alert.alert('Görüntü Kalitesi Düşük', errorMessages + '\n\nLütfen tekrar deneyin.', [
          { text: 'Tamam' },
        ]);
        setIsCapturing(false);
        return;
      }

      // Görüntüyü kaydet
      const capturedImage: CapturedImage = {
        ...compressedImage,
        type: 'selfie',
      };

      setSelfie(capturedImage);
      setStep('review');
      navigation.navigate('VerificationReview');
    } catch (error) {
      console.error('Selfie capture error:', error);
      Alert.alert('Hata', 'Selfie çekilirken bir hata oluştu. Lütfen tekrar deneyin.', [
        { text: 'Tamam' },
      ]);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, faceDetected, settings.flash, setSelfie, setStep, navigation]);

  /**
   * İzin yok ekranı
   */
  if (!hasPermission) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>
            Kamera İzni Gerekli
          </Text>
          <Text style={[styles.permissionText, { color: colors.text.secondary }]}>
            Selfie çekmek için kamera erişimine ihtiyacımız var.
          </Text>
          <Button title="İzin Ver" onPress={requestPermission} style={styles.permissionButton} />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Ön kamera bulunamadı
   */
  if (!device) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>⚠️</Text>
          <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>
            Ön Kamera Bulunamadı
          </Text>
          <Text style={[styles.permissionText, { color: colors.text.secondary }]}>
            Bu cihazda kullanılabilir ön kamera bulunamadı.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Kamera önizlemesi */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Selfie rehberi overlay */}
      <SelfieGuide isCapturing={isCapturing} faceDetected={faceDetected} />

      {/* Üst bilgi çubuğu */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <View style={styles.topBarContent}>
          <Text style={styles.stepText}>Adım 3/3</Text>
        </View>
      </SafeAreaView>

      {/* Alt kontroller */}
      <SafeAreaView style={styles.bottomControls} edges={['bottom']}>
        <CameraControls
          settings={settings}
          onSettingsChange={handleSettingsChange}
          showFlip={false}
        />

        <View style={styles.captureContainer}>
          <CaptureButton
            onCapture={handleCapture}
            loading={isCapturing}
            disabled={isCapturing || !faceDetected}
            accessibilityLabel="Selfie çek"
          />
        </View>

        <Text style={styles.captureHint}>
          {isCapturing
            ? 'Fotoğraf çekiliyor...'
            : faceDetected
              ? 'Çekmek için dokunun'
              : 'Yüzünüzü çerçeveye yerleştirin'}
        </Text>
      </SafeAreaView>

      {/* Yükleniyor göstergesi */}
      {isCapturing && <Loading fullScreen message="İşleniyor..." />}
    </View>
  );
});

SelfieCaptureScreen.displayName = 'SelfieCaptureScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  permissionText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    minWidth: 200,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  stepText: {
    ...typography.bodySmall,
    color: 'white',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  captureContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  captureHint: {
    ...typography.bodySmall,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

export default SelfieCaptureScreen;
