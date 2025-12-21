// src/features/verification/screens/DocumentCaptureScreen.tsx
// Belge yakalama ekranı
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, StatusBar, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  PhotoFile,
} from 'react-native-vision-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { spacing, typography, borderRadius } from '@theme';
import { Button, UnifiedLoadingState } from '@shared/components';
import { showOperationError, showValidationError } from '@shared/utils';
import { useHaptic } from '@shared/hooks';
import { useVerificationStore } from '../stores';
import { cameraService, imageProcessor } from '../services';
import { DocumentGuide, CaptureButton, CameraControls } from '../components';
import type { CameraSettings, CapturedImage } from '../types';
import type { VerificationStackParamList } from '@shared/types/navigation.types';

type NavigationProp = NativeStackNavigationProp<VerificationStackParamList, 'DocumentCapture'>;

type RouteProps = RouteProp<VerificationStackParamList, 'DocumentCapture'>;

/**
 * Belge yakalama ekranı
 */
export const DocumentCaptureScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const colors = useColors();
  const toast = useToast();
  const { trigger } = useHaptic();

  const { side } = route.params;
  const isBackSide = side === 'back';

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [settings, setSettings] = useState<CameraSettings>(cameraService.getDefaultSettings());
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedImage | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const {
    setDocumentFront,
    setDocumentBack,
    setStep,
    goToNextStep: _goToNextStep,
  } = useVerificationStore();

  /**
   * İzin kontrolü
   */
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  /**
   * Ayar değişikliği
   */
  const handleSettingsChange = useCallback((newSettings: Partial<CameraSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Fotoğraf çek ve preview göster
   */
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      // Fotoğraf çek
      const photo: PhotoFile = await cameraRef.current.takePhoto({
        flash: settings.flash,
        qualityPrioritization: 'quality',
      });

      // Görüntüyü işle
      const compressedImage = await imageProcessor.compress(`file://${photo.path}`);

      // P2: Preview için state'e kaydet
      const capturedImage: CapturedImage = {
        ...compressedImage,
        type: isBackSide ? 'back' : 'front',
      };

      setCapturedPhoto(capturedImage);
    } catch (error) {
      console.error('Capture error:', error);
      showOperationError(
        toast,
        { trigger },
        'Fotoğraf çekilirken bir hata oluştu. Lütfen tekrar deneyin.',
      );
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, settings.flash, isBackSide]);

  /**
   * P2: Fotoğrafı onayla ve devam et
   */
  const handleConfirm = useCallback(async () => {
    if (!capturedPhoto) return;

    try {
      setIsValidating(true);

      // Görüntüyü doğrula
      const validation = await imageProcessor.validate(capturedPhoto.uri);

      if (!validation.isValid) {
        const errorMessages = validation.errors
          .map(err => imageProcessor.getErrorMessage(err))
          .join('\n');

        showValidationError(toast, errorMessages + '\n\nLütfen tekrar çekin.', { trigger });
        setCapturedPhoto(null);
        setIsValidating(false);
        return;
      }

      // Görüntüyü kaydet ve sonraki adıma geç
      if (isBackSide) {
        setDocumentBack(capturedPhoto);
        setStep('selfie');
        navigation.navigate('SelfieCapture');
      } else {
        setDocumentFront(capturedPhoto);
        setStep('document_back');
        navigation.navigate('DocumentCapture', {
          documentType: route.params.documentType,
          side: 'back',
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      showOperationError(
        toast,
        { trigger },
        'Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      );
      setCapturedPhoto(null);
      setIsValidating(false);
    }
  }, [capturedPhoto, isBackSide, setDocumentFront, setDocumentBack, setStep, navigation, route]);

  /**
   * P2: Fotoğrafı reddet ve tekrar çek
   */
  const handleRetake = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

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
            Belge fotoğrafı çekmek için kamera erişimine ihtiyacımız var.
          </Text>
          <Button title="İzin Ver" onPress={requestPermission} style={styles.permissionButton} />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Cihaz bulunamadı
   */
  if (!device) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>⚠️</Text>
          <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>
            Kamera Bulunamadı
          </Text>
          <Text style={[styles.permissionText, { color: colors.text.secondary }]}>
            Bu cihazda kullanılabilir kamera bulunamadı.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // P2: Preview ekranı - Fotoğraf çekildiğinde göster
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Çekilen fotoğraf önizlemesi */}
        <Image
          source={{ uri: capturedPhoto.uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Üst bilgi çubuğu */}
        <SafeAreaView style={styles.topBar} edges={['top']}>
          <View style={styles.topBarContent}>
            <Text style={styles.stepText}>{isBackSide ? 'Adım 2/3' : 'Adım 1/3'}</Text>
          </View>
        </SafeAreaView>

        {/* Preview alt butonlar */}
        <SafeAreaView style={styles.previewControls} edges={['bottom']}>
          <View style={styles.previewButtonsContainer}>
            <TouchableOpacity
              style={[styles.previewButton, styles.retakeButton]}
              onPress={handleRetake}
              disabled={isValidating}>
              <Text style={styles.previewButtonText}>Tekrar Çek</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.previewButton,
                styles.confirmButton,
                { backgroundColor: colors.interactive.default },
              ]}
              onPress={handleConfirm}
              disabled={isValidating}>
              <Text style={[styles.previewButtonText, styles.confirmButtonText]}>
                {isValidating ? 'Doğrulanıyor...' : 'Devam Et'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.previewHint}>
            Belge net görünüyor mu? Doğrulama için "Devam Et" butonuna basın.
          </Text>
        </SafeAreaView>

        {/* Doğrulama loading */}
        {isValidating && (
          <UnifiedLoadingState strategy="spinner" message="Doğrulanıyor..." variant="screen" />
        )}
      </View>
    );
  }

  // Kamera modu - Varsayılan
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Kamera önizlemesi */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!capturedPhoto}
        photo={true}
        enableZoomGesture
        zoom={settings.zoom}
      />

      {/* Belge rehberi overlay */}
      <DocumentGuide type={isBackSide ? 'back' : 'front'} isCapturing={isCapturing} />

      {/* Üst bilgi çubuğu */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <View style={styles.topBarContent}>
          <Text style={styles.stepText}>{isBackSide ? 'Adım 2/3' : 'Adım 1/3'}</Text>
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
            disabled={isCapturing}
            accessibilityLabel={isBackSide ? 'Belge arka yüzünü çek' : 'Belge ön yüzünü çek'}
          />
        </View>

        <Text style={styles.captureHint}>
          {isCapturing ? 'Fotoğraf çekiliyor...' : 'Çekmek için dokunun'}
        </Text>
      </SafeAreaView>

      {/* Yükleniyor göstergesi */}
      {isCapturing && (
        <UnifiedLoadingState strategy="spinner" message="İşleniyor..." variant="screen" />
      )}
    </View>
  );
});

DocumentCaptureScreen.displayName = 'DocumentCaptureScreen';

const styles = StyleSheet.create({
  bottomControls: {
    bottom: 0,
    left: 0,
    position: 'absolute',
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
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
  },
  confirmButtonText: {
    color: 'white',
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  permissionButton: {
    minWidth: 200,
  },
  permissionContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  permissionText: {
    ...typography.body,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  permissionTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  previewButton: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  previewButtonText: {
    ...typography.button,
    fontWeight: '600',
  },
  previewButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  previewControls: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  previewHint: {
    ...typography.bodySmall,
    color: 'white',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
  },
  stepText: {
    ...typography.bodySmall,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.lg,
    color: 'white',
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  topBar: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  topBarContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.md,
  },
});

// Wrap with Error Boundary for production safety
import { ErrorBoundary } from '@core/components';

export default function DocumentCaptureScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <DocumentCaptureScreen />
    </ErrorBoundary>
  );
}
