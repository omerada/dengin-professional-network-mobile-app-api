// src/features/verification/screens/UploadStatusScreen.tsx
// Yükleme durumu ekranı
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { spacing, typography } from '@theme';
import { UNIFIED_TIMING } from '@constants';
import { Button } from '@shared/components';
import { useVerificationStore } from '../stores';
import { uploadService } from '../services';
import { UploadProgress } from '../components';
import type { VerificationStackParamList } from '@shared/types/navigation.types';
import type { VerificationResponse } from '../types';

type NavigationProp = NativeStackNavigationProp<VerificationStackParamList, 'VerificationStatus'>;

/**
 * Yükleme durumu ekranı
 */
export const UploadStatusScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp>();
  const colors = useColors();

  const {
    data,
    uploadProgress,
    verificationResponse,
    setUploadProgress,
    setVerificationResponse,
    setError,
    setStep,
    reset,
  } = useVerificationStore();

  const [isUploading, setIsUploading] = useState(true);
  const scale = useSharedValue(1);

  /**
   * Pulse animasyonu - P2 Optimized: 800ms → 600ms (UNIFIED_TIMING)
   */
  useEffect(() => {
    if (isUploading) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: UNIFIED_TIMING.pulseAnimation }),
          withTiming(1, { duration: UNIFIED_TIMING.pulseAnimation }),
        ),
        -1,
        true,
      );
    }
  }, [isUploading, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  /**
   * Yükleme işlemini başlat
   */
  useEffect(() => {
    const startUpload = async () => {
      try {
        setUploadProgress({ status: 'uploading' });

        // Belgeleri yükle ve doğrulama isteği gönder
        const response = await uploadService.uploadWithRetry(data, progress => {
          setUploadProgress(progress);
        });

        setUploadProgress({ status: 'processing' });
        setVerificationResponse(response);

        // Durumu poll et (backend'den güncel durumu al)
        const finalResponse = await uploadService.pollStatus(
          (statusResponse: VerificationResponse) => {
            setVerificationResponse(statusResponse);
          },
        );

        if (finalResponse) {
          setUploadProgress({ status: 'completed', total: 100 });
          setVerificationResponse(finalResponse);
        }

        setStep('status');
        setIsUploading(false);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress({ status: 'failed' });
        setError({
          code: 'NETWORK_ERROR',
          message: 'Yükleme başarısız oldu. Lütfen tekrar deneyin.',
        });
        setIsUploading(false);
      }
    };

    startUpload();
  }, [data, setUploadProgress, setVerificationResponse, setStep, setError]);

  /**
   * Tekrar dene
   */
  const handleRetry = useCallback(() => {
    setUploadProgress({
      documentFront: 0,
      documentBack: 0,
      selfie: 0,
      total: 0,
      status: 'idle',
    });
    setIsUploading(true);
  }, [setUploadProgress]);

  /**
   * Tamamla ve ana ekrana dön
   */
  const handleComplete = useCallback(() => {
    reset();
    navigation.popToTop();
  }, [navigation, reset]);

  /**
   * Sonuç durumunu göster
   */
  const renderResult = () => {
    if (!verificationResponse) return null;

    const { status } = verificationResponse;

    switch (status) {
      case 'APPROVED':
        return (
          <View style={styles.resultContainer}>
            <Animated.Text style={[styles.resultIcon, animatedIconStyle]}>✅</Animated.Text>
            <Text style={[styles.resultTitle, { color: colors.status.success }]}>
              Doğrulama Onaylandı!
            </Text>
            <Text style={[styles.resultText, { color: colors.text.secondary }]}>
              Mesleğiniz başarıyla doğrulandı. Profilinizde doğrulanmış rozeti görünecek.
            </Text>
          </View>
        );

      case 'REJECTED':
        return (
          <View style={styles.resultContainer}>
            <Text style={styles.resultIcon}>❌</Text>
            <Text style={[styles.resultTitle, { color: colors.status.error }]}>
              Doğrulama Reddedildi
            </Text>
            <Text style={[styles.resultText, { color: colors.text.secondary }]}>
              Belgeleriniz doğrulanamadı. Lütfen tekrar deneyin.
            </Text>
          </View>
        );

      case 'MANUAL_REVIEW':
        return (
          <View style={styles.resultContainer}>
            <Text style={styles.resultIcon}>🔍</Text>
            <Text style={[styles.resultTitle, { color: colors.status.warning }]}>
              Manuel İnceleme
            </Text>
            <Text style={[styles.resultText, { color: colors.text.secondary }]}>
              Belgeleriniz manuel olarak incelenecek. Tahmini süre: 24-48 saat
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.content}>
        {/* Yükleme ilerleme göstergesi */}
        {isUploading && (
          <View style={styles.uploadingContainer}>
            <Animated.Text style={[styles.uploadingIcon, animatedIconStyle]}>📤</Animated.Text>
            <Text style={[styles.uploadingTitle, { color: colors.text.primary }]}>
              Belgeler Yükleniyor
            </Text>
            <UploadProgress progress={uploadProgress} />
          </View>
        )}

        {/* Sonuç gösterimi */}
        {!isUploading && uploadProgress.status === 'completed' && renderResult()}

        {/* Hata durumu */}
        {!isUploading && uploadProgress.status === 'failed' && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultIcon}>⚠️</Text>
            <Text style={[styles.resultTitle, { color: colors.status.error }]}>
              Yükleme Başarısız
            </Text>
            <Text style={[styles.resultText, { color: colors.text.secondary }]}>
              Belgeleriniz yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edip
              tekrar deneyin.
            </Text>
          </View>
        )}
      </View>

      {/* Alt butonlar */}
      <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
        {uploadProgress.status === 'failed' ? (
          <Button title="Tekrar Dene" onPress={handleRetry} fullWidth />
        ) : uploadProgress.status === 'completed' ? (
          <Button title="Tamam" onPress={handleComplete} fullWidth />
        ) : null}
      </View>
    </SafeAreaView>
  );
});

UploadStatusScreen.displayName = 'UploadStatusScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  resultContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  resultIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  resultText: {
    ...typography.body,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
  },
  resultTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  uploadingTitle: {
    ...typography.h2,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});

// Wrap with Error Boundary for production safety
import { ErrorBoundary } from '@core/components';

export default function UploadStatusScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <UploadStatusScreen />
    </ErrorBoundary>
  );
}
